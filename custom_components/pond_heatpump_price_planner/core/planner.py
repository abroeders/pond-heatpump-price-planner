"""Cost-optimal schedule of off/low/high/boost per quarter hour (dynamic programming).

State: pond temperature on a grid and the previous mode. Costs: energy, a penalty per start, a penalty per
preset change (into or out of boost) and a soft penalty for leaving the inner band. The heat left in the pond
at the horizon has a value, so the plan does not empty the buffer just before the end.
See docs/design/2026-11-17-planner.md and docs/design/2026-11-24-capacity-preset.md.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass, field
from typing import Protocol

import numpy as np

from .costs import QUARTERS_PER_DAY, EnergyCosts
from .model import DT, MODES, ModelParams
from .samples import QUARTER

GRID_STEP = 0.02  # K (values are interpolated linearly between grid points)
GRID_MARGIN = 1.5  # K beyond the band on both sides
PENALTY_LINEAR = 5.0  # € per K outside the inner band, per quarter
PENALTY_QUADRATIC = 500.0  # € per K², per quarter


@dataclass
class PlanRequest:
    """Everything the planner needs; prices and outdoor temperatures per quarter from `start`."""

    start: float  # epoch of the current quarter start
    pond: float  # measured pond temperature
    mode_now: str  # current mode
    target: float
    band: float
    params: ModelParams
    outdoor: Sequence[float]
    costs: EnergyCosts
    margin: float = 0.07
    cover: bool = False
    start_penalty: float = 0.05
    allow_high: bool = True
    allow_boost: bool = False
    preset_penalty: float = 0.05

    def allowed(self, mode: str) -> bool:
        if mode == "high":
            return self.allow_high
        if mode == "boost":
            return self.allow_high and self.allow_boost
        return True

    @property
    def quarters(self) -> int:
        return min(len(self.outdoor), len(self.costs.price))


@dataclass
class Plan:
    """The schedule and what it is expected to cost; only the first quarter is executed."""

    start: float
    modes: list[str]
    temps: list[float]  # predicted pond temperature at the end of each quarter
    prices: list[float]
    energy_kwh: float  # next 24 h
    cost: float  # next 24 h, €
    starts: int  # next 24 h
    expensive_share: float  # share of energy in the most expensive 25 % of quarters, next 24 h
    next_start: float | None = None
    next_stop: float | None = None
    quarter_costs: list[float] = field(default_factory=list)

    @property
    def mode(self) -> str:
        return self.modes[0]


class Planner(Protocol):
    def make_plan(self, request: PlanRequest) -> Plan: ...


class DynamicProgrammingPlanner:
    """Backward induction over (temperature grid × previous mode), forward read-out from the measurement."""

    def make_plan(self, request: PlanRequest) -> Plan:
        n = request.quarters
        if n == 0:
            raise ValueError("no quarters to plan")
        p = request.params
        modes = [m for m in range(len(MODES)) if request.allowed(MODES[m])]
        grid = self._grid(request)
        cost = request.costs.matrix(p, planning=True)[:n]
        real_cost = request.costs.matrix(p)[:n]
        outdoor = np.asarray(request.outdoor[:n], dtype=float)
        lo = request.target - request.band + request.margin
        hi = request.target + request.band - request.margin
        k = p.k(request.cover)
        rates = np.array([p.rate(m) for m in MODES])

        # value of heat at the horizon: what it would cost to deliver in low mode at the mean price
        heat_value = float(np.mean(request.costs.price[:n])) * p.power["low"] / max(rates[1], 1e-6)
        value = np.tile(-(grid - request.target) * heat_value, (len(MODES), 1))
        policy = np.zeros((n, len(MODES), grid.size), dtype=np.int8)

        for t in range(n - 1, -1, -1):
            cooling = -k * (grid - outdoor[t]) + p.offset
            nxt = np.full((len(MODES), grid.size), np.inf)
            for m in modes:
                for prev in range(len(MODES)):
                    starting = MODES[prev] == "off" and MODES[m] != "off"
                    heat = rates[m] * (p.start_factor if starting else 1.0)
                    t_next = grid + DT * (heat + cooling)
                    total = (
                        cost[t, m]
                        + (request.start_penalty if starting else 0.0)
                        + (request.preset_penalty if _preset_change(MODES[prev], MODES[m]) else 0.0)
                        + self._penalty(t_next, lo, hi)
                        + _interp_uniform(t_next, grid[0], value[m])
                    )
                    better = total < nxt[prev]
                    nxt[prev] = np.where(better, total, nxt[prev])
                    policy[t, prev] = np.where(better, m, policy[t, prev])
            value = nxt

        return self._read_out(request, grid, policy, real_cost, outdoor, n)

    @staticmethod
    def _grid(request: PlanRequest) -> np.ndarray:
        low = min(request.target - request.band, request.pond) - GRID_MARGIN
        high = max(request.target + request.band, request.pond) + GRID_MARGIN
        return np.arange(low, high + GRID_STEP / 2, GRID_STEP)

    @staticmethod
    def _penalty(temp: np.ndarray, lo: float, hi: float) -> np.ndarray:
        d = np.maximum(lo - temp, 0.0) + np.maximum(temp - hi, 0.0)
        return PENALTY_LINEAR * d + PENALTY_QUADRATIC * d * d

    @staticmethod
    def _read_out(request, grid, policy, cost, outdoor, n) -> Plan:
        p = request.params
        temp, prev = request.pond, MODES.index(request.mode_now)
        modes, temps, quarter_costs = [], [], []
        for t in range(n):
            i = int(np.clip(round((temp - grid[0]) / GRID_STEP), 0, grid.size - 1))
            m = int(policy[t, prev, i])
            starting = MODES[prev] == "off" and MODES[m] != "off"
            temp = p.step(temp, MODES[m], float(outdoor[t]), starting, request.cover)
            modes.append(MODES[m])
            temps.append(temp)
            quarter_costs.append(float(cost[t, m]))
            prev = m
        return summarize(request, modes, temps, quarter_costs)


def _preset_change(prev: str, mode: str) -> bool:
    """Whether going from prev to mode changes the preset while running: into or out of boost."""
    return "off" not in (prev, mode) and (prev == "boost") != (mode == "boost")


def _interp_uniform(x: np.ndarray, x0: float, values: np.ndarray) -> np.ndarray:
    """Linear interpolation on the uniform temperature grid (faster than np.interp), clamped at the ends."""
    pos = np.clip((x - x0) / GRID_STEP, 0.0, values.size - 1.000001)
    i = pos.astype(np.int64)
    frac = pos - i
    return values[i] * (1.0 - frac) + values[i + 1] * frac


def summarize(request: PlanRequest, modes: list[str], temps: list[float], quarter_costs: list[float]) -> Plan:
    """Totals over the next 24 h and the next start/stop."""
    p = request.params
    day = min(len(modes), QUARTERS_PER_DAY)
    prices = list(request.costs.price[: len(modes)])
    energy = [p.power[m] * DT for m in modes[:day]]
    prev = request.mode_now
    starts = 0
    for m in modes[:day]:
        starts += prev == "off" and m != "off"
        prev = m
    threshold = float(np.quantile(prices[:day], 0.75)) if day else 0.0
    running = [m != "off" for m in modes]
    expensive = sum(
        e for e, price, on in zip(energy, prices, running, strict=False) if on and price > threshold
    )
    heating = sum(e for e, on in zip(energy, running, strict=False) if on)
    return Plan(
        start=request.start,
        modes=modes,
        temps=temps,
        prices=prices,
        energy_kwh=sum(energy),
        cost=sum(quarter_costs[:day]),
        starts=starts,
        expensive_share=expensive / heating if heating else 0.0,
        next_start=_first(request, modes, lambda m: m != "off", request.mode_now != "off"),
        next_stop=_first(request, modes, lambda m: m == "off", request.mode_now == "off"),
        quarter_costs=quarter_costs,
    )


def _first(request: PlanRequest, modes: list[str], wanted, already: bool) -> float | None:
    """Start of the first quarter where the condition becomes true after being false."""
    state = already
    for q, m in enumerate(modes):
        hit = wanted(m)
        if hit and not state:
            return request.start + q * QUARTER
        state = hit
    return None

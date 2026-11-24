"""Closed-loop replay of the planner on the reference dataset.

Every quarter a plan is made with the prices known at that moment (day-ahead prices for tomorrow from 13:00
local), only its first quarter is executed, and the pond follows the thermal model. Used by the tests and by
scripts/replay.py.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import numpy as np
from core.costs import EnergyCosts
from core.model import DT, MODES, ModelParams
from core.planner import DynamicProgrammingPlanner, PlanRequest

TZ = ZoneInfo("Europe/Amsterdam")
REFERENCE_PARAMS = ModelParams(
    power={"off": 0.005, "low": 0.384, "high": 0.918},
    gain={"off": 0.0, "low": 0.304, "high": 0.209},
    k_open=0.0121,
    offset=-0.0115,
)


def known_until(t: float) -> float:
    """End of the last day with known prices at time t (tomorrow becomes known at 13:00 local)."""
    local = datetime.fromtimestamp(t, TZ)
    days = 2 if local.hour >= 13 else 1
    end = datetime.combine(local.date() + timedelta(days=days), datetime.min.time(), TZ)
    return end.timestamp()


@dataclass
class ReplayResult:
    modes: list[str]
    temps: list[float]
    cost: float
    energy: float
    starts_per_day: float
    expensive_share: float
    max_deviation: float
    plan_ms: float


def evaluate(rows, modes, temps, target) -> ReplayResult:
    p = REFERENCE_PARAMS
    price = np.array([r["price"] for r in rows[: len(modes)]])
    energy = np.array([p.power[m] * DT for m in modes])
    on = np.array([m != "off" for m in modes])
    starts = sum(1 for a, b in zip(["off", *modes[:-1]], modes, strict=True) if a == "off" and b != "off")
    expensive = 0.0
    for d in range(0, len(modes), 96):
        sl = slice(d, d + 96)
        thr = np.quantile(price[sl], 0.75)
        expensive += float((energy[sl] * on[sl] * (price[sl] > thr)).sum())
    return ReplayResult(
        modes=modes,
        temps=temps,
        cost=float((energy * price).sum()),
        energy=float(energy.sum()),
        starts_per_day=starts / (len(modes) / 96),
        expensive_share=expensive / float((energy * on).sum()),
        max_deviation=float(np.max(np.abs(np.array(temps) - target))),
        plan_ms=0.0,
    )


def replay(rows, target=15.0, band=0.25, start_penalty=0.05, horizon_h=36) -> ReplayResult:
    import time

    planner = DynamicProgrammingPlanner()
    p = REFERENCE_PARAMS
    temp, mode = target, "off"
    modes, temps, spent = [], [], 0.0
    for i, r in enumerate(rows):
        end = min(known_until(r["t"]), r["t"] + horizon_h * 3600)
        n = max(16, int((end - r["t"]) // 900))
        window = rows[i : i + n]
        req = PlanRequest(
            start=r["t"],
            pond=temp,
            mode_now=mode,
            target=target,
            band=band,
            params=p,
            outdoor=[w["outdoor"] for w in window],
            costs=EnergyCosts([w["price"] for w in window]),
            start_penalty=start_penalty,
        )
        t0 = time.perf_counter()
        plan = planner.make_plan(req)
        spent += time.perf_counter() - t0
        starting = mode == "off" and plan.mode != "off"
        temp = p.step(temp, plan.mode, r["outdoor"], starting)
        mode = plan.mode
        modes.append(mode)
        temps.append(temp)
    result = evaluate(rows, modes, temps, target)
    result.plan_ms = spent / len(rows) * 1000
    return result


def offline_optimum(rows, target=15.0, band=0.25, start_penalty=0.05) -> ReplayResult:
    """One plan over the whole period with perfect knowledge: the lower bound for the cost."""
    req = PlanRequest(
        start=rows[0]["t"],
        pond=target,
        mode_now="off",
        target=target,
        band=band,
        params=REFERENCE_PARAMS,
        outdoor=[r["outdoor"] for r in rows],
        costs=EnergyCosts([r["price"] for r in rows]),
        start_penalty=start_penalty,
    )
    plan = DynamicProgrammingPlanner().make_plan(req)
    return evaluate(rows, plan.modes, plan.temps, target)


def thermostat(rows, target=15.0, band=0.25) -> ReplayResult:
    """Low-mode thermostat for comparison."""
    p = REFERENCE_PARAMS
    temp, on, prev = target, False, "off"
    modes, temps = [], []
    for r in rows:
        if temp < target - band:
            on = True
        elif temp > target + band:
            on = False
        mode = "low" if on else "off"
        temp = p.step(temp, mode, r["outdoor"], prev == "off" and on)
        prev = mode
        modes.append(mode)
        temps.append(temp)
    return evaluate(rows, modes, temps, target)


assert MODES == ("off", "low", "high", "boost")

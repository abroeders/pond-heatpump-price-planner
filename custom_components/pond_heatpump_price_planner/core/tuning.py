"""Choosing the surcharge on expensive quarters from recent history.

The surcharge is not a price that is paid; it only shapes the plan. Which value gives the lowest real cost
depends on how well prices and weather were known in advance, so it is tuned by replaying the last days:
plan with only the prices known at the time, execute, and add up the real cost. The candidate with the
lowest real cost wins; with (near) equal cost the smallest surcharge wins. A candidate whose replay leaves
the band is not considered, so a lower cost can never come from a colder pond.
"""

from __future__ import annotations

from collections.abc import Callable, Sequence
from dataclasses import dataclass, field

from .costs import EnergyCosts
from .model import DT, ModelParams
from .planner import DynamicProgrammingPlanner, Planner, PlanRequest
from .samples import QUARTER, Sample

CANDIDATES = (0.0, 0.15, 0.30, 0.50, 1.00)  # €/kWh
REPLAN_EVERY = 4  # quarters: replan hourly in the replay, enough to compare candidates
TIE = 0.005  # relative cost difference treated as equal
MIN_COVERAGE = 0.9  # share of quarters with price and outdoor temperature
BAND_TOLERANCE = 0.05  # K beyond the band before a candidate is rejected


@dataclass
class TuningResult:
    surcharge: float
    costs: dict[float, float] = field(default_factory=dict)  # candidate → real cost (€)
    days: float = 0.0
    reason: str = ""


def _filled(values: Sequence[float | None]) -> list[float] | None:
    """Forward/backward fill gaps; None if too many values are missing."""
    known = [v for v in values if v is not None]
    if not values or len(known) < MIN_COVERAGE * len(values):
        return None
    out, last = [], known[0]
    for v in values:
        last = v if v is not None else last
        out.append(last)
    return out


def tune_surcharge(
    samples: Sequence[Sample],
    params: ModelParams,
    target: float,
    band: float,
    known_until: Callable[[float], float],
    now: float,
    days: int = 14,
    start_penalty: float = 0.05,
    horizon_hours: int = 36,
    candidates: Sequence[float] = CANDIDATES,
    planner: Planner | None = None,
) -> TuningResult:
    """Replay the last `days` days for each candidate; known_until(t) gives the end of the known prices."""
    planner = planner or DynamicProgrammingPlanner()
    start = now - days * 86400
    window = sorted((s for s in samples if start <= s.t < now), key=lambda s: s.t)
    if not window:
        return TuningResult(0.0, reason="no samples")
    n = int((window[-1].t - window[0].t) // QUARTER) + 1
    by_t = {s.t: s for s in window}
    quarters = [by_t.get(window[0].t + i * QUARTER) for i in range(n)]
    price = _filled([q.price if q else None for q in quarters])
    outdoor = _filled([q.outdoor if q else None for q in quarters])
    if price is None or outdoor is None or n < 96:
        return TuningResult(0.0, reason="not enough history with prices")
    t0 = window[0].t

    costs, rejected = {}, []
    for surcharge in candidates:
        temp, mode, total, worst = target, "off", 0.0, 0.0  # same start for every candidate
        modes: list[str] = []
        for i in range(n):
            if i % REPLAN_EVERY == 0:
                t = t0 + i * QUARTER
                end = min(known_until(t), t + horizon_hours * 3600)
                m = max(16, min(n - i, int((end - t) // QUARTER)))
                plan = planner.make_plan(
                    PlanRequest(
                        start=t,
                        pond=temp,
                        mode_now=mode,
                        target=target,
                        band=band,
                        params=params,
                        outdoor=outdoor[i : i + m],
                        costs=EnergyCosts(price[i : i + m], expensive_surcharge=surcharge),
                        start_penalty=start_penalty,
                    )
                )
                modes = plan.modes
            step = modes[i % REPLAN_EVERY] if i % REPLAN_EVERY < len(modes) else "off"
            temp = params.step(temp, step, outdoor[i], mode == "off" and step != "off")
            mode = step
            total += params.power[step] * DT * price[i]
            worst = max(worst, abs(temp - target))
        if worst > band + BAND_TOLERANCE:
            rejected.append(surcharge)
            continue
        costs[surcharge] = total

    if not costs:
        return TuningResult(0.0, reason=f"every candidate left the band ({rejected})")
    best = min(costs.values())
    chosen = min(c for c, v in costs.items() if v <= best * (1 + TIE))
    return TuningResult(chosen, costs, n / 96)

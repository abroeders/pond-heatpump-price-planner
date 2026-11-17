"""Quarter-hour samples of the pond: storage format and conversion from sensor histories."""

from __future__ import annotations

import bisect
import math
from collections.abc import Iterable
from dataclasses import dataclass

QUARTER = 900.0  # seconds
RETENTION_DAYS = 42
MIN_COVERAGE = 0.5  # share of a quarter that must have a known power value


def quarter_start(t: float) -> float:
    """Start of the quarter hour that contains epoch time t."""
    return math.floor(t / QUARTER) * QUARTER


@dataclass(slots=True)
class Sample:
    """One quarter hour, starting at t (epoch seconds, UTC)."""

    t: float
    pond: float | None  # pond temperature at the end of the quarter (°C)
    outdoor: float | None  # outdoor temperature at the end of the quarter (°C)
    power: float | None  # mean heat pump power over the quarter (W)
    cover: bool = False  # insulation cover switch
    price: float | None = None  # effective purchase price of the quarter (€/kWh)

    def to_list(self) -> list:
        return [self.t, self.pond, self.outdoor, self.power, int(self.cover), self.price]

    @classmethod
    def from_list(cls, row: list) -> Sample:
        t, pond, outdoor, power, *rest = row
        cover = bool(rest[0]) if rest else False
        price = rest[1] if len(rest) > 1 else None
        return cls(float(t), pond, outdoor, power, cover, price)


class PowerIntegrator:
    """Time-weighted mean of a step signal: each value holds until the next one.

    A value of None (unavailable) breaks the signal until the next known value.
    """

    def __init__(self) -> None:
        self._t: list[float] = []
        self._v: list[float | None] = []

    def add(self, t: float, value: float | None) -> None:
        if self._t and t < self._t[-1]:
            i = bisect.bisect_right(self._t, t)
            self._t.insert(i, t)
            self._v.insert(i, value)
            return
        if self._t and t == self._t[-1]:
            self._v[-1] = value
            return
        self._t.append(t)
        self._v.append(value)

    def mean(self, start: float, end: float) -> float | None:
        """Mean over [start, end), or None if less than half of the interval is known."""
        if end <= start or not self._t:
            return None
        i = max(bisect.bisect_right(self._t, start) - 1, 0)
        total = covered = 0.0
        while i < len(self._t) and self._t[i] < end:
            seg_start = max(self._t[i], start)
            seg_end = min(self._t[i + 1] if i + 1 < len(self._t) else end, end)
            v = self._v[i]
            if seg_end > seg_start and v is not None:
                total += v * (seg_end - seg_start)
                covered += seg_end - seg_start
            i += 1
        if covered < MIN_COVERAGE * (end - start):
            return None
        return total / covered

    def prune(self, before: float) -> None:
        """Drop points that are no longer needed for intervals starting at or after `before`."""
        i = bisect.bisect_right(self._t, before) - 1
        if i > 0:
            del self._t[:i]
            del self._v[:i]


def last_value(times: list[float], values: list[float | None], t: float) -> float | None:
    """Value of the step signal at time t (the last point at or before t)."""
    i = bisect.bisect_right(times, t) - 1
    return values[i] if i >= 0 else None


def to_quarters(
    series: dict[str, Iterable[tuple[float, float | None]]],
    start: float,
    end: float,
    cover: bool = False,
) -> list[Sample]:
    """Convert sensor histories to quarter samples between start and end.

    `series` has the keys 'pond', 'outdoor' and 'power', each a list of (epoch, value) state changes.
    Temperatures are taken at the end of each quarter; power is the time-weighted mean.
    """
    pts = {k: sorted(series.get(k, ()), key=lambda p: p[0]) for k in ("pond", "outdoor", "power")}
    times = {k: [p[0] for p in v] for k, v in pts.items()}
    values = {k: [p[1] for p in v] for k, v in pts.items()}
    power = PowerIntegrator()
    for t, v in pts["power"]:
        power.add(t, v)
    out = []
    q = quarter_start(start)
    while q + QUARTER <= end:
        end_q = q + QUARTER - 1e-6
        out.append(
            Sample(
                t=q,
                pond=last_value(times["pond"], values["pond"], end_q),
                outdoor=last_value(times["outdoor"], values["outdoor"], end_q),
                power=power.mean(q, q + QUARTER),
                cover=cover,
            )
        )
        q += QUARTER
    return out


def prune(samples: list[Sample], now: float, days: int = RETENTION_DAYS) -> list[Sample]:
    """Keep the samples of the last `days` days."""
    limit = now - days * 86400
    return [s for s in samples if s.t >= limit]


def merge(old: list[Sample], new: list[Sample]) -> list[Sample]:
    """Merge two sample lists; for the same quarter, the sample from `new` wins."""
    by_t = {s.t: s for s in old}
    by_t.update({s.t: s for s in new})
    return [by_t[t] for t in sorted(by_t)]

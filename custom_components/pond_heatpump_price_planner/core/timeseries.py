"""Time intervals with a value, and spreading them over quarter hours."""

from __future__ import annotations

import bisect
from collections.abc import Sequence
from dataclasses import dataclass

from .samples import QUARTER

MAX_OPEN_INTERVAL = 3600.0  # an interval without an end lasts until the next start, at most this long


@dataclass(frozen=True, slots=True)
class Interval:
    start: float  # epoch seconds
    end: float
    value: float


def close_intervals(points: Sequence[tuple[float, float | None, float]]) -> list[Interval]:
    """Turn (start, end or None, value) points into intervals; a missing end runs to the next start."""
    ordered = sorted(points, key=lambda p: p[0])
    out = []
    for i, (start, end, value) in enumerate(ordered):
        if end is None:
            nxt = ordered[i + 1][0] if i + 1 < len(ordered) else start + MAX_OPEN_INTERVAL
            end = min(nxt, start + MAX_OPEN_INTERVAL)
        if end > start:
            out.append(Interval(start, end, value))
    return out


def quarter_values(intervals: Sequence[Interval], start: float, n: int) -> list[float | None]:
    """Value per quarter, from the interval that contains the start of the quarter (None if none)."""
    ordered = sorted(intervals, key=lambda i: i.start)
    starts = [i.start for i in ordered]
    out: list[float | None] = []
    for q in range(n):
        t = start + q * QUARTER
        idx = bisect.bisect_right(starts, t) - 1
        out.append(ordered[idx].value if idx >= 0 and t < ordered[idx].end else None)
    return out


def last_known_end(intervals: Sequence[Interval]) -> float | None:
    return max((i.end for i in intervals), default=None)

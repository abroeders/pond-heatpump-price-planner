"""Turning a mode into a setpoint for the heat pump.

A strategy, so heat pumps that are controlled differently can get their own implementation.
"""

from __future__ import annotations

import math
from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Protocol

DEFAULT_OFFSETS = {"off": -2, "low": 0, "high": 1, "boost": 1, "start": 2}
HEATING = ("low", "high", "boost")


class SetpointStrategy(Protocol):
    def setpoint(
        self,
        mode: str,
        inlet: float | None,
        pond: float,
        min_temp: float,
        max_temp: float,
        step: float,
        running: bool = True,
    ) -> float: ...


def _round_to_step(value: float, step: float) -> float:
    step = step or 1.0
    return math.floor(value / step + 0.5) * step


@dataclass(frozen=True)
class OffsetSetpoint:
    """Setpoint = rounded inlet temperature (or pond temperature) + offset of the mode, within the limits.

    A stopped heat pump does not start on the low (or high) setpoint: it needs a higher one. While it is not
    running, the heating modes use the start offset (at least the mode's offset); once it runs, the mode's
    offset.
    """

    offsets: Mapping[str, float] = field(default_factory=lambda: dict(DEFAULT_OFFSETS))

    def setpoint(
        self,
        mode: str,
        inlet: float | None,
        pond: float,
        min_temp: float,
        max_temp: float,
        step: float,
        running: bool = True,
    ) -> float:
        base = _round_to_step(inlet if inlet is not None else pond, step)
        offset = self.offsets[mode]
        if mode in HEATING and not running and "start" in self.offsets:
            offset = max(offset, self.offsets["start"])
        value = _round_to_step(base + offset, step)
        return min(max(value, min_temp), max_temp)

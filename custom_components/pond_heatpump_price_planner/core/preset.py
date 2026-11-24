"""Turning a mode into a preset of the heat pump.

A strategy, like the setpoint: boost runs on the capacity preset, the other modes on the efficient one.
See docs/design/2026-11-24-capacity-preset.md §6.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


class PresetStrategy(Protocol):
    def preset(self, mode: str) -> str | None:
        """The preset for the mode; None: leave the preset alone."""
        ...


@dataclass(frozen=True)
class NoPreset:
    """The integration never changes the preset (no presets configured)."""

    def preset(self, mode: str) -> str | None:
        return None


@dataclass(frozen=True)
class CapacityPreset:
    """Boost on the capacity preset, every other mode on the efficient preset."""

    efficient: str
    capacity: str

    def preset(self, mode: str) -> str:
        return self.capacity if mode == "boost" else self.efficient


def preset_strategy(efficient: str | None, capacity: str | None) -> PresetStrategy:
    """CapacityPreset when both presets are set and differ, otherwise NoPreset."""
    if efficient and capacity and efficient != capacity:
        return CapacityPreset(efficient, capacity)
    return NoPreset()

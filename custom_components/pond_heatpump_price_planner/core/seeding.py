"""Filling the sample store from sensor history on first start.

The history comes from a `HistorySource`; in Home Assistant that is an adapter around the recorder
(history.py). Depending on the protocol keeps this testable without Home Assistant.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any, Protocol

from .samples import RETENTION_DAYS, Sample, fill_presets, merge, prune, to_quarters

SEED_MIN_SAMPLES = 96  # seed while there is less than a day of samples

Series = dict[str, list[tuple[float, float | None]]]


class HistorySource(Protocol):
    """State history of entities as (epoch, value) lists, keyed by entity id."""

    def series(self, entity_ids: Sequence[str], start: float, end: float) -> Series: ...

    def attribute(self, entity_id: str, attribute: str, start: float, end: float) -> list[tuple[float, Any]]:
        """Changes of one attribute as (epoch, value)."""
        ...


@dataclass(frozen=True)
class SeedEntities:
    pond: str
    outdoor: str
    power: str
    climate: str | None = None  # for the preset of each quarter


@dataclass(frozen=True)
class SeedResult:
    samples: list[Sample]
    added: int


def needs_seed(samples: Sequence[Sample]) -> bool:
    return len(samples) < SEED_MIN_SAMPLES


def seed(
    existing: list[Sample],
    source: HistorySource,
    entities: SeedEntities,
    now: float,
    days: int = RETENTION_DAYS,
) -> SeedResult:
    """Merge quarter samples built from the history into the existing ones; existing samples win."""
    ids = (entities.pond, entities.outdoor, entities.power)
    history = source.series(ids, now - days * 86400, now)
    series = {
        key: history.get(entity_id, [])
        for key, entity_id in zip(("pond", "outdoor", "power"), ids, strict=True)
    }
    if not any(series.values()):
        return SeedResult(existing, 0)
    first = min(t for points in series.values() for t, _ in points)
    if entities.climate:
        series["preset"] = source.attribute(entities.climate, "preset_mode", now - days * 86400, now)
    seeded = [s for s in to_quarters(series, first, now) if s.pond is not None]
    merged = prune(merge(seeded, existing), now, days)
    return SeedResult(merged, len(merged) - len(existing))


def backfill_presets(samples: list[Sample], source: HistorySource, climate: str, now: float) -> int:
    """Fill the preset of stored samples that have none (stored before the preset was recorded).

    Reads the preset history from the first such sample on; samples older than the history stay None.
    Changes the samples in place and returns how many were filled.
    """
    missing = [s for s in samples if s.preset is None]
    if not missing:
        return 0
    points = source.attribute(climate, "preset_mode", missing[0].t, now)
    return fill_presets(missing, points)

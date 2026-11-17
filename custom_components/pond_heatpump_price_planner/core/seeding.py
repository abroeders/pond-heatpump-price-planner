"""Filling the sample store from sensor history on first start.

The history comes from a `HistorySource`; in Home Assistant that is an adapter around the recorder
(history.py). Depending on the protocol keeps this testable without Home Assistant.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Protocol

from .samples import RETENTION_DAYS, Sample, merge, prune, to_quarters

SEED_MIN_SAMPLES = 96  # seed while there is less than a day of samples

Series = dict[str, list[tuple[float, float | None]]]


class HistorySource(Protocol):
    """State history of entities as (epoch, value) lists, keyed by entity id."""

    def series(self, entity_ids: Sequence[str], start: float, end: float) -> Series: ...


@dataclass(frozen=True)
class SeedEntities:
    pond: str
    outdoor: str
    power: str


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
    seeded = [s for s in to_quarters(series, first, now) if s.pond is not None]
    merged = prune(merge(seeded, existing), now, days)
    return SeedResult(merged, len(merged) - len(existing))

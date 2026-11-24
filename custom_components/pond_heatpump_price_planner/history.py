"""Adapter from the Home Assistant recorder to the `HistorySource` protocol of the core."""

from __future__ import annotations

import logging
from collections.abc import Sequence
from datetime import UTC, datetime
from typing import Any

from homeassistant.core import HomeAssistant, State

from .core.seeding import SeedEntities, Series, backfill_presets, needs_seed, seed
from .storage import PlannerStore

_LOGGER = logging.getLogger(__name__)


def _number(state: State) -> float | None:
    try:
        return float(state.state)
    except (TypeError, ValueError):
        return None


class RecorderHistory:
    """Reads state history from the recorder. Must run in the recorder's executor."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    def series(self, entity_ids: Sequence[str], start: float, end: float) -> Series:
        from homeassistant.components.recorder import history

        states = history.get_significant_states(
            self.hass,
            datetime.fromtimestamp(start, UTC),
            datetime.fromtimestamp(end, UTC),
            list(entity_ids),
            include_start_time_state=True,
            significant_changes_only=False,
            minimal_response=False,
            no_attributes=True,
        )
        return {
            entity_id: [(s.last_changed.timestamp(), _number(s)) for s in states.get(entity_id, [])]
            for entity_id in entity_ids
        }

    def attribute(self, entity_id: str, attribute: str, start: float, end: float) -> list[tuple[float, Any]]:
        from homeassistant.components.recorder import history

        states = history.state_changes_during_period(
            self.hass,
            datetime.fromtimestamp(start, UTC),
            datetime.fromtimestamp(end, UTC),
            entity_id,
            no_attributes=False,
            include_start_time_state=True,
        )
        out: list[tuple[float, Any]] = []
        for s in states.get(entity_id, []):
            value = s.attributes.get(attribute)
            if not out or out[-1][1] != value:
                out.append((s.last_updated.timestamp(), value))
        return out


async def async_seed_store(
    hass: HomeAssistant, store: PlannerStore, entities: SeedEntities, now: float
) -> int:
    """Fill a nearly empty store from the recorder (best effort). Returns the number of samples added."""
    if not needs_seed(store.samples):
        return 0
    try:
        from homeassistant.components.recorder import get_instance

        result = await get_instance(hass).async_add_executor_job(
            seed, store.samples, RecorderHistory(hass), entities, now
        )
    except Exception:  # noqa: BLE001 - seeding is optional; learning then starts from defaults
        _LOGGER.warning("Could not read history from the recorder; learning starts from defaults")
        return 0
    if result.added:
        store.replace_samples(result.samples)
        _LOGGER.info("Seeded %d quarter samples from the recorder", result.added)
    return result.added


async def async_backfill_presets(hass: HomeAssistant, store: PlannerStore, climate: str, now: float) -> int:
    """Once: fill the preset of samples stored before it was recorded (best effort)."""
    if store.extra.get("presets_backfilled"):
        return 0
    try:
        from homeassistant.components.recorder import get_instance

        filled = await get_instance(hass).async_add_executor_job(
            backfill_presets, store.samples, RecorderHistory(hass), climate, now
        )
    except Exception:  # noqa: BLE001 - optional; without it older quarters count as the efficient preset
        _LOGGER.warning("Could not read the preset history from the recorder")
        return 0
    store.extra["presets_backfilled"] = True
    store.schedule_save()
    if filled:
        _LOGGER.info("Filled the preset of %d stored quarter samples from the recorder", filled)
    return filled

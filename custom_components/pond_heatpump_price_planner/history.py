"""Adapter from the Home Assistant recorder to the `HistorySource` protocol of the core."""

from __future__ import annotations

import logging
from collections.abc import Sequence
from datetime import UTC, datetime

from homeassistant.core import HomeAssistant, State

from .core.seeding import SeedEntities, Series, needs_seed, seed
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

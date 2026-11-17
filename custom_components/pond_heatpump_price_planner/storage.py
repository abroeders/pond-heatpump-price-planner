"""Persistent state of a planner: quarter samples and model parameters, plus seeding from the recorder."""

from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

from homeassistant.core import HomeAssistant, State
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .core.model import ModelParams
from .core.samples import RETENTION_DAYS, Sample, merge, prune, to_quarters

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
SAVE_DELAY = 60  # seconds
SEED_MIN_SAMPLES = 96  # seed from the recorder while there is less than a day of samples


def _number(state: State | None) -> float | None:
    if state is None:
        return None
    try:
        return float(state.state)
    except (TypeError, ValueError):
        return None


class PlannerStore:
    """Samples and model parameters of one config entry, kept in .storage."""

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self.hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry_id}")
        self.samples: list[Sample] = []
        self.params = ModelParams()
        self.extra: dict[str, Any] = {}

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self.samples = [Sample.from_list(row) for row in data.get("samples", [])]
        self.params = ModelParams.from_dict(data.get("params"))
        self.extra = data.get("extra", {})

    def _data(self) -> dict[str, Any]:
        return {
            "samples": [s.to_list() for s in self.samples],
            "params": self.params.to_dict(),
            "extra": self.extra,
        }

    def add(self, sample: Sample) -> None:
        """Add or replace the sample of one quarter and schedule a save."""
        self.samples = prune(merge(self.samples, [sample]), sample.t + 900, RETENTION_DAYS)
        self.schedule_save()

    def schedule_save(self) -> None:
        self._store.async_delay_save(self._data, SAVE_DELAY)

    async def async_save(self) -> None:
        await self._store.async_save(self._data())

    async def async_remove(self) -> None:
        await self._store.async_remove()

    async def async_seed(self, pond: str, outdoor: str, power: str) -> int:
        """Fill missing history from the recorder (best effort). Returns the number of samples added."""
        if len(self.samples) >= SEED_MIN_SAMPLES:
            return 0
        try:
            from homeassistant.components.recorder import get_instance, history
        except ImportError:
            return 0
        end = dt_util.utcnow()
        start = end - timedelta(days=RETENTION_DAYS)
        ids = [pond, outdoor, power]
        try:
            states = await get_instance(self.hass).async_add_executor_job(
                lambda: history.get_significant_states(
                    self.hass,
                    start,
                    end,
                    ids,
                    include_start_time_state=True,
                    significant_changes_only=False,
                    minimal_response=False,
                    no_attributes=True,
                )
            )
        except Exception:  # noqa: BLE001 - seeding is optional
            _LOGGER.warning("Could not read history from the recorder; learning starts from defaults")
            return 0
        series = {
            key: [(s.last_changed.timestamp(), _number(s)) for s in states.get(entity_id, [])]
            for key, entity_id in zip(("pond", "outdoor", "power"), ids, strict=True)
        }
        if not any(series.values()):
            return 0
        first = min(p[0] for v in series.values() for p in v)
        seeded = [s for s in to_quarters(series, first, end.timestamp()) if s.pond is not None]
        before = len(self.samples)
        self.samples = prune(merge(seeded, self.samples), end.timestamp(), RETENTION_DAYS)
        self.schedule_save()
        added = len(self.samples) - before
        _LOGGER.info("Seeded %d quarter samples from the recorder", added)
        return added

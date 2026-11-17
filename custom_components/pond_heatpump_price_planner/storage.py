"""Repository for the persistent state of a planner: samples, COP buckets, model parameters and settings."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DEFAULT_SETTINGS, DOMAIN
from .core.cop import CopBucket
from .core.model import ModelParams
from .core.samples import QUARTER, RETENTION_DAYS, Sample, merge, prune

STORAGE_VERSION = 1
SAVE_DELAY = 60  # seconds


class PlannerStore:
    """Everything of one config entry that must survive a restart, kept in .storage."""

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry_id}")
        self.samples: list[Sample] = []
        self.buckets: list[CopBucket] = []
        self.params = ModelParams()
        self.settings: dict[str, Any] = dict(DEFAULT_SETTINGS)
        self.extra: dict[str, Any] = {}  # last reports, tuning result, cumulative COP

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        self.samples = [Sample.from_list(row) for row in data.get("samples", [])]
        self.buckets = [CopBucket.from_list(row) for row in data.get("buckets", [])]
        self.params = ModelParams.from_dict(data.get("params"))
        self.settings = {**DEFAULT_SETTINGS, **data.get("settings", {})}
        self.extra = data.get("extra", {})

    def add(self, sample: Sample) -> None:
        """Add or replace the sample of one quarter and schedule a save."""
        self.samples = prune(merge(self.samples, [sample]), sample.t + QUARTER, RETENTION_DAYS)
        self.schedule_save()

    def add_bucket(self, bucket: CopBucket) -> None:
        limit = bucket.t - RETENTION_DAYS * 86400
        self.buckets = [b for b in self.buckets if b.t >= limit and b.t != bucket.t] + [bucket]
        self.schedule_save()

    def replace_samples(self, samples: list[Sample]) -> None:
        self.samples = samples
        self.schedule_save()

    def set_params(self, params: ModelParams) -> None:
        self.params = params
        self.schedule_save()

    def set_setting(self, key: str, value: Any) -> None:
        self.settings[key] = value
        self.schedule_save()

    def schedule_save(self) -> None:
        self._store.async_delay_save(self._data, SAVE_DELAY)

    async def async_save(self) -> None:
        await self._store.async_save(self._data())

    async def async_remove(self) -> None:
        await self._store.async_remove()

    def _data(self) -> dict[str, Any]:
        return {
            "samples": [s.to_list() for s in self.samples],
            "buckets": [b.to_list() for b in self.buckets],
            "params": self.params.to_dict(),
            "settings": self.settings,
            "extra": self.extra,
        }

"""Base class for the entities of a planner: one device per config entry."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import PlannerCoordinator


class PlannerEntity(CoordinatorEntity[PlannerCoordinator]):
    """Observes the coordinator; the name comes from the translation key."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: PlannerCoordinator, key: str) -> None:
        super().__init__(coordinator)
        entry = coordinator.entry
        self._attr_unique_id = f"{entry.entry_id}_{key}"
        self._attr_translation_key = key
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            manufacturer="Pond Heat Pump Price Planner",
            model="Price planner",
            entry_type=DeviceEntryType.SERVICE,
        )

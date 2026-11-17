"""Button: learn the model now instead of waiting for the night."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .coordinator import PlannerCoordinator
from .entity import PlannerEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    async_add_entities([RelearnButton(entry.runtime_data)])


class RelearnButton(PlannerEntity, ButtonEntity):
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator: PlannerCoordinator) -> None:
        super().__init__(coordinator, "relearn")

    async def async_press(self) -> None:
        await self.coordinator.async_learn()

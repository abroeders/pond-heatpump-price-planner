"""Select: which COP method the COP sensor shows."""

from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import SET_COP_METHOD
from .coordinator import PlannerCoordinator
from .core.cop import COP_METHODS
from .entity import PlannerEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    async_add_entities([CopMethodSelect(entry.runtime_data)])


class CopMethodSelect(PlannerEntity, SelectEntity):
    _attr_entity_category = EntityCategory.CONFIG
    _attr_options = list(COP_METHODS)

    def __init__(self, coordinator: PlannerCoordinator) -> None:
        super().__init__(coordinator, "cop_method")

    @property
    def current_option(self) -> str:
        return self.coordinator.settings[SET_COP_METHOD]

    async def async_select_option(self, option: str) -> None:
        await self.coordinator.async_set_setting(SET_COP_METHOD, option)

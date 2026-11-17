"""Switches: control (off = dry run) and insulation cover."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.components.switch import SwitchEntity, SwitchEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import SET_CONTROL, SET_COVER
from .coordinator import PlannerCoordinator
from .entity import PlannerEntity


@dataclass(frozen=True, kw_only=True)
class SettingSwitchDescription(SwitchEntityDescription):
    setting: str


SWITCHES = (
    SettingSwitchDescription(key="control", setting=SET_CONTROL),
    SettingSwitchDescription(key="insulation_cover", setting=SET_COVER),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator: PlannerCoordinator = entry.runtime_data
    async_add_entities(SettingSwitch(coordinator, d) for d in SWITCHES)


class SettingSwitch(PlannerEntity, SwitchEntity):
    entity_description: SettingSwitchDescription

    def __init__(self, coordinator: PlannerCoordinator, description: SettingSwitchDescription) -> None:
        super().__init__(coordinator, description.key)
        self.entity_description = description

    @property
    def is_on(self) -> bool:
        return bool(self.coordinator.settings.get(self.entity_description.setting))

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.coordinator.async_set_setting(self.entity_description.setting, True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.coordinator.async_set_setting(self.entity_description.setting, False)

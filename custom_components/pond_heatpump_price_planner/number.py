"""Number entities: band, pond volume and flow. The target temperature is the climate entity."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.components.number import (
    NumberDeviceClass,
    NumberEntity,
    NumberEntityDescription,
    NumberMode,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory, UnitOfTemperature, UnitOfVolume, UnitOfVolumeFlowRate
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import SET_BAND, SET_FLOW, SET_VOLUME
from .coordinator import PlannerCoordinator
from .entity import PlannerEntity


@dataclass(frozen=True, kw_only=True)
class SettingNumberDescription(NumberEntityDescription):
    setting: str


NUMBERS: tuple[SettingNumberDescription, ...] = (
    SettingNumberDescription(
        key="band",
        setting=SET_BAND,
        native_unit_of_measurement=UnitOfTemperature.KELVIN,
        native_min_value=0.1,
        native_max_value=1.0,
        native_step=0.05,
        mode=NumberMode.BOX,
    ),
    SettingNumberDescription(
        key="pond_volume",
        setting=SET_VOLUME,
        entity_category=EntityCategory.CONFIG,
        device_class=NumberDeviceClass.VOLUME,
        native_unit_of_measurement=UnitOfVolume.CUBIC_METERS,
        native_min_value=1,
        native_max_value=500,
        native_step=0.25,
        mode=NumberMode.BOX,
    ),
    SettingNumberDescription(
        key="flow",
        setting=SET_FLOW,
        entity_category=EntityCategory.CONFIG,
        device_class=NumberDeviceClass.VOLUME_FLOW_RATE,
        native_unit_of_measurement=UnitOfVolumeFlowRate.CUBIC_METERS_PER_HOUR,
        native_min_value=0.5,
        native_max_value=20,
        native_step=0.25,
        mode=NumberMode.BOX,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator: PlannerCoordinator = entry.runtime_data
    async_add_entities(SettingNumber(coordinator, d) for d in NUMBERS)


class SettingNumber(PlannerEntity, NumberEntity):
    entity_description: SettingNumberDescription

    def __init__(self, coordinator: PlannerCoordinator, description: SettingNumberDescription) -> None:
        super().__init__(coordinator, description.key)
        self.entity_description = description

    @property
    def native_value(self) -> float | None:
        return self.coordinator.settings.get(self.entity_description.setting)

    async def async_set_native_value(self, value: float) -> None:
        await self.coordinator.async_set_setting(self.entity_description.setting, value)

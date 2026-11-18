"""Climate entity: the pond as a thermostat (current and target temperature, heating or idle)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.climate import ClimateEntity, ClimateEntityFeature, HVACAction, HVACMode
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_TEMPERATURE, UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import SET_BAND, SET_CONTROL, SET_TARGET, TARGET_MAX, TARGET_MIN, TARGET_STEP
from .coordinator import PlannerCoordinator
from .entity import PlannerEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    async_add_entities([PondThermostat(entry.runtime_data)])


class PondThermostat(PlannerEntity, ClimateEntity):
    """Only heat: whether the planner controls the heat pump is the control switch, not an HVAC mode."""

    _attr_hvac_modes = [HVACMode.HEAT]
    _attr_hvac_mode = HVACMode.HEAT
    _attr_supported_features = ClimateEntityFeature.TARGET_TEMPERATURE
    _attr_min_temp = TARGET_MIN
    _attr_max_temp = TARGET_MAX
    _attr_target_temperature_step = TARGET_STEP

    def __init__(self, coordinator: PlannerCoordinator) -> None:
        super().__init__(coordinator, "thermostat")

    def _pond(self) -> float | None:
        return self.coordinator.data.pond

    def _target(self) -> float:
        return self.coordinator.target

    @property
    def hvac_action(self) -> HVACAction | None:
        decision = self.coordinator.data.decision
        if decision is None:
            return None
        return HVACAction.IDLE if decision.mode == "off" else HVACAction.HEATING

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        decision = self.coordinator.data.decision
        return {
            "mode": decision.mode if decision else None,
            "reason": decision.reason if decision else None,
            "band": self.coordinator.settings[SET_BAND],
            "control": bool(self.coordinator.settings[SET_CONTROL]),
        }

    async def async_set_temperature(self, **kwargs: Any) -> None:
        if (temperature := kwargs.get(ATTR_TEMPERATURE)) is not None:
            value = round(min(max(float(temperature), TARGET_MIN), TARGET_MAX), 1)
            await self.coordinator.async_set_setting(SET_TARGET, value)

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        """Only heat exists; nothing to change."""


# Home Assistant 2026.11 renamed the temperature properties to native_*;
# the old names stop working in 2027.11.
# Attach whichever names this Home Assistant version uses, so neither old nor new versions log a warning.
NATIVE_CLIMATE = hasattr(ClimateEntity, "native_current_temperature")
if NATIVE_CLIMATE:
    PondThermostat._attr_native_temperature_unit = UnitOfTemperature.CELSIUS
    PondThermostat.native_current_temperature = property(PondThermostat._pond)
    PondThermostat.native_target_temperature = property(PondThermostat._target)
else:  # before 2026.11
    PondThermostat._attr_temperature_unit = UnitOfTemperature.CELSIUS
    PondThermostat.current_temperature = property(PondThermostat._pond)
    PondThermostat.target_temperature = property(PondThermostat._target)

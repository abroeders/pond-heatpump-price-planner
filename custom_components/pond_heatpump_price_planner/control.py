"""Applying decisions to the heat pump's climate entity. See docs/design/2026-11-17-control-and-safety.md."""

from __future__ import annotations

import logging
from dataclasses import dataclass

from homeassistant.components.climate import (
    ATTR_MAX_TEMP,
    ATTR_MIN_TEMP,
    ATTR_PRESET_MODE,
    ATTR_PRESET_MODES,
    ATTR_TARGET_TEMP_STEP,
    SERVICE_SET_PRESET_MODE,
    SERVICE_SET_TEMPERATURE,
    HVACMode,
)
from homeassistant.components.climate import (
    DOMAIN as CLIMATE_DOMAIN,
)
from homeassistant.const import ATTR_ENTITY_ID, ATTR_TEMPERATURE, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import issue_registry as ir

from .const import DOMAIN
from .core.preset import NoPreset, PresetStrategy
from .core.safety import Decision, MismatchTracker
from .core.setpoint import SetpointStrategy

_LOGGER = logging.getLogger(__name__)

ISSUE_NOT_FOLLOWING = "heat_pump_not_following"


@dataclass(frozen=True)
class ApplyResult:
    setpoint: float | None  # what was (or would be) sent
    sent: bool
    reason: str  # sent, unchanged, dry_run, heat_pump_off, unavailable, error
    preset: str | None = None  # the preset for the decision (None: presets not configured)


class HeatPumpController:
    """Sends the preset and the setpoint for a decision to the climate entity, each only when it changes."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry_id: str,
        climate_entity: str,
        strategy: SetpointStrategy,
        mismatch: MismatchTracker | None = None,
        presets: PresetStrategy | None = None,
    ) -> None:
        self.hass = hass
        self.entry_id = entry_id
        self.climate_entity = climate_entity
        self.strategy = strategy
        self.presets = presets or NoPreset()
        self.mismatch = mismatch or MismatchTracker()
        self.repair_raised = False

    def _climate(self):
        state = self.hass.states.get(self.climate_entity)
        if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return None
        return state

    def setpoint_for(
        self, decision: Decision, inlet: float | None, pond: float, running: bool = True
    ) -> float | None:
        state = self._climate()
        if state is None:
            return None
        attrs = state.attributes
        return self.strategy.setpoint(
            decision.mode,
            inlet,
            pond,
            float(attrs.get(ATTR_MIN_TEMP, 7)),
            float(attrs.get(ATTR_MAX_TEMP, 35)),
            float(attrs.get(ATTR_TARGET_TEMP_STEP) or 1),
            running,
        )

    async def async_apply(
        self,
        decision: Decision,
        inlet: float | None,
        pond: float,
        control: bool,
        now: float,
        running: bool = True,
    ) -> ApplyResult:
        state = self._climate()
        if state is None:
            return ApplyResult(None, False, "unavailable")
        setpoint = self.setpoint_for(decision, inlet, pond, running)
        preset = self.presets.preset(decision.mode)
        if not control:
            return ApplyResult(setpoint, False, "dry_run", preset)
        if state.state == HVACMode.OFF:
            return ApplyResult(setpoint, False, "heat_pump_off", preset)
        self.mismatch.applied(decision.mode, now)
        preset_sent = await self.async_set_preset(preset)
        current = state.attributes.get(ATTR_TEMPERATURE)
        if current is not None and float(current) == setpoint:
            return ApplyResult(setpoint, preset_sent, "sent" if preset_sent else "unchanged", preset)
        try:
            await self.hass.services.async_call(
                CLIMATE_DOMAIN,
                SERVICE_SET_TEMPERATURE,
                {ATTR_ENTITY_ID: self.climate_entity, ATTR_TEMPERATURE: setpoint},
                blocking=True,
            )
        except HomeAssistantError as err:
            _LOGGER.warning("Could not set %s to %s: %s", self.climate_entity, setpoint, err)
            return ApplyResult(setpoint, False, "error", preset)
        return ApplyResult(setpoint, True, "sent", preset)

    async def async_set_preset(self, preset: str | None) -> bool:
        """Set the preset when it differs and the heat pump offers it; returns whether it was sent."""
        state = self._climate()
        if preset is None or state is None or state.attributes.get(ATTR_PRESET_MODE) == preset:
            return False
        if preset not in (state.attributes.get(ATTR_PRESET_MODES) or ()):
            _LOGGER.warning("%s has no preset %s", self.climate_entity, preset)
            return False
        try:
            await self.hass.services.async_call(
                CLIMATE_DOMAIN,
                SERVICE_SET_PRESET_MODE,
                {ATTR_ENTITY_ID: self.climate_entity, ATTR_PRESET_MODE: preset},
                blocking=True,
            )
        except HomeAssistantError as err:
            _LOGGER.warning("Could not set the preset of %s to %s: %s", self.climate_entity, preset, err)
            return False
        return True

    async def async_release(self) -> None:
        """Control was turned off: leave the heat pump on the efficient preset."""
        await self.async_set_preset(self.presets.preset("off"))

    def check_following(self, measured_mode: str | None, now: float) -> bool:
        """Track whether the heat pump follows; raise or clear the repair issue. Returns the mismatch."""
        mismatch, repair = self.mismatch.observe(measured_mode, now)
        if repair and not self.repair_raised:
            ir.async_create_issue(
                self.hass,
                DOMAIN,
                f"{ISSUE_NOT_FOLLOWING}_{self.entry_id}",
                is_fixable=False,
                severity=ir.IssueSeverity.WARNING,
                translation_key=ISSUE_NOT_FOLLOWING,
                translation_placeholders={"entity": self.climate_entity},
            )
            self.repair_raised = True
        elif not mismatch and self.repair_raised:
            ir.async_delete_issue(self.hass, DOMAIN, f"{ISSUE_NOT_FOLLOWING}_{self.entry_id}")
            self.repair_raised = False
        return mismatch

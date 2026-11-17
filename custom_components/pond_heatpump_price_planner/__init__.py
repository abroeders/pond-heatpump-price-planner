"""Pond Heat Pump Price Planner: plans a pond heat pump on quarter-hour electricity prices."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .coordinator import PlannerCoordinator

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.NUMBER,
    Platform.SWITCH,
    Platform.SELECT,
    Platform.BUTTON,
]

type PlannerConfigEntry = ConfigEntry[PlannerCoordinator]


async def async_setup_entry(hass: HomeAssistant, entry: PlannerConfigEntry) -> bool:
    """Set up a planner: load its store, start its timers and listeners, add the entities."""
    coordinator = PlannerCoordinator(hass, entry)
    try:
        await coordinator.async_start()
    except Exception:
        await coordinator.async_stop()  # no timers or listeners may outlive a failed setup
        raise
    entry.runtime_data = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: PlannerConfigEntry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        await entry.runtime_data.async_stop()
    return unloaded


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Delete the stored samples and model when the entry is removed."""
    from .storage import PlannerStore

    await PlannerStore(hass, entry.entry_id).async_remove()


async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Version 1 entries (the empty scaffold of v0.0.x) have no links: they must be added again."""
    if entry.version == 1:
        _LOGGER.error(
            "The entry '%s' was created by a development version without links to entities. "
            "Remove it and add the integration again",
            entry.title,
        )
        return False
    return True


async def _async_options_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)

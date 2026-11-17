from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.pond_heatpump_price_planner.const import DEFAULT_OPTIONS, DOMAIN

from .conftest import CLIMATE, LINKS


async def setup(hass: HomeAssistant) -> MockConfigEntry:
    entry = MockConfigEntry(
        domain=DOMAIN, title="Pond", unique_id=CLIMATE, data=LINKS, options=DEFAULT_OPTIONS, version=2
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def state(hass: HomeAssistant, domain: str, key: str):
    from homeassistant.helpers import entity_registry as er

    entity_id = er.async_get(hass).async_get_entity_id(domain, DOMAIN, f"{hass.data['_entry_id']}_{key}")
    return hass.states.get(entity_id)


async def test_setup_creates_entities_and_plans_in_dry_run(hass: HomeAssistant, pond_states) -> None:
    entry = await setup(hass)
    calls = async_mock_service(hass, "climate", "set_temperature")
    await entry.runtime_data.async_replan()
    hass.data["_entry_id"] = entry.entry_id
    assert entry.state is ConfigEntryState.LOADED
    mode = state(hass, "sensor", "mode")
    assert mode.state in ("off", "low", "high")
    assert mode.attributes["control"] is False
    assert mode.attributes["would_set"] is not None
    assert len(mode.attributes["plan"]) > 0
    assert state(hass, "climate", "thermostat").attributes["temperature"] == 15.0
    assert state(hass, "switch", "control").state == "off"
    assert state(hass, "select", "cop_method").state == "average"
    assert not calls  # dry run: nothing is sent


async def test_control_on_sends_the_setpoint(hass: HomeAssistant, pond_states) -> None:
    entry = await setup(hass)
    calls = async_mock_service(hass, "climate", "set_temperature")  # after setup: loading climate replaces it
    hass.data["_entry_id"] = entry.entry_id
    switch = state(hass, "switch", "control")
    await hass.services.async_call("switch", "turn_on", {"entity_id": switch.entity_id}, blocking=True)
    await entry.runtime_data.async_replan()
    await hass.async_block_till_done()
    assert calls and calls[-1].data["entity_id"] == CLIMATE
    assert calls[-1].data["temperature"] in (13, 15, 16)  # off, low or high around inlet 15


async def test_thermostat_sets_target_and_shows_heating(hass: HomeAssistant, pond_states) -> None:
    entry = await setup(hass)
    hass.data["_entry_id"] = entry.entry_id
    thermostat = state(hass, "climate", "thermostat")
    assert thermostat.state == "heat"
    assert thermostat.attributes["current_temperature"] == 14.9
    assert thermostat.attributes["max_temp"] == 28 and thermostat.attributes["min_temp"] == 5
    decision = entry.runtime_data.data.decision.mode
    assert thermostat.attributes["hvac_action"] == ("idle" if decision == "off" else "heating")
    await hass.services.async_call(
        "climate", "set_temperature", {"entity_id": thermostat.entity_id, "temperature": 16.5}, blocking=True
    )
    assert entry.runtime_data.settings["target"] == 16.5
    assert state(hass, "climate", "thermostat").attributes["temperature"] == 16.5
    await hass.services.async_call(
        "climate", "set_hvac_mode", {"entity_id": thermostat.entity_id, "hvac_mode": "heat"}, blocking=True
    )
    assert state(hass, "climate", "thermostat").state == "heat"


async def test_old_target_number_is_removed(hass: HomeAssistant, pond_states) -> None:
    from homeassistant.helpers import entity_registry as er

    entry = MockConfigEntry(
        domain=DOMAIN, title="Pond", unique_id=CLIMATE, data=LINKS, options=DEFAULT_OPTIONS, version=2
    )
    entry.add_to_hass(hass)
    registry = er.async_get(hass)
    old = registry.async_get_or_create("number", DOMAIN, f"{entry.entry_id}_target", config_entry=entry)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert registry.async_get(old.entity_id) is None


async def test_stored_target_above_the_maximum_is_capped(hass: HomeAssistant, pond_states) -> None:
    entry = await setup(hass)
    await entry.runtime_data.async_set_setting("target", 30.0)
    assert entry.runtime_data.target == 28.0


async def test_unload(hass: HomeAssistant, pond_states) -> None:
    entry = await setup(hass)
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert entry.state is ConfigEntryState.NOT_LOADED


async def test_version_1_entry_is_not_migrated(hass: HomeAssistant, pond_states) -> None:
    entry = MockConfigEntry(domain=DOMAIN, title="Old", data={}, version=1)
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    assert entry.state is ConfigEntryState.MIGRATION_ERROR

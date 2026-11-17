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
    calls = async_mock_service(hass, "climate", "set_temperature")
    entry = await setup(hass)
    hass.data["_entry_id"] = entry.entry_id
    assert entry.state is ConfigEntryState.LOADED
    mode = state(hass, "sensor", "mode")
    assert mode.state in ("off", "low", "high")
    assert mode.attributes["control"] is False
    assert mode.attributes["would_set"] is not None
    assert len(mode.attributes["plan"]) > 0
    assert state(hass, "number", "target").state == "15.0"
    assert state(hass, "switch", "control").state == "off"
    assert state(hass, "select", "cop_method").state == "average"
    assert not calls  # dry run: nothing is sent


async def test_control_on_sends_the_setpoint(hass: HomeAssistant, pond_states) -> None:
    calls = async_mock_service(hass, "climate", "set_temperature")
    entry = await setup(hass)
    hass.data["_entry_id"] = entry.entry_id
    switch = state(hass, "switch", "control")
    await hass.services.async_call("switch", "turn_on", {"entity_id": switch.entity_id}, blocking=True)
    await entry.runtime_data.async_replan()
    await hass.async_block_till_done()
    assert calls and calls[-1].data["entity_id"] == CLIMATE
    assert calls[-1].data["temperature"] in (13, 15, 16)  # off, low or high around inlet 15


async def test_target_change_is_stored(hass: HomeAssistant, pond_states) -> None:
    entry = await setup(hass)
    hass.data["_entry_id"] = entry.entry_id
    target = state(hass, "number", "target")
    await hass.services.async_call(
        "number", "set_value", {"entity_id": target.entity_id, "value": 16.5}, blocking=True
    )
    assert entry.runtime_data.settings["target"] == 16.5
    assert state(hass, "number", "target").state == "16.5"


async def test_unload(hass: HomeAssistant, pond_states) -> None:
    entry = await setup(hass)
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert entry.state is ConfigEntryState.NOT_LOADED


async def test_version_1_entry_is_not_migrated(hass: HomeAssistant, pond_states) -> None:
    entry = MockConfigEntry(domain=DOMAIN, title="Old", data={}, version=1)
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    assert entry.state is ConfigEntryState.MIGRATION_ERROR

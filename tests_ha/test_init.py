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
    assert isinstance(mode.attributes["pond_history"], list)
    assert state(hass, "climate", "thermostat").attributes["temperature"] == 15.0
    assert state(hass, "switch", "control").state == "off"
    assert state(hass, "select", "cop_method").state == "average"
    assert not calls  # dry run: nothing is sent


async def test_mode_sensor_publishes_the_pond_history(hass: HomeAssistant, pond_states) -> None:
    import time

    from custom_components.pond_heatpump_price_planner.core.samples import Sample

    entry = await setup(hass)
    hass.data["_entry_id"] = entry.entry_id
    coordinator = entry.runtime_data
    now = time.time() // 900 * 900
    coordinator.store.replace_samples(
        sorted(
            [Sample(t=now - 50 * 3600, pond=13.0, outdoor=5, power=0)]
            + [Sample(t=now - 900 * i, pond=14.0 + i / 100, outdoor=5, power=0) for i in range(1, 5)]
            + [Sample(t=now - 1800 - 1, pond=None, outdoor=5, power=0)],
            key=lambda x: x.t,
        )
    )
    coordinator.async_set_updated_data(coordinator.data)
    await hass.async_block_till_done()
    history = state(hass, "sensor", "mode").attributes["pond_history"]
    assert [p["temp"] for p in history] == [14.04, 14.03, 14.02, 14.01]  # older than 48 h and gaps left out


async def test_control_on_sends_the_setpoint(hass: HomeAssistant, pond_states) -> None:
    entry = await setup(hass)
    calls = async_mock_service(hass, "climate", "set_temperature")  # after setup: loading climate replaces it
    hass.data["_entry_id"] = entry.entry_id
    # a setpoint that fits no mode, so the planner always sends one (13 = off would be "unchanged" at night)
    hass.states.async_set(CLIMATE, "heat", {**hass.states.get(CLIMATE).attributes, "temperature": 20})
    switch = state(hass, "switch", "control")
    await hass.services.async_call("switch", "turn_on", {"entity_id": switch.entity_id}, blocking=True)
    await entry.runtime_data.async_replan()
    await hass.async_block_till_done()
    assert calls and calls[-1].data["entity_id"] == CLIMATE
    assert calls[-1].data["temperature"] in (13, 17)  # off, or low/high with the start offset (not running)


async def test_start_setpoint_until_the_heat_pump_runs(hass: HomeAssistant, pond_states) -> None:
    from .conftest import POND, POWER

    hass.states.async_set(POND, "14.6", {"device_class": "temperature", "unit_of_measurement": "°C"})
    entry = await setup(hass)
    calls = async_mock_service(hass, "climate", "set_temperature")
    hass.data["_entry_id"] = entry.entry_id
    switch = state(hass, "switch", "control")
    await hass.services.async_call("switch", "turn_on", {"entity_id": switch.entity_id}, blocking=True)
    await entry.runtime_data.async_replan()
    await hass.async_block_till_done()
    assert entry.runtime_data.data.decision.mode in ("low", "high")  # below the band of 15 ± 0.25
    assert calls[-1].data["temperature"] == 17  # inlet 15 + start offset 2: the heat pump is off (5 W)
    hass.states.async_set(CLIMATE, "heat", {**hass.states.get(CLIMATE).attributes, "temperature": 17})
    hass.states.async_set(POWER, "120", {"device_class": "power", "unit_of_measurement": "W"})
    await hass.async_block_till_done()
    assert calls[-1].data["temperature"] == 17  # still below low_w (150 W): not started yet
    hass.states.async_set(POWER, "380", {"device_class": "power", "unit_of_measurement": "W"})
    await hass.async_block_till_done()
    assert calls[-1].data["temperature"] in (15, 16)  # running: the mode's setpoint at once


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


async def test_plans_as_soon_as_the_pond_sensor_appears(hass: HomeAssistant, pond_states) -> None:
    from datetime import timedelta

    from homeassistant.util import dt as dt_util
    from pytest_homeassistant_custom_component.common import async_fire_time_changed

    from .conftest import POND

    hass.states.async_set(POND, "unavailable")
    entry = await setup(hass)
    coordinator = entry.runtime_data
    assert coordinator.data.plan is None and coordinator.data.decision.reason == "no_pond_temperature"
    hass.states.async_set(POND, "14.8", {"device_class": "temperature", "unit_of_measurement": "°C"})
    await hass.async_block_till_done()  # let the state listener schedule the replan
    assert coordinator._replan_handle is not None
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=5))  # past the 2 s debounce
    await hass.async_block_till_done()
    assert coordinator.data.plan is not None
    assert coordinator.data.decision.reason != "no_pond_temperature"


async def test_band_is_in_celsius(hass: HomeAssistant, pond_states) -> None:
    entry = await setup(hass)
    hass.data["_entry_id"] = entry.entry_id
    band = state(hass, "number", "band")
    assert band.attributes["unit_of_measurement"] == "°C" and band.state == "0.25"


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

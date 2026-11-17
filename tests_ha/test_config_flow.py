from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.pond_heatpump_price_planner.const import DEFAULT_OPTIONS, DOMAIN

from .conftest import CLIMATE, INLET, LINKS, OUTDOOR, OUTLET, POND, POWER, PRICE


async def test_full_flow_creates_entry(hass: HomeAssistant, pond_states) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    assert result["type"] is FlowResultType.FORM and result["step_id"] == "user"
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "name": "Pond",
            "pond_temperature": POND,
            "heat_pump": CLIMATE,
            "power": POWER,
            "inlet_temperature": INLET,
            "outdoor_temperature": OUTDOOR,
        },  # fmt: skip
    )
    assert result["step_id"] == "prices"
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {"price": PRICE})
    assert result["step_id"] == "solar"
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["step_id"] == "cop"
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {"outlet_temperature": OUTLET})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Pond"
    assert result["data"]["price"] == PRICE and result["data"]["outlet_temperature"] == OUTLET
    assert "name" not in result["data"] and "weather" not in result["data"]
    assert result["options"] == DEFAULT_OPTIONS


async def test_price_sensor_without_list_is_refused(hass: HomeAssistant, pond_states) -> None:
    hass.states.async_set("sensor.plain_price", "0.31")
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "name": "Pond",
            "pond_temperature": POND,
            "heat_pump": CLIMATE,
            "power": POWER,
            "outdoor_temperature": OUTDOOR,
        },
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"price": "sensor.plain_price"}
    )
    assert result["type"] is FlowResultType.FORM and result["errors"] == {"price": "price_not_recognised"}


async def test_same_heat_pump_twice_is_aborted(hass: HomeAssistant, pond_states) -> None:
    MockConfigEntry(domain=DOMAIN, unique_id=CLIMATE, data=LINKS, version=2).add_to_hass(hass)
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {
            "name": "Pond",
            "pond_temperature": POND,
            "heat_pump": CLIMATE,
            "power": POWER,
            "outdoor_temperature": OUTDOOR,
        },
    )
    assert result["type"] is FlowResultType.ABORT and result["reason"] == "already_configured"


async def test_options_flow(hass: HomeAssistant, pond_states) -> None:
    entry = MockConfigEntry(domain=DOMAIN, unique_id=CLIMATE, data=LINKS, options=DEFAULT_OPTIONS, version=2)
    entry.add_to_hass(hass)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.FORM
    new = {**DEFAULT_OPTIONS, "price_multiplier": 1.21, "price_addition": 0.1357}
    result = await hass.config_entries.options.async_configure(result["flow_id"], new)
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options["price_multiplier"] == 1.21


async def test_reconfigure_removes_an_emptied_link(hass: HomeAssistant, pond_states) -> None:
    entry = MockConfigEntry(domain=DOMAIN, unique_id=CLIMATE, data=LINKS, options=DEFAULT_OPTIONS, version=2)
    entry.add_to_hass(hass)
    result = await entry.start_reconfigure_flow(hass)
    assert result["step_id"] == "reconfigure"
    pond_step = {k: LINKS[k] for k in ("pond_temperature", "heat_pump", "power", "outdoor_temperature")}
    result = await hass.config_entries.flow.async_configure(result["flow_id"], pond_step)  # inlet emptied
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {"price": PRICE})
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {"outlet_temperature": OUTLET})
    assert result["type"] is FlowResultType.ABORT and result["reason"] == "reconfigure_successful"
    assert "inlet_temperature" not in entry.data and entry.data["price"] == PRICE
    await hass.async_block_till_done()
    await hass.config_entries.async_unload(entry.entry_id)  # the reload after reconfigure set it up

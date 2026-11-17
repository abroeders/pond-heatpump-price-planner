"""Fixtures: a pond, a heat pump, prices and the integration enabled."""

from __future__ import annotations

from datetime import timedelta

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

pytest_plugins = "pytest_homeassistant_custom_component"

POND = "sensor.pond_temperature"
OUTDOOR = "sensor.outdoor_temperature"
POWER = "sensor.heat_pump_power"
INLET = "sensor.heat_pump_water_in"
OUTLET = "sensor.heat_pump_water_out"
CLIMATE = "climate.heat_pump"
PRICE = "sensor.electricity_price"

LINKS = {
    "pond_temperature": POND,
    "heat_pump": CLIMATE,
    "power": POWER,
    "inlet_temperature": INLET,
    "outdoor_temperature": OUTDOOR,
    "price": PRICE,
    "outlet_temperature": OUTLET,
}


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    return


def price_attributes(hours: int = 36, base: float = 0.30) -> dict:
    start = dt_util.now().replace(minute=0, second=0, microsecond=0)
    raw = []
    for i in range(hours):
        t = start + timedelta(hours=i)
        value = base + (0.25 if 17 <= t.hour < 20 else 0.0)
        raw.append({"start": t.isoformat(), "end": (t + timedelta(hours=1)).isoformat(), "value": value})
    return {"raw_today": raw}


@pytest.fixture
def pond_states(hass: HomeAssistant) -> None:
    hass.states.async_set(POND, "14.9", {"device_class": "temperature", "unit_of_measurement": "°C"})
    hass.states.async_set(OUTDOOR, "9.0", {"device_class": "temperature", "unit_of_measurement": "°C"})
    hass.states.async_set(POWER, "5", {"device_class": "power", "unit_of_measurement": "W"})
    hass.states.async_set(INLET, "15", {"device_class": "temperature", "unit_of_measurement": "°C"})
    hass.states.async_set(OUTLET, "15", {"device_class": "temperature", "unit_of_measurement": "°C"})
    hass.states.async_set(
        CLIMATE,
        "heat",
        {"temperature": 13, "min_temp": 7, "max_temp": 60, "target_temp_step": 1, "current_temperature": 15},
    )
    hass.states.async_set(PRICE, "0.30", price_attributes())

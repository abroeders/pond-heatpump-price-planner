"""Adapter from Home Assistant states to the inputs of the core: numbers, prices, forecasts, surplus."""

from __future__ import annotations

import logging
from collections.abc import Mapping
from typing import Any

from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.util import dt as dt_util

from .const import (
    CONF_AIR_INLET,
    CONF_INLET,
    CONF_OUTDOOR,
    CONF_POND,
    CONF_POWER,
    CONF_PRICE,
    CONF_PRICE_FORECAST,
    CONF_SOLAR_FORECAST,
    CONF_SURPLUS,
    CONF_SURPLUS_TYPE,
    CONF_WEATHER,
    OPT_BASE_LOAD,
    OPT_FEED_IN_ADDITION,
    OPT_FEED_IN_MULTIPLIER,
    OPT_FORECAST_ADDITION,
    OPT_FORECAST_MULTIPLIER,
    OPT_HORIZON,
    OPT_PRICE_ADDITION,
    OPT_PRICE_MULTIPLIER,
)
from .core.forecasts import OutdoorForecast, SolarSurplus, solar_intervals, surplus_now
from .core.prices import PriceTransform, parse_intervals
from .core.pricing import PriceSeries, current_price, price_series
from .core.timeseries import Interval, quarter_values

_LOGGER = logging.getLogger(__name__)
WEATHER_CACHE = 3600.0  # s


class InputReader:
    """Reads the linked entities. Entity ids come from the config entry, tuning from its options."""

    def __init__(self, hass: HomeAssistant, links: Mapping[str, Any], options: Mapping[str, Any]) -> None:
        self.hass = hass
        self.links = links
        self.options = options
        self._weather_points: list[tuple[float, float]] = []
        self._weather_at = 0.0

    # --- plain numbers -------------------------------------------------------------------------
    def number(self, key: str) -> float | None:
        entity_id = self.links.get(key)
        if not entity_id:
            return None
        state = self.hass.states.get(entity_id)
        if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return None
        try:
            return float(state.state)
        except ValueError:
            return None

    def age(self, key: str, now: float) -> float:
        """Seconds since the linked entity last reported (infinite if unknown)."""
        entity_id = self.links.get(key)
        state = self.hass.states.get(entity_id) if entity_id else None
        if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return float("inf")
        return now - state.last_reported.timestamp()

    def pond(self) -> float | None:
        return self.number(CONF_POND)

    def outdoor(self) -> float | None:
        return self.number(CONF_OUTDOOR)

    def inlet(self) -> float | None:
        return self.number(CONF_INLET)

    def power_w(self) -> float | None:
        return self.number(CONF_POWER)

    def air_inlet(self) -> float | None:
        return self.number(CONF_AIR_INLET)

    # --- prices --------------------------------------------------------------------------------
    def _transform(self, mult: str, add: str) -> PriceTransform:
        return PriceTransform(float(self.options[mult]), float(self.options[add]))

    def _intervals(self, key: str) -> list[Interval]:
        entity_id = self.links.get(key)
        state = self.hass.states.get(entity_id) if entity_id else None
        if state is None:
            return []
        return parse_intervals(state.attributes, self.hass.config.time_zone)

    def prices(self, start: float) -> PriceSeries:
        return price_series(
            self._intervals(CONF_PRICE),
            self._intervals(CONF_PRICE_FORECAST),
            start,
            float(self.options[OPT_HORIZON]),
            self._transform(OPT_PRICE_MULTIPLIER, OPT_PRICE_ADDITION),
            self._transform(OPT_FORECAST_MULTIPLIER, OPT_FORECAST_ADDITION),
            self._transform(OPT_FEED_IN_MULTIPLIER, OPT_FEED_IN_ADDITION),
        )

    def price_now(self, t: float) -> float | None:
        transform = self._transform(OPT_PRICE_MULTIPLIER, OPT_PRICE_ADDITION)
        value = current_price(self._intervals(CONF_PRICE), t, transform)
        if value is None:  # sensors without a list: use the state
            raw = self.number(CONF_PRICE)
            value = transform.apply(raw) if raw is not None else None
        return value

    # --- weather -------------------------------------------------------------------------------
    async def async_outdoor_forecast(self, now: float) -> OutdoorForecast:
        entity_id = self.links.get(CONF_WEATHER)
        if not entity_id:
            return OutdoorForecast([])
        if now - self._weather_at > WEATHER_CACHE or not self._weather_points:
            try:
                response = await self.hass.services.async_call(
                    "weather",
                    "get_forecasts",
                    {"entity_id": entity_id, "type": "hourly"},
                    blocking=True,
                    return_response=True,
                )
                forecast = (response or {}).get(entity_id, {}).get("forecast", [])
                points = []
                for item in forecast:
                    when = dt_util.parse_datetime(str(item.get("datetime")))
                    temp = item.get("temperature")
                    if when is not None and temp is not None:
                        points.append((when.timestamp(), float(temp)))
                self._weather_points = sorted(points)
                self._weather_at = now
            except (HomeAssistantError, ValueError) as err:
                _LOGGER.debug("No hourly forecast from %s: %s", entity_id, err)
        return OutdoorForecast(self._weather_points)

    # --- solar ---------------------------------------------------------------------------------
    def surplus(self, start: float, n: int, heat_pump_w: float) -> list[float] | None:
        """Solar surplus per quarter (kW), or None when no surplus sensor is linked."""
        if not self.links.get(CONF_SURPLUS):
            return None
        base_load = float(self.options[OPT_BASE_LOAD])
        now_kw = surplus_now(
            self.links.get(CONF_SURPLUS_TYPE, "pv_power"), self.number(CONF_SURPLUS), heat_pump_w, base_load
        )
        forecast: list[Interval] = []
        forecast_now = None
        entity_id = self.links.get(CONF_SOLAR_FORECAST)
        state = self.hass.states.get(entity_id) if entity_id else None
        if state is not None:
            forecast = solar_intervals(state.attributes, self.hass.config.time_zone)
            forecast_now = quarter_values(forecast, start, 1)[0]
        return SolarSurplus(base_load / 1000).quarters(start, n, now_kw, forecast, forecast_now)

"""Config flow (links to other entities, in four steps), reconfigure flow and options flow (tuning)."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.const import CONF_NAME
from homeassistant.core import callback
from homeassistant.helpers import selector

from .const import (
    CONF_AIR_INLET,
    CONF_CLIMATE,
    CONF_ENERGY,
    CONF_INLET,
    CONF_OUTDOOR,
    CONF_OUTLET,
    CONF_POND,
    CONF_POWER,
    CONF_PRICE,
    CONF_PRICE_FORECAST,
    CONF_SOLAR_FORECAST,
    CONF_SURPLUS,
    CONF_SURPLUS_TYPE,
    CONF_WEATHER,
    DEFAULT_NAME,
    DEFAULT_OPTIONS,
    DOMAIN,
    LANGUAGE_OPTIONS,
    OPT_ALLOW_HIGH,
    OPT_BASE_LOAD,
    OPT_COP_WINDOW,
    OPT_FEED_IN_ADDITION,
    OPT_FEED_IN_MULTIPLIER,
    OPT_FORECAST_ADDITION,
    OPT_FORECAST_MULTIPLIER,
    OPT_HIGH_W,
    OPT_HORIZON,
    OPT_LANGUAGE,
    OPT_LOW_W,
    OPT_MARGIN,
    OPT_OFFSET_HIGH,
    OPT_OFFSET_LOW,
    OPT_OFFSET_OFF,
    OPT_OFFSET_START,
    OPT_PRICE_ADDITION,
    OPT_PRICE_MULTIPLIER,
    OPT_RUN_THRESHOLD,
    OPT_SETTLE,
    OPT_START_PENALTY,
    OPT_SURCHARGE,
    OPT_SURCHARGE_AUTO,
    SURPLUS_TYPES,
)
from .core.prices import parse_intervals


def _entity(domain: str, device_class: str | None = None) -> selector.EntitySelector:
    if device_class:
        return selector.EntitySelector(
            selector.EntitySelectorConfig(domain=domain, device_class=device_class)
        )
    return selector.EntitySelector(selector.EntitySelectorConfig(domain=domain))


def _number(
    minimum: float, maximum: float, step: float | str, unit: str | None = None
) -> selector.NumberSelector:
    config = selector.NumberSelectorConfig(
        min=minimum, max=maximum, step=step, mode=selector.NumberSelectorMode.BOX
    )
    if unit:
        config = selector.NumberSelectorConfig(
            min=minimum,
            max=maximum,
            step=step,
            mode=selector.NumberSelectorMode.BOX,
            unit_of_measurement=unit,
        )
    return selector.NumberSelector(config)


STEP_POND = vol.Schema(
    {
        vol.Required(CONF_POND): _entity("sensor", "temperature"),
        vol.Required(CONF_CLIMATE): _entity("climate"),
        vol.Required(CONF_POWER): _entity("sensor", "power"),
        vol.Optional(CONF_INLET): _entity("sensor", "temperature"),
        vol.Required(CONF_OUTDOOR): _entity("sensor", "temperature"),
    }
)
STEP_PRICES = vol.Schema(
    {
        vol.Optional(CONF_PRICE): _entity("sensor"),
        vol.Optional(CONF_PRICE_FORECAST): _entity("sensor"),
        vol.Optional(CONF_WEATHER): _entity("weather"),
    }
)
STEP_SOLAR = vol.Schema(
    {
        vol.Optional(CONF_SURPLUS): _entity("sensor", "power"),
        vol.Optional(CONF_SURPLUS_TYPE, default="pv_power"): selector.SelectSelector(
            selector.SelectSelectorConfig(options=list(SURPLUS_TYPES), translation_key=CONF_SURPLUS_TYPE)
        ),
        vol.Optional(CONF_SOLAR_FORECAST): _entity("sensor"),
    }
)
STEP_COP = vol.Schema(
    {
        vol.Optional(CONF_OUTLET): _entity("sensor", "temperature"),
        vol.Optional(CONF_ENERGY): _entity("sensor", "energy"),
        vol.Optional(CONF_AIR_INLET): _entity("sensor", "temperature"),
    }
)


class PondPlannerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Links the planner to the pond, the heat pump and the optional price, weather, solar and COP sensors."""

    VERSION = 2

    def __init__(self) -> None:
        self._data: dict[str, Any] = {}
        self._title = DEFAULT_NAME
        self._reconfigure = False

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return PondPlannerOptionsFlow()

    def _check_prices(self, user_input: dict[str, Any]) -> dict[str, str]:
        """A price sensor must publish a price list in a recognised format."""
        for key in (CONF_PRICE, CONF_PRICE_FORECAST):
            entity_id = user_input.get(key)
            if not entity_id:
                continue
            state = self.hass.states.get(entity_id)
            if state is None or not parse_intervals(state.attributes, self.hass.config.time_zone):
                return {key: "price_not_recognised"}
        return {}

    async def _step(
        self,
        step_id: str,
        schema: vol.Schema,
        user_input: dict[str, Any] | None,
        next_step: Callable[[], Awaitable[ConfigFlowResult]],
        validate: Callable[[dict[str, Any]], dict[str, str]] | None = None,
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            errors = validate(user_input) if validate else {}
            if not errors:
                for key in schema.schema:  # an emptied optional field removes the link
                    self._data.pop(str(key), None)
                self._data.update(
                    {k: v for k, v in user_input.items() if v not in (None, "") and k != CONF_NAME}
                )
                return await next_step()
        return self.async_show_form(
            step_id=step_id,
            data_schema=self.add_suggested_values_to_schema(schema, user_input or self._data),
            errors=errors,
        )

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        schema = vol.Schema({vol.Required(CONF_NAME, default=DEFAULT_NAME): str}).extend(STEP_POND.schema)
        if user_input is not None:
            await self.async_set_unique_id(user_input[CONF_CLIMATE])
            self._abort_if_unique_id_configured()
            self._title = user_input[CONF_NAME]
        return await self._step("user", schema, user_input, self.async_step_prices)

    async def async_step_prices(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        return await self._step("prices", STEP_PRICES, user_input, self.async_step_solar, self._check_prices)

    async def async_step_solar(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        return await self._step("solar", STEP_SOLAR, user_input, self.async_step_cop)

    async def async_step_cop(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        return await self._step("cop", STEP_COP, user_input, self._async_finish)

    async def async_step_reconfigure(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if not self._reconfigure:
            self._reconfigure = True
            self._data = dict(self._get_reconfigure_entry().data)
        return await self._step("reconfigure", STEP_POND, user_input, self.async_step_prices)

    async def _async_finish(self) -> ConfigFlowResult:
        if self._reconfigure:
            return self.async_update_reload_and_abort(self._get_reconfigure_entry(), data=self._data)
        return self.async_create_entry(title=self._title, data=self._data, options=dict(DEFAULT_OPTIONS))


OPTIONS_SCHEMA = vol.Schema(
    {
        vol.Required(OPT_PRICE_MULTIPLIER): _number(0, 10, 0.001),
        vol.Required(OPT_PRICE_ADDITION): _number(-2, 2, "any", "EUR/kWh"),
        vol.Required(OPT_FORECAST_MULTIPLIER): _number(0, 10, 0.001),
        vol.Required(OPT_FORECAST_ADDITION): _number(-2, 2, "any", "EUR/kWh"),
        vol.Required(OPT_FEED_IN_MULTIPLIER): _number(0, 10, 0.001),
        vol.Required(OPT_FEED_IN_ADDITION): _number(-2, 2, "any", "EUR/kWh"),
        vol.Required(OPT_BASE_LOAD): _number(0, 5000, 10, "W"),
        vol.Required(OPT_START_PENALTY): _number(0, 1, 0.01, "EUR"),
        vol.Required(OPT_MARGIN): _number(0, 0.2, 0.01, "K"),
        vol.Required(OPT_ALLOW_HIGH): selector.BooleanSelector(),
        vol.Required(OPT_SURCHARGE_AUTO): selector.BooleanSelector(),
        vol.Required(OPT_SURCHARGE): _number(0, 2, 0.01, "EUR/kWh"),
        vol.Required(OPT_HORIZON): _number(6, 48, 1, "h"),
        vol.Required(OPT_OFFSET_OFF): _number(-5, 5, 0.5, "K"),
        vol.Required(OPT_OFFSET_LOW): _number(-5, 5, 0.5, "K"),
        vol.Required(OPT_OFFSET_HIGH): _number(-5, 5, 0.5, "K"),
        vol.Required(OPT_OFFSET_START): _number(-5, 5, 0.5, "K"),
        vol.Required(OPT_LOW_W): _number(0, 5000, 10, "W"),
        vol.Required(OPT_HIGH_W): _number(0, 10000, 10, "W"),
        vol.Required(OPT_COP_WINDOW): _number(7, 42, 1, "d"),
        vol.Required(OPT_RUN_THRESHOLD): _number(0, 2000, 10, "W"),
        vol.Required(OPT_SETTLE): _number(0, 120, 1, "min"),
        vol.Required(OPT_LANGUAGE): selector.SelectSelector(
            selector.SelectSelectorConfig(options=list(LANGUAGE_OPTIONS), translation_key=OPT_LANGUAGE)
        ),
    }
)


class PondPlannerOptionsFlow(OptionsFlow):
    """All tuning values in one form; saving reloads the entry."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=user_input)
        current = {**DEFAULT_OPTIONS, **self.config_entry.options}
        return self.async_show_form(
            step_id="init", data_schema=self.add_suggested_values_to_schema(OPTIONS_SCHEMA, current)
        )

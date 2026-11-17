"""Config flow for the Pond Heat Pump Price Planner integration."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.const import CONF_NAME

from .const import DEFAULT_NAME, DOMAIN


class PondPlannerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the setup of a planner."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Ask for a name."""
        if user_input is not None:
            return self.async_create_entry(title=user_input[CONF_NAME], data={})
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({vol.Required(CONF_NAME, default=DEFAULT_NAME): str}),
        )

from unittest.mock import AsyncMock, MagicMock, patch

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.pond_heatpump_price_planner import async_register_card
from custom_components.pond_heatpump_price_planner.const import CARD_URL, DEFAULT_OPTIONS, DOMAIN

from .conftest import CLIMATE, LINKS


async def test_card_is_served_and_registered(hass: HomeAssistant) -> None:
    hass.http = MagicMock(async_register_static_paths=AsyncMock())
    hass.config.components.add("frontend")
    with patch("homeassistant.components.frontend.add_extra_js_url") as add_url:
        assert await async_register_card(hass)
    config = hass.http.async_register_static_paths.call_args.args[0][0]
    assert config.url_path == CARD_URL and config.path.endswith("frontend/pond-heatpump-planner-card.js")
    url = add_url.call_args.args[1]
    assert url.startswith(f"{CARD_URL}?v=")


async def test_card_registration_is_skipped_without_frontend(hass: HomeAssistant) -> None:
    assert not await async_register_card(hass)


async def test_plan_attribute_has_known_and_links(hass: HomeAssistant, pond_states) -> None:
    from homeassistant.helpers import entity_registry as er

    entry = MockConfigEntry(
        domain=DOMAIN, title="Pond", unique_id=CLIMATE, data=LINKS, options=DEFAULT_OPTIONS, version=2
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    registry = er.async_get(hass)
    mode = hass.states.get(registry.async_get_entity_id("sensor", DOMAIN, f"{entry.entry_id}_mode"))
    plan = mode.attributes["plan"]
    assert plan and "known" in plan[0] and plan[0]["known"] is True
    assert "surplus" not in plan[0]  # no solar configured
    status = hass.states.get(registry.async_get_entity_id("sensor", DOMAIN, f"{entry.entry_id}_model_status"))
    assert status.attributes["links"]["inlet_temperature"] == LINKS["inlet_temperature"]

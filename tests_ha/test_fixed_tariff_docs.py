"""The template sensor in docs/fixed-tariff.md renders in Home Assistant and its prices are recognised."""

from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest
import yaml
from homeassistant.core import HomeAssistant
from homeassistant.helpers.template import Template

from custom_components.pond_heatpump_price_planner.core.prices import parse_intervals

DOC = Path(__file__).resolve().parent.parent / "docs" / "fixed-tariff.md"


def documented_config() -> dict:
    text = DOC.read_text()
    block = text.split("```yaml\n", 1)[1].split("```", 1)[0]
    return yaml.safe_load(block)["template"][0]


def render(hass: HomeAssistant):
    config = documented_config()
    variables = config["variables"]
    sensor = config["sensor"][0]
    state = Template(sensor["state"], hass).async_render(variables)
    attrs = {key: Template(src, hass).async_render(variables) for key, src in sensor["attributes"].items()}
    return variables, state, attrs


@pytest.mark.parametrize(
    ("moment", "today_hours"),
    [("2026-11-18 12:00:00+01:00", 24), ("2026-10-25 12:00:00+01:00", 25), ("2026-03-29 12:00:00+02:00", 23)],
)
async def test_lists_are_continuous_on_clock_change_days(
    hass: HomeAssistant, freezer, moment, today_hours
) -> None:
    await hass.config.async_set_time_zone("Europe/Amsterdam")
    freezer.move_to(moment)
    _, _, attrs = render(hass)
    assert len(attrs["raw_today"]) == today_hours
    intervals = parse_intervals(attrs, "Europe/Amsterdam")
    assert all(a.end == b.start for a, b in zip(intervals, intervals[1:], strict=False))  # no gaps


async def test_documented_template_gives_a_recognised_price_list(hass: HomeAssistant) -> None:
    await hass.config.async_set_time_zone("Europe/Amsterdam")
    variables, state, attrs = render(hass)

    assert float(state) in (variables["peak"], variables["offpeak"])
    assert len(attrs["raw_today"]) == 24 and len(attrs["raw_tomorrow"]) == 24
    intervals = parse_intervals(attrs, "Europe/Amsterdam")
    assert len(intervals) == 48

    zone = ZoneInfo("Europe/Amsterdam")
    for interval in intervals:
        start = datetime.fromtimestamp(interval.start, zone)
        offpeak = start.weekday() >= 5 or start.hour >= 23 or start.hour < 7
        assert interval.value == (variables["offpeak"] if offpeak else variables["peak"])
        assert interval.end - interval.start == 3600

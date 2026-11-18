"""The day/night tariff templates in docs/fixed-tariff.md render in Home Assistant and give valid prices."""

from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest
import yaml
from homeassistant.core import HomeAssistant
from homeassistant.helpers.template import Template, async_load_custom_templates

from custom_components.pond_heatpump_price_planner.core.prices import parse_intervals

DOC = Path(__file__).resolve().parent.parent / "docs" / "fixed-tariff.md"
TZ = "Europe/Amsterdam"


def block(language: str) -> str:
    return DOC.read_text().split(f"```{language}\n", 1)[1].split("```", 1)[0]


async def setup_templates(hass: HomeAssistant) -> None:
    await hass.config.async_set_time_zone(TZ)
    folder = Path(hass.config.path("custom_templates"))
    folder.mkdir(exist_ok=True)
    (folder / "day_night_tariff.jinja").write_text(block("jinja"))
    await async_load_custom_templates(hass)


def render(hass: HomeAssistant):
    config = yaml.safe_load(block("yaml"))["template"][0]
    variables = config["variables"]
    sensor = config["sensor"][0]
    state = Template(sensor["state"], hass).async_render(variables)
    attrs = {key: Template(src, hass).async_render(variables) for key, src in sensor["attributes"].items()}
    return variables, state, attrs


@pytest.mark.parametrize(
    ("year", "expected"),
    [
        (
            2025,
            "2025-01-01,2025-04-21,2025-04-26,2025-05-29,2025-06-09,2025-12-25,2025-12-26",
        ),  # King's Day on a Sunday
        (2026, "2026-01-01,2026-04-06,2026-04-27,2026-05-14,2026-05-25,2026-12-25,2026-12-26"),
        (2027, "2027-01-01,2027-03-29,2027-04-27,2027-05-06,2027-05-17,2027-12-25,2027-12-26"),
    ],
)
async def test_recognised_holidays(hass: HomeAssistant, year, expected) -> None:
    await setup_templates(hass)
    src = "{% from 'day_night_tariff.jinja' import holidays %}{{ holidays(" + str(year) + ") }}"
    assert Template(src, hass).async_render(parse_result=False).strip() == expected


@pytest.mark.parametrize(
    ("moment", "offpeak"),
    [
        ("2026-11-18 14:00:00+01:00", False),  # Wednesday afternoon: normal
        ("2026-11-18 07:00:00+01:00", False),  # normal from 7:00
        ("2026-11-18 06:59:00+01:00", True),  # off-peak until 7:00
        ("2026-11-18 23:00:00+01:00", True),  # off-peak from 23:00
        ("2026-11-21 14:00:00+01:00", True),  # Saturday
        ("2026-11-22 14:00:00+01:00", True),  # Sunday
        ("2026-05-14 14:00:00+02:00", True),  # Ascension Day (Thursday)
        ("2026-05-05 14:00:00+02:00", False),  # Liberation Day is not counted
    ],
)
async def test_state_follows_the_dutch_rules(hass: HomeAssistant, freezer, moment, offpeak) -> None:
    await setup_templates(hass)
    freezer.move_to(moment)
    variables, state, _ = render(hass)
    assert float(state) == (variables["offpeak"] if offpeak else variables["peak"])


@pytest.mark.parametrize(
    ("moment", "today_hours"),
    [("2026-11-18 12:00:00+01:00", 24), ("2026-10-25 12:00:00+01:00", 25), ("2026-03-29 12:00:00+02:00", 23)],
)
async def test_lists_are_continuous_when_the_clock_changes(
    hass: HomeAssistant, freezer, moment, today_hours
) -> None:
    await setup_templates(hass)
    freezer.move_to(moment)
    _, _, attrs = render(hass)
    assert len(attrs["raw_today"]) == today_hours
    intervals = parse_intervals(attrs, TZ)
    assert all(a.end == b.start for a, b in zip(intervals, intervals[1:], strict=False))  # no gaps


async def test_price_list_is_recognised_and_matches_the_rules(hass: HomeAssistant, freezer) -> None:
    await setup_templates(hass)
    freezer.move_to("2026-05-13 12:00:00+02:00")  # Wednesday; tomorrow is Ascension Day
    variables, _, attrs = render(hass)
    intervals = parse_intervals(attrs, TZ)
    assert len(intervals) == 48
    zone = ZoneInfo(TZ)
    for interval in intervals:
        start = datetime.fromtimestamp(interval.start, zone)
        offpeak = start.date().isoformat() == "2026-05-14" or start.hour >= 23 or start.hour < 7
        assert interval.value == (variables["offpeak"] if offpeak else variables["peak"])
        assert interval.end - interval.start == 3600

"""Screenshots of the Lovelace card for the README and the docs.

Renders the built card bundle in headless Chromium with example data: a plan made by the real planner on the
reference dataset, and states as Home Assistant would publish them.

Usage: python scripts/screenshot_card.py
Needs: pip install playwright numpy; playwright install chromium
Writes docs/images/card-light.png, card-dark.png and card-wide.png.
"""

from __future__ import annotations

import functools
import http.server
import json
import sys
import threading
from datetime import UTC, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path[:0] = [str(ROOT / "custom_components" / "pond_heatpump_price_planner"), str(ROOT / "tests")]

from conftest import epoch, load_reference  # noqa: E402
from core.costs import EnergyCosts  # noqa: E402
from core.planner import DynamicProgrammingPlanner, PlanRequest  # noqa: E402
from replay import REFERENCE_PARAMS  # noqa: E402

DEVICE = "pond_planner_device"
P = "pond_heatpump_price_planner"
OUT = ROOT / "docs" / "images"
SHOTS = (("card-light.png", "light", 460), ("card-dark.png", "dark", 460), ("card-wide.png", "light", 1280))


def example_plan() -> tuple[list[dict], dict]:
    """36 h plan from the reference data, starting on a November afternoon."""
    start = epoch("2026-11-12T12:00:00+01:00")
    rows = [r for r in load_reference() if r["t"] >= start][:144]
    request = PlanRequest(
        start=start,
        pond=14.6,
        mode_now="low",
        target=14.5,
        band=0.25,
        params=REFERENCE_PARAMS,
        outdoor=[r["outdoor"] for r in rows],
        costs=EnergyCosts([r["price"] for r in rows]),
    )
    plan = DynamicProgrammingPlanner().make_plan(request)
    entries = [
        {
            "start": datetime.fromtimestamp(start + i * 900, UTC).isoformat(),
            "mode": mode,
            "temp": round(plan.temps[i], 2),
            "price": round(plan.prices[i], 4),
            "known": i < 48,
        }
        for i, mode in enumerate(plan.modes)
    ]
    return entries, {"cost": plan.cost, "energy": plan.energy_kwh, "share": plan.expensive_share}


def hass_json(now_iso: str) -> dict:
    plan, totals = example_plan()

    def s(state, **attributes):
        return {"state": str(state), "attributes": attributes, "last_updated": now_iso}

    planner = {
        "thermostat": ("climate.pond_thermostat", s("heat", current_temperature=14.6, temperature=14.5,
                                                    hvac_action="heating", min_temp=5, max_temp=28,
                                                    target_temp_step=0.1)),
        "mode": ("sensor.pond_mode", s(plan[0]["mode"], reason="plan", plan=plan)),
        "band": ("number.pond_band", s(0.25, unit_of_measurement="°C")),
        "next_start": ("sensor.pond_next_start", s("2026-11-12T23:00:00+00:00")),
        "next_stop": ("sensor.pond_next_stop", s("2026-11-12T16:15:00+00:00")),
        "control": ("switch.pond_control", s("on")),
        "insulation_cover": ("switch.pond_insulation_cover", s("off")),
        "planned_cost": ("sensor.pond_planned_cost",
                         s(round(totals["cost"], 2), expensive_share=totals["share"])),
        "planned_energy": ("sensor.pond_planned_energy", s(round(totals["energy"], 2))),
        "cop": ("sensor.pond_cop",
                s(5.4, method="average", by_outdoor={"<5": 4.9, "5-10": 5.4, "10-15": 5.7})),
        "heat_loss": ("sensor.pond_heat_loss", s(295)),
        "thermal_power": ("sensor.pond_thermal_power", s(2850)),
        "cooling_coefficient": ("sensor.pond_cooling_coefficient", s(0.0121)),
        "heating_rate_low": ("sensor.pond_heating_rate_low", s(0.117)),
        "heating_rate_high": ("sensor.pond_heating_rate_high", s(0.192)),
        "prediction_error": ("sensor.pond_prediction_error", s(0.08)),
        "model_status": ("sensor.pond_model_status", s("2026-11-12T02:30:00+00:00", links={
            "inlet_temperature": "sensor.hp_water_in", "outlet_temperature": "sensor.hp_water_out",
            "air_inlet_temperature": "sensor.hp_air_in", "power": "sensor.hp_power"})),
    }  # fmt: skip
    extra = {
        "sensor.hp_water_in": s(14),
        "sensor.hp_water_out": s(16),
        "sensor.hp_air_in": s(10),
        "sensor.hp_air_out": s(6),
        "sensor.hp_power": s(386),
        "sensor.hp_liquid": s(17),
        "sensor.hp_gas": s(52),
        "sensor.pump_speed": s(43, unit_of_measurement="%"),
        "sensor.pump_power": s(103),
        "binary_sensor.hp_fan": s("on"),
        "binary_sensor.hp_flow": s("on"),
        "binary_sensor.hp_compressor": s("on"),
    }
    states = {eid: {"entity_id": eid, **st} for eid, st in [*planner.values()]} | {
        eid: {"entity_id": eid, **st} for eid, st in extra.items()
    }
    entities = {
        eid: {"entity_id": eid, "device_id": DEVICE, "platform": P, "translation_key": key}
        for key, (eid, _) in planner.items()
    }
    config = {
        "type": "custom:pond-heatpump-planner-card",
        "device_id": DEVICE,
        "hours": 36,
        "heat_pump": {
            "air_out": "sensor.hp_air_out",
            "liquid": "sensor.hp_liquid",
            "gas": "sensor.hp_gas",
            "fan": "binary_sensor.hp_fan",
            "flow": "binary_sensor.hp_flow",
            "compressor": "binary_sensor.hp_compressor",
            "pump_speed": "sensor.pump_speed",
            "pump_power": "sensor.pump_power",
        },
    }
    return {"states": states, "entities": entities, "locale": {"language": "en"}, "__config": config}


def main() -> None:
    from playwright.sync_api import sync_playwright

    data = ROOT / "scripts" / "screenshots" / "hass.json"
    data.write_text(json.dumps(hass_json("2026-11-12T11:00:00+00:00")))
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    port = server.server_address[1]
    OUT.mkdir(parents=True, exist_ok=True)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for name, theme, width in SHOTS:
                page = browser.new_page(viewport={"width": width + 32, "height": 900}, device_scale_factor=2)
                page.emulate_media(reduced_motion="reduce")  # still frames: no half-way animations
                page.clock.set_fixed_time(
                    datetime(2026, 11, 12, 11, 5, tzinfo=UTC)
                )  # "now" inside the example plan
                page.goto(
                    f"http://127.0.0.1:{port}/scripts/screenshots/harness.html?theme={theme}&width={width}"
                )
                page.wait_for_function("window.__ready === true")
                page.wait_for_timeout(800)  # fonts
                page.locator("#host").screenshot(path=str(OUT / name))
                print(OUT / name)
            browser.close()
    finally:
        server.shutdown()
        data.unlink(missing_ok=True)


if __name__ == "__main__":
    main()

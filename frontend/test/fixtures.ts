import type { HomeAssistant } from "../src/types";

export const DEVICE = "dev1";
const P = "pond_heatpump_price_planner";
const ts = "2026-11-17T10:00:00+00:00";

function reg(key: string, id: string) {
  return { [id]: { entity_id: id, device_id: DEVICE, platform: P, translation_key: key } };
}

export function plan(n = 8) {
  const start = Date.parse("2026-11-17T10:00:00Z");
  return Array.from({ length: n }, (_, i) => ({
    start: new Date(start + i * 900e3).toISOString(),
    mode: i < 4 ? "low" : "off",
    temp: 14.5 + i * 0.01,
    price: i === 5 ? 0.45 : 0.3,
    known: i < 6,
    ...(i === 2 ? { surplus: 0.4 } : {}),
  }));
}

/** 24 h of pond temperatures, one per quarter, ending at 11:00 UTC on 17 Nov; the last 8 with mode and price. */
export function pondHistory(): { time: string; temp: number; mode?: string; price?: number }[] {
  const end = Date.parse("2026-11-17T11:00:00Z");
  return Array.from({ length: 96 }, (_, i) => ({
    time: new Date(end - (95 - i) * 900e3).toISOString(),
    temp: Math.round((14.5 + 0.2 * Math.sin(i / 10)) * 100) / 100,
    ...(i >= 88 ? { mode: i % 2 ? "high" : "low", price: 0.25 } : {}),
  }));
}

export function fakeHass(overrides: Record<string, any> = {}): HomeAssistant & { calls: any[] } {
  const calls: any[] = [];
  const s = (state: string, attributes: Record<string, any> = {}) => ({ entity_id: "", state, attributes, last_updated: ts });
  const states: Record<string, any> = {
    "climate.pond_thermostat": s("heat", { current_temperature: 14.6, temperature: 14.5, hvac_action: "heating", min_temp: 5, max_temp: 28, target_temp_step: 0.1 }),
    "sensor.pond_mode": s("low", { reason: "plan", plan: plan(), pond_history: pondHistory() }),
    "number.pond_band": s("0.25"),
    "sensor.pond_next_start": s("2026-11-17T11:00:00+00:00"),
    "sensor.pond_next_stop": s("2026-11-17T12:00:00+00:00"),
    "switch.pond_control": s("on"),
    "switch.pond_insulation_cover": s("off"),
    "sensor.pond_planned_cost": s("2.31", { expensive_share: 0.06, starts: 1 }),
    "sensor.pond_planned_energy": s("7.12"),
    "sensor.pond_cop": s("5.43", { method: "average", by_outdoor: { "<5": 4.9, "5-10": 5.4, "10-15": null } }),
    "sensor.pond_heat_loss": s("295.2"),
    "sensor.pond_thermal_power": s("2850"),
    "sensor.pond_cooling_coefficient": s("0.0121"),
    "sensor.pond_heating_rate_low": s("0.117"),
    "sensor.pond_heating_rate_high": s("0.192"),
    "sensor.pond_prediction_error": s("0.08"),
    "sensor.pond_model_status": s("2026-11-17T02:30:00+00:00", { links: { inlet_temperature: "sensor.water_in", outlet_temperature: "sensor.water_out", power: "sensor.hp_power" } }),
    "sensor.water_in": s("14"),
    "sensor.water_out": s("16"),
    "sensor.hp_power": s("386.4"),
    "sensor.pump_speed": s("43", { unit_of_measurement: "%" }),
    "sensor.pump_power": s("102.6"),
    "binary_sensor.fan": s("on"),
    "binary_sensor.flow": s("on"),
    "binary_sensor.pump_fault": s("off"),
    ...overrides,
  };
  for (const [id, st] of Object.entries(states)) st.entity_id = id;
  const keys: Record<string, string> = {
    thermostat: "climate.pond_thermostat", mode: "sensor.pond_mode", band: "number.pond_band",
    next_start: "sensor.pond_next_start", next_stop: "sensor.pond_next_stop", control: "switch.pond_control",
    insulation_cover: "switch.pond_insulation_cover", planned_cost: "sensor.pond_planned_cost",
    planned_energy: "sensor.pond_planned_energy", cop: "sensor.pond_cop", heat_loss: "sensor.pond_heat_loss",
    thermal_power: "sensor.pond_thermal_power", cooling_coefficient: "sensor.pond_cooling_coefficient",
    heating_rate_low: "sensor.pond_heating_rate_low", heating_rate_high: "sensor.pond_heating_rate_high",
    prediction_error: "sensor.pond_prediction_error", model_status: "sensor.pond_model_status",
  };
  const entities = Object.assign({}, ...Object.entries(keys).map(([k, id]) => reg(k, id)), {
    "sensor.other": { entity_id: "sensor.other", device_id: "dev2", platform: "other", translation_key: "mode" },
  });
  return {
    states,
    entities,
    locale: { language: "en" },
    calls,
    callService: async (domain: string, service: string, data: Record<string, unknown>) => {
      calls.push({ domain, service, data });
    },
  };
}

// Turns Home Assistant state into what each section of the card shows. No DOM, unit-tested.

import { resolvePlanner } from "./entities";
import { fixed, num, numberText, power, temperature, time, withUnit } from "./format";
import { cardLanguage } from "./localize";
import type { CardConfig, HassEntity, HeatPumpKey, HomeAssistant, Section } from "./types";
import { SECTIONS } from "./types";

export type Mode = "off" | "low" | "high";
export type PumpState = "running" | "fault" | "off";

export interface IllustrationModel {
  pond: string | null;
  waterIn: string | null;
  waterOut: string | null;
  airIn: string | null;
  airOut: string | null;
  electrical: string | null;
  thermal: string | null;
  liquid: string | null;
  gas: string | null;
  mode: Mode | null;
  fan: boolean;
  flow: boolean;
  compressor: boolean;
  pump: PumpState;
  pumpText: string | null; // e.g. "43 % · 103 W"
}

export interface GaugeModel {
  pond: number | null;
  target: number;
  band: number;
  min: number;
  max: number;
  step: number;
  heating: boolean | null;
  mode: Mode | null;
  position: "in_band" | "above_band" | "below_band" | null;
  thermostat: string;
  bandEntity: string | null;
  nextStart: string | null;
  nextStop: string | null;
  control: boolean | null;
  /** pond temperature of the last 24 h (end of each quarter), oldest first */
  history: HistoryPoint[];
}

export interface Quarter {
  t: number;
  mode: Mode;
  temp: number;
  price: number;
  known: boolean;
  surplus: number | null;
}

export interface HistoryPoint {
  t: number;
  temp: number;
}

export interface PlanModel {
  quarters: Quarter[];
  target: number;
  band: number;
  now: number;
  /** width of the chart in hours; the chart ends where the plan ends */
  hours: number;
  /** measured pond temperature (end of each quarter, oldest first) */
  history: HistoryPoint[];
  /** current pond temperature; the measured line ends and the predicted line starts here */
  pond: number | null;
}

export interface FiguresModel {
  cost: string | null;
  energy: string | null;
  expensive: string | null;
  cop: string | null;
  copMethod: string | null;
  heatLoss: string | null;
  thermal: string | null;
}

export interface SwitchModel {
  entity: string;
  on: boolean;
}

export interface ModelSectionModel {
  cooling: string | null;
  heatingLow: string | null;
  heatingHigh: string | null;
  predictionError: string | null;
  learned: string | null;
  copByOutdoor: [string, string | null][];
}

export interface CardViewModel {
  sections: Section[];
  illustration: IllustrationModel | null;
  gauge: GaugeModel | null;
  plan: PlanModel | null;
  /** why there is no plan (the mode sensor's reason), when the planner has none */
  planMissing: string | null;
  figures: FiguresModel | null;
  switches: { cover: SwitchModel | null; control: SwitchModel | null } | null;
  model: ModelSectionModel | null;
  missingDevice: boolean;
  /** language of texts, dates and numbers (see cardLanguage) */
  language: string;
  /** last_updated of every entity the card reads; equal signatures mean nothing to re-render */
  signature: string;
}

const MODES: Mode[] = ["off", "low", "high"];

function pondHistory(raw: unknown): HistoryPoint[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p) => ({ t: Date.parse(p?.time), temp: Number(p?.temp) }))
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.temp))
    .sort((a, b) => a.t - b.t);
}

function state(hass: HomeAssistant, entityId: string | undefined | null): HassEntity | undefined {
  return entityId ? hass.states[entityId] : undefined;
}

function available(entity: HassEntity | undefined): entity is HassEntity {
  return !!entity && entity.state !== "unavailable" && entity.state !== "unknown";
}

function value(hass: HomeAssistant, entityId: string | undefined | null): number | null {
  const s = state(hass, entityId);
  return available(s) ? num(s.state) : null;
}

function isOn(hass: HomeAssistant, entityId: string | undefined | null): boolean {
  return state(hass, entityId)?.state === "on";
}

/** Heat pump entities: card config first, then the planner's own links (attribute `links` of model_status). */
export function heatPumpEntities(
  hass: HomeAssistant,
  config: CardConfig,
  planner: Record<string, string>,
): Partial<Record<HeatPumpKey, string>> {
  const links = (state(hass, planner.model_status)?.attributes.links ?? {}) as Record<string, string>;
  const fromLinks: Partial<Record<HeatPumpKey, string>> = {
    water_in: links.inlet_temperature,
    water_out: links.outlet_temperature,
    air_in: links.air_inlet_temperature,
    power: links.power,
  };
  const out: Partial<Record<HeatPumpKey, string>> = {};
  for (const [k, v] of Object.entries({ ...fromLinks, ...(config.heat_pump ?? {}) })) {
    if (v) out[k as HeatPumpKey] = v;
  }
  return out;
}

export function buildViewModel(hass: HomeAssistant, config: CardConfig, now = Date.now()): CardViewModel {
  const p = resolvePlanner(hass, config.device_id);
  const sections = (config.sections?.length ? config.sections : [...SECTIONS]).filter((s) =>
    SECTIONS.includes(s),
  );
  const hp = heatPumpEntities(hass, config, p);
  const read = [...Object.values(p), ...Object.values(hp)];
  const signature = read.map((id) => `${id}:${state(hass, id)?.last_updated ?? "-"}`).join("|");
  const language = cardLanguage(config, state(hass, p.mode)?.attributes.language, hass.locale?.language ?? hass.language);
  const empty: CardViewModel = {
    sections,
    illustration: null,
    gauge: null,
    plan: null,
    planMissing: null,
    figures: null,
    switches: null,
    model: null,
    missingDevice: !config.device_id || Object.keys(p).length === 0,
    language,
    signature,
  };
  if (empty.missingDevice) return empty;

  const thermostat = state(hass, p.thermostat);
  const mode = state(hass, p.mode);
  const modeValue = available(mode) && MODES.includes(mode.state as Mode) ? (mode.state as Mode) : null;
  const pond = available(thermostat) ? num(thermostat.attributes.current_temperature) : null;
  const target = available(thermostat) ? (num(thermostat.attributes.temperature) ?? 15) : 15;
  const band = value(hass, p.band) ?? 0.25;

  // --- illustration ---------------------------------------------------------------------------
  const thermalW = value(hass, p.thermal_power);
  const speedEntity = state(hass, hp.pump_speed);
  const pumpPower = value(hass, hp.pump_power);
  const fault = isOn(hass, hp.pump_fault);
  const flow = isOn(hass, hp.flow);
  const pumpParts = [
    withUnit(value(hass, hp.pump_speed), speedEntity?.attributes.unit_of_measurement, 0, language),
    power(pumpPower, language),
  ].filter(Boolean);
  const illustration: IllustrationModel = {
    pond: temperature(pond, language),
    waterIn: temperature(value(hass, hp.water_in), language),
    waterOut: temperature(value(hass, hp.water_out), language),
    airIn: temperature(value(hass, hp.air_in), language),
    airOut: temperature(value(hass, hp.air_out), language),
    electrical: power(value(hass, hp.power), language),
    thermal: power(thermalW, language),
    liquid: fixed(value(hass, hp.liquid), 0, language) && `${fixed(value(hass, hp.liquid), 0, language)} °C`,
    gas: fixed(value(hass, hp.gas), 0, language) && `${fixed(value(hass, hp.gas), 0, language)} °C`,
    mode: modeValue,
    fan: isOn(hass, hp.fan),
    flow,
    compressor: isOn(hass, hp.compressor),
    pump: fault ? "fault" : flow ? "running" : "off",
    pumpText: pumpParts.length ? pumpParts.join(" · ") : null,
  };

  // --- thermostat gauge -------------------------------------------------------------------------
  const action = available(thermostat) ? thermostat.attributes.hvac_action : null;
  const history = pondHistory(mode?.attributes.pond_history);
  const gauge: GaugeModel | null = p.thermostat
    ? {
        pond,
        target,
        band,
        min: num(thermostat?.attributes.min_temp) ?? 5,
        max: num(thermostat?.attributes.max_temp) ?? 28,
        step: num(thermostat?.attributes.target_temp_step) ?? 0.1,
        heating: action === "heating" ? true : action === "idle" ? false : null,
        mode: modeValue,
        position:
          pond === null ? null : pond > target + band ? "above_band" : pond < target - band ? "below_band" : "in_band",
        thermostat: p.thermostat,
        bandEntity: p.band ?? null,
        nextStart: available(state(hass, p.next_start)) ? state(hass, p.next_start)!.state : null,
        nextStop: available(state(hass, p.next_stop)) ? state(hass, p.next_stop)!.state : null,
        control: p.control ? isOn(hass, p.control) : null,
        history: history.filter((h) => h.t >= now - 24 * 3600e3),
      }
    : null;

  // --- plan ---------------------------------------------------------------------------------------
  const rawPlan = (mode?.attributes.plan ?? []) as any[];
  const hours = config.hours ?? 36;
  const quarters: Quarter[] = rawPlan
    .map((q) => ({
      t: Date.parse(q.start),
      mode: (MODES.includes(q.mode) ? q.mode : "off") as Mode,
      temp: Number(q.temp),
      price: Number(q.price),
      known: q.known !== false,
      surplus: q.surplus === undefined ? null : Number(q.surplus),
    }))
    .filter((q) => Number.isFinite(q.t) && Number.isFinite(q.temp))
    .slice(0, hours * 4);
  const plan: PlanModel | null = quarters.length ? { quarters, target, band, now, hours, history, pond } : null;

  // --- figures ------------------------------------------------------------------------------------
  const costEntity = state(hass, p.planned_cost);
  const copEntity = state(hass, p.cop);
  const share = available(costEntity) ? num(costEntity.attributes.expensive_share) : null;
  const heatLoss = value(hass, p.heat_loss);
  const figures: FiguresModel = {
    cost: available(costEntity) && num(costEntity.state) !== null ? `€ ${numberText(num(costEntity.state)!, 2, language)}` : null,
    energy: withUnit(value(hass, p.planned_energy), "kWh", 1, language),
    expensive: share === null ? null : `${Math.round(share * 100)} %`,
    cop: fixed(value(hass, p.cop), 1, language),
    copMethod: available(copEntity) ? (copEntity.attributes.method ?? null) : null,
    heatLoss: heatLoss === null ? null : `${Math.round(heatLoss)} W/K`,
    thermal: power(thermalW, language),
  };

  // --- switches and model -------------------------------------------------------------------------
  const sw = (key: string): SwitchModel | null => (p[key] ? { entity: p[key], on: isOn(hass, p[key]) } : null);
  const outdoor = (state(hass, p.cop)?.attributes.by_outdoor ?? {}) as Record<string, number | null>;
  const model: ModelSectionModel = {
    cooling: withUnit(value(hass, p.cooling_coefficient), "1/h", 4, language),
    heatingLow: withUnit(value(hass, p.heating_rate_low), "K/h", 3, language),
    heatingHigh: withUnit(value(hass, p.heating_rate_high), "K/h", 3, language),
    predictionError: withUnit(value(hass, p.prediction_error), "K", 2, language),
    learned: available(state(hass, p.model_status))
      ? time(state(hass, p.model_status)!.state, language)
      : null,
    copByOutdoor: Object.entries(outdoor).map(([k, v]) => [k, v === null ? null : numberText(Number(v), 1, language)]),
  };

  const planMissing = plan ? null : available(mode) ? String(mode.attributes.reason ?? "no_plan") : "unavailable";

  return {
    ...empty,
    illustration,
    gauge,
    plan,
    planMissing,
    figures,
    switches: { cover: sw("insulation_cover"), control: sw("control") },
    model,
  };
}

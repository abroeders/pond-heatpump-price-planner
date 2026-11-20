// The parts of Home Assistant's frontend objects the card uses.

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_updated: string;
}

export interface EntityRegistryEntry {
  entity_id: string;
  device_id?: string | null;
  platform: string;
  translation_key?: string | null;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  entities: Record<string, EntityRegistryEntry>;
  devices?: Record<string, { id: string; name?: string | null; name_by_user?: string | null }>;
  locale?: { language: string };
  language?: string;
  callService(domain: string, service: string, data: Record<string, unknown>): Promise<unknown>;
}

export const DOMAIN = "pond_heatpump_price_planner";

export const SECTIONS = ["heat_pump", "thermostat", "plan", "figures", "switches", "model"] as const;
export type Section = (typeof SECTIONS)[number];

export const HEAT_PUMP_KEYS = [
  "water_in",
  "water_out",
  "air_in",
  "air_out",
  "power",
  "liquid",
  "gas",
  "fan",
  "flow",
  "compressor",
  "pump_speed",
  "pump_power",
  "pump_fault",
] as const;
export type HeatPumpKey = (typeof HEAT_PUMP_KEYS)[number];

export const CARD_LANGUAGES = ["auto", "en", "nl"] as const;
export type CardLanguage = (typeof CARD_LANGUAGES)[number];

export interface CardConfig {
  type: string;
  device_id?: string;
  hours?: 24 | 36 | 48;
  sections?: Section[];
  heat_pump?: Partial<Record<HeatPumpKey, string>>;
  /** auto (default): the language of the integration, else the profile language */
  language?: CardLanguage;
}

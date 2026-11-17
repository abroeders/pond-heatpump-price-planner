// Finds the planner's entities by device and translation key, independent of entity ids and UI language.

import { DOMAIN, type HomeAssistant } from "./types";

export type PlannerEntities = Record<string, string>; // translation key -> entity id

export function plannerDevices(hass: HomeAssistant): string[] {
  const ids = new Set<string>();
  for (const entry of Object.values(hass.entities ?? {})) {
    if (entry.platform === DOMAIN && entry.device_id) ids.add(entry.device_id);
  }
  return [...ids].sort();
}

export function resolvePlanner(hass: HomeAssistant, deviceId: string | undefined): PlannerEntities {
  const out: PlannerEntities = {};
  if (!deviceId) return out;
  for (const entry of Object.values(hass.entities ?? {})) {
    if (entry.platform === DOMAIN && entry.device_id === deviceId && entry.translation_key) {
      out[entry.translation_key] = entry.entity_id;
    }
  }
  return out;
}

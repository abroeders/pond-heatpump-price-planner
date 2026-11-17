// Number formatting for the card.

export function num(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

export function fixed(value: number | null, digits: number): string | null {
  return value === null ? null : value.toFixed(digits);
}

/** Power in W, shown as W below 1 kW and as kW (2 decimals) from 1 kW. */
export function power(watts: number | null): string | null {
  if (watts === null) return null;
  return Math.abs(watts) >= 1000 ? `${(watts / 1000).toFixed(2)} kW` : `${Math.round(watts)} W`;
}

export function temperature(value: number | null): string | null {
  return value === null ? null : `${value.toFixed(1)} °C`;
}

export function withUnit(value: number | null, unit: string | undefined, digits = 0): string | null {
  if (value === null) return null;
  return unit ? `${value.toFixed(digits)} ${unit}` : value.toFixed(digits);
}

export function time(iso: string | null | undefined, language = "en"): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" });
}

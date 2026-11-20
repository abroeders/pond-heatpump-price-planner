// Number formatting for the card.

export function num(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

/** Format a number without grouping, with a fixed number of decimal places. */
export function numberText(value: number, digits: number, language: string): string {
  return new Intl.NumberFormat(language, { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false }).format(value);
}

export function fixed(value: number | null, digits: number, language = "en"): string | null {
  return value === null ? null : numberText(value, digits, language);
}

/** Power in W, shown as W below 1 kW and as kW (2 decimals) from 1 kW. */
export function power(watts: number | null, language = "en"): string | null {
  if (watts === null) return null;
  return Math.abs(watts) >= 1000 ? `${numberText(watts / 1000, 2, language)} kW` : `${Math.round(watts)} W`;
}

export function temperature(value: number | null, language = "en"): string | null {
  return value === null ? null : `${numberText(value, 1, language)} °C`;
}

export function withUnit(value: number | null, unit: string | undefined, digits = 0, language = "en"): string | null {
  if (value === null) return null;
  return unit ? `${numberText(value, digits, language)} ${unit}` : numberText(value, digits, language);
}

/** Clock time in 24-hour format. */
export function clockText(ms: number, language: string): string {
  return new Date(ms).toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
}

export function time(iso: string | null | undefined, language = "en"): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return clockText(d.getTime(), language);
}

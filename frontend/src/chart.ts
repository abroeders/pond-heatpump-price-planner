// Scales and text summary of the plan chart. No DOM.

import type { Localizer } from "./localize";
import type { Mode, PlanModel, Quarter } from "./viewmodel";

export interface ChartScales {
  x(t: number): number;
  yTemp(temp: number): number;
  yPrice(price: number): number;
  tempMin: number;
  tempMax: number;
  priceMin: number;
  priceMax: number;
  start: number;
  end: number;
  expensive: boolean[]; // per quarter: in the most expensive 25 % of its 24 h block
  knownUntil: number | null; // time where forecast prices begin
}

const QUARTER = 15 * 60 * 1000;

function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export interface TimeTick {
  t: number;
  midnight: boolean;
}

/** Ticks at every local 0, 6, 12 and 18 h between start and end (ms); correct across DST changes. */
export function timeTicks(start: number, end: number, everyHours = 6): TimeTick[] {
  const d = new Date(start);
  d.setMinutes(0, 0, 0);
  if (d.getTime() < start) d.setHours(d.getHours() + 1);
  const out: TimeTick[] = [];
  for (; d.getTime() < end; d.setHours(d.getHours() + 1)) {
    if (d.getHours() % everyHours === 0) out.push({ t: d.getTime(), midnight: d.getHours() === 0 });
  }
  return out;
}

export function scales(plan: PlanModel, width: number, height: number, pad = 28): ChartScales {
  const q = plan.quarters;
  const start = q[0].t;
  const end = q[q.length - 1].t + QUARTER;
  const temps = q.map((x) => x.temp).concat([plan.target - plan.band, plan.target + plan.band]);
  const tempMin = Math.floor((Math.min(...temps) - 0.1) * 10) / 10;
  const tempMax = Math.ceil((Math.max(...temps) + 0.1) * 10) / 10;
  const prices = q.map((x) => x.price);
  const priceMin = Math.min(...prices);
  const priceMax = Math.max(...prices) === priceMin ? priceMin + 0.01 : Math.max(...prices);
  const expensive = q.map((_, i) => {
    const block = q.slice(Math.floor(i / 96) * 96, Math.floor(i / 96) * 96 + 96).map((x) => x.price);
    return q[i].price > quantile([...block].sort((a, b) => a - b), 0.75);
  });
  const firstForecast = q.find((x) => !x.known);
  const plotH = height - pad * 2;
  return {
    x: (t) => pad + ((t - start) / (end - start)) * (width - pad * 2),
    yTemp: (v) => pad + (1 - (v - tempMin) / (tempMax - tempMin)) * plotH,
    yPrice: (v) => pad + (1 - (v - priceMin) / (priceMax - priceMin)) * plotH,
    tempMin,
    tempMax,
    priceMin,
    priceMax,
    start,
    end,
    expensive,
    knownUntil: firstForecast ? firstForecast.t : null,
  };
}

/** Runs of equal mode, for the screen-reader summary: "low 11:00–03:15, off 03:15–11:00". */
export function runs(quarters: Quarter[]): { mode: Mode; from: number; to: number }[] {
  const out: { mode: Mode; from: number; to: number }[] = [];
  for (const q of quarters) {
    const last = out[out.length - 1];
    if (last && last.mode === q.mode) last.to = q.t + QUARTER;
    else out.push({ mode: q.mode, from: q.t, to: q.t + QUARTER });
  }
  return out;
}

export function summary(plan: PlanModel, t: Localizer, language = "en"): string {
  const hm = (ms: number) => new Date(ms).toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" });
  const parts = runs(plan.quarters).map((r) => `${t(r.mode)} ${hm(r.from)}–${hm(r.to)}`);
  return t("plan_summary", { parts: parts.join(", ") });
}

// Scales and text summary of the plan chart. No DOM.

import { clockText } from "./format";
import type { Localizer } from "./localize";
import type { HistoryPoint, Mode, PlanModel, Quarter } from "./viewmodel";

export interface ChartScales {
  x(t: number): number;
  yTemp(temp: number): number;
  yPrice(price: number): number;
  tempMin: number;
  tempMax: number;
  priceMin: number;
  priceMax: number;
  /** time (ms) for an x position, unclamped */
  t(x: number): number;
  start: number;
  end: number;
  /** measured points inside the window, ending with the current pond temperature */
  measured: HistoryPoint[];
  expensive: boolean[]; // per quarter: in the most expensive 25 % of its 24 h block
  /** measured quarters before the plan inside the window, oldest first */
  past: PastQuarter[];
  pastExpensive: boolean[]; // per past quarter, with the 24 h blocks continued back from the plan start
  knownUntil: number | null; // time where forecast prices begin
}

export const QUARTER = 15 * 60 * 1000;
const GAP = 30 * 60 * 1000; // a longer gap in the history breaks the measured line

export interface ChartWindow {
  start: number;
  end: number;
}

/**
 * The chart ends where the plan ends (the last known price) and spans `hours` back from there.
 * When the plan is longer than that, it shows now … now + hours instead, so now stays visible.
 */
export function chartWindow(now: number, planEnd: number, hours: number): ChartWindow {
  const span = hours * 3600e3;
  const end = Math.ceil(planEnd / QUARTER) * QUARTER;
  const nowQ = Math.floor(now / QUARTER) * QUARTER;
  return end - span > nowQ ? { start: nowQ, end: nowQ + span } : { start: end - span, end };
}

/** Measured points in [start, now], plus the current temperature at now. */
export function measuredPoints(plan: PlanModel, start: number): HistoryPoint[] {
  const points = plan.history.filter((p) => p.t >= start && p.t <= plan.now);
  if (plan.pond !== null) points.push({ t: plan.now, temp: plan.pond });
  return points;
}

/** A quarter before the plan: its measured mode and its price. */
export interface PastQuarter {
  /** start of the quarter */
  t: number;
  mode: Mode | null;
  price: number | null;
}

/** Past quarters from the history (points are at the end of their quarter) in [start, first plan quarter). */
export function pastQuarters(plan: PlanModel, start: number): PastQuarter[] {
  const planStart = plan.quarters[0].t;
  return plan.history
    .map((p) => ({ t: p.t - QUARTER, mode: p.mode ?? null, price: p.price ?? null }))
    .filter((p) => p.t >= start && p.t < planStart && (p.mode !== null || p.price !== null));
}

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
  const { start, end } = chartWindow(plan.now, q[q.length - 1].t + QUARTER, plan.hours);
  const measured = measuredPoints(plan, start);
  const temps = q
    .map((x) => x.temp)
    .concat(measured.map((p) => p.temp), [plan.target - plan.band, plan.target + plan.band]);
  const tempMin = Math.floor((Math.min(...temps) - 0.1) * 10) / 10;
  const tempMax = Math.ceil((Math.max(...temps) + 0.1) * 10) / 10;
  const past = pastQuarters(plan, start);
  const prices = q.map((x) => x.price).concat(past.flatMap((p) => (p.price === null ? [] : [p.price])));
  const priceMin = Math.min(...prices);
  const priceMax = Math.max(...prices) === priceMin ? priceMin + 0.01 : Math.max(...prices);
  const expensive = q.map((_, i) => {
    const block = q.slice(Math.floor(i / 96) * 96, Math.floor(i / 96) * 96 + 96).map((x) => x.price);
    return q[i].price > quantile([...block].sort((a, b) => a - b), 0.75);
  });
  // the 24 h blocks continue back from the plan start, so the marking of the plan does not change
  const day = 96 * QUARTER;
  const block = (t: number) => Math.floor((t - q[0].t) / day);
  const pastExpensive = past.map((p) => {
    if (p.price === null) return false;
    const same = past.filter((x) => x.price !== null && block(x.t) === block(p.t)).map((x) => x.price as number);
    return p.price > quantile(same.sort((a, b) => a - b), 0.75);
  });
  const firstForecast = q.find((x) => !x.known);
  const plotH = height - pad * 2;
  return {
    x: (t) => pad + ((t - start) / (end - start)) * (width - pad * 2),
    t: (x) => start + ((x - pad) / (width - pad * 2)) * (end - start),
    yTemp: (v) => pad + (1 - (v - tempMin) / (tempMax - tempMin)) * plotH,
    yPrice: (v) => pad + (1 - (v - priceMin) / (priceMax - priceMin)) * plotH,
    tempMin,
    tempMax,
    priceMin,
    priceMax,
    start,
    end,
    measured,
    expensive,
    past,
    pastExpensive,
    knownUntil: firstForecast ? firstForecast.t : null,
  };
}

/** SVG step path of the price: past quarters, then the plan; a quarter without a price breaks the line. */
export function pricePath(plan: PlanModel, s: ChartScales): string {
  const steps = [...s.past, ...plan.quarters].filter((x) => x.t >= s.start && x.t < s.end);
  let prev: number | null = null;
  return steps
    .flatMap((x) => {
      if (x.price === null) return [];
      const cmd = prev === null || x.t !== prev + QUARTER ? "M" : "L";
      prev = x.t;
      return [`${cmd}${s.x(x.t).toFixed(1)} ${s.yPrice(x.price).toFixed(1)} H${s.x(x.t + QUARTER).toFixed(1)}`];
    })
    .join(" ");
}

/** SVG path of the measured temperature; gaps of more than 30 min start a new segment. */
export function measuredPath(s: ChartScales): string {
  let prev: number | null = null;
  return s.measured
    .map((p) => {
      const cmd = prev === null || p.t - prev > GAP ? "M" : "L";
      prev = p.t;
      return `${cmd}${s.x(p.t).toFixed(1)} ${s.yTemp(p.temp).toFixed(1)}`;
    })
    .join(" ");
}

/** SVG path of the predicted temperature: from the current temperature at now along the plan. */
export function predictedPath(plan: PlanModel, s: ChartScales): string {
  const points = plan.quarters
    .filter((x) => x.t + QUARTER > plan.now && x.t >= s.start)
    .map((x) => [s.x(x.t + QUARTER), s.yTemp(x.temp)]);
  if (plan.pond !== null && plan.now >= s.start) points.unshift([s.x(plan.now), s.yTemp(plan.pond)]);
  return points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

/** The quarter (start, ms) under an x position, clamped to the window. */
export function quarterAt(s: ChartScales, x: number): number {
  const t = Math.floor(s.t(x) / QUARTER) * QUARTER;
  return Math.min(Math.max(t, s.start), s.end - QUARTER);
}

export interface HoverInfo {
  /** start of the quarter */
  t: number;
  temp: number | null;
  measured: boolean;
  mode: Mode | null;
  price: number | null;
  known: boolean;
  expensive: boolean;
  surplus: number | null;
}

/** What the tooltip shows for the quarter starting at t. Temperatures are those at the end of the quarter. */
export function hoverInfo(plan: PlanModel, s: ChartScales, t: number): HoverInfo {
  const info: HoverInfo = { t, temp: null, measured: false, mode: null, price: null, known: true, expensive: false, surplus: null };
  const i = plan.quarters.findIndex((x) => x.t === t);
  if (i >= 0) {
    const q = plan.quarters[i];
    return { ...info, temp: q.temp, mode: q.mode, price: q.price, known: q.known, expensive: s.expensive[i], surplus: q.surplus };
  }
  if (t < plan.now) {
    const j = s.past.findIndex((x) => x.t === t);
    const past = j >= 0 ? { mode: s.past[j].mode, price: s.past[j].price, expensive: s.pastExpensive[j] } : {};
    const end = t + QUARTER;
    const near = s.measured.filter((p) => Math.abs(p.t - end) <= QUARTER / 2);
    if (near.length) {
      const best = near.reduce((a, b) => (Math.abs(b.t - end) < Math.abs(a.t - end) ? b : a));
      return { ...info, ...past, temp: best.temp, measured: true };
    }
    return { ...info, ...past };
  }
  return info;
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
  const parts = runs(plan.quarters).map((r) => `${t(r.mode)} ${clockText(r.from, language)}–${clockText(r.to, language)}`);
  return t("plan_summary", { parts: parts.join(", ") });
}

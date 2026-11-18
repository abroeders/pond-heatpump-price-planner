// Geometry of the thermostat gauge: a 270° ring showing a window of target ± 3 K. No DOM.

export const WINDOW = 3; // K on each side of the target
export const START = 135; // degrees, clockwise from the positive x axis (SVG y points down)
export const SWEEP = 270;

export interface Ring {
  cx: number;
  cy: number;
  r: number;
  lo: number;
  hi: number;
}

export function ring(target: number, cx = 180, cy = 180, r = 118): Ring {
  return { cx, cy, r, lo: target - WINDOW, hi: target + WINDOW };
}

export function angleOf(ringDef: Ring, temp: number): number {
  const f = Math.min(Math.max((temp - ringDef.lo) / (ringDef.hi - ringDef.lo), 0), 1);
  return START + SWEEP * f;
}

export function point(ringDef: Ring, angle: number, radius = ringDef.r): [number, number] {
  const a = (angle * Math.PI) / 180;
  return [ringDef.cx + radius * Math.cos(a), ringDef.cy + radius * Math.sin(a)];
}

export function arc(ringDef: Ring, a0: number, a1: number, radius = ringDef.r): string {
  const [x0, y0] = point(ringDef, a0, radius);
  const [x1, y1] = point(ringDef, a1, radius);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${radius} ${radius} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

export interface Spark {
  line: string;
  bandTop: number;
  bandBottom: number;
  target: number;
  lo: number;
  hi: number;
}

/**
 * Small chart of the pond temperature in a box (x, y, w, h): the line, and the band and target clipped to the box.
 * The scale covers the history and the band, at least 0.5 K. Null with fewer than two points.
 */
export function sparkline(
  history: { t: number; temp: number }[],
  target: number,
  band: number,
  box: { x: number; y: number; w: number; h: number },
): Spark | null {
  if (history.length < 2) return null;
  const temps = history.map((p) => p.temp);
  let lo = Math.min(...temps, target - band);
  let hi = Math.max(...temps, target + band);
  if (hi - lo < 0.5) {
    const mid = (hi + lo) / 2;
    lo = mid - 0.25;
    hi = mid + 0.25;
  }
  const t0 = history[0].t;
  const t1 = history[history.length - 1].t;
  const x = (t: number) => box.x + ((t - t0) / (t1 - t0)) * box.w;
  const y = (v: number) => box.y + ((hi - v) / (hi - lo)) * box.h;
  const line = history.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)} ${y(p.temp).toFixed(1)}`).join(" ");
  return { line, bandTop: y(target + band), bandBottom: y(target - band), target: y(target), lo, hi };
}

/** Temperature for a pointer position, rounded to the step and clamped to the ring and the limits. */
export function tempAt(ringDef: Ring, x: number, y: number, step: number, min: number, max: number): number {
  let deg = (Math.atan2(y - ringDef.cy, x - ringDef.cx) * 180) / Math.PI;
  if (deg < START - 45) deg += 360; // the gap at the bottom belongs to the nearest end
  const f = Math.min(Math.max((deg - START) / SWEEP, 0), 1);
  const raw = ringDef.lo + f * (ringDef.hi - ringDef.lo);
  return clampStep(raw, step, min, max);
}

export function clampStep(value: number, step: number, min: number, max: number): number {
  const stepped = Math.round(value / step) * step;
  return Number(Math.min(Math.max(stepped, min), max).toFixed(2));
}

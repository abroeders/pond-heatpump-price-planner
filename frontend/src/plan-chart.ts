// Plan chart: predicted pond temperature with band and target, mode bars, price step line.

import { css, html, nothing, svg, type TemplateResult } from "lit";
import { scales, summary, timeTicks } from "./chart";
import type { Localizer } from "./localize";
import type { PlanModel } from "./viewmodel";

const DEFAULT_W = 600;
const H = 220;
const QUARTER = 15 * 60 * 1000;
const DAY_LABEL_W = 70; // room for a date label before the first midnight

export function planChart(plan: PlanModel, t: Localizer, language: string, W = DEFAULT_W): TemplateResult {
  const s = scales(plan, W, H);
  const q = plan.quarters;
  const bw = s.x(q[0].t + QUARTER) - s.x(q[0].t);
  const level = { off: 0, low: 0.5, high: 1 } as const;
  const bars = q.map((x, i) => {
    const h = 18 * level[x.mode];
    const expensive = s.expensive[i] ? svg`<rect x=${s.x(x.t)} y="28" width=${bw} height=${H - 56} class="expensive"/>` : svg``;
    const sun = x.surplus ? svg`<rect x=${s.x(x.t)} y=${H - 26} width=${bw} height="4" class="sun"/>` : svg``;
    return svg`${expensive}${sun}<rect x=${s.x(x.t)} y=${H - 28 - h} width=${bw} height=${h} class="bar ${x.mode}"/>`;
  });
  const temp = q.map((x, i) => `${i ? "L" : "M"}${s.x(x.t + QUARTER).toFixed(1)} ${s.yTemp(x.temp).toFixed(1)}`).join(" ");
  const price = q
    .map((x, i) => `${i ? "L" : "M"}${s.x(x.t).toFixed(1)} ${s.yPrice(x.price).toFixed(1)} H${s.x(x.t + QUARTER).toFixed(1)}`)
    .join(" ");
  const bandTop = s.yTemp(plan.target + plan.band);
  const bandBottom = s.yTemp(plan.target - plan.band);
  const nowX = Math.min(Math.max(s.x(plan.now), 28), W - 28);
  const hour = (ms: number) => new Date(ms).toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" });
  const day = (ms: number) => new Date(ms).toLocaleDateString(language, { weekday: "short", day: "numeric", month: "short" });
  const tickList = timeTicks(s.start, s.end);
  const gridLines = tickList.map(
    (k) => svg`<line x1=${s.x(k.t)} x2=${s.x(k.t)} y1="28" y2=${H - 28} class=${k.midnight ? "day" : "grid"}/>`,
  );
  const ticks = tickList.map((k) => svg`<text x=${s.x(k.t)} y=${H - 8} class="axis" text-anchor="middle">${hour(k.t)}</text>`);
  // the date of every day in the chart: at the start and at each midnight
  const firstMidnight = tickList.find((k) => k.midnight);
  const dayStarts = [
    ...(firstMidnight && s.x(firstMidnight.t) - 28 < DAY_LABEL_W ? [] : [{ t: s.start, x: 28 }]),
    ...tickList.filter((k) => k.midnight).map((k) => ({ t: k.t, x: s.x(k.t) })),
  ];
  const days = dayStarts.map((d) => svg`<text x=${d.x + 4} y="40" class="day-label">${day(d.t)}</text>`);
  return svg`
    <svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label=${summary(plan, t, language)}>
      ${gridLines}
      <rect x="28" y=${bandTop} width=${W - 56} height=${bandBottom - bandTop} class="band"/>
      ${bars}
      <line x1="28" x2=${W - 28} y1=${s.yTemp(plan.target)} y2=${s.yTemp(plan.target)} class="target"/>
      <path d=${price} class="price"/>
      <path d=${temp} class="temp"/>
      ${s.knownUntil === null ? svg`` : svg`<line x1=${s.x(s.knownUntil)} x2=${s.x(s.knownUntil)} y1="28" y2=${H - 28} class="known"/>`}
      <line x1=${nowX} x2=${nowX} y1="20" y2=${H - 28} class="now"/>
      <text x="4" y="20" class="axis">${s.tempMax.toFixed(1)} °C</text>
      <text x="4" y=${H - 30} class="axis">${s.tempMin.toFixed(1)}</text>
      <text x=${W - 4} y="20" class="axis" text-anchor="end">€ ${s.priceMax.toFixed(2)}</text>
      <text x=${W - 4} y=${H - 30} class="axis" text-anchor="end">${s.priceMin.toFixed(2)}</text>
      ${ticks}
      ${days}
    </svg>`;
}

export interface LegendItem {
  key: string;
  swatch: "line" | "dashed" | "area" | "low" | "high" | "step" | "expensive" | "solar" | "now" | "dotted";
}

/** Legend items for this plan; optional items only when the plan contains them. */
export function legendItems(plan: PlanModel): LegendItem[] {
  const s = scales(plan, DEFAULT_W, H);
  const items: LegendItem[] = [
    { key: "legend_pond", swatch: "line" },
    { key: "target", swatch: "dashed" },
    { key: "band", swatch: "area" },
    { key: "low", swatch: "low" },
    { key: "high", swatch: "high" },
    { key: "price", swatch: "step" },
  ];
  if (s.expensive.some(Boolean)) items.push({ key: "legend_expensive", swatch: "expensive" });
  if (plan.quarters.some((q) => q.surplus)) items.push({ key: "legend_solar", swatch: "solar" });
  items.push({ key: "now", swatch: "now" });
  if (s.knownUntil !== null) items.push({ key: "legend_forecast", swatch: "dotted" });
  return items;
}

export function planLegend(plan: PlanModel, t: Localizer): TemplateResult | typeof nothing {
  return html`<ul class="chart-legend">
    ${legendItems(plan).map((i) => html`<li><span class="sw ${i.swatch}"></span>${t(i.key)}</li>`)}
  </ul>`;
}

export const planChartStyles = css`
  .chart-legend { list-style: none; display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 6px 0 0; padding: 0; font-size: 11px; color: var(--secondary-text-color); }
  .chart-legend li { display: flex; align-items: center; gap: 5px; }
  .sw { display: inline-block; width: 18px; height: 10px; box-sizing: border-box; }
  .sw.line { border-top: 2.5px solid var(--phpc-pond-color, #1e88e5); height: 0; }
  .sw.dashed { border-top: 1.5px dashed var(--primary-text-color); height: 0; opacity: 0.6; }
  .sw.area { background: var(--success-color, #66bb6a); opacity: 0.3; }
  .sw.low { background: #1e88e5; opacity: 0.55; } .sw.high { background: #ef6c00; opacity: 0.6; }
  .sw.step { border-top: 1.2px solid var(--secondary-text-color); height: 0; }
  .sw.expensive { background: var(--warning-color, #ff9800); opacity: 0.2; }
  .sw.solar { background: #fdd835; height: 4px; }
  .sw.now { border-left: 2px solid var(--error-color, #e53935); width: 2px; height: 12px; }
  .sw.dotted { border-left: 1.5px dotted var(--secondary-text-color); width: 2px; height: 12px; }
  .chart { width: 100%; height: auto; display: block; }
  .band { fill: var(--success-color, #66bb6a); opacity: 0.15; }
  .expensive { fill: var(--warning-color, #ff9800); opacity: 0.07; }
  .sun { fill: #fdd835; }
  .bar.low { fill: #1e88e5; opacity: 0.55; } .bar.high { fill: #ef6c00; opacity: 0.6; } .bar.off { fill: none; }
  .target { stroke: var(--primary-text-color); stroke-dasharray: 4 4; opacity: 0.6; }
  .temp { fill: none; stroke: var(--phpc-pond-color, #1e88e5); stroke-width: 2.5; }
  .price { fill: none; stroke: var(--secondary-text-color); stroke-width: 1.2; }
  .known { stroke: var(--secondary-text-color); stroke-dasharray: 2 3; }
  .now { stroke: var(--error-color, #e53935); stroke-width: 1.5; }
  .axis { font-size: 10px; fill: var(--secondary-text-color); }
  .grid { stroke: var(--divider-color, #e0e0e0); stroke-width: 1; }
  .day { stroke: var(--secondary-text-color); stroke-width: 1; opacity: 0.6; }
  .day-label { font-size: 11px; font-weight: 600; fill: var(--primary-text-color); opacity: 0.75; }
`;

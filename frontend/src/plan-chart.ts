// Plan chart: measured and predicted pond temperature with band and target, mode bars, price step line,
// and a hairline with a tooltip under the pointer.

import { LitElement, css, html, nothing, svg, type TemplateResult } from "lit";
import {
  QUARTER,
  hoverInfo,
  measuredPath,
  predictedPath,
  quarterAt,
  scales,
  summary,
  timeTicks,
  type ChartScales,
  type HoverInfo,
} from "./chart";
import { clockText } from "./format";
import type { Localizer } from "./localize";
import type { PlanModel } from "./viewmodel";

const DEFAULT_W = 600;
const H = 220;
const DAY_LABEL_W = 70; // room for a date label before the first midnight

const dayText = (ms: number, language: string) =>
  new Date(ms).toLocaleDateString(language, { weekday: "short", day: "numeric", month: "short" });

/** The lines of the tooltip for one quarter. */
export function tooltipLines(info: HoverInfo, t: Localizer, language: string): string[] {
  const lines = [`${dayText(info.t, language)} ${clockText(info.t, language)}–${clockText(info.t + QUARTER, language)}`];
  if (info.temp !== null) lines.push(`${info.temp.toFixed(2)} °C ${t(info.measured ? "tip_measured" : "tip_predicted")}`);
  if (info.mode !== null) lines.push(`${t("tip_mode")}: ${t(info.mode)}`);
  if (info.price !== null) lines.push(`€ ${info.price.toFixed(3)}/kWh${info.known ? "" : ` (${t("tip_forecast")})`}`);
  if (info.expensive) lines.push(t("tip_expensive"));
  if (info.surplus) lines.push(`${t("tip_solar")} ${info.surplus.toFixed(1)} kW`);
  return lines;
}

export function planChart(
  plan: PlanModel,
  t: Localizer,
  language: string,
  W = DEFAULT_W,
  hover: HoverInfo | null = null,
  s: ChartScales = scales(plan, W, H),
): TemplateResult {
  const q = plan.quarters;
  const bw = s.x(q[0].t + QUARTER) - s.x(q[0].t);
  const level = { off: 0, low: 0.5, high: 1 } as const;
  const bars = q.map((x, i) => {
    if (x.t < s.start || x.t >= s.end) return svg``;
    const h = 18 * level[x.mode];
    const expensive = s.expensive[i] ? svg`<rect x=${s.x(x.t)} y="28" width=${bw} height=${H - 56} class="expensive"/>` : svg``;
    const sun = x.surplus ? svg`<rect x=${s.x(x.t)} y=${H - 26} width=${bw} height="4" class="sun"/>` : svg``;
    return svg`${expensive}${sun}<rect x=${s.x(x.t)} y=${H - 28 - h} width=${bw} height=${h} class="bar ${x.mode}"/>`;
  });
  const price = q
    .filter((x) => x.t >= s.start && x.t < s.end)
    .map((x, i) => `${i ? "L" : "M"}${s.x(x.t).toFixed(1)} ${s.yPrice(x.price).toFixed(1)} H${s.x(x.t + QUARTER).toFixed(1)}`)
    .join(" ");
  const bandTop = s.yTemp(plan.target + plan.band);
  const bandBottom = s.yTemp(plan.target - plan.band);
  const nowX = Math.min(Math.max(s.x(plan.now), 28), W - 28);
  const tickList = timeTicks(s.start, s.end);
  const gridLines = tickList.map(
    (k) => svg`<line x1=${s.x(k.t)} x2=${s.x(k.t)} y1="28" y2=${H - 28} class=${k.midnight ? "day" : "grid"}/>`,
  );
  const ticks = tickList.map(
    (k) => svg`<text x=${s.x(k.t)} y=${H - 8} class="axis" text-anchor="middle">${clockText(k.t, language)}</text>`,
  );
  // the date of every day in the chart: at the start and at each midnight
  const firstMidnight = tickList.find((k) => k.midnight);
  const dayStarts = [
    ...(firstMidnight && s.x(firstMidnight.t) - 28 < DAY_LABEL_W ? [] : [{ t: s.start, x: 28 }]),
    ...tickList.filter((k) => k.midnight).map((k) => ({ t: k.t, x: s.x(k.t) })),
  ];
  const days = dayStarts.map((d) => svg`<text x=${d.x + 4} y="40" class="day-label">${dayText(d.t, language)}</text>`);
  let hair = svg``;
  if (hover) {
    const hx = s.x(hover.t + QUARTER / 2);
    const dot =
      hover.temp === null ? svg`` : svg`<circle cx=${s.x(hover.t + QUARTER)} cy=${s.yTemp(hover.temp)} r="4" class="hover-dot"/>`;
    hair = svg`<line x1=${hx} x2=${hx} y1="28" y2=${H - 28} class="hair"/>${dot}`;
  }
  return svg`
    <svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label=${summary(plan, t, language)}>
      ${gridLines}
      <rect x="28" y=${bandTop} width=${W - 56} height=${bandBottom - bandTop} class="band"/>
      ${bars}
      <line x1="28" x2=${W - 28} y1=${s.yTemp(plan.target)} y2=${s.yTemp(plan.target)} class="target"/>
      <path d=${price} class="price"/>
      <path d=${measuredPath(s)} class="measured"/>
      <path d=${predictedPath(plan, s)} class="temp"/>
      ${s.knownUntil === null ? svg`` : svg`<line x1=${s.x(s.knownUntil)} x2=${s.x(s.knownUntil)} y1="28" y2=${H - 28} class="known"/>`}
      <line x1=${nowX} x2=${nowX} y1="20" y2=${H - 28} class="now"/>
      <text x="4" y="20" class="axis">${s.tempMax.toFixed(1)} °C</text>
      <text x="4" y=${H - 30} class="axis">${s.tempMin.toFixed(1)}</text>
      <text x=${W - 4} y="20" class="axis" text-anchor="end">€ ${s.priceMax.toFixed(2)}</text>
      <text x=${W - 4} y=${H - 30} class="axis" text-anchor="end">€ ${s.priceMin.toFixed(2)}</text>
      ${ticks}
      ${days}
      ${hair}
    </svg>`;
}

/**
 * The plan chart as an element: it keeps the hover state, so moving the pointer redraws only the chart.
 * Rendered without a shadow root, so the card's chart styles apply.
 */
export class PhpcPlanChart extends LitElement {
  static properties = { model: { attribute: false }, t: { attribute: false }, language: {}, width: { type: Number }, _hover: { state: true } };

  model!: PlanModel;
  t!: Localizer;
  language = "en";
  width = DEFAULT_W;
  _hover: number | null = null; // start of the hovered quarter

  createRenderRoot() {
    return this;
  }

  private get scales(): ChartScales {
    return scales(this.model, this.width, H);
  }

  private onPointer = (ev: PointerEvent) => {
    const box = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    if (!box.width) return;
    this._hover = quarterAt(this.scales, ((ev.clientX - box.left) / box.width) * this.width);
  };

  private onLeave = (ev: PointerEvent) => {
    if (ev.pointerType === "mouse") this._hover = null; // touch: stays until a tap elsewhere
  };

  private onOutside = (ev: PointerEvent) => {
    if (this._hover !== null && !ev.composedPath().includes(this)) this._hover = null;
  };

  private onKey = (ev: KeyboardEvent) => {
    const s = this.scales;
    const current = this._hover ?? Math.floor(this.model.now / QUARTER) * QUARTER;
    const next: Record<string, number | null> = {
      ArrowLeft: current - QUARTER,
      ArrowRight: current + QUARTER,
      Home: s.start,
      End: s.end - QUARTER,
      Escape: null,
    };
    if (!(ev.key in next)) return;
    ev.preventDefault();
    const value = next[ev.key];
    this._hover = value === null ? null : Math.min(Math.max(value, s.start), s.end - QUARTER);
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("pointerdown", this.onOutside);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("pointerdown", this.onOutside);
  }

  render() {
    if (!this.model) return nothing;
    const s = this.scales;
    const info = this._hover === null ? null : hoverInfo(this.model, s, this._hover);
    const lines = info ? tooltipLines(info, this.t, this.language) : [];
    let tip: TemplateResult | typeof nothing = nothing;
    if (info) {
      const pct = (s.x(info.t + QUARTER / 2) / this.width) * 100;
      const side = pct > 50 ? `right:${(100 - pct).toFixed(1)}%` : `left:${pct.toFixed(1)}%`;
      tip = html`<div class="tooltip ${pct > 50 ? "to-left" : "to-right"}" style=${side}>
        ${lines.map((l, i) => html`<div class=${i ? "" : "tip-time"}>${l}</div>`)}
      </div>`;
    }
    return html`<div class="plot" tabindex="0" @pointermove=${this.onPointer} @pointerdown=${this.onPointer}
        @pointerleave=${this.onLeave} @keydown=${this.onKey}>
        ${planChart(this.model, this.t, this.language, this.width, info, s)}${tip}
        <span class="sr-only" aria-live="polite">${lines.join(", ")}</span>
      </div>`;
  }
}

export interface LegendItem {
  key: string;
  swatch: "line" | "predicted" | "dashed" | "area" | "low" | "high" | "step" | "expensive" | "solar" | "now" | "dotted";
}

/** Legend items for this plan; optional items only when the plan contains them. */
export function legendItems(plan: PlanModel): LegendItem[] {
  const s = scales(plan, DEFAULT_W, H);
  const items: LegendItem[] = [
    ...(s.measured.length > 1 ? [{ key: "legend_measured", swatch: "line" } as LegendItem] : []),
    { key: "legend_pond", swatch: "predicted" },
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
  .sw.predicted { border-top: 2.5px dashed var(--phpc-pond-color, #1e88e5); height: 0; }
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
  .temp { fill: none; stroke: var(--phpc-pond-color, #1e88e5); stroke-width: 2.5; stroke-dasharray: 7 4; }
  .measured { fill: none; stroke: var(--phpc-pond-color, #1e88e5); stroke-width: 2.5; }
  .plot { position: relative; touch-action: pan-y; outline: none; }
  .plot:focus-visible { box-shadow: 0 0 0 2px var(--primary-color, #1e88e5); border-radius: 4px; }
  .hair { stroke: var(--primary-text-color); stroke-width: 1; opacity: 0.7; }
  .hover-dot { fill: var(--phpc-pond-color, #1e88e5); stroke: var(--card-background-color, #fff); stroke-width: 2; }
  .tooltip { position: absolute; top: 8px; z-index: 1; pointer-events: none; white-space: nowrap; font-size: 12px; line-height: 1.45;
    padding: 6px 9px; border-radius: 6px; background: var(--card-background-color, #fff); color: var(--primary-text-color);
    border: 1px solid var(--divider-color, #e0e0e0); box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18); }
  .tooltip.to-right { margin-left: 10px; } .tooltip.to-left { margin-right: 10px; }
  .tip-time { font-weight: 600; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .price { fill: none; stroke: var(--secondary-text-color); stroke-width: 1.2; }
  .known { stroke: var(--secondary-text-color); stroke-dasharray: 2 3; }
  .now { stroke: var(--error-color, #e53935); stroke-width: 1.5; }
  .axis { font-size: 10px; fill: var(--secondary-text-color); }
  .grid { stroke: var(--divider-color, #e0e0e0); stroke-width: 1; }
  .day { stroke: var(--secondary-text-color); stroke-width: 1; opacity: 0.6; }
  .day-label { font-size: 11px; font-weight: 600; fill: var(--primary-text-color); opacity: 0.75; }
`;

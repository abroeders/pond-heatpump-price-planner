// Plan chart: predicted pond temperature with band and target, mode bars, price step line.

import { css, svg, type TemplateResult } from "lit";
import { scales, summary } from "./chart";
import type { Localizer } from "./localize";
import type { PlanModel } from "./viewmodel";

const W = 600;
const H = 220;
const QUARTER = 15 * 60 * 1000;

export function planChart(plan: PlanModel, t: Localizer, language: string): TemplateResult {
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
  const ticks = [];
  for (let t0 = Math.ceil(s.start / (6 * 3600e3)) * 6 * 3600e3; t0 < s.end; t0 += 6 * 3600e3) {
    ticks.push(svg`<text x=${s.x(t0)} y=${H - 8} class="axis" text-anchor="middle">${hour(t0)}</text>`);
  }
  return svg`
    <svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label=${summary(plan, t, language)}>
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
    </svg>`;
}

export const planChartStyles = css`
  .chart { width: 100%; height: auto; display: block; }
  .band { fill: var(--success-color, #66bb6a); opacity: 0.15; }
  .expensive { fill: var(--warning-color, #ff9800); opacity: 0.07; }
  .sun { fill: #fdd835; }
  .bar.low { fill: #1e88e5; opacity: 0.55; } .bar.high { fill: #ef6c00; opacity: 0.6; } .bar.off { fill: none; }
  .target { stroke: var(--primary-text-color); stroke-dasharray: 4 4; opacity: 0.6; }
  .temp { fill: none; stroke: #0d47a1; stroke-width: 2.5; }
  .price { fill: none; stroke: var(--secondary-text-color); stroke-width: 1.2; }
  .known { stroke: var(--secondary-text-color); stroke-dasharray: 2 3; }
  .now { stroke: var(--error-color, #e53935); stroke-width: 1.5; }
  .axis { font-size: 10px; fill: var(--secondary-text-color); }
`;

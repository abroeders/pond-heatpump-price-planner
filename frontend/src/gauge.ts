// Thermostat gauge with a vertical band slider. Emits `set-target` and `set-band` after 1 s of quiet.

import { LitElement, css, html, nothing, svg } from "lit";
import { WINDOW, angleOf, arc, clampStep, point, ring, tempAt, START, SWEEP } from "./gauge-math";
import type { Localizer } from "./localize";
import type { GaugeModel } from "./viewmodel";

export const DEBOUNCE_MS = 1000;
const BAND_MIN = 0.1;
const BAND_MAX = 1.0;
const BAND_STEP = 0.05;

export class PhpcGauge extends LitElement {
  static properties = {
    model: { attribute: false },
    t: { attribute: false },
    _target: { state: true },
    _band: { state: true },
  };

  model!: GaugeModel;
  t!: Localizer;
  _target: number | null = null; // local value while the user is changing it
  _band: number | null = null;
  private _timers: Record<string, ReturnType<typeof setTimeout> | undefined> = {};
  private _dragging = false;

  private get target(): number {
    return this._target ?? this.model.target;
  }

  private get band(): number {
    return this._band ?? this.model.band;
  }

  private emit(name: "set-target" | "set-band", value: number) {
    clearTimeout(this._timers[name]);
    this._timers[name] = setTimeout(() => {
      this.dispatchEvent(new CustomEvent(name, { detail: { value }, bubbles: true, composed: true }));
      if (name === "set-target") this._target = null;
      else this._band = null;
    }, DEBOUNCE_MS);
  }

  private setTarget(value: number) {
    const m = this.model;
    this._target = clampStep(value, m.step, m.min, m.max);
    this.emit("set-target", this._target);
  }

  private setBand(value: number) {
    this._band = clampStep(value, BAND_STEP, BAND_MIN, BAND_MAX);
    this.emit("set-band", this._band);
  }

  private pointerTemp(ev: PointerEvent): number {
    const svgEl = (ev.currentTarget as SVGElement).closest("svg")!;
    const box = svgEl.getBoundingClientRect();
    const x = ((ev.clientX - box.left) / box.width) * 360;
    const y = ((ev.clientY - box.top) / box.height) * 360;
    return tempAt(ring(this.model.target), x, y, this.model.step, this.model.min, this.model.max);
  }

  private onDown = (ev: PointerEvent) => {
    this._dragging = true;
    (ev.currentTarget as Element).setPointerCapture?.(ev.pointerId);
    this.setTarget(this.pointerTemp(ev));
  };

  private onMove = (ev: PointerEvent) => {
    if (this._dragging) this.setTarget(this.pointerTemp(ev));
  };

  private onUp = () => {
    this._dragging = false;
  };

  private onKey(ev: KeyboardEvent, kind: "target" | "band") {
    const delta = ev.key === "ArrowUp" || ev.key === "ArrowRight" ? 1 : ev.key === "ArrowDown" || ev.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    ev.preventDefault();
    if (kind === "target") this.setTarget(this.target + delta * this.model.step);
    else this.setBand(this.band + delta * BAND_STEP);
  }

  private onSlider(ev: Event) {
    this.setBand(Number((ev.target as HTMLInputElement).value));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    Object.values(this._timers).forEach((timer) => clearTimeout(timer));
  }

  render() {
    const m = this.model;
    const t = this.t;
    const target = this.target;
    const band = this.band;
    const r = ring(m.target); // the window follows the stored target, not the one being dragged
    const ticks = [];
    for (let v = Math.ceil(r.lo); v <= Math.floor(r.hi); v++) {
      const a = angleOf(r, v);
      const [x0, y0] = point(r, a, r.r + 11);
      const [x1, y1] = point(r, a, r.r + 17);
      const [lx, ly] = point(r, a, r.r + 30);
      ticks.push(svg`<line x1=${x0} y1=${y0} x2=${x1} y2=${y1} class="tick"/>
        <text x=${lx} y=${ly + 4} class="tick-label" text-anchor="middle">${v}</text>`);
    }
    const [hx, hy] = point(r, angleOf(r, target));
    let pondMarker = svg``;
    if (m.pond !== null) {
      const a = angleOf(r, m.pond);
      const tip = point(r, a, r.r - 12);
      const b1 = point(r, a - 4, r.r - 26);
      const b2 = point(r, a + 4, r.r - 26);
      pondMarker = svg`<polygon class="pond-marker" points="${tip.join(",")} ${b1.join(",")} ${b2.join(",")}"/>`;
    }
    const status = [
      m.heating === null ? null : t(m.heating ? "heating" : "idle"),
      m.mode ? t(m.mode) : null,
      m.position ? t(m.position) : null,
    ].filter(Boolean);
    return html`
      <div class="wrap">
        <svg viewBox="0 0 360 330" class="gauge">
          <path d=${arc(r, START, START + SWEEP)} class="ring"/>
          <path d=${arc(r, angleOf(r, target - band), angleOf(r, target + band))} class="band"/>
          ${ticks}
          ${pondMarker}
          <circle cx=${hx} cy=${hy} r="12" class="handle" tabindex="0" role="slider"
            aria-label=${t("target")} aria-valuemin=${m.min} aria-valuemax=${m.max} aria-valuenow=${target}
            @pointerdown=${this.onDown} @pointermove=${this.onMove} @pointerup=${this.onUp}
            @keydown=${(e: KeyboardEvent) => this.onKey(e, "target")}/>
          <path d=${arc(r, START, START + SWEEP)} class="hit"
            @pointerdown=${this.onDown} @pointermove=${this.onMove} @pointerup=${this.onUp}/>
          <text x="180" y="140" class="caption" text-anchor="middle">${t("pond")}</text>
          <text x="180" y="178" class="pond" text-anchor="middle">${m.pond === null ? "–" : `${m.pond.toFixed(1)} °C`}</text>
          <text x="180" y="200" class="status ${m.position ?? ""}" text-anchor="middle">${status.join(" · ")}</text>
        </svg>
        <div class="stepper" style="--window:${WINDOW}">
          <span class="caption">${t("target")}</span>
          <button @click=${() => this.setTarget(target - m.step)} aria-label="−">−</button>
          <span class="number">${target.toFixed(1)} °C</span>
          <button @click=${() => this.setTarget(target + m.step)} aria-label="+">+</button>
        </div>
        ${m.bandEntity === null ? nothing : html`
          <div class="band-slider">
            <span class="caption">${t("band")}</span>
            <span class="number">± ${band.toFixed(2)} °C</span>
            <input type="range" min=${BAND_MIN} max=${BAND_MAX} step=${BAND_STEP} .value=${String(band)}
              aria-label=${t("band")} @input=${this.onSlider} @keydown=${(e: KeyboardEvent) => this.onKey(e, "band")}/>
          </div>`}
      </div>`;
  }

  static styles = css`
    .wrap { display: grid; grid-template-columns: 1fr auto; grid-template-areas: "gauge band" "step band"; align-items: center; gap: 0 12px; }
    .gauge { grid-area: gauge; width: 100%; height: auto; touch-action: none; }
    .ring { fill: none; stroke: var(--divider-color, #e0e0e0); stroke-width: 18; stroke-linecap: round; }
    .band { fill: none; stroke: var(--success-color, #66bb6a); stroke-width: 18; }
    .hit { fill: none; stroke: transparent; stroke-width: 40; cursor: pointer; }
    .tick { stroke: var(--secondary-text-color); stroke-width: 1.5; }
    .tick-label { font-size: 11px; fill: var(--secondary-text-color); }
    .handle { fill: var(--card-background-color, #fff); stroke: var(--primary-color, #1e88e5); stroke-width: 4; cursor: grab; }
    .handle:focus-visible { outline: none; stroke-width: 6; }
    .pond-marker { fill: #0d47a1; }
    .caption { font-size: 12px; fill: var(--secondary-text-color); color: var(--secondary-text-color); }
    .pond { font-size: 34px; font-weight: 700; fill: #0d47a1; }
    .status { font-size: 12px; fill: var(--success-color, #43a047); }
    .status.above_band { fill: var(--warning-color, #ef6c00); }
    .status.below_band { fill: var(--info-color, #1e88e5); }
    .stepper { grid-area: step; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .stepper .caption { margin-right: 4px; }
    .number { font-size: 16px; font-weight: 600; color: var(--primary-text-color); min-width: 72px; text-align: center; }
    button { width: 32px; height: 32px; border-radius: 50%; border: none; background: var(--secondary-background-color, #eceff1); color: var(--primary-text-color); font-size: 18px; cursor: pointer; }
    .band-slider { grid-area: band; display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .band-slider input { writing-mode: vertical-lr; direction: rtl; height: 200px; accent-color: var(--success-color, #43a047); }
  `;
}

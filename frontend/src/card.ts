// The card: renders the sections of the view model; re-renders only when one of its entities changed.

import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { plannerDevices } from "./entities";
import { PhpcGauge } from "./gauge";
import { illustration, illustrationStyles } from "./illustration";
import { GRID_OPTIONS, chartWidth, columnsOf, layoutFor, spanFor, type Block, type Layout } from "./layout";
import { localizer, type Localizer } from "./localize";
import { planChartStyles, planLegend } from "./plan-chart";
import { figures, modelSection, nextLine, sectionStyles, switches } from "./sections";
import type { CardConfig, HomeAssistant, Section } from "./types";
import { buildViewModel, type CardViewModel } from "./viewmodel";

export const CARD_TAG = "pond-heatpump-planner-card";
export const EDITOR_TAG = "pond-heatpump-planner-card-editor";
export const GAUGE_TAG = "phpc-gauge";
export const PLAN_CHART_TAG = "phpc-plan-chart";

export class PondHeatpumpPlannerCard extends LitElement {
  static properties = { _vm: { state: true }, _layout: { state: true } };

  _vm?: CardViewModel;
  _layout: Layout = "narrow";
  private _observer?: ResizeObserver;
  private _hass?: HomeAssistant;
  private _config?: CardConfig;

  static getConfigElement(): HTMLElement {
    return document.createElement(EDITOR_TAG);
  }

  static getStubConfig(hass: HomeAssistant): CardConfig {
    return { type: `custom:${CARD_TAG}`, device_id: plannerDevices(hass)[0] };
  }

  setConfig(config: CardConfig): void {
    if (!config) throw new Error("Invalid configuration");
    this._config = { hours: 36, ...config };
    this.rebuild(true);
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this.rebuild(false);
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  private rebuild(force: boolean) {
    if (!this._hass || !this._config) return;
    const vm = buildViewModel(this._hass, this._config);
    if (force || !this._vm || vm.signature !== this._vm.signature) this._vm = vm;
  }

  getCardSize(): number {
    return 12;
  }

  /** Sections dashboard: full width by default, at least half a section, height follows the content. */
  getGridOptions() {
    return { ...GRID_OPTIONS };
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (typeof ResizeObserver !== "undefined") {
      this._observer = new ResizeObserver((entries) => this.resized(entries[0]?.contentRect.width ?? 0));
      this._observer.observe(this);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._observer?.disconnect();
  }

  /** Called with the card's width; picks the layout. */
  resized(width: number): void {
    const layout = layoutFor(width);
    if (layout !== this._layout) this._layout = layout;
  }

  private get language(): string {
    return this._vm?.language ?? this._hass?.locale?.language ?? this._hass?.language ?? "en";
  }

  private get t(): Localizer {
    return localizer(this.language);
  }

  private call(domain: string, service: string, data: Record<string, unknown>) {
    this._hass?.callService(domain, service, data).catch((err: unknown) => {
      console.error(`${domain}.${service} failed`, err);
    });
  }

  private content(name: Section, vm: CardViewModel): TemplateResult | typeof nothing {
    const t = this.t;
    const language = this.language;
    switch (name) {
      case "heat_pump":
        return vm.illustration ? illustration(vm.illustration, t) : nothing;
      case "thermostat":
        return vm.gauge
          ? html`<phpc-gauge .model=${vm.gauge} .t=${t} .language=${language}
                @set-target=${(e: CustomEvent) => this.call("climate", "set_temperature", { entity_id: vm.gauge!.thermostat, temperature: e.detail.value })}
                @set-band=${(e: CustomEvent) => vm.gauge!.bandEntity && this.call("number", "set_value", { entity_id: vm.gauge!.bandEntity, value: e.detail.value })}
              ></phpc-gauge>
              ${nextLine(vm.gauge, t, language)}`
          : nothing;
      case "plan":
        if (vm.plan)
          return html`<div class="title">${t("plan_title")}</div>
            <phpc-plan-chart .model=${vm.plan} .t=${t} .language=${language} .width=${chartWidth(this._layout)}></phpc-plan-chart>
            ${planLegend(vm.plan, t)}`;
        if (vm.planMissing === null) return nothing;
        return html`<div class="no-plan"><strong>${t("no_plan_yet")}</strong> · ${this.reasonText(vm.planMissing)}</div>`;
      case "figures":
        return vm.figures ? figures(vm.figures, t) : nothing;
      case "switches":
        return vm.switches && (vm.switches.cover || vm.switches.control)
          ? switches(vm.switches, t, (entity, on) => this.call("switch", on ? "turn_on" : "turn_off", { entity_id: entity }))
          : nothing;
      case "model":
        return vm.model ? modelSection(vm.model, t) : nothing;
    }
  }

  private reasonText(reason: string): string {
    const key = `reason_${reason}`;
    const text = this.t(key);
    return text === key ? this.t("reason_other") : text;
  }

  /** Configured sections as layout blocks; figures and switches share one block ("side"). */
  private blocks(vm: CardViewModel): { block: Block; parts: TemplateResult[] }[] {
    const out: { block: Block; parts: TemplateResult[] }[] = [];
    for (const name of vm.sections) {
      const part = this.content(name, vm);
      if (part === nothing) continue;
      const block: Block = name === "figures" || name === "switches" ? "side" : name;
      const existing = block === "side" ? out.find((b) => b.block === "side") : undefined;
      if (existing) existing.parts.push(part as TemplateResult);
      else out.push({ block, parts: [part as TemplateResult] });
    }
    return out;
  }

  render() {
    const vm = this._vm;
    if (!vm) return nothing;
    if (vm.missingDevice) return html`<ha-card><div class="section warning">${this.t("no_device")}</div></ha-card>`;
    const layout = this._layout;
    return html`<ha-card class=${layout} style="--phpc-columns:${columnsOf(layout)}">
      ${this.blocks(vm).map(
        (b) => html`<div class="section ${b.block}" style="grid-column: span ${spanFor(layout, b.block)}">
          ${b.parts.map((p) => html`<div class="part">${p}</div>`)}
        </div>`,
      )}
    </ha-card>`;
  }

  static styles = [
    illustrationStyles,
    planChartStyles,
    sectionStyles,
    css`
      :host { display: block; } /* an inline host has no width, so the layout would never change */
      ha-card { padding: 8px 0; overflow: hidden; display: grid; grid-template-columns: repeat(var(--phpc-columns, 1), minmax(0, 1fr)); grid-auto-flow: row dense; }
      .section { padding: 8px 16px; min-width: 0; border-top: 1px solid var(--divider-color, #e0e0e0); }
      ha-card.narrow .section:first-child { border-top: none; }
      ha-card.medium .section, ha-card.wide .section { border-top: none; padding: 12px 16px; }
      ha-card.medium .section.plan, ha-card.wide .section.plan, ha-card.wide .section.model { border-top: 1px solid var(--divider-color, #e0e0e0); }
      .section.side .part + .part { margin-top: 12px; }
      ha-card.medium .section.side, ha-card.wide .section.side { display: flex; flex-direction: column; justify-content: center; }
      .warning { color: var(--warning-color, #ef6c00); }
      .title { font-size: 14px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px; }
      .no-plan { color: var(--secondary-text-color); font-size: 14px; padding: 12px 0; text-align: center; }
    `,
  ];
}

export { PhpcGauge };

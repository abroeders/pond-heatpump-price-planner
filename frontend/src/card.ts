// The card: renders the sections of the view model; re-renders only when one of its entities changed.

import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { plannerDevices } from "./entities";
import { PhpcGauge } from "./gauge";
import { illustration, illustrationStyles } from "./illustration";
import { localizer, type Localizer } from "./localize";
import { planChart, planChartStyles } from "./plan-chart";
import { figures, modelSection, nextLine, sectionStyles, switches } from "./sections";
import type { CardConfig, HomeAssistant, Section } from "./types";
import { buildViewModel, type CardViewModel } from "./viewmodel";

export const CARD_TAG = "pond-heatpump-planner-card";
export const EDITOR_TAG = "pond-heatpump-planner-card-editor";
export const GAUGE_TAG = "phpc-gauge";

export class PondHeatpumpPlannerCard extends LitElement {
  static properties = { _vm: { state: true } };

  _vm?: CardViewModel;
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

  private get t(): Localizer {
    return localizer(this._hass?.locale?.language ?? this._hass?.language);
  }

  private call(domain: string, service: string, data: Record<string, unknown>) {
    this._hass?.callService(domain, service, data);
  }

  private section(name: Section, vm: CardViewModel): TemplateResult | typeof nothing {
    const t = this.t;
    const language = this._hass?.locale?.language ?? "en";
    switch (name) {
      case "heat_pump":
        return vm.illustration ? html`<div class="section">${illustration(vm.illustration, t)}</div>` : nothing;
      case "thermostat":
        return vm.gauge
          ? html`<div class="section">
              <phpc-gauge .model=${vm.gauge} .t=${t}
                @set-target=${(e: CustomEvent) => this.call("climate", "set_temperature", { entity_id: vm.gauge!.thermostat, temperature: e.detail.value })}
                @set-band=${(e: CustomEvent) => vm.gauge!.bandEntity && this.call("number", "set_value", { entity_id: vm.gauge!.bandEntity, value: e.detail.value })}
              ></phpc-gauge>
              ${nextLine(vm.gauge, t, language)}
            </div>`
          : nothing;
      case "plan":
        return vm.plan ? html`<div class="section">${planChart(vm.plan, t, language)}</div>` : nothing;
      case "figures":
        return vm.figures ? html`<div class="section">${figures(vm.figures, t)}</div>` : nothing;
      case "switches":
        return vm.switches && (vm.switches.cover || vm.switches.control)
          ? html`<div class="section">${switches(vm.switches, t, (entity, on) => this.call("switch", on ? "turn_on" : "turn_off", { entity_id: entity }))}</div>`
          : nothing;
      case "model":
        return vm.model ? html`<div class="section">${modelSection(vm.model, t)}</div>` : nothing;
    }
  }

  render() {
    const vm = this._vm;
    if (!vm) return nothing;
    if (vm.missingDevice) return html`<ha-card><div class="section warning">${this.t("no_device")}</div></ha-card>`;
    return html`<ha-card>${vm.sections.map((s) => this.section(s, vm))}</ha-card>`;
  }

  static styles = [
    illustrationStyles,
    planChartStyles,
    sectionStyles,
    css`
      ha-card { padding: 8px 0; overflow: hidden; }
      .section { padding: 8px 16px; }
      .section + .section { border-top: 1px solid var(--divider-color, #e0e0e0); }
      .warning { color: var(--warning-color, #ef6c00); }
    `,
  ];
}

export { PhpcGauge };

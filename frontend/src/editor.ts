// Visual editor: device picker, hours, sections and the heat pump entities (via Home Assistant's ha-form).

import { LitElement, html } from "lit";
import { localizer } from "./localize";
import { DOMAIN, HEAT_PUMP_KEYS, SECTIONS, type CardConfig, type HomeAssistant } from "./types";

const SENSOR_KEYS = ["water_in", "water_out", "air_in", "air_out", "power", "liquid", "gas", "pump_speed", "pump_power"];

export function editorSchema() {
  return [
    { name: "device_id", selector: { device: { integration: DOMAIN } } },
    { name: "hours", selector: { select: { options: ["24", "36"], mode: "dropdown" } } },
    { name: "sections", selector: { select: { options: [...SECTIONS], multiple: true, reorder: true } } },
    {
      name: "heat_pump",
      type: "expandable",
      title: "Heat pump",
      schema: HEAT_PUMP_KEYS.map((key) => ({
        name: key,
        selector: { entity: { domain: SENSOR_KEYS.includes(key) ? "sensor" : "binary_sensor" } },
      })),
    },
  ];
}

export class PondHeatpumpPlannerCardEditor extends LitElement {
  static properties = { hass: { attribute: false }, _config: { state: true } };

  hass?: HomeAssistant;
  _config?: CardConfig;

  setConfig(config: CardConfig) {
    this._config = config;
  }

  private changed(ev: CustomEvent) {
    const value = { ...ev.detail.value };
    if (value.hours) value.hours = Number(value.hours);
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: value }, bubbles: true, composed: true }));
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const t = localizer(this.hass.locale?.language);
    const data = { ...this._config, hours: String(this._config.hours ?? 36) };
    return html`<ha-form
      .hass=${this.hass}
      .data=${data}
      .schema=${editorSchema()}
      .computeLabel=${(s: { name: string }) => t(s.name)}
      @value-changed=${this.changed}
    ></ha-form>`;
  }
}

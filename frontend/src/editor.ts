// Visual editor: device picker, hours, sections and the heat pump entities (via Home Assistant's ha-form).

import { LitElement, html } from "lit";
import { resolvePlanner } from "./entities";
import { cardLanguage, localizer, type Localizer } from "./localize";
import { CARD_LANGUAGES, DOMAIN, HEAT_PUMP_KEYS, SECTIONS, type CardConfig, type HomeAssistant } from "./types";

const SENSOR_KEYS = ["water_in", "water_out", "air_in", "air_out", "power", "liquid", "gas", "pump_speed", "pump_power"];

export function editorSchema(t: Localizer) {
  return [
    { name: "device_id", selector: { device: { integration: DOMAIN } } },
    { name: "hours", selector: { select: { options: ["24", "36", "48"], mode: "dropdown" } } },
    { name: "sections", selector: { select: { options: [...SECTIONS], multiple: true, reorder: true } } },
    {
      name: "language",
      selector: {
        select: { options: CARD_LANGUAGES.map((value) => ({ value, label: t(`language_${value}`) })), mode: "dropdown" },
      },
    },
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
    if (value.language === "auto") delete value.language; // the default
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: value }, bubbles: true, composed: true }));
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const planner = resolvePlanner(this.hass, this._config.device_id);
    const t = localizer(
      cardLanguage(this._config, this.hass.states[planner.mode ?? ""]?.attributes.language, this.hass.locale?.language),
    );
    const data = { ...this._config, hours: String(this._config.hours ?? 36), language: this._config.language ?? "auto" };
    return html`<ha-form
      .hass=${this.hass}
      .data=${data}
      .schema=${editorSchema(t)}
      .computeLabel=${(s: { name: string }) => t(s.name)}
      @value-changed=${this.changed}
    ></ha-form>`;
  }
}

// Small presentational sections: next start/stop, key figures, switches, model.

import { css, html, nothing, type TemplateResult } from "lit";
import { time } from "./format";
import type { Localizer } from "./localize";
import type { FiguresModel, GaugeModel, ModelSectionModel, SwitchModel } from "./viewmodel";

function item(label: string, value: string | null): TemplateResult | typeof nothing {
  return value === null ? nothing : html`<div class="fig"><span class="v">${value}</span><span class="l">${label}</span></div>`;
}

export function nextLine(g: GaugeModel, t: Localizer, language: string): TemplateResult {
  const parts = [
    g.nextStop ? `${t("next_stop")} ${time(g.nextStop, language)}` : null,
    g.nextStart ? `${t("next_start")} ${time(g.nextStart, language)}` : null,
    g.control === null ? null : t(g.control ? "controlling" : "dry_run"),
  ].filter(Boolean);
  return html`<div class="next">${parts.join(" · ")}</div>`;
}

export function figures(f: FiguresModel, t: Localizer): TemplateResult {
  return html`<div class="figures">
    ${item(t("planned_cost"), f.cost)} ${item(t("planned_energy"), f.energy)}
    ${item(t("expensive_share"), f.expensive)}
    ${item(f.copMethod ? `${t("cop")} (${f.copMethod})` : t("cop"), f.cop)}
    ${item(t("heat_loss"), f.heatLoss)} ${item(t("thermal_power"), f.thermal)}
  </div>`;
}

export function switches(
  s: { cover: SwitchModel | null; control: SwitchModel | null },
  t: Localizer,
  toggle: (entity: string, on: boolean) => void,
): TemplateResult {
  const row = (sw: SwitchModel | null, key: string) =>
    sw === null
      ? nothing
      : html`<label class="switch"><input type="checkbox" .checked=${sw.on} @change=${(e: Event) => toggle(sw.entity, (e.target as HTMLInputElement).checked)}/>${t(key)}</label>`;
  return html`<div class="switches">${row(s.cover, "insulation_cover")} ${row(s.control, "control")}</div>`;
}

export function modelSection(m: ModelSectionModel, t: Localizer): TemplateResult {
  const rows: [string, string | null][] = [
    [t("cooling"), m.cooling],
    [t("heating_low"), m.heatingLow],
    [t("heating_high"), m.heatingHigh],
    [t("heating_boost"), m.heatingBoost],
    [t("prediction_error"), m.predictionError],
    [t("learned"), m.learned],
  ];
  return html`<details class="model"><summary>${t("model")}</summary>
    <table>${rows.filter(([, v]) => v !== null).map(([l, v]) => html`<tr><td>${l}</td><td>${v}</td></tr>`)}</table>
    ${m.copByOutdoor.length
      ? html`<div class="l">${t("cop_by_outdoor")}</div>
          <table>${m.copByOutdoor.map(([k, v]) => html`<tr><td>${k} °C</td><td>${v ?? "–"}</td></tr>`)}</table>`
      : nothing}
  </details>`;
}

export const sectionStyles = css`
  .next { text-align: center; font-size: 13px; color: var(--secondary-text-color); margin: 4px 0 8px; }
  .figures { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px; }
  .fig { display: flex; flex-direction: column; }
  .fig .v { font-size: 16px; font-weight: 600; color: var(--primary-text-color); }
  .fig .l, .l { font-size: 11px; color: var(--secondary-text-color); }
  .switches { display: flex; flex-wrap: wrap; gap: 16px; }
  .switch { display: flex; align-items: center; gap: 6px; color: var(--primary-text-color); }
  .model summary { cursor: pointer; color: var(--primary-text-color); }
  .model table { border-collapse: collapse; font-size: 13px; color: var(--primary-text-color); margin: 4px 0; }
  .model td { padding: 2px 12px 2px 0; }
`;

// Entry point: defines the elements and registers the card in the card picker.

import { CARD_TAG, EDITOR_TAG, GAUGE_TAG, PLAN_CHART_TAG, PondHeatpumpPlannerCard } from "./card";
import { PhpcPlanChart } from "./plan-chart";
import { PondHeatpumpPlannerCardEditor } from "./editor";
import { PhpcGauge } from "./gauge";

function define(tag: string, element: CustomElementConstructor) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

define(GAUGE_TAG, PhpcGauge);
define(PLAN_CHART_TAG, PhpcPlanChart);
define(EDITOR_TAG, PondHeatpumpPlannerCardEditor);
define(CARD_TAG, PondHeatpumpPlannerCard);

const w = window as unknown as { customCards?: unknown[] };
w.customCards = w.customCards ?? [];
if (!w.customCards.some((c: any) => c.type === CARD_TAG)) {
  w.customCards.push({
    type: CARD_TAG,
    name: "Pond Heat Pump Planner",
    description: "Heat pump illustration, thermostat with band, plan and key figures of the pond heat pump planner.",
    preview: true,
    documentationURL: "https://github.com/abroeders/pond-heatpump-price-planner/blob/main/docs/card.md",
  });
}

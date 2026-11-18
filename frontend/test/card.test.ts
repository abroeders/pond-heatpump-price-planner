import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/index";
import { DEBOUNCE_MS } from "../src/gauge";
import { DEVICE, fakeHass, plan, pondHistory } from "./fixtures";

async function mount(hass = fakeHass(), extra: Record<string, unknown> = {}) {
  const card = document.createElement("pond-heatpump-planner-card") as any;
  card.setConfig({ type: "custom:pond-heatpump-planner-card", device_id: DEVICE, heat_pump: { fan: "binary_sensor.fan", flow: "binary_sensor.flow" }, ...extra });
  card.hass = hass;
  document.body.appendChild(card);
  await card.updateComplete;
  return card;
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("card", () => {
  it("registers itself in the card picker", () => {
    const cards = (window as any).customCards;
    expect(cards.some((c: any) => c.type === "pond-heatpump-planner-card" && c.preview)).toBe(true);
  });

  it("renders the sections in the default order", async () => {
    const card = await mount();
    const root = card.shadowRoot;
    expect(root.querySelector(".illustration")).not.toBeNull();
    expect(root.querySelector("phpc-gauge")).not.toBeNull();
    expect(root.querySelector(".chart")).not.toBeNull();
    expect(root.querySelector(".figures")).not.toBeNull();
    const order = [...root.querySelectorAll(".section")].map((s: Element) => s.classList[1]);
    expect(order).toEqual(["heat_pump", "thermostat", "plan", "side", "model"]);
    const side = root.querySelector(".section.side");
    expect(side.querySelector(".figures")).not.toBeNull();
    expect(side.querySelector(".switches")).not.toBeNull();
  });

  it("offers grid options and switches layout with its width", async () => {
    const card = await mount();
    const styles = (customElements.get("pond-heatpump-planner-card") as any).styles.map((s: any) => s.cssText).join("");
    expect(styles).toMatch(/:host\s*\{\s*display:\s*block/); // otherwise the observer measures 0 px
    expect(card.getGridOptions()).toEqual({ columns: "full", min_columns: 6, rows: "auto" });
    const haCard = () => card.shadowRoot.querySelector("ha-card");
    expect(haCard().classList.contains("narrow")).toBe(true);
    card.resized(700);
    await card.updateComplete;
    expect(haCard().classList.contains("medium")).toBe(true);
    expect(card.shadowRoot.querySelector(".section.plan").getAttribute("style")).toContain("span 2");
    card.resized(1200);
    await card.updateComplete;
    expect(haCard().classList.contains("wide")).toBe(true);
    expect(card.shadowRoot.querySelector(".section.plan").getAttribute("style")).toContain("span 3");
    expect(card.shadowRoot.querySelector(".section.side").getAttribute("style")).toContain("span 1");
    expect(card.shadowRoot.querySelector(".chart").getAttribute("viewBox")).toBe("0 0 1200 220");
  });

  it("animations follow the boolean entities", async () => {
    const card = await mount();
    expect(card.shadowRoot.querySelector(".fan.on")).not.toBeNull();
    expect(card.shadowRoot.querySelector(".water.on")).not.toBeNull();
    const still = await mount(fakeHass({ "binary_sensor.fan": { state: "off", attributes: {}, last_updated: "x" }, "binary_sensor.flow": { state: "off", attributes: {}, last_updated: "x" } }));
    expect(still.shadowRoot.querySelector(".fan.on")).toBeNull();
    expect(still.shadowRoot.querySelector(".water.on")).toBeNull();
    expect(still.shadowRoot.querySelector(".pump.off")).not.toBeNull();
  });

  it("hides sections that are not configured and asks for a device", async () => {
    const card = await mount(fakeHass(), { sections: ["figures"] });
    expect(card.shadowRoot.querySelector(".illustration")).toBeNull();
    const none = document.createElement("pond-heatpump-planner-card") as any;
    none.setConfig({ type: "x" });
    none.hass = fakeHass();
    document.body.appendChild(none);
    await none.updateComplete;
    expect(none.shadowRoot.textContent).toContain("Choose a planner device");
  });

  it("sends the target once, 1 s after the last press", async () => {
    vi.useFakeTimers();
    const hass = fakeHass();
    const card = await mount(hass);
    const gauge = card.shadowRoot.querySelector("phpc-gauge");
    await gauge.updateComplete;
    const plus = [...gauge.shadowRoot.querySelectorAll("button")].find((b: HTMLButtonElement) => b.textContent === "+") as HTMLButtonElement;
    plus.click();
    await gauge.updateComplete;
    plus.click();
    await gauge.updateComplete;
    expect(hass.calls).toHaveLength(0);
    vi.advanceTimersByTime(DEBOUNCE_MS + 10);
    expect(hass.calls).toEqual([{ domain: "climate", service: "set_temperature", data: { entity_id: "climate.pond_thermostat", temperature: 14.7 } }]);
  });

  it("shows the band in °C and a legend under the chart", async () => {
    const card = await mount();
    const gauge = card.shadowRoot.querySelector("phpc-gauge");
    await gauge.updateComplete;
    expect(gauge.shadowRoot.textContent).toContain("± 0.25 °C");
    expect(card.shadowRoot.querySelectorAll(".chart-legend li").length).toBeGreaterThanOrEqual(7);
  });

  it("shows the 24-hour history in the gauge, the plan title and the dates", async () => {
    const card = await mount(fakeHass({ "sensor.pond_mode": { state: "low", attributes: { reason: "plan", plan: plan(144), pond_history: pondHistory() }, last_updated: "z" } }));
    const gauge = card.shadowRoot.querySelector("phpc-gauge");
    await gauge.updateComplete;
    expect(gauge.shadowRoot.querySelector(".spark-line").getAttribute("d")).toMatch(/^M/);
    expect(card.shadowRoot.querySelector(".plan .title").textContent).toBe("Plan:");
    expect(card.shadowRoot.querySelectorAll(".chart .day-label").length).toBeGreaterThan(0);
    expect(card.shadowRoot.querySelectorAll(".chart line.grid").length).toBeGreaterThan(0);
  });

  it("leaves the history out without data", async () => {
    const card = await mount(fakeHass({ "sensor.pond_mode": { state: "low", attributes: { reason: "plan" }, last_updated: "y" } }));
    const gauge = card.shadowRoot.querySelector("phpc-gauge");
    await gauge.updateComplete;
    expect(gauge.shadowRoot.querySelector(".spark")).toBeNull();
  });

  it("explains why there is no plan", async () => {
    const card = await mount(fakeHass({ "sensor.pond_mode": { state: "low", attributes: { reason: "no_pond_temperature" }, last_updated: "x" } }));
    expect(card.shadowRoot.querySelector(".chart")).toBeNull();
    expect(card.shadowRoot.querySelector(".no-plan").textContent).toContain("waiting for the pond temperature");
    const other = await mount(fakeHass({ "sensor.pond_mode": { state: "low", attributes: { reason: "something_new" }, last_updated: "x" } }));
    expect(other.shadowRoot.querySelector(".no-plan").textContent).toContain("waiting for the next planning cycle");
  });

  it("sends the band from the slider", async () => {
    vi.useFakeTimers();
    const hass = fakeHass();
    const card = await mount(hass);
    const gauge = card.shadowRoot.querySelector("phpc-gauge");
    await gauge.updateComplete;
    const slider = gauge.shadowRoot.querySelector("input[type=range]") as HTMLInputElement;
    slider.value = "0.4";
    slider.dispatchEvent(new Event("input"));
    vi.advanceTimersByTime(DEBOUNCE_MS + 10);
    expect(hass.calls).toEqual([{ domain: "number", service: "set_value", data: { entity_id: "number.pond_band", value: 0.4 } }]);
  });

  it("toggles a switch", async () => {
    const hass = fakeHass();
    const card = await mount(hass);
    const boxes = card.shadowRoot.querySelectorAll(".switch input");
    (boxes[0] as HTMLInputElement).checked = true;
    boxes[0].dispatchEvent(new Event("change"));
    expect(hass.calls).toEqual([{ domain: "switch", service: "turn_on", data: { entity_id: "switch.pond_insulation_cover" } }]);
  });
});

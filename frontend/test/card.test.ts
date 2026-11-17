import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/index";
import { DEBOUNCE_MS } from "../src/gauge";
import { DEVICE, fakeHass } from "./fixtures";

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
    const order = [...root.querySelectorAll(".section")].map((s: Element) => s.firstElementChild?.tagName.toLowerCase() ?? "");
    expect(order[0]).toBe("svg");
    expect(order[1]).toBe("phpc-gauge");
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

import { describe, expect, it } from "vitest";
import { scales, runs, summary } from "../src/chart";
import { legendItems } from "../src/plan-chart";
import { chartWidth, columnsOf, layoutFor, spanFor } from "../src/layout";
import { plan as planAttr } from "./fixtures";
import { plannerDevices, resolvePlanner } from "../src/entities";
import { angleOf, clampStep, ring, tempAt, START, SWEEP } from "../src/gauge-math";
import { localizer } from "../src/localize";
import { buildViewModel } from "../src/viewmodel";
import { DEVICE, fakeHass } from "./fixtures";

const config = { type: "custom:pond-heatpump-planner-card", device_id: DEVICE, heat_pump: { pump_speed: "sensor.pump_speed", pump_power: "sensor.pump_power", fan: "binary_sensor.fan", flow: "binary_sensor.flow", pump_fault: "binary_sensor.pump_fault" } };

describe("entities", () => {
  it("finds planner devices and resolves by translation key", () => {
    const hass = fakeHass();
    expect(plannerDevices(hass)).toEqual([DEVICE]);
    const p = resolvePlanner(hass, DEVICE);
    expect(p.thermostat).toBe("climate.pond_thermostat");
    expect(p.mode).toBe("sensor.pond_mode"); // not sensor.other of another platform
    expect(resolvePlanner(hass, undefined)).toEqual({});
  });
});

describe("view model", () => {
  it("builds every section", () => {
    const vm = buildViewModel(fakeHass(), config, Date.parse("2026-11-17T10:20:00Z"));
    expect(vm.missingDevice).toBe(false);
    expect(vm.illustration).toMatchObject({ pond: "14.6 °C", waterIn: "14.0 °C", electrical: "386 W", thermal: "2.85 kW", fan: true, flow: true, pump: "running", pumpText: "43 % · 103 W", mode: "low" });
    expect(vm.gauge).toMatchObject({ target: 14.5, band: 0.25, heating: true, position: "in_band", control: true });
    expect(vm.plan?.quarters).toHaveLength(8);
    expect(vm.plan?.quarters[2].surplus).toBe(0.4);
    expect(vm.figures).toMatchObject({ cost: "€ 2.31", expensive: "6 %", cop: "5.4", copMethod: "average", heatLoss: "295 W/K" });
    expect(vm.switches?.control).toEqual({ entity: "switch.pond_control", on: true });
    expect(vm.model?.copByOutdoor).toEqual([["<5", "4.9"], ["5-10", "5.4"], ["10-15", null]]);
  });

  it("uses the planner's links as defaults and the card config first", () => {
    const vm = buildViewModel(fakeHass(), { ...config, heat_pump: { ...config.heat_pump, water_in: "sensor.water_out" } });
    expect(vm.illustration?.waterIn).toBe("16.0 °C");
    expect(vm.illustration?.airIn).toBeNull(); // not linked, not configured: left out
  });

  it("pump colours: fault wins, off without flow", () => {
    const fault = buildViewModel(fakeHass({ "binary_sensor.pump_fault": { state: "on", attributes: {}, last_updated: "x" } }), config);
    expect(fault.illustration?.pump).toBe("fault");
    const off = buildViewModel(fakeHass({ "binary_sensor.flow": { state: "off", attributes: {}, last_updated: "x" } }), config);
    expect(off.illustration?.pump).toBe("off");
    expect(off.illustration?.flow).toBe(false);
  });

  it("reports a missing device and changes its signature only when entities change", () => {
    expect(buildViewModel(fakeHass(), { type: "x" }).missingDevice).toBe(true);
    const a = buildViewModel(fakeHass(), config).signature;
    const b = buildViewModel(fakeHass(), config).signature;
    const c = buildViewModel(fakeHass({ "number.pond_band": { state: "0.3", attributes: {}, last_updated: "later" } }), config).signature;
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it("limits the plan to the configured hours and positions the pond", () => {
    const vm = buildViewModel(fakeHass({ "climate.pond_thermostat": { state: "heat", attributes: { current_temperature: 15.0, temperature: 14.5 }, last_updated: "x" } }), { ...config, hours: 24 });
    expect(vm.gauge?.position).toBe("above_band");
  });
});

describe("chart", () => {
  it("scales, marks expensive quarters and the known-price boundary", () => {
    const vm = buildViewModel(fakeHass(), config);
    const s = scales(vm.plan!, 600, 220);
    expect(s.x(s.start)).toBeCloseTo(28);
    expect(s.x(s.end)).toBeCloseTo(572);
    expect(s.expensive[5]).toBe(true);
    expect(s.expensive[0]).toBe(false);
    expect(s.knownUntil).toBe(vm.plan!.quarters[6].t);
    expect(s.yTemp(s.tempMax)).toBeCloseTo(28);
  });

  it("summarises runs for screen readers", () => {
    const vm = buildViewModel(fakeHass(), config);
    expect(runs(vm.plan!.quarters).map((r) => r.mode)).toEqual(["low", "off"]);
    expect(summary(vm.plan!, localizer("en"), "en")).toMatch(/^Plan: low .*, off .*\.$/);
  });
});

describe("hours and legend", () => {
  it("keeps 24, 36 or 48 hours of the plan", () => {
    const long = fakeHass({ "sensor.pond_mode": { state: "low", attributes: { plan: planAttr(200) }, last_updated: "x" } });
    expect(buildViewModel(long, { ...config, hours: 48 }).plan?.quarters).toHaveLength(192);
    expect(buildViewModel(long, { ...config, hours: 24 }).plan?.quarters).toHaveLength(96);
    expect(buildViewModel(long, config).plan?.quarters).toHaveLength(144);
  });

  it("lists optional legend items only when present", () => {
    const vm = buildViewModel(fakeHass(), config);
    const keys = legendItems(vm.plan!).map((i) => i.key);
    expect(keys).toEqual(["legend_pond", "target", "band", "low", "high", "price", "legend_expensive", "legend_solar", "now", "legend_forecast"]);
    const flat = planAttr(8).map((q) => ({ ...q, price: 0.3, known: true, surplus: undefined }));
    const plain = buildViewModel(fakeHass({ "sensor.pond_mode": { state: "low", attributes: { plan: flat }, last_updated: "x" } }), config);
    const plainKeys = legendItems(plain.plan!).map((i) => i.key);
    expect(plainKeys).not.toContain("legend_solar");
    expect(plainKeys).not.toContain("legend_forecast");
    expect(plainKeys).not.toContain("legend_expensive");
  });
});

describe("layout", () => {
  it("picks the layout at the thresholds", () => {
    expect(layoutFor(320)).toBe("narrow");
    expect(layoutFor(559)).toBe("narrow");
    expect(layoutFor(560)).toBe("medium");
    expect(layoutFor(899)).toBe("medium");
    expect(layoutFor(900)).toBe("wide");
    expect([columnsOf("narrow"), columnsOf("medium"), columnsOf("wide")]).toEqual([1, 2, 3]);
  });

  it("spans blocks so that every row is full", () => {
    expect(spanFor("medium", "plan")).toBe(2);
    expect(spanFor("wide", "plan")).toBe(3);
    expect(spanFor("wide", "model")).toBe(3);
    for (const b of ["heat_pump", "thermostat", "side"] as const) expect(spanFor("wide", b)).toBe(1);
    for (const b of ["heat_pump", "thermostat", "plan", "side", "model"] as const) expect(spanFor("narrow", b)).toBe(1);
    expect([chartWidth("narrow"), chartWidth("medium"), chartWidth("wide")]).toEqual([600, 900, 1200]);
  });
});

describe("gauge geometry", () => {
  it("maps the target window onto the ring", () => {
    const r = ring(14.5);
    expect(angleOf(r, 11.5)).toBe(START);
    expect(angleOf(r, 17.5)).toBe(START + SWEEP);
    expect(angleOf(r, 30)).toBe(START + SWEEP); // clamped
    const [x, y] = [r.cx, r.cy - r.r]; // top of the ring = middle of the window
    expect(tempAt(r, x, y, 0.1, 5, 28)).toBeCloseTo(14.5);
  });

  it("rounds to the step and clamps to the limits", () => {
    expect(clampStep(14.53, 0.1, 5, 28)).toBe(14.5);
    expect(clampStep(29, 0.1, 5, 28)).toBe(28);
    expect(clampStep(0.27, 0.05, 0.1, 1)).toBe(0.25);
  });
});

describe("localizer", () => {
  it("speaks Dutch and falls back to English", () => {
    expect(localizer("nl")("pond")).toBe("vijver");
    expect(localizer("nl-BE")("running")).toBe("in bedrijf");
    expect(localizer("de")("pond")).toBe("pond");
    expect(localizer("en")("plan_summary", { parts: "x" })).toBe("Plan: x.");
    expect(localizer("en")("unknown_key")).toBe("unknown_key");
  });
});

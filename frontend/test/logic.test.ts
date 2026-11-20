import { describe, expect, it } from "vitest";
import { QUARTER, chartWindow, hoverInfo, measuredPath, pastQuarters, predictedPath, pricePath, quarterAt, scales, runs, summary, timeTicks } from "../src/chart";
import { legendItems, tooltipLines } from "../src/plan-chart";
import { chartWidth, columnsOf, layoutFor, spanFor } from "../src/layout";
import { plan as planAttr } from "./fixtures";
import { plannerDevices, resolvePlanner } from "../src/entities";
import { angleOf, clampStep, ring, sparkline, tempAt, START, SWEEP } from "../src/gauge-math";
import { cardLanguage, localizer } from "../src/localize";
import { editorSchema } from "../src/editor";
import { buildViewModel } from "../src/viewmodel";
import { DEVICE, fakeHass } from "./fixtures";
import { clockText, fixed, numberText, power, temperature, time, withUnit } from "../src/format";

const config = { type: "custom:pond-heatpump-planner-card", device_id: DEVICE, heat_pump: { pump_speed: "sensor.pump_speed", pump_power: "sensor.pump_power", fan: "binary_sensor.fan", flow: "binary_sensor.flow", pump_fault: "binary_sensor.pump_fault" } };

const NOW = Date.parse("2026-11-17T10:05:00Z"); // inside the fixture plan

describe("number formatting", () => {
  it("formats fixed decimal text in the card language", () => {
    expect(numberText(0.33, 2, "en")).toBe("0.33");
    expect(numberText(0.33, 2, "nl")).toBe("0,33");
    expect(fixed(12.3, 2, "nl")).toBe("12,30");
  });

  it("uses commas in Dutch display helpers", () => {
    expect(temperature(14.6, "nl")).toBe("14,6 °C");
    expect(power(2850, "nl")).toBe("2,85 kW");
    expect(withUnit(0.33, "kWh", 2, "nl")).toBe("0,33 kWh");
  });
});

describe("time ticks and sparkline", () => {
  it("ticks at local 0, 6, 12 and 18 h, marking midnights", () => {
    const start = new Date(2026, 10, 17, 11, 15).getTime();
    const ticks = timeTicks(start, start + 48 * 3600e3);
    expect(ticks.length).toBe(8);
    for (const k of ticks) {
      expect(new Date(k.t).getHours() % 6).toBe(0);
      expect(k.midnight).toBe(new Date(k.t).getHours() === 0);
    }
    expect(ticks.filter((k) => k.midnight).length).toBe(2);
    expect(new Date(ticks[0].t).getHours()).toBe(12);
  });

  it("scales the sparkline to the history and the band", () => {
    const box = { x: 0, y: 0, w: 100, h: 40 };
    const h = [ { t: 0, temp: 14 }, { t: 1, temp: 15 } ];
    const s = sparkline(h, 14.5, 0.25, box)!;
    expect(s.lo).toBe(14);
    expect(s.hi).toBe(15);
    expect(s.line).toBe("M0.0 40.0 L100.0 0.0");
    expect(s.target).toBeCloseTo(20);
    expect(s.bandTop).toBeCloseTo(10);
    expect(sparkline([{ t: 0, temp: 14 }], 14.5, 0.25, box)).toBeNull();
    // a flat history still gets at least 0.5 K
    const flat = sparkline([ { t: 0, temp: 14.5 }, { t: 1, temp: 14.5 } ], 14.5, 0.1, box)!;
    expect(flat.hi - flat.lo).toBeCloseTo(0.5);
  });

  it("reads the pond history from the mode sensor", () => {
    const vm = buildViewModel(fakeHass(), config, NOW);
    expect(vm.gauge!.history.length).toBe(96);
    expect(vm.gauge!.history[0].t).toBeLessThan(vm.gauge!.history[95].t);
    expect(vm.gauge!.history[95]).toMatchObject({ mode: "high", price: 0.25 });
    expect(vm.gauge!.history[0]).toMatchObject({ mode: null, price: null });
  });
});

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

  it("formats the cost with the planner's Dutch language", () => {
    const hass = fakeHass();
    hass.states["sensor.pond_mode"].attributes.language = "nl";
    expect(buildViewModel(hass, config).figures?.cost).toBe("€ 2,31");
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
  it("formats 24-hour clock text and time strings", () => {
    const afternoon = new Date(2026, 10, 17, 14, 0).getTime();
    const midnight = new Date(2026, 10, 17, 0, 15).getTime();
    expect(clockText(afternoon, "en")).toBe("14:00");
    expect(clockText(midnight, "en")).toBe("00:15");
    expect(clockText(afternoon, "nl")).toBe("14:00");
    expect(clockText(midnight, "nl")).toBe("00:15");
    expect(time(new Date(afternoon).toISOString(), "en")).toBe("14:00");
    expect(time(new Date(midnight).toISOString(), "nl")).toBe("00:15");
  });

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
    expect(summary(vm.plan!, localizer("en"), "en")).toMatch(/^Plan: low \d{2}:\d{2}–\d{2}:\d{2}, off .*\.$/);
  });
});

describe("chart window, measured line and hover", () => {
  const H = 3600e3;
  const t0 = Date.parse("2026-11-18T09:07:00Z");

  it("ends at the plan end and spans the hours back from there", () => {
    const planEnd = Date.parse("2026-11-18T23:00:00Z");
    const w = chartWindow(t0, planEnd, 36);
    expect(w.end).toBe(planEnd);
    expect(w.end - w.start).toBe(36 * H);
    // a plan longer than the span: now … now + hours
    const long = chartWindow(t0, t0 + 35 * H, 12);
    expect(long.start).toBe(Date.parse("2026-11-18T09:00:00Z"));
    expect(long.end - long.start).toBe(12 * H);
  });

  function model(hours = 36) {
    const start = Date.parse("2026-11-18T09:00:00Z");
    const quarters = Array.from({ length: 8 }, (_, i) => ({
      t: start + i * QUARTER, mode: (i < 4 ? "low" : "off") as "low" | "off", temp: 14.5 + i * 0.01,
      price: 0.3, known: i < 6, surplus: null,
    }));
    const history = [
      ...Array.from({ length: 8 }, (_, i) => ({ t: start - 4 * H + i * QUARTER, temp: 14.0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ t: start - H + (i + 1) * QUARTER, temp: 14.2 })), // after a 1 h gap
    ];
    return { quarters, target: 14.5, band: 0.25, now: t0, hours, history, pond: 14.3 };
  }

  it("draws the measured line up to now with gaps, and the prediction from now", () => {
    const plan = model();
    const s = scales(plan, 600, 220);
    expect(s.end).toBe(plan.quarters[7].t + QUARTER);
    expect(s.measured[s.measured.length - 1]).toEqual({ t: t0, temp: 14.3 });
    expect(measuredPath(s).match(/M/g)).toHaveLength(2); // the gap starts a new segment
    const predicted = predictedPath(plan, s);
    expect(predicted.startsWith(`M${s.x(t0).toFixed(1)} ${s.yTemp(14.3).toFixed(1)}`)).toBe(true);
    expect(s.tempMin).toBeLessThanOrEqual(14.0); // the scale includes the measured values
  });

  it("maps the pointer to a quarter and describes it", () => {
    const plan = model();
    const s = scales(plan, 600, 220);
    expect(quarterAt(s, s.x(plan.quarters[2].t) + 1)).toBe(plan.quarters[2].t);
    expect(quarterAt(s, -50)).toBe(s.start);
    expect(quarterAt(s, 9999)).toBe(s.end - QUARTER);
    const planned = hoverInfo(plan, s, plan.quarters[6].t);
    expect(planned).toMatchObject({ mode: "off", temp: 14.56, measured: false, known: false, price: 0.3 });
    const past = hoverInfo(plan, s, Date.parse("2026-11-18T08:30:00Z"));
    expect(past).toMatchObject({ temp: 14.2, measured: true, mode: null, price: null });
    const empty = hoverInfo(plan, s, s.start);
    expect(empty).toMatchObject({ temp: null, mode: null, price: null });
    const lines = tooltipLines(planned, localizer("en"), "en");
    expect(lines[1]).toBe("14.56 °C predicted");
    expect(lines).toContain("mode: off");
    expect(lines).toContain("€ 0.300/kWh (forecast)");
    expect(tooltipLines(planned, localizer("nl"), "nl")).toContain("€ 0,300/kWh (verwacht)");
    expect(tooltipLines({ ...planned, known: true }, localizer("nl"), "nl")).toContain("€ 0,300/kWh");
    expect(tooltipLines(past, localizer("nl"), "nl")[1]).toBe("14,20 °C gemeten");
    expect(tooltipLines(empty, localizer("en"), "en")).toHaveLength(1);
  });

  it("shows the measured modes and prices before the plan", () => {
    const plan = model();
    const start = plan.quarters[0].t;
    // the last 4 quarters before the plan: low, high, off and one without power; prices 0.2, 0.2, 0.2 and 0.5
    plan.history = plan.history.map((p, i) =>
      i < 8 ? p : { ...p, mode: (["low", "high", "off", null] as const)[i - 8], price: i === 11 ? 0.5 : 0.2 },
    );
    const s = scales(plan, 600, 220);
    expect(pastQuarters(plan, s.start).map((p) => p.t)).toEqual([0, 1, 2, 3].map((i) => start - H + i * QUARTER));
    expect(s.past.map((p) => p.mode)).toEqual(["low", "high", "off", null]);
    expect(s.priceMin).toBe(0.2); // the scale includes the past prices
    expect(s.priceMax).toBe(0.5);
    expect(s.pastExpensive).toEqual([false, false, false, true]);
    expect(s.expensive.every((e) => !e)).toBe(true); // the plan marking does not change
    const path = pricePath(plan, s);
    expect(path.startsWith(`M${s.x(start - H).toFixed(1)}`)).toBe(true);
    expect(path.match(/M/g)).toHaveLength(1); // one line from the past into the plan
    const past = hoverInfo(plan, s, start - QUARTER);
    expect(past).toMatchObject({ temp: 14.2, measured: true, mode: null, price: 0.5, expensive: true });
    expect(hoverInfo(plan, s, start - 3 * QUARTER)).toMatchObject({ mode: "high", price: 0.2, expensive: false });
    const lines = tooltipLines(past, localizer("en"), "en");
    expect(lines).toContain("€ 0.500/kWh");
    expect(lines).toContain("expensive quarter");
  });

  it("uses 24-hour times in tooltip lines", () => {
    const t = new Date(2026, 10, 18, 14, 0).getTime();
    const info = { t, temp: null, measured: false, mode: null, price: null, known: true, expensive: false, surplus: null };
    expect(tooltipLines(info, localizer("en"), "en")[0]).toMatch(/14:00–14:15$/);
    expect(tooltipLines(info, localizer("nl"), "nl")[0]).toMatch(/14:00–14:15$/);
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
    const vm = buildViewModel(fakeHass(), config, NOW);
    const keys = legendItems(vm.plan!).map((i) => i.key);
    expect(keys).toEqual(["legend_measured", "legend_pond", "target", "band", "low", "high", "price", "legend_expensive", "legend_solar", "now", "legend_forecast"]);
    const flat = planAttr(8).map((q) => ({ ...q, price: 0.3, known: true, surplus: undefined }));
    const plain = buildViewModel(fakeHass({ "sensor.pond_mode": { state: "low", attributes: { plan: flat }, last_updated: "x" } }), config);
    const plainKeys = legendItems(plain.plan!).map((i) => i.key);
    expect(plainKeys).not.toContain("legend_measured"); // no history
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

  it("takes the card option, then the integration's language, then the profile language", () => {
    const base = { type: "custom:pond-heatpump-planner-card" };
    expect(cardLanguage({ ...base, language: "nl" }, "en", "en")).toBe("nl");
    expect(cardLanguage({ ...base, language: "auto" }, "nl", "en")).toBe("nl");
    expect(cardLanguage(base, "auto", "en-GB")).toBe("en-GB");
    expect(cardLanguage(base, undefined, undefined)).toBe("en");
  });

  it("follows the language option of the integration in the view model", () => {
    const hass = fakeHass();
    hass.states["sensor.pond_mode"].attributes.language = "nl";
    expect(buildViewModel(hass, config).language).toBe("nl");
    expect(buildViewModel(hass, { ...config, language: "en" }).language).toBe("en");
  });

  it("offers the language in the editor, labelled in the editor's language", () => {
    const field = editorSchema(localizer("nl")).find((f) => f.name === "language") as any;
    expect(field.selector.select.options.map((o: any) => o.value)).toEqual(["auto", "en", "nl"]);
    expect(field.selector.select.options[0].label).toBe("Volg de integratie");
  });
});

# Plan chart: fixed span, measured temperature, hairline with tooltip

- Issue: #22
- Status: **approved** (2026-11-18)
- Date: 2026-11-18

## 1. Purpose

The plan chart is now as long as the plan, and the plan is only as long as the known prices. Before the
day-ahead prices are published (about 13:00) that is less than 15 hours. This makes the chart change scale
during the day. The chart also shows only the prediction, so you cannot see how well it matched, and you
cannot read exact values.

This design gives the chart:
1. a fixed time span;
2. the measured pond temperature up to now;
3. a hairline with a tooltip.

## 2. Time window

The right side is where the prices end; the left side is that moment minus the span.

| Card option | Default | Range | Meaning |
|---|---|---|---|
| `hours` | 36 | 6–48 | width of the chart in hours (existing option, new meaning) |

- **End** = the end of the plan, which is the end of the last known price. With a price forecast sensor the
  plan, and so the chart, goes on to the end of the forecast prices; those quarters are already marked
  (#14). If the `horizon` option is shorter than the known prices, the plan and the chart end there.
- **Start** = end − `hours`.
- Everything between the start and now is history: the measured pond temperature. Everything from now to the
  end is the plan.
- **Plan longer than the span** (e.g. `hours: 12` and prices for 35 h): the window would start after now.
  Then it becomes now … now + `hours`, so now stays visible and the plan is cut off on the right.
- Examples with `hours: 36`:

| Time | Prices known until | Window | Measured | Plan |
|---|---|---|---|---|
| 09:00 | today 24:00 | yesterday 12:00 – today 24:00 | 21 h | 15 h |
| 14:00 (after the day-ahead prices) | tomorrow 24:00 | today 12:00 – tomorrow 24:00 | 2 h | 34 h |

- So the history is longest just before the day-ahead prices arrive, and shortest just after.
- The temperature scale covers the band, the plan and the measured values inside the window. The price scale
  covers the plan's prices only.
- "Now" stays a red vertical line. The axis, the grid lines and the date labels (#21) cover the whole
  window.

```mermaid
flowchart LR
  S["end − hours"] -->|measured, solid| N((now))
  N -->|predicted, dashed| E["end of the last known price"]
```

### 2.1 Longer history from the integration

`pond_history` now covers 24 h. With `hours: 48` the measured part can be up to about 37 h long (48 h minus
the shortest plan, about 11 h at 13:00). The attribute therefore covers **48 h** (192 quarters, about
10 kB). It is not stored in the recorder, so this costs no database space. The small chart in the thermostat
keeps showing only the last 24 h.

## 3. Measured and predicted temperature

| Part | Source | Line |
|---|---|---|
| Measured, from `start` to now | `pond_history` (mode sensor, #21), quarter values; the current pond temperature as the last point | solid, `--phpc-pond-color` |
| Predicted, from now | `plan[].temp` | dashed, same colour; starts at the current measured value so the two lines join |

- Legend: "pond temperature (measured)" (solid) and "pond temperature (predicted)" (dashed).
- If the history is shorter than the measured part (just after installing), the measured line starts later.
- Gaps of more than 30 minutes in the history break the measured line instead of drawing a straight
  segment across them.

## 4. Hairline and tooltip

- **Pointer.** `pointermove` over the chart gives the time under the pointer. That time is rounded to its
  quarter and clamped to the window. `pointerleave` hides the hairline. On touch screens, a tap or a drag
  shows it, and a tap outside the chart hides it. `touch-action: pan-y` keeps vertical scrolling of the
  page working.
- **Keyboard.** The chart gets `tabindex="0"`. ← and → move one quarter, Home and End jump to the first and
  last quarter, and Escape hides the hairline. The tooltip text is also the `aria-live` text.
- **Drawing.** The hairline, a dot on the temperature line and the tooltip all come from the same quarter.
  The tooltip is an HTML element over the SVG (positioned in % of the width). It sits to the right of the
  hairline, or to the left on the right half, so it stays inside the card.
- **Contents:**

| Line | Example | When |
|---|---|---|
| day and time | Thu 19 Nov 14:15 | always (local time, card language) |
| pond temperature | 14.62 °C measured / 14.58 °C predicted | when known |
| mode | low | plan quarters |
| price | € 0.244 /kWh (forecast) | plan quarters |
| expensive quarter | expensive quarter | when it is one |
| solar surplus | solar 0.4 kW | when > 0 |

Quarters without information (after the plan, or before the history) show only the time.

## 5. Structure

The chart stays a pure view: geometry in `chart.ts` (no DOM), state in a small element.

```mermaid
classDiagram
  class ChartWindow {
    +start: number
    +end: number
    +now: number
  }
  class chart_ts {
    +chartWindow(now, planEnd, hours) ChartWindow
    +scales(plan, history, window, width, height) ChartScales
    +quarterAt(scales, x) number
    +hoverInfo(plan, history, t) HoverInfo
  }
  class HoverInfo {
    +t: number
    +temp: number|null
    +measured: boolean
    +mode: Mode|null
    +price: number|null
    +known: boolean
    +expensive: boolean
    +surplus: number|null
  }
  class PhpcPlanChart {
    +model: PlanModel
    -hover: number|null
    +render()
  }
  PhpcPlanChart ..> chart_ts : uses
  chart_ts ..> ChartWindow
  chart_ts ..> HoverInfo
```

- **`PhpcPlanChart`** is a new Lit element (`phpc-plan-chart`), like `phpc-gauge`. It holds only the hover
  state, so a pointer move redraws the chart and not the whole card.
- **`PlanModel`** gets `history` (from the gauge model) and `window`.
- **`card.ts`** renders `<phpc-plan-chart>` instead of calling `planChart()`.
- **Editor:** no new field; the description of `hours` changes to "width of the plan chart".
- **Integration:** `POND_HISTORY_HOURS` 24 → 48.

## 6. Tests

- `chartWindow`: the end is the plan end and the start is the end − `hours`; a plan longer than `hours`
  gives now … now + `hours`; the span is always `hours`.
- `hoverInfo`: a past quarter gives the measured value and no mode; a plan quarter gives the predicted
  temperature, mode, price and forecast flag; a quarter after the plan gives only the time.
- `quarterAt`: the pointer x maps to the right quarter and is clamped to the window.
- Card: there is a solid measured path and a dashed predicted path; a `pointermove` shows the hairline and
  the tooltip with the expected text; `pointerleave` hides them; the arrow keys move the hairline.
- Docs: `card.md` (options, hover), screenshots (one with the tooltip visible), architecture UML, changelog.

## 7. Open questions

None.

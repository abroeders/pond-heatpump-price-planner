# Card: 48 hours, chart legend, band in °C

- Issue: #14
- Status: **approved** (2026-11-18, requested by the user as specified)
- Date: 2026-11-18

## 1. Changes

| Change | Where | How |
|---|---|---|
| 48 h in the plan chart | card option `hours`: 24, 36 or 48 (default 36); editor dropdown | the chart shows at most `hours × 4` quarters of the plan; the integration's horizon option (6–48 h) limits what exists |
| Legend below the plan chart | `plan-chart.ts` | one item per element, each with its own swatch (line, dashed line, area, bar, step line, background, marker); optional items (solar, forecast start) only when the plan contains them; wraps on narrow cards |
| Band in °C | integration: band number unit °C (was K); card: "± 0.25 °C" in the gauge and the slider; docs | a band is a temperature difference, but °C reads more naturally for users; the value does not change |

## 2. Legend items

| Item | Swatch | Shown |
|---|---|---|
| Pond temperature (predicted) | solid dark-blue line | always |
| Target | dashed line | always |
| Band | green area | always |
| Low / High | blue / orange bar | always |
| Price | thin grey step line | always |
| Expensive quarters | light orange background | when the plan has any |
| Solar surplus | yellow strip | when the plan has surplus |
| Now | red line | always |
| Forecast prices from | dotted line | when the plan contains forecast prices |

The legend is HTML below the SVG (not inside it), so it wraps and stays readable at phone width, and screen
readers read it as a list.

## 3. Tests

- View model: `hours: 48` keeps 192 quarters, 24 keeps 96.
- Legend: the optional items appear only when present.
- Gauge: the band text ends in °C.
- Home Assistant test: the band number reports °C.

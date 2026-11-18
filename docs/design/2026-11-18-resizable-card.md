# Card: resizable to several columns

- Issue: #16
- Status: **approved** (2026-11-18, requested by the user as specified)
- Date: 2026-11-18

## 1. Sizing in the dashboard

`getGridOptions()` returns `{ columns: "full", min_columns: 6, rows: "auto" }`:
- in a sections dashboard the card starts at the full width of its section;
- it can be made as narrow as half a section;
- its height follows the content.

A section itself can be made 2, 3 or 4 dashboard columns wide (*Edit section → column span*), so the card
can span that width too. In a masonry dashboard the card takes the width of its column.

## 2. Layout by card width

The card measures its own width (ResizeObserver) and picks a layout. This works in every dashboard type and
in the editor preview.

| Layout | Card width | Grid | Placement |
|---|---|---|---|
| `narrow` | < 560 px | 1 column | everything stacked in the configured order |
| `medium` | 560–899 px | 2 columns | heat pump · thermostat / plan (2) / figures and switches · model |
| `wide` | ≥ 900 px | 3 columns | heat pump · thermostat · figures and switches / plan (3) / model (3) |

- Figures and switches form one block ("side"), so a hidden section never leaves an empty cell.
- The grid uses `grid-auto-flow: row`, and the spans come from the layout. Sections keep their configured
  order; a section that does not fit next to the previous one moves to the next row.
- The drawings are SVGs with a viewBox and scale with their cell. Text keeps its size in the plan legend and
  the figures; the SVG text scales with the drawing and stays readable from a cell width of about 280 px.

## 3. Interface

```ts
export type Layout = "narrow" | "medium" | "wide";
export function layoutFor(width: number): Layout;
export function spanFor(layout: Layout, block: "heat_pump" | "thermostat" | "plan" | "side" | "model"): number;
```

## 4. Tests

- `getGridOptions` values.
- `layoutFor` at the thresholds.
- `spanFor` for every block and layout.
- Rendering: the card carries the layout class; figures and switches are rendered in one block.

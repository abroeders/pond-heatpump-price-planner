# Card: running state of the drawing without linked fan, compressor and flow

- Issue: #36
- Status: **approved** (2026-11-21)
- Date: 2026-11-21

## 1. Purpose

The drawing takes the fan, compressor and water flow from the card's `heat_pump` entities. A card with only
`device_id` has none of them, so the drawing always shows a stopped heat pump, even while it runs. The
planner already knows whether the heat pump runs: the measured mode of the mode sensor, derived from the mean
power with the *low* and *high* thresholds of the integration.

## 2. Behaviour

| Element | Entity configured | Not configured |
|---|---|---|
| Fan, air arrows | `heat_pump.fan` | runs while `measured_mode` is `low` or `high` |
| Compressor, refrigerant | `heat_pump.compressor` | runs while `measured_mode` is `low` or `high` |
| Water flow, pump "running" | `heat_pump.flow` | the circulation sensor linked in the integration (`links.circulation`); without it, while `measured_mode` is `low` or `high` |

- A configured entity always wins, also when it is unavailable (then it reads as off, as now).
- `measured_mode` missing or `off`: the derived elements are off.
- The pump fault and the pump speed and power stay entity-only.

## 3. Structure

- `heatPumpEntities()` adds `flow` from `links.circulation` as a default, like the other linked entities.
- `buildViewModel()` reads `measured_mode` from the mode sensor and uses it as the fallback for `fan`,
  `compressor` and `flow` when `hp` has no entity for them.
- No new classes; the illustration and its model stay as they are.

## 4. Tests

- A card without `heat_pump` entities and `measured_mode: low`: fan, compressor and flow on, pump running.
- `measured_mode: off` or missing: all off.
- A configured `fan` that is off wins over `measured_mode: low`.
- `links.circulation` is used for `flow` and wins over `measured_mode`.
- Docs: `card.md` (illustration table, options), architecture, changelog.

## 5. Open questions

None.

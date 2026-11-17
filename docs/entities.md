# Entities

All entities belong to one device per planner. Entity IDs are derived from the device name, e.g.
`sensor.pond_mode` for a planner named "Pond". The keys below are the stable part of the unique ID.

## Thermostat

| Key | Type | Meaning |
|---|---|---|
| `thermostat` | climate | the pond as a thermostat: current temperature = pond temperature, target temperature (5–28 °C, step 0.1), HVAC action *heating* when the applied mode is low or high and *idle* when off. Only the HVAC mode *heat* exists; whether the planner controls the heat pump is the `control` switch. Attributes: `mode`, `reason`, `band`, `control`. |

Set the target with the thermostat card, the more-info dialog, `climate.set_temperature` or a voice assistant.
Until version 0.1.0 the target was a number entity; it is removed automatically.

## Settings

| Key | Type | Unit / options | Meaning |
|---|---|---|---|
| `band` | number | K, 0.1–1.0, step 0.05 | the pond may move this far above and below the target |
| `pond_volume` | number | m³, 1–500, step 0.25 | water volume; needed for the pond COP, heat loss and thermal power |
| `flow` | number | m³/h, 0.5–20, step 0.25 | flow through the heat pump; needed for the flow COP |
| `control` | switch | on/off | off: plan and show only (dry run); on: control the heat pump |
| `insulation_cover` | switch | on/off | tells the model the cover is on; optional, the model also learns it within a week |
| `cop_method` | select | `flow`, `pond`, `average` | what the COP sensor shows |
| `relearn` | button | – | learn the model and tune the surcharge now instead of at 03:30 |

The settings are stored by the integration and survive a restart.

## Plan

| Key | Unit | Meaning | Attributes |
|---|---|---|---|
| `mode` | `off`, `low`, `high` | the mode applied (or, in dry run, that would be applied) now | `reason`, `plan_mode`, `measured_mode`, `control`, `would_set`, `apply_result`, `mismatch`, `price_status`, `horizon_end`, `plan` |
| `next_start` | timestamp | next quarter in which the plan switches the heat pump on | – |
| `next_stop` | timestamp | next quarter in which the plan switches it off | – |
| `planned_energy` | kWh | planned electricity for the next 24 h | – |
| `planned_cost` | € | planned cost for the next 24 h (real prices) | `expensive_share`, `starts` |
| `predicted_temperature` | °C | predicted pond temperature in 4 h | – |

**`reason`** of `mode`:

| Reason | Meaning |
|---|---|
| `plan` | the plan's mode |
| `below_band` | the pond is below the band: at least low |
| `far_below_band` | more than 0.3 K below the band: high (or low if high is not allowed) |
| `above_band` | above the band: off |
| `no_pond_temperature` | no pond temperature for 30 min: low |
| `no_plan` | no plan could be made: simple thermostat |

**`apply_result`**: `sent`, `unchanged`, `dry_run`, `heat_pump_off` (the heat pump itself is switched off),
`unavailable`, `error`.

**`plan`**: one entry per quarter with `start`, `mode`, `temp` (predicted pond temperature at the end of the
quarter) and `price` (effective €/kWh). It is not stored in the recorder.

**`price_status`**:

| Value | Meaning |
|---|---|
| `ok` | known prices |
| `forecast_only` | only forecast prices |
| `limited_prices` | fewer than 4 h of prices, extended with their mean |
| `no_prices` | no prices |

## COP and pond

See [COP, heat loss and thermal power](cop.md) for the formulas.

| Key | Unit | Meaning | Attributes |
|---|---|---|---|
| `cop` | – | COP by the chosen method over the COP window | `by_outdoor`, `by_power`, `hours`, `hours_by_outdoor`, `hours_by_power`, `window_days`, `method` |
| `cop_flow` | – | COP by the flow method | as above, `flow` |
| `cop_pond` | – | COP by the pond method | as above, `loss_a_w`, `loss_b_w_per_k` |
| `heat_loss` | W/K | heat lost per kelvin pond–outdoor difference (model) | `loss_a_w`, `loss_b_w_per_k`, `cover` |
| `thermal_power` | W | heat delivered to the pond now (model) | `flow_mean_w`, `mode` |

A COP is unknown until there are at least 24 counted hours in the window, and a breakdown group shows no
value below 24 hours. The pond values need `pond_volume`; the flow COP needs `flow` and the water outlet
link.

## Diagnostics

| Key | Unit | Meaning | Attributes |
|---|---|---|---|
| `cooling_coefficient` | 1/h | cooling of the pond to the outdoor air, for the current cover state | `k_open`, `k_cover` |
| `heating_rate_low` | K/h | how fast low power warms the pond | `gain`, `power_kw` |
| `heating_rate_high` | K/h | the same for high power | `gain`, `power_kw` |
| `prediction_error` | K | mean absolute error of the 4-hour prediction over the last 24 h | `checked` |
| `model_status` | timestamp | when the model was last learned | `reports`, `model_check`, `samples` |
| `surcharge` | €/kWh | the surcharge on expensive quarters in use | `auto`, `costs` per candidate, `days`, `reason`, `at` |

*Download diagnostics* on the device page gives the links, options, settings, model, last reports and a
summary of the plan.

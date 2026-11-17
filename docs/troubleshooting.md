# Troubleshooting

Symptoms, likely causes and what to do. When asking for help, attach the diagnostics file (*device page →
Download diagnostics*).

## Price sensor not recognised

**Symptom.** Adding the integration says "This sensor has no price list in a recognised format."

**Cause.** The sensor has no price list in a format the integration knows. See
[Price sensor formats](configuration.md#price-sensor-formats).

**Fix.**
- Look at the sensor in *Developer tools → States*: the list must be in the attributes, not only the state.
- Many integrations publish an extra sensor with the list; try that one.
- Otherwise leave the price empty: the planner then only minimises energy.

## The mode sensor says `no_plan` or is unavailable

**Cause.** No pond temperature, or the planning failed.

**Fix.** Check that the pond sensor has a numeric state. Look in *Settings → System → Logs* for messages from
`pond_heatpump_price_planner`.

## `price_status` is `limited_prices` or `no_prices`

**Cause.** The price sensor has fewer than 4 hours of prices left, or none. This happens shortly before
midnight with day-ahead prices when tomorrow's prices are late.

**Fix.** Usually nothing: it recovers when the prices arrive. A price forecast sensor extends the horizon.

## The heat pump does not follow the planner

**Symptom.** Repair issue "Heat pump does not follow the planner", or `mismatch` on the mode sensor.

**Causes and fixes.**
- **Another automation** changes the heat pump's setpoint: disable it.
- **The heat pump is switched off** (HVAC mode off): the planner does not switch it on.
- **The offsets do not suit this heat pump:** see
  [Finding the setpoint offsets](configuration.md#finding-the-setpoint-offsets-for-another-heat-pump).
- **The power thresholds are wrong.** Set `low_w` and `high_w` so they separate off, low and high for your
  heat pump.

## The model is not learned

**Symptom.** *Model learned* stays unknown, or `reports` say "not enough hours".

**Cause.** The slow fit needs at least 300 hours in its 28-day window, with at least 20 hours in a mode to
learn that mode. The cooling fit needs 24 night hours with a clear difference between pond and outdoor
temperature.

**Fix.**
- Wait. Until then the defaults are used.
- *Learn now* runs the fits at once.

## The prediction error is high

**Symptom.** *Prediction error* is well above 0.2 K for days.

**Causes.**
- Sun on the pond (spring, summer).
- Topping up with tap water, heavy rain.
- A changed installation.
- A pond sensor in a place that does not represent the pond.

**Fix.**
- The rolling plan corrects errors every quarter. A larger `margin` keeps the pond safely inside the band.
- After a lasting change, *Learn now*.

## The COP looks wrong

- **Flow COP too high or too low:** it scales with the `flow` setting; check the flow.
- **Pond COP unavailable:** set `pond_volume`, and wait for enough off-hours to fit the loss.
- **No values in a breakdown group:** fewer than 24 hours in that group.
- **`model_check` warns:** the model's efficiency ratio differs from both COP methods. Run *Learn now*. If it
  stays, check `low_w` and `high_w`.

## Migration error after updating from a development version

**Cause.** Entries created by version 0.0.x (only a name, no links) cannot be migrated.

**Fix.** Delete the entry and add the integration again.

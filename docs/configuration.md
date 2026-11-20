# Configuration reference

Every link (chosen when adding the integration, changed with *Reconfigure*) and every option (*Configure*),
with its default and what happens when you leave it out or change it. Settings that you change daily are
entities; see [Entities](entities.md).

## Links

| Key | Name in the UI | Required | Effect when left out |
|---|---|---|---|
| `pond_temperature` | Pond temperature | yes | – |
| `heat_pump` | Heat pump | yes | – (one planner per heat pump) |
| `power` | Heat pump power | yes | – |
| `inlet_temperature` | Water inlet temperature | no | setpoints are based on the rounded pond temperature |
| `outdoor_temperature` | Outdoor temperature | yes | – |
| `price` | Price sensor | no | no prices: the plan minimises energy (`price_status`: `no_prices`) |
| `price_forecast` | Price forecast sensor | no | the horizon ends at the last known price |
| `weather` | Weather | no | the current outdoor temperature is used for the whole horizon |
| `surplus` | Solar surplus sensor | no | no solar: every quarter at the purchase price |
| `surplus_type` | Type of this sensor | with `surplus` | see below |
| `solar_forecast` | Solar forecast sensor | no | the surplus only counts for the current quarter |
| `outlet_temperature` | Water outlet temperature | no | no flow COP |
| `energy` | Heat pump energy | no | electricity for the COP from the power sensor |
| `air_inlet_temperature` | Air inlet temperature | no | the outdoor sensor is used for the COP per outdoor temperature |

### Price sensor formats

A price sensor is accepted when its attributes contain one of these lists:

| Attribute | Entry keys | Typical source |
|---|---|---|
| `raw_today`, `raw_tomorrow` | `start`, `end`, `value` | EPEX Spot, Nord Pool |
| `today`, `tomorrow` | `time` or `startsAt`, `total` / `price` / `energy` | Tibber-style sensors |
| `today_raw`, `tomorrow_raw` | `time`, `price` | Tibber Grid Reward style |
| `prices`, `data`, `forecast` | `start` / `time` / `startsAt`, `value` / `price` / `total` | other sensors, price forecasts |
| `today`, `tomorrow` as plain lists | 24 hourly or 96 quarter-hour numbers from local midnight | simple sensors |

Hourly prices are used for all four quarters of the hour.

With a fixed day/night tariff instead of a dynamic one, a template sensor can publish this list: see
[Price sensor for a day/night tariff](fixed-tariff.md).

### Solar surplus sensor types

| `surplus_type` | The sensor shows | Surplus used by the planner |
|---|---|---|
| `pv_power` | PV production (W) | PV − `base_load` |
| `grid_export` | power exported to the grid (W) | export + heat pump power now |
| `grid_net` | net grid power (W), export negative | −net + heat pump power now |

A solar forecast sensor is read from a `forecast` list with `w` (W) per entry, or from `raw_today` /
`raw_tomorrow` in kWh per hour.

## Options

| Key | Default | Range | Meaning | Effect of changing it |
|---|---|---|---|---|
| `price_multiplier` | 1 | 0–10 | effective price = price × multiplier + addition | must give your real price per kWh; wrong values make high power look cheaper or dearer than it is |
| `price_addition` | 0 | −2–2 €/kWh | see above | as above |
| `forecast_multiplier` | 1 | 0–10 | the same for the price forecast sensor | – |
| `forecast_addition` | 0 | −2–2 €/kWh | the same for the price forecast sensor | – |
| `feed_in_multiplier` | 1 | 0–10 | value of own solar power = price × multiplier + addition | 1 and 0 = net metering: solar does not change the plan |
| `feed_in_addition` | 0 | −2–2 €/kWh | see above | – |
| `base_load` | 300 W | 0–5000 W | household use that solar covers first | higher: less surplus for the heat pump |
| `start_penalty` | 0.05 € | 0–1 € | cost the planner adds per start | higher: longer runs, fewer starts, slightly higher cost |
| `margin` | 0.07 K | 0–0.2 K | the plan stays this far inside the band | higher: fewer safety interventions, a little less room to shift |
| `allow_high` | on | on/off | the planner may use high power | off: never high, except as low when the pond is far below the band |
| `surcharge_auto` | on | on/off | choose the expensive-quarter surcharge every night | off: use `surcharge` |
| `surcharge` | 0 €/kWh | 0–2 €/kWh | planning-only surcharge on the most expensive 25 % of quarters | higher: avoids expensive quarters more, at a possibly higher real cost |
| `horizon` | 36 h | 6–48 h | how far ahead the planner looks | limited by the available prices |
| `offset_off` | −2 K | −5–5 K | setpoint offset from the inlet temperature for off | must switch the compressor off |
| `offset_low` | 0 K | −5–5 K | offset for low | must give the lowest stable power |
| `offset_high` | +1 K | −5–5 K | offset for high | must give full power |
| `offset_start` | +2 K | −5–5 K | offset for low and high while the heat pump is not running (power below `low_w`) | must start a stopped heat pump; once it runs, the mode's offset is sent at once |
| `low_w` | 150 W | 0–5000 W | below this power the heat pump counts as off | used for learning and COP |
| `high_w` | 650 W | 0–10000 W | from this power the heat pump counts as high | used for learning and COP; set between your low and high power |
| `cop_window` | 14 d | 7–42 d | window of the COP sensors | shorter: follows changes faster, more noise |
| `run_threshold` | 100 W | 0–2000 W | flow COP: running above this power | – |
| `settle_minutes` | 20 min | 0–120 min | flow COP: ignore this long after each start | lower: includes unstable start-up readings |
| `language` | automatic | automatic, English, Nederlands | language of the entity names, the explanatory attributes (`reason_text` and friends) and the card | see below |

Saving the options restarts the planner. The learned model and the stored data are kept.

### Language

Home Assistant has two languages: the **profile language** of each user (menus, settings, dialogs) and the
**system language** (*Settings → System → General*), which names the entities of integrations. With
`language` on *automatic* the planner follows them: entity names in the system language, the card in your
profile language.

With *English* or *Nederlands* the planner uses that language whatever Home Assistant uses, for example a
Dutch pond planner in an English Home Assistant:
- entity names, e.g. *Stand* instead of *Mode*; entity ids do not change;
- the text attributes `reason_text`, `apply_result_text` and `price_status_text` (see [entities](entities.md));
- the card: texts, dates and numbers (`vr 21 nov`, `€ 0,33`), unless the card has its own language option.

Screens that Home Assistant draws itself stay in your profile language: this options form, the setup and
repair dialogs, and the translated states and attributes in the entity dialog.

### Finding the setpoint offsets for another heat pump

The defaults come from the heat pump the planner is in use with: a W'eau pond heat pump, which holds its
water inlet at its setpoint with a whole-degree thermostat. To check yours:
1. Set the heat pump's setpoint to the inlet temperature, then 1 K above it, then 2 K below it, with 30
   minutes between each step.
2. Note the power at each step.
3. Use the offset with the lowest stable power for low, the one with full power for high, and one where
   the compressor stops for off.
4. Stop the heat pump (offset off), then try +1, +2 and +3, each for 10 minutes. The lowest one at which the
   compressor starts is `offset_start`. Many heat pumps keep running on a setpoint at which they do not
   start: the reference heat pump starts at +2 (not at 0 or +1) and then runs at low power on 0.

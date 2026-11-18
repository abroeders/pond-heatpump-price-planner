# Installation guide

This guide takes you from nothing to a planner that controls your pond heat pump. Plan for about 15 minutes
to set it up and one week of dry run before you let it control the heat pump.

## 1. Before you start

**Requirements**

- Home Assistant 2026.3 or later.
- HACS installed.
- An air-to-water heat pump that Home Assistant can control through a `climate` entity whose setpoint
  you can change.

**Checklist of sensors.** Find these entities in *Developer tools → States* before you start:

| Entity | Needed | Used for |
|---|---|---|
| Pond temperature (`sensor`, °C) | **required** | everything |
| Heat pump (`climate`) | **required** | control |
| Heat pump electrical power (`sensor`, W) | **required** | learning, COP, detecting the actual mode |
| Outdoor temperature (`sensor`, °C) | **required** | cooling of the pond |
| Water inlet temperature of the heat pump (`sensor`) | recommended | exact setpoints (see §3) |
| Price sensor with today's and tomorrow's prices in its attributes | recommended | price planning |
| Weather entity with an hourly forecast | recommended | outdoor temperature over the next day |
| Price forecast sensor (prices beyond tomorrow) | optional | a longer horizon |
| Solar surplus sensor and solar forecast | optional | using your own solar power |
| Water outlet temperature, energy counter, air inlet temperature | optional | COP |

A pond temperature from a sensor in the water (or in the filter) works best. A sensor that reads the air
temperature near the pond does not work.

## 2. Install through HACS

1. **HACS → ⋮ (top right) → Custom repositories.**
   - Repository: `https://github.com/abroeders/pond-heatpump-price-planner`
   - Type: **Integration**
   - Choose *Add*.
2. Search for **Pond Heat Pump Price Planner** in HACS and choose *Download*.
3. Restart Home Assistant (*Settings → System → Restart*).

## 3. Add the integration

*Settings → Devices & services → Add integration → Pond Heat Pump Price Planner.* The setup has four
steps. Only the first one is required; you can add the others later with *Reconfigure*.

### Step 1: pond and heat pump (required)

| Field | Pick | Without it |
|---|---|---|
| Name | anything, e.g. "Pond" | – |
| Pond temperature | your pond sensor | required |
| Heat pump | the `climate` entity of the heat pump | required |
| Heat pump power | the power sensor of the heat pump (often a smart plug) | required |
| Water inlet temperature | the heat pump's water inlet sensor | the setpoint is based on the rounded pond temperature instead; works, but the heat pump may switch to a different mode than intended when the inlet differs from the pond |
| Outdoor temperature | an outdoor sensor near the pond | required |

### Step 2: prices and weather (optional)

| Field | Pick | Without it |
|---|---|---|
| Price sensor | a sensor with a price list in its attributes (EPEX Spot, Nord Pool, Tibber, EnergyZero and similar) | no price planning: the planner only minimises energy |
| Price forecast sensor | a sensor with a `forecast` list of expected prices | the plan ends where the known prices end (often at midnight before 13:00, the next midnight after) |
| Weather | a weather entity with an hourly forecast | the current outdoor temperature is used for the whole horizon; the plan is less accurate on days with a large temperature swing |

If a price sensor is refused ("no price list in a recognised format"), see
[Troubleshooting](troubleshooting.md#price-sensor-not-recognised).

### Step 3: solar power (optional)

| Field | Pick | Without it |
|---|---|---|
| Solar surplus sensor | PV power, grid export, or net grid power | every quarter is charged at the purchase price |
| Type of this sensor | what the sensor measures (see [configuration](configuration.md#solar-surplus-sensor-types)) | – |
| Solar forecast sensor | hourly PV forecast (Forecast.Solar, Solcast or similar) | the surplus only counts for the current quarter |

With net metering (feed-in worth the same as purchase), solar does not change the plan. You can leave this
step empty until net metering ends.

### Step 4: COP (optional)

| Field | Pick | Without it |
|---|---|---|
| Water outlet temperature | the heat pump's water outlet sensor | no COP from the flow method; the pond method still works |
| Heat pump energy | an energy counter (kWh) of the heat pump | the power sensor is integrated instead (slightly less exact) |
| Air inlet temperature | the heat pump's air inlet sensor | the outdoor sensor is used for the COP per outdoor temperature |

## 4. First settings

Open the new device (*Settings → Devices & services → Pond Heat Pump Price Planner → the device*):

| Entity | Set to |
|---|---|
| Thermostat | set the target temperature you want for the pond (5–28 °C) |
| Band | how far the pond may move around the target; 0.25 °C is a good start |
| Pond volume | the water volume in m³ (needed for the pond COP, heat loss and thermal power) |
| Flow through the heat pump | the water flow through the heat pump in m³/h (needed for the flow COP) |
| COP method | *Average of both* unless one method is known to be better for your pond |

Leave **Control the heat pump** off for now.

## 5. Price setup

The planner compares prices between quarters, so the price it uses must be the price you actually pay per
kWh. Open the options (*Configure* on the integration).

| Your price sensor shows | Price multiplier | Price addition |
|---|---|---|
| The all-in price (supplier price with taxes) | 1 | 0 |
| The bare exchange price (EPEX) in €/kWh, Netherlands 2026 | 1.21 | ≈ 0.136 (energy tax, supplier fee, VAT) |
| The bare exchange price in €/MWh | 0.00121 | ≈ 0.136 |

Use the same values for the price forecast sensor if it shows the same kind of price.

**Feed-in** (only with solar). The defaults (1 and 0) mean net metering: own solar power is worth as much
as bought power. Without net metering, set the feed-in multiplier and addition so that they give what you
receive per exported kWh, e.g. 1 and −0.02 for "exchange price minus 2 cents" on a bare exchange price
sensor.

## 6. Dry run (one week)

Keep your existing automations running. The planner now plans and shows what it would do, without touching
the heat pump.

Check daily:

| Look at | What you want to see |
|---|---|
| *Mode* and its attribute `plan` | low in cheaper quarters, off in expensive ones, the pond predicted inside the band |
| `would_set` on *Mode* | sensible setpoints (around the inlet temperature) |
| *Prediction error* | after a day: below about 0.2 K |
| *Model learned* | a time after the first night (needs a few days of data, more is better) |
| *Planned cost next 24 h* | lower than what the heat pump costs now |

The [dashboard examples](dashboard.md) show the plan as a chart.

## 7. Switch over

1. **Disable the automations** that change the heat pump: anything that sets its temperature, turns it on
   or off, or changes its mode. Disable them (do not delete them), so you can go back.
2. **Turn on** *Control the heat pump*.
3. **Check during the first hours:**
   - the heat pump's setpoint follows *Mode*;
   - the measured power matches the mode (about 400 W for low on the reference pond);
   - no *Heat pump does not follow the planner* repair appears.

## 8. Minimal and full setup

| | Minimal | Full |
|---|---|---|
| Links | pond, heat pump, power, outdoor | all of step 1–4 |
| What you get | safe control at low power with a learned model; no price planning | price planning over 24–36 h, weather and solar, COP, heat loss, thermal power |
| Typical saving vs. a thermostat at high power | most of it: low power alone saves ~20–25 % | ~25–30 % on the reference pond |

## 9. Undo

- **Stop controlling:** turn off *Control the heat pump* and re-enable your automations. The heat pump keeps
  its last setpoint until your automations change it.
- **Remove:** *Settings → Devices & services → Pond Heat Pump Price Planner → ⋮ → Delete*. The stored samples
  and the learned model are deleted with it.

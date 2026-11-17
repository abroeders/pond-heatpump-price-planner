# Dashboard examples

Examples with Home Assistant's standard cards. The integration also brings its own card: see
[Lovelace card](card.md).

The entity IDs below assume a planner named "Pond" that was added while Home Assistant was set to English.
Check the real IDs on the device page, or in *Settings → Devices & services → Entities*, and replace them
where needed.

## Thermostat card

```yaml
type: thermostat
entity: climate.pond_thermostat
```

Shows the pond temperature, the target and whether the heat pump is heating; the target can be changed
with the dial.

## Entities card

```yaml
type: entities
title: Pond heat pump
entities:
  - entity: sensor.pond_mode
    secondary_info: last-changed
  - entity: switch.pond_control_the_heat_pump
  - entity: climate.pond_thermostat
  - entity: number.pond_band
  - entity: sensor.pond_next_start
  - entity: sensor.pond_next_stop
  - entity: sensor.pond_planned_cost_next_24_h
  - entity: sensor.pond_cop
  - entity: sensor.pond_heat_loss
  - entity: sensor.pond_thermal_power
  - entity: switch.pond_insulation_cover
```

## Plan chart (ApexCharts)

Needs the [ApexCharts card](https://github.com/RomRider/apexcharts-card) from HACS. The chart shows the
predicted pond temperature with the band, the planned mode as bars and the price.

```yaml
type: custom:apexcharts-card
header:
  show: true
  title: Plan
graph_span: 36h
span:
  start: minute
now:
  show: true
yaxis:
  - id: temp
    decimals: 1
  - id: mode
    min: 0
    max: 2
    show: false
  - id: price
    opposite: true
    decimals: 2
series:
  - entity: sensor.pond_mode
    name: Pond temperature
    yaxis_id: temp
    type: line
    data_generator: |
      return entity.attributes.plan.map(q => [new Date(q.start).getTime(), q.temp]);
  - entity: climate.pond_thermostat
    name: Target
    yaxis_id: temp
    type: line
    stroke_dash: 4
    data_generator: |
      const plan = hass.states['sensor.pond_mode'].attributes.plan;
      return plan.map(q => [new Date(q.start).getTime(), entity.attributes.temperature]);
  - entity: sensor.pond_mode
    name: Mode
    yaxis_id: mode
    type: column
    opacity: 0.3
    data_generator: |
      const level = {off: 0, low: 1, high: 2};
      return entity.attributes.plan.map(q => [new Date(q.start).getTime(), level[q.mode]]);
  - entity: sensor.pond_mode
    name: Price
    yaxis_id: price
    type: line
    curve: stepline
    data_generator: |
      return entity.attributes.plan.map(q => [new Date(q.start).getTime(), q.price]);
```

## History

```yaml
type: history-graph
title: Pond, last 3 days
hours_to_show: 72
entities:
  - entity: sensor.pond_temperature
  - entity: climate.pond_thermostat
  - entity: sensor.pond_mode
```

`sensor.pond_temperature` is your own pond sensor here.

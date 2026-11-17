# Lovelace card

The integration ships its own dashboard card. It shows the heat pump as an animated drawing, a thermostat
with the band, the plan and the key figures, and lets you change the target, the band and the switches.

## Adding the card

The card is loaded automatically with the integration; there is no separate download and no dashboard
resource to add.

1. Open a dashboard, choose *Edit dashboard → Add card*.
2. Search for **Pond Heat Pump Planner**.
3. Choose the planner device. The card is ready; the other settings are optional.

After an update of the integration, reload the browser page once if the card does not change.

## Size and layout

The card adapts its layout to its own width:

| Card width | Layout |
|---|---|
| narrow (one dashboard column) | everything stacked |
| about two columns (560 px and more) | heat pump and thermostat side by side; the plan over the full width; figures with switches next to the model |
| three columns or more (900 px and more) | heat pump, thermostat and figures with switches side by side; plan and model over the full width |

**Making it wider:**
- **Sections dashboard:** the card fills its section by default. To make it 2, 3 or more dashboard columns
  wide, make the section wider (*Edit section → column span*); the card follows. You can also make the card
  narrower within its section, down to half a section.
- **Masonry dashboard:** the card takes the width of its column.
- **Panel view:** the card takes the full width of the screen.

## What it shows

| Section | Contents |
|---|---|
| Heat pump | The drawing below, with live values and animations |
| Thermostat | Ring with the pond temperature (triangle), the target (handle, drag it) and the band (green); target − / + and a vertical slider for the band (in °C); next start/stop and whether the planner controls the heat pump |
| Plan | 24, 36 or 48 hours: predicted pond temperature (line) with band (shaded) and target (dashed), mode per quarter (bars: blue low, orange high), price (thin step line), expensive quarters (light background), solar quarters (yellow), now (red line) and where forecast prices begin (dotted); a legend below the chart explains each element |
| Figures | Planned cost and energy for 24 h, share in expensive quarters, COP (method), heat loss, thermal power |
| Switches | Insulation cover, control the heat pump |
| Model | Collapsible: cooling coefficient, heating rates, prediction error, last learned, COP by outdoor temperature |

Changes to the target and the band are sent one second after the last change, so quick presses become one
update.

### The drawing

![heat pump illustration](design/assets/2026-11-17-heatpump-illustration.svg)

| Element | Shows | Moves when |
|---|---|---|
| Pond | pond temperature | the water surface waves gently, always |
| Pump | speed and power; green running, red fault, grey off | – |
| Water pipes | water in and out temperatures | dashes flow while the `flow` entity is on |
| Fan | – | turns while the `fan` entity is on |
| Compressor | – | the piston pumps while the `compressor` entity is on |
| Refrigerant lines | hot gas (red), liquid (orange), suction gas (purple); gas and liquid temperatures | dashes flow while the compressor runs |
| Heat exchanger | thermal power below it | – |
| Power cord and socket | electrical power | – |
| Air arrows | air in and out temperatures | dashes flow while the fan runs |

With the browser or system setting *reduce motion*, nothing moves; states stay visible as colours and
labels. Values without an entity are left out.

## Options

All options can be set in the visual editor.

```yaml
type: custom:pond-heatpump-planner-card
device_id: 0123456789abcdef   # the planner device
hours: 36                     # 24, 36 or 48 hours in the plan chart
sections: [heat_pump, thermostat, plan, figures, switches, model]   # order and visibility
heat_pump:                    # entities of the drawing, all optional
  water_in: sensor.heat_pump_water_inlet_temperature
  water_out: sensor.heat_pump_water_outlet_temperature
  air_in: sensor.heat_pump_air_inlet_temperature
  air_out: sensor.heat_pump_air_outlet_temperature
  power: sensor.heat_pump_power
  liquid: sensor.heat_pump_condenser_temperature   # refrigerant after the heat exchanger
  gas: sensor.heat_pump_gas_out_temperature
  fan: binary_sensor.heat_pump_fan_active
  flow: binary_sensor.heat_pump_circulation_active
  compressor: binary_sensor.heat_pump_compressor_active
  pump_speed: sensor.circulation_pump_speed
  pump_power: sensor.circulation_pump_power
  pump_fault: binary_sensor.circulation_pump_fault
```

| Option | Default |
|---|---|
| `device_id` | the first planner device |
| `hours` | 36 (for 48, also set the integration's *Planning horizon* to 48 h) |
| `sections` | all, in the order above |
| `heat_pump.water_in`, `water_out`, `air_in`, `power` | the entities linked in the integration |
| other `heat_pump` keys | none (left out of the drawing) |

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Choose a planner device" | pick the device in the editor |
| Card not in the picker | reload the browser page; check that the integration is loaded |
| A value is missing in the drawing | link the entity in the editor (*Heat pump*) |
| Nothing moves | check the boolean entities in the editor, and the *reduce motion* setting of the device |

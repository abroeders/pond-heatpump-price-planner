# Pond Heat Pump Price Planner

A Home Assistant custom integration (HACS) that plans a pond heat pump on quarter-hour electricity prices.

It learns how fast your pond warms up and cools down, plans when the heat pump runs over the next 24–36 hours,
keeps the pond within a narrow temperature band, preheats before expensive periods and avoids short cycles.

**Status:** in development. See the [issues](https://github.com/abroeders/pond-heatpump-price-planner/issues) for the roadmap.

## Installation

1. In HACS, open the menu → *Custom repositories*, add `https://github.com/abroeders/pond-heatpump-price-planner`
   with type *Integration*.
2. Install *Pond Heat Pump Price Planner* and restart Home Assistant.
3. *Settings → Devices & services → Add integration → Pond Heat Pump Price Planner*.

Requires Home Assistant 2024.8 or later; the integration icon shows from 2026.3.

## License

[Apache-2.0](LICENSE)

<p align="center"><img src="brand/icon.svg" width="128" alt=""></p>

# Pond Heat Pump Price Planner

A Home Assistant integration that heats a pond with a heat pump at the lowest cost while keeping the water
temperature stable for the fish.

It learns how fast your pond warms up and cools down, and plans every quarter hour of the next 24–36 hours:
off, low power or high power. The plan uses quarter-hour electricity prices, the weather forecast and,
optionally, your own solar power. It prefers long runs at low power, where a heat pump is most efficient,
and it preheats before expensive periods when that pays off. Safety rules keep the pond in its band whatever
happens.

## Features

- **Cost-optimal plan** over 24–36 h with dynamic programming, replanned every quarter hour.
- **Self-learning thermal model.** It updates every night and follows an insulation cover within a week.
- **Prices from common sensors.** Known prices plus an optional price forecast, and a conversion from a bare
  exchange price to all-in.
- **Solar surplus**, valued at the feed-in price.
- **Safety rules** with hysteresis, a dry-run mode, and a repair issue when the heat pump does not follow.
- **COP** by two independent methods (water flow and the pond itself), plus heat loss and thermal power.
- **Everything in the UI**, in English and Dutch.

On the reference pond (21 m³, November 2026) the planner costs about 25–30 % less than the previous control
at high power, with 1–2 starts a day and the pond within ±0.25 K.

## Requirements

- Home Assistant 2026.3 or later, and HACS.
- A heat pump with a `climate` entity whose setpoint Home Assistant can change.
- Sensors for the pond temperature, the outdoor temperature and the heat pump's power.
- Recommended: a price sensor with today's and tomorrow's prices, and a weather entity.

## Quick start

1. **Add the repository.** HACS → ⋮ → *Custom repositories* →
   `https://github.com/abroeders/pond-heatpump-price-planner`, type *Integration*.
2. **Install.** Download *Pond Heat Pump Price Planner* and restart Home Assistant.
3. **Add the integration.** *Settings → Devices & services → Add integration → Pond Heat Pump Price
   Planner*, then link your sensors.
4. **First settings.** Set the target on the thermostat, and the band, pond volume and flow on the device page. Set the
   price options if your price sensor shows a bare exchange price.
5. **Dry run first.** Watch the plan for a week, then turn on *Control the heat pump*.

The [installation guide](docs/installation.md) explains every step.

## Documentation

| Page | |
|---|---|
| [Installation guide](docs/installation.md) | step by step, including the switch-over from existing automations |
| [Configuration](docs/configuration.md) | every link and option, and what leaving it out does |
| [Entities](docs/entities.md) | what every sensor, number, switch and attribute shows |
| [How it works](docs/how-it-works.md) | model, learning, planning, safety, with formulas |
| [COP, heat loss and thermal power](docs/cop.md) | both COP methods with formulas |
| [Dashboard examples](docs/dashboard.md) | entities card, plan chart, history |
| [Troubleshooting](docs/troubleshooting.md) | symptoms, causes, fixes |
| [FAQ](docs/faq.md) | short answers |
| [Architecture](docs/architecture.md) and [designs](docs/design/) | for contributors |

## License

[Apache-2.0](LICENSE)

# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Plan chart of the card: 48 hours option and a legend below the chart (#14).

### Changed

- The band is shown in °C (number entity and card) instead of K; the value is unchanged (#14).

## [0.2.0] - 2026-11-17

### Added

- Built-in Lovelace card `custom:pond-heatpump-planner-card`: animated heat pump drawing with pond, pump,
  refrigerant circuit and power cord; thermostat gauge with the band and a band slider; plan chart; key
  figures; switches; model. Loaded automatically, English and Dutch (#10).
- The `plan` attribute shows per quarter whether the price is known and the solar surplus; the model status
  sensor shows the linked entities (#10).

### Changed

- The target temperature is now a thermostat (climate entity) with the pond temperature and whether the
  heat pump is heating, usable in the thermostat card and by voice assistants. Range 5–28 °C. The target
  number entity is removed automatically; the stored target is kept (#12).

## [0.1.0] - 2026-11-17

### Added

- Thermal model of the pond, learned every night from quarter-hour samples (42 days), seeded from the
  recorder; follows an insulation cover within a week.
- Planner: cost-optimal off/low/high per quarter over 24–36 h (dynamic programming), with prices from common
  price sensors, an optional price forecast, the weather forecast and optional solar surplus.
- Expensive-quarter surcharge, tuned every night on the last 14 days.
- Safety rules with hysteresis, setpoint control relative to the heat pump's inlet temperature, dry run,
  and a repair issue when the heat pump does not follow.
- COP by the flow method and the pond method (or their average), heat loss (W/K) and thermal power (W).
- Config flow in four steps, reconfigure, options, sensors, settings entities, diagnostics; English and Dutch.
- Documentation: installation guide, configuration and entity reference, how it works, COP formulas,
  dashboard examples, troubleshooting, FAQ, architecture with UML diagrams.
- Integration icon (pond with a koi), light and dark variants.

### Requirements

- Home Assistant 2026.3 or later.

[Unreleased]: https://github.com/abroeders/pond-heatpump-price-planner/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/abroeders/pond-heatpump-price-planner/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/abroeders/pond-heatpump-price-planner/releases/tag/v0.1.0

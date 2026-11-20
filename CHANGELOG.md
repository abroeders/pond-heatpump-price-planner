# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses calendar versioning like Home Assistant (`YEAR.MONTH.PATCH`) from 2026.11.0 on;
earlier releases used [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- The plan chart keeps the history visible left of now: the measured mode per quarter (lighter bars), the
  prices and the expensive quarters; the tooltip of a past quarter shows its mode and price. The
  `pond_history` attribute carries the measured `mode` and the `price` of each quarter (#34).

## [2026.11.3] - 2026-11-20

### Added

- Flow COP with whole-degree water sensors: option *COP: inlet temperature* (heat pump inlet or the pond
  sensor), an outlet correction learned while the heat pump is off and water flows (or set by hand with
  *COP: outlet correction*), and an optional link to a circulation sensor. The flow COP shows the inlet, the
  correction, its source and the calibration hours (#32).

### Fixed

- After a start-up the flow method waited for the first change of each water temperature before counting;
  it now starts from the current values (#32).

## [2026.11.2] - 2026-11-20

### Fixed

- The flow-method COP got no value: the hourly timer runs just after the full hour, and the finished hour was
  dropped instead of stored. Every finished hour is now kept, also when a sensor update crosses the hour
  first (#30).

## [2026.11.1] - 2026-11-20

### Added

- Option *Language* (automatic, English, Nederlands): entity names, readable texts for the reason, setpoint
  result and price status (`reason_text`, `apply_result_text`, `price_status_text`) and the card in that
  language, independent of the Home Assistant language. The card has its own `language` option that
  overrides it; texts, dates and numbers follow the chosen language (#28).

## [2026.11.0] - 2026-11-20

### Fixed

- The card shows times of day in 24-hour format, also when Home Assistant uses English (it showed AM/PM).
  The lower label of the price axis shows the euro sign too (#26).

## [0.5.1] - 2026-11-18

### Changed

- The documentation names the heat pump the planner is in use with (a W'eau pond heat pump) and where the
  default offsets come from.

### Fixed

- A stopped heat pump is started with a higher setpoint: new option `offset_start` (default +2 K) for low and
  high while the power is below `low_w`; once the heat pump runs, the mode's setpoint is sent at once. Before,
  the planner planned low but a stopped heat pump did not start on the low setpoint (#24).

## [0.5.0] - 2026-11-18

### Added

- The plan chart shows the measured pond temperature up to now (solid) and the prediction from now
  (dashed) (#22).
- A hairline with a tooltip in the plan chart: time, temperature, mode, price, expensive quarter and solar
  surplus of the quarter under the pointer; also with the keyboard (#22).

### Changed

- The plan chart always spans `hours`: it ends where the known prices end and starts `hours` before that
  (#22).
- `pond_history` covers 48 hours instead of 24 (#22).

## [0.4.0] - 2026-11-18

### Added

- The card shows the pond temperature of the last 24 hours in the thermostat, from the new attribute
  `pond_history` of the mode sensor (#21).
- The plan chart has a "Plan:" title, the date at every midnight and vertical lines every 6 hours in local
  time (#21).
- Screenshots of the card in the README (shown by HACS and the marketplace) and in the docs, made from the
  real card with `scripts/screenshot_card.py` (#18).

### Changed

- The card explains why there is no plan instead of hiding the chart (#20).
- "Planned energy" is now called "planned electricity": it is electrical energy, not heat (#21).

### Fixed

- A plan is made again as soon as Home Assistant has started and whenever the pond, price or heat pump
  entity becomes available; before, there was no plan for up to 15 minutes after a restart (#20).
- The pond temperature only counts as missing when the sensor is unavailable or quiet for more than 6 hours;
  sensors that only report changes were treated as missing after 30 minutes (#20).
- The thermostat uses the native climate properties of Home Assistant 2026.11, without deprecation warnings
  (#20).
- The card now switches to its two- and three-column layout: the card element was inline and its width was
  measured as 0. On wide cards the key figures fill the empty cell next to the thermostat, and the plan chart
  keeps its height and text size (#18).
- Better contrast of the pond temperature and the predicted temperature line in dark themes (#18).

## [0.3.0] - 2026-11-18

### Added

- Plan chart of the card: 48 hours option and a legend below the chart (#14).
- The card is resizable in sections dashboards and adapts its layout to its width: one, two or three
  columns (#16).
- Documentation: a template price sensor for a normal and off-peak (day/night) tariff following the Dutch
  rules (off-peak 23:00–7:00 on weekdays, weekends and recognised holidays all day, holidays calculated per
  year), tested against Home Assistant's template engine (#15).

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

[Unreleased]: https://github.com/abroeders/pond-heatpump-price-planner/compare/v2026.11.3...HEAD
[2026.11.3]: https://github.com/abroeders/pond-heatpump-price-planner/compare/v2026.11.2...v2026.11.3
[2026.11.2]: https://github.com/abroeders/pond-heatpump-price-planner/compare/v2026.11.1...v2026.11.2
[2026.11.1]: https://github.com/abroeders/pond-heatpump-price-planner/compare/v2026.11.0...v2026.11.1
[2026.11.0]: https://github.com/abroeders/pond-heatpump-price-planner/compare/v0.5.1...v2026.11.0
[0.5.1]: https://github.com/abroeders/pond-heatpump-price-planner/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/abroeders/pond-heatpump-price-planner/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/abroeders/pond-heatpump-price-planner/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/abroeders/pond-heatpump-price-planner/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/abroeders/pond-heatpump-price-planner/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/abroeders/pond-heatpump-price-planner/releases/tag/v0.1.0

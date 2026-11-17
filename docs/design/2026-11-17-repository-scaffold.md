# Repository scaffold

- Issue: #1
- Status: **approved** (2026-11-17); §10 added 2026-11-17, **draft**
- Date: 2026-11-17

## 1. Purpose

Set up the repository so that the integration can be developed, tested and installed through HACS from the
first commit onward. No planning or control logic is part of this issue.

## 2. Constraints

- The integration must install as a HACS custom repository (category *Integration*) and later qualify for
  the default HACS store.
- Home Assistant ships `numpy`; the integration needs no extra Python requirements.
- Home Assistant requires Python 3.13 or newer. The computational core (model, learning, planner) is
  plain Python + numpy without Home Assistant imports, so it can be tested on any recent Python.
- Minimum Home Assistant version: **2024.8** (`ConfigEntry.runtime_data`, `weather.get_forecasts`).

## 3. Layout

```
custom_components/pond_heatpump_price_planner/
  __init__.py          setup/unload of the config entry
  manifest.json
  const.py             domain, configuration keys, defaults
  core/                no Home Assistant imports
    __init__.py
    model.py           thermal model and learning           (#2)
    samples.py         quarter-hour samples, resampling     (#2)
    prices.py          price attribute parsing              (#3)
    planner.py         optimiser                            (#3)
  coordinator.py       glue to Home Assistant               (#4, #5)
  config_flow.py       config and options flow              (#5)
  sensor.py, number.py, switch.py, button.py                (#5)
  diagnostics.py                                            (#5)
  strings.json
  translations/en.json, translations/nl.json
tests/                 pytest, core only
docs/                  user documentation                   (#6)
docs/design/           design documents
hacs.json
README.md, CHANGELOG.md, LICENSE
.github/workflows/validate.yml, .github/workflows/tests.yml
.github/ISSUE_TEMPLATE/bug_report.yml, feature_request.yml
pyproject.toml         pytest and ruff configuration only (not a package)
```

The `core` subpackage keeps the numerical code importable without Home Assistant. Tests add
`custom_components/pond_heatpump_price_planner` to `sys.path` and import `core` directly, so the
package `__init__.py` (which imports Home Assistant) is never loaded during tests.

## 4. Files

### 4.1 `manifest.json`

```json
{
  "domain": "pond_heatpump_price_planner",
  "name": "Pond Heat Pump Price Planner",
  "codeowners": ["@abroeders"],
  "config_flow": true,
  "dependencies": [],
  "after_dependencies": ["recorder", "weather"],
  "documentation": "https://github.com/abroeders/pond-heatpump-price-planner",
  "integration_type": "service",
  "iot_class": "calculated",
  "issue_tracker": "https://github.com/abroeders/pond-heatpump-price-planner/issues",
  "requirements": [],
  "version": "0.0.0"
}
```

`iot_class` is `calculated`: the integration reads other entities and computes; it talks to no device or
service of its own.

### 4.2 `hacs.json`

```json
{ "name": "Pond Heat Pump Price Planner", "homeassistant": "2024.8.0", "render_readme": true }
```

### 4.3 Minimal integration

For this issue the integration contains a config flow with one step: a name. It creates an entry without
entities. This proves that hassfest, HACS validation and installation work before real code lands. Issue #5
replaces the flow.

## 5. CI

| Workflow | Trigger | Steps |
|---|---|---|
| `validate.yml` | push, pull request, weekly | `home-assistant/actions/hassfest`, `hacs/action` (category integration) |
| `tests.yml` | push, pull request | Python 3.13, `pip install numpy pytest ruff`, `ruff check`, `pytest` |

Both run on `main`, `develop` and pull requests. The `main` protection gets these checks as required status
checks once they exist (a later change on GitHub, after OK).

## 6. Versioning and releases

- Semantic versioning; `manifest.json` `version` is updated on release.
- `CHANGELOG.md` in *Keep a Changelog* format.
- Releases are GitHub releases with tag `vX.Y.Z` on `main`; HACS offers the releases to users.

## 7. Issue templates

Bug report (version, HA version, what happened, diagnostics download) and feature request (problem, proposal).

## 8. Brand images

The integration gets its own icon: a pond with a koi that sticks its head above the water.

- **Where it shows.** Since Home Assistant 2026.3, a custom integration can ship its own brand images in
  `custom_components/<domain>/brand/`; they are served at `/api/brands/integration/<domain>/<image>` and
  take precedence over the brands repository. No PR to `home-assistant/brands` is needed. On older
  versions Home Assistant shows its generic placeholder; the minimum version stays 2024.8.
- **Files:**
  - `icon.png` (256 × 256) and `icon@2x.png` (512 × 512);
  - `dark_icon.png` and `dark_icon@2x.png`, with a lighter rim and ripples for dark themes;
  - no `logo.png`: Home Assistant falls back to the icon.
- **Source and format.**
  - Source: `brand/icon.svg` in the repository (not used by Home Assistant). The PNGs are generated from it
    with a small script (`scripts/render_icons.py`, resvg).
  - Transparent background, square, trimmed to the content.
- **Style:** flat with soft gradients, readable at 48 px.
  - Grey stone rim, blue water with white ripples, an orange-and-white koi seen from the side, its head above the surface and its body visible
    through the water, two water
    droplets.
  - No text and no Home Assistant marks.

Draft: [`assets/2026-11-17-icon-draft.svg`](assets/2026-11-17-icon-draft.svg)

![icon draft](assets/2026-11-17-icon-draft.png)

## 9. Out of scope

Any planning, learning or control logic; documentation content beyond the README stub (#6).

## 10. Acceptance

- CI green on the feature branch.
- The icon shows on *Settings → Devices & services* on Home Assistant 2026.3 or later.
- Adding the repository as a HACS custom repository on a test or real installation shows the integration and
  the config flow creates an entry without errors (checked by the user).

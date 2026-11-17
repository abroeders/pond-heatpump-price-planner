# Documentation

- Issue: #6
- Status: **approved** (2026-11-17)
- Date: 2026-11-17

## 1. Purpose

User documentation that lets someone with a pond heat pump install, configure, understand and tune the
integration without reading the code, in English (the UI itself is also in Dutch).

## 2. Readers

| Reader | Needs |
|---|---|
| New user | what it does, what it needs, installation, a working minimal setup |
| Tuning user | every option and link, what leaving it out does, how to check the result |
| Curious user | how planning, learning, safety and COP work, with formulas |
| Contributor | architecture, design documents, tests (already in `architecture.md` and `design/`) |

## 3. Structure

| File | Contents |
|---|---|
| `README.md` | What it does (with the icon and a dashboard screenshot), features, requirements, quick start in 5 steps, links to the docs, license |
| `docs/installation.md` | Step-by-step installation guide (§4) |
| `docs/configuration.md` | Reference of every link (config flow) and every option: meaning, default, range, **effect of leaving it out or changing it** |
| `docs/entities.md` | Every entity: what it shows, unit, attributes, when it is unavailable |
| `docs/how-it-works.md` | Thermal model and learning, planner (dynamic programming, start penalty, surcharge tuning), solar, safety rules and control; plain language first, formulas after |
| `docs/cop.md` | Already written (#8) |
| `docs/dashboard.md` | Ready-to-use dashboard examples: entities card, ApexCharts plan chart (pond temperature, band, mode, price), history; until the card of #10 exists |
| `docs/troubleshooting.md` | Symptoms → causes → fixes (no plan, price not recognised, heat pump does not follow, model not learned, odd COP, migration error) |
| `docs/faq.md` | Short answers (why not per-day COP, why low power, battery, other heat pumps, net metering) |
| `docs/architecture.md`, `docs/design/` | Existing, for contributors |
| `CHANGELOG.md` | Filled for every release |

## 4. Installation guide

1. **Before you start:** requirements (HA 2026.3, HACS); which sensors you need and which are optional, as
   a checklist.
2. **Install through HACS:** custom repository, download, restart.
3. **Add the integration:** the four steps with what to pick in each field. Per optional step: what you
   lose by skipping it.
4. **First settings:** target temperature, band, pond volume, flow, COP method.
5. **Price setup:** how to set the price multiplier and addition for a bare exchange price (EPEX) or an
   all-in price (Tibber, …). Feed-in after the end of net metering.
6. **Dry run (recommended for a week):**
   - keep the existing automations;
   - what to look at: mode, plan, would-set setpoint, prediction error.
7. **Switch over:**
   - which kinds of automations to disable (anything that sets the heat pump's setpoint or turns it on/off);
   - turn on *Control the heat pump*;
   - what to check in the first hours.
8. **Minimal and full setup:** two example configurations side by side.
9. **Undo:** turn control off, re-enable your automations, remove the integration (the stored data is
   deleted with it).

## 5. Style

- Short sentences, conclusion first, tables for settings.
- Menu names exactly as in Home Assistant (English).
- Formulas in LaTeX (GitHub renders them).
- Every page starts with one paragraph that says what it covers.
- No screenshots of other people's installations.
- Dashboard screenshots are made from a test installation with neutral entity names.

## 6. Checks

- **Links:** every option and entity in the code appears in `configuration.md` / `entities.md`. A small test
  compares the keys in `strings.json` with the documentation.
- **Markdown:** the Mermaid blocks parse. Internal links resolve (link check in CI).

## 7. Out of scope

Translating the documentation; video; the Lovelace card documentation (comes with #10).

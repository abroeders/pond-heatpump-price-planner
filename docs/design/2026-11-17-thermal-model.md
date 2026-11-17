# Thermal model and learning

- Issue: #2
- Status: **approved** (2026-11-17)
- Date: 2026-11-17

## 1. Purpose

Predict the pond temperature quarter by quarter for a given heat pump schedule, and keep that prediction
accurate as conditions change (season, an insulation cover in winter, a different heat pump). The planner
(#3) uses the model; this issue covers the model, the data it learns from and the learning itself.

## 2. Reference data

Measured on the reference installation (pond with an inverter air-to-water heat pump, 10-10 to
17-11-2026, quarter-hour data):

| Item | Value |
|---|---|
| Heating, low mode (~390 W) | 0.30 K/h per kW → +0.12 K/h |
| Heating, high mode (~920 W) | 0.21 K/h per kW → +0.19 K/h |
| Cooling coefficient `k` | 0.012 /h (time constant ~80 h) |
| Constant offset `c` | −0.0115 K/h |
| Start-up | first ~5 min at ~2/3 efficiency |
| Prediction error, open loop | 4 h: 0.10 K, 12 h: 0.15 K, 24 h: 0.20 K (mean absolute) |

Low mode delivers ~1.45× more heat per kWh than high mode. These values are the defaults until the
installation has its own data.

*Revised 2026-11-17 during implementation:* the first analysis regressed the 4-hour slope on the power of
the middle hour only. That attenuates the gains by ~30 % (errors in variables). With power and temperature
difference averaged over the same window as the slope (§5), the values above follow; the ratio low/high
(1.45) now agrees with both COP methods of #8 (1.37–1.45). Earlier values: 0.222 / 0.139 / 0.009 / −0.005.

## 3. Model

Per quarter hour (Δt = 0.25 h), with mode `m ∈ {off, low, high}`:

```
T[t+1] = T[t] + Δt · ( g_m · s · P_m  −  k_c · (T[t] − T_out[t])  +  c )
```

| Symbol | Meaning | Default |
|---|---|---|
| `P_m` | mean electrical power in mode m (kW) | off 0.005, low 0.39, high 0.90 |
| `g_m` | heating gain per kW in mode m (K/h per kW) | off 0, low 0.30, high 0.21 |
| `s` | start factor: 0.75 in the first quarter after off, else 1 | 0.75 |
| `k_c` | cooling coefficient for cover state c (open/covered) | open 0.012, covered 0.6 · open |
| `c` | constant offset (pumps, filters, evaporation, ground) | −0.01 |
| `T_out` | outdoor temperature (forecast in the planner) | |

The model is linear in its parameters, so learning is least squares. Solar gain and wind are not in the
model yet (separate issue); in practice they show up as noise and are partly absorbed by `c`.

### 3.1 Parameter object

```python
@dataclass
class ModelParams:
    power: dict[str, float]      # kW per mode
    gain: dict[str, float]       # K/h per kW per mode
    k_open: float
    k_cover: float | None        # None until learned
    offset: float
    start_factor: float
    learned_at: float | None     # epoch seconds
    samples_used: int
    def k(self, cover: bool) -> float
    def rate(self, mode: str) -> float          # g_m · P_m, K/h
    def step(self, temp, mode, t_out, starting, cover) -> float
    def to_dict(self) -> dict; from_dict(d) -> ModelParams
```

## 4. Samples

### 4.1 What is stored

One record per quarter hour (start time, UTC epoch seconds):

| Field | Source |
|---|---|
| `t` | quarter start |
| `pond` | pond temperature at the end of the quarter |
| `outdoor` | outdoor temperature at the end of the quarter |
| `power` | time-weighted mean heat pump power over the quarter (W) |
| `cover` | state of the insulation-cover switch (bool) |

The mode for learning is derived from `power` with two thresholds (options, defaults: off < 150 W,
high ≥ 650 W). Power is integrated from state changes of the power sensor (step function: the last value
holds until the next change), so sparse updates are weighted correctly.

### 4.2 Storage

- Home Assistant's `Store` (`.storage/pond_heatpump_price_planner.<entry_id>`), JSON, saved with a delay
  of 60 s after each quarter.
- Retention **42 days** (4032 records, ~200 kB). The recorder often keeps less (default 10 days).
- Gaps (Home Assistant restart, unavailable sensors) are allowed; records with a missing value are skipped
  by the fits.

### 4.3 Seeding

On first start (fewer than 96 records) the integration reads up to the recorder's retention of history
for the three sensors (`recorder.history.get_significant_states`, in the recorder's executor) and converts
it to quarter-hour records with the same time weighting. Seeding is best effort: if the recorder is not
available, learning starts from the defaults and fills over time.

`samples.py` contains the pure conversion `to_quarters(series, start, end) -> list[Sample]` from
`(timestamp, value)` lists, so it is unit-tested.

## 5. Learning

Learning runs once a night (03:30 local) and on demand (button, #5). The fits work on hourly
aggregates of the samples, like the reference analysis:

- hourly mean of `pond`, `outdoor`, low-mode power and high-mode power (power split by the thresholds);
- slope `dT[h] = (T[h+2] − T[h−2]) / 4 h` (centred, reduces sensor quantisation);
- power and `T − T_out` averaged over the same window as the slope (weights ⅛, ¼, ¼, ¼, ⅛ for hours
  h−2 … h+2), so the regressors match the interval of the slope;
- hours with gaps in the ±2 h window are skipped.

### 5.1 Slow fit: gains and offset

- Window: the last 28 days; needs ≥ 14 days and ≥ 20 hours in each of low and high mode for that mode's gain.
- Least squares on `dT = g_low · P_low + g_high · P_high − k_open · ΔT_open − k_cover · ΔT_cover + c`, where
  `ΔT_open`/`ΔT_cover` is `T − T_out` in hours with the cover off/on (the other is 0).
- Result is accepted only within bounds (gain 0.02–1.0 K/h per kW, offset −0.05–+0.05 K/h) and blended:
  new = 0.7 · old + 0.3 · fit, so one odd month cannot move the model far.
- A mode without enough hours keeps its previous gain. If high mode is rarely used, its gain stays at the
  default ratio to low (0.69) until data exist.
- Mode powers `P_m`: median of the hourly power in that mode over the same window.

### 5.2 Fast fit: cooling coefficient

This is what makes the model follow the insulation cover.

- Night hours only (19:00–07:00 local), no solar gain.
- Gains and offset fixed from the slow fit; per hour `y = dT − g_low · P_low − g_high · P_high − c`.
- Weighted least squares through the origin: `k = −Σ w · y · ΔT / Σ w · ΔT²`, with
  `w = 0.5^(age_days / 3)` (half-life 3 days) over the last 7 days.
- Only hours with the same cover state as now; the result updates `k_open` or `k_cover`.
- Needs ≥ 24 night hours and a mean `ΔT` ≥ 2 K (no information when pond and air are equally warm);
  otherwise `k` is unchanged. Bounds 0.001–0.05 /h.

On the reference data this estimate has a day-to-day spread of ~15 % (7-day window). A cover that lowers
cooling by 30–50 % therefore shows within 3–5 days and is fully reflected within 7 days, even without the
switch.

### 5.3 Insulation cover switch

Optional help for the model, not required:

- Switching it on uses `k_cover` immediately (or 0.6 · `k_open` if never learned); off uses `k_open`.
- The fast fit then refines the active one.
- Without using the switch, the fast fit adapts `k_open` to the cover within a week, and back in spring.

### 5.4 Prediction error

Every planning cycle stores the predicted pond temperature 4 hours ahead. When that time arrives, the
absolute error against the measured temperature is recorded. The sensor shows the mean over the last
24 hours. This shows whether the model still fits; a sustained rise is the trigger to look at
solar gain, wind or a changed installation.

## 6. Module interfaces (`core/`)

```python
# samples.py
@dataclass
class Sample: t: float; pond: float | None; outdoor: float | None; power: float | None; cover: bool
class PowerIntegrator:                     # step-function mean over an interval
    def add(self, t: float, value: float | None) -> None
    def mean(self, start: float, end: float) -> float | None
def to_quarters(series: dict[str, list[tuple[float, float | None]]], start: float, end: float,
                cover: bool = False) -> list[Sample]
def prune(samples: list[Sample], now: float, days: int = 42) -> list[Sample]

# model.py
DEFAULTS: ModelParams
def hourly(samples, tz: str, low_w: float, high_w: float) -> list[Hour]
def fit_slow(params, samples, now, tz, low_w, high_w) -> tuple[ModelParams, FitReport]
def fit_k(params, samples, now, tz, low_w, high_w, cover: bool) -> tuple[ModelParams, FitReport]
```

`FitReport` holds the number of hours used, the new and old values and why a fit was rejected; it is shown
in a diagnostic sensor attribute and in diagnostics.

## 7. Tests

- Step function, start factor and both cover states match hand calculations.
- `PowerIntegrator` and `to_quarters` with irregular updates, gaps and a DST change.
- `fit_slow` recovers known parameters from synthetic data with noise (±10 %).
- `fit_k` recovers a step change of `k` by −40 % within 7 simulated days (within 10 %).
- Fits reject out-of-bounds results and keep the previous values.
- Replay on an exported quarter-hour dataset of the reference installation (CSV in `tests/data`,
  anonymised to temperatures and power only) gives gains and `k` within 10 % of §2.

## 8. Out of scope

Solar gain, wind, rain and topping-up with tap water (later issue); more than one heat pump.

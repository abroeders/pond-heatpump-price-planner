# COP calculation

- Issue: #8
- Status: **draft**
- Date: 2026-11-17

## 1. Purpose

Show how efficient the heat pump really is, over periods long enough to be meaningful. Two independent
methods are used:
- **Flow method:** from the water flow and the temperature difference over the heat pump. Simple and live.
- **Pond method:** from the pond's own temperature curve. A check that needs no flow.

Both are broken down by outdoor temperature and by power level. They also check the heating gains of the
thermal model (#2), which the planner (#3) relies on.

## 2. Comparison on the reference data

Reference installation, 10-10 to 16-11-2026. "Low" < 600 W, "high" ≥ 600 W. The flow method excludes
the first 20 minutes after a start.

| Method | COP low | COP high | Ratio low/high | COP overall |
|---|---|---|---|---|
| Flow method (flow 3.0 m³/h) | 6.8 | 4.7 | 1.45 | 5.3 |
| Pond method (21 m³, loss fitted on off-hours) | 4.8 | 3.5 | 1.37 | 4.1 |
| Thermal model #2 (regression, × 24.4 kWh/K) | 5.4 | 3.4 | 1.60 | – |

| Outdoor (air inlet) | COP, flow method | Hours |
|---|---|---|
| < 5 °C | 5.0 | 98 |
| 5–10 °C | 5.2 | 169 |
| 10–15 °C | 5.6 | 139 |

Findings:

- **Low power is 1.4–1.6× as efficient as high power** in all three methods. That supports the planner's
  preference for long runs at low power.
- **The absolute COP differs between the methods** (4.1 to 5.3):
  - The flow method scales directly with the configured flow. 3.0 m³/h is the flow that reproduces the
    known 5.3; it is not measured.
  - The pond method depends on the fitted heat loss. Off-hours give 0.60 kW + 0.15 kW/K (mean 1.5 kW).
    The regression of #2 splits the loss differently: 0.14 kW + 0.22 kW/K.
  - Neither method is the "true" value. The integration shows both, so a drift in either one stands out.
- **Temperature resolution.** In the recorded history the water inlet and outlet temperatures are whole
  degrees, not 0.5 °C, while the difference is about 1–2 K. A COP per moment or per day is therefore
  meaningless (it jumps between ~1.5 and ~9). Only windows of 7 days or longer are shown.

## 3. Flow method

### 3.1 Calculation

Per state update, as a time-weighted sum:

```
heat_kW = flow_m3h × 1.163 × (T_water_out − T_water_in)
```

- Heat is counted only while `power > run_threshold` (default 100 W) and after `settle_minutes` (default 20)
  since the last start.
- Electrical energy comes from the energy counter (kWh, `total_increasing`), as the increase over exactly
  the same counted intervals.
  - Counter resets and decreases are ignored.
  - Without an energy sensor, power is integrated instead (§3.3).
- Heat and electricity are accumulated per hour into buckets: counted minutes, heat in kWh, electricity
  in kWh, mean power and mean air/outdoor temperature. These are stored with the samples of #2 (42 days).

### 3.2 Results

- **COP (window):** Σ heat ÷ Σ electricity over the last `window_days` (default 14, minimum 7).
- **COP (cumulative):** since the integration was set up (or reset by the re-learn button).
- **Breakdown by outdoor temperature:** < 5, 5–10, 10–15, ≥ 15 °C.
- **Breakdown by power level:** low and high, with the same thresholds as #2.
- **Hours per bin.** A bin with fewer than 24 counted hours is shown as unknown.

### 3.3 Options

| Option | Default | Notes |
|---|---|---|
| Water inlet / outlet temperature sensors | – | Required for this method |
| Energy sensor | – | Optional; otherwise the power sensor is integrated |
| Flow (m³/h) | 3.0 | Step 0.25; one step shifts the COP by ~9 % at 3 m³/h |
| Run threshold (W) | 100 | |
| Settle time (min) | 20 | |
| Window (days) | 14 | 7–42 |

## 4. Pond method

### 4.1 Calculation

- **Thermal capacity** `C = volume × 1.163 kWh/(m³·K)`; 21 m³ → 24.4 kWh/K.
- **Heat loss.** Fitted on hours with the heat pump off for the whole hour (the circulation pumps keep
  running), over the last `loss_days` (default 21):

  ```
  −C · dT/dt = a + b · (T_pond − T_outdoor)
  ```

  - `dT/dt` uses the centred hourly slope of #2.
  - The fit needs ≥ 48 off-hours. Otherwise the previous fit is kept, or the loss implied by the
    thermal model is used.
- **Heat of an on-hour:** `C · dT/dt + a + b · (T_pond − T_outdoor)`. This is the pond's rise plus the
  loss it had to make up.
- **COP** = Σ heat ÷ Σ electricity over the on-hours in the window. Hours that are partly on and partly
  off count with their electricity, so the start-up loss is included.

This is the issue's "heat rate while on minus cooling rate in the adjacent off-period". It uses a fitted
loss instead of the single neighbouring off-period, which is less noisy and needs no pairing of periods.

### 4.2 Options

| Option | Default |
|---|---|
| Pond volume (m³) | – (method disabled when empty) |
| Loss window (days) | 21 |

### 4.3 Limits

Solar gain on sunny days shows up as extra heat and makes the COP look better. Topping up with tap water
and rain do the opposite. Both average out partly over the window. The model issue for solar gain and
wind will also improve this method.

## 5. Model check

The ratio COP low / COP high of both methods is compared with the ratio of the model's heating gains
(#2), `gain_low / gain_high`. If the model differs by more than 25 % from both methods over a full window,
the diagnostic attribute `model_check` says so. The planner keeps using the model; this is only a
signal.

## 6. Entities (added to #5)

| Entity | State | Attributes |
|---|---|---|
| `sensor.<name>_cop_flow` | COP over the window | `cumulative`, `by_outdoor`, `by_power`, `hours`, `window_days`, `flow` |
| `sensor.<name>_cop_pond` | COP over the window | `by_outdoor`, `by_power`, `hours`, `loss_a_kw`, `loss_b_kw_per_k`, `capacity_kwh_per_k` |

- No state class `measurement` and no long-term statistics: these are rolling window values.
- Precision: 1 decimal.

## 7. Interface (`core/cop.py`)

```python
@dataclass
class CopBucket:
    t: float                    # hour start
    minutes: float; heat_kwh: float; elec_kwh: float
    power_w: float; outdoor: float | None
class FlowAccumulator:          # fed with state changes, yields hourly buckets
    def update(self, t, *, power=None, t_in=None, t_out=None, energy=None) -> None
    def close_hour(self, t) -> CopBucket | None
def cop_flow(buckets, now, window_days, low_w, high_w) -> CopResult
def fit_loss(samples, now, days, capacity) -> LossFit | None
def cop_pond(samples, loss, now, window_days, capacity, low_w, high_w) -> CopResult
```

## 8. Tests

- **`FlowAccumulator` timing:** settle time, the run threshold, a counter reset and gaps.
- **Synthetic data with 1 K quantisation:** the true COP of 5.0 is recovered within 5 % over 14 days;
  a daily COP would be off by more than 50 % (shows why there is no daily value).
- **`fit_loss`:** recovers `a` and `b` from synthetic off-periods with noise.
- **Reference dataset (§2):**
  - the flow method at 3.0 m³/h gives 5.3 ± 0.2;
  - the pond method gives 4.1 ± 0.3;
  - both have a ratio low/high between 1.3 and 1.7.

## 9. Out of scope

COP as a direct planner input; COP per moment or per day; flow measurement hardware; long-term statistics
for the COP sensors.

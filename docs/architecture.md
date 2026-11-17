# Architecture

This document describes how the integration is built. The diagrams are kept in sync with the code; each
section names the issue that introduced it. Design rationale lives in [`design/`](design/).

## 1. Overview

```mermaid
flowchart LR
    subgraph HA[Home Assistant]
        S1[pond temperature sensor]
        S2[outdoor temperature sensor]
        S3[heat pump power sensor]
        REC[(recorder)]
        ST[(.storage)]
    end
    subgraph INT[integration package]
        STORE[PlannerStore<br/>storage.py]
        HIST[RecorderHistory<br/>history.py]
        subgraph CORE[core — no Home Assistant imports]
            SAMP[samples.py]
            MODEL[model.py]
            LEARN[learning.py]
            SEED[seeding.py]
            TRACK[tracking.py]
            PRICES[prices.py<br/>timeseries.py]
            FC[forecasts.py]
            COSTS[costs.py]
            PLAN[planner.py]
            TUNE[tuning.py]
            COP[cop.py]
            SAFE[safety.py]
            SETP[setpoint.py]
        end
        CTL[HeatPumpController<br/>control.py]
    end
    S1 & S2 & S3 --> SAMP
    REC --> HIST
    HIST -- HistorySource --> SEED
    SEED --> STORE
    STORE <--> ST
    STORE --> LEARN
    LEARN --> MODEL
    SAMP --> LEARN
    PRICES & FC --> COSTS
    COSTS --> PLAN
    MODEL --> PLAN
    PLAN --> TUNE
    STORE --> TUNE
    LEARN --> COP
    MODEL --> COP
    PLAN --> SAFE
    SAFE --> CTL
    SETP --> CTL
    CTL --> HP[heat pump climate entity]
```

The integration is split in two layers:

- **`core/`** holds all computation. It is plain Python + numpy, tested on its own:
  - samples;
  - the thermal model;
  - learning;
  - seeding;
  - prediction tracking;
  - later the planner.
- **The integration package** connects the core to Home Assistant: state listeners, storage, the recorder,
  entities and services.

## 2. Design principles

| Principle / pattern | Where | Why |
|---|---|---|
| Single responsibility | one concern per module: model (`model.py`), learning (`learning.py`), seeding (`seeding.py`), tracking (`tracking.py`), persistence (`storage.py`), recorder access (`history.py`) | each part changes for one reason and is tested alone |
| Open/closed + **Strategy** | `Fitter` protocol with `SlowFit`, `CoolingFit` | a new fit (e.g. solar gain) is a new class, existing fits stay untouched |
| **Facade** | `Learner` runs the fits in order | the rest of the integration calls one method |
| Dependency inversion + **Adapter** | `seeding.seed()` depends on the `HistorySource` protocol; `RecorderHistory` adapts the recorder | the core never imports Home Assistant and is tested with a fake source |
| **Repository** | `PlannerStore` | one place that loads and saves samples and parameters |
| Liskov / immutability | fits return new `ModelParams` (via `copy()`), never mutate their input | fits can be chained and compared safely |
| Interface segregation | small protocols (`Fitter.fit`, `HistorySource.series`, `Planner.make_plan`, `AttributeParser.parse`) | implementations need only what they use |
| **Strategy** + **Chain of responsibility** | `AttributeParser` implementations (`DictListParser`, `PlainListParser`) tried in turn by `parse_intervals` | a new price format is a new parser; the planner never sees attribute formats |
| Open/closed + **Strategy** | `Planner` protocol, `DynamicProgrammingPlanner` | another optimiser can replace it without touching callers (the tuning takes any `Planner`) |
| **Strategy** | `SetpointStrategy` protocol, `OffsetSetpoint` | another heat pump can be controlled differently without touching the controller |
| Single responsibility | `SafetyGuard` decides, `OffsetSetpoint` translates, `HeatPumpController` sends and watches | decisions are tested without Home Assistant |
| Separation of cost and optimisation | `EnergyCosts` computes € per quarter and mode (solar surplus, feed-in, surcharge); the planner only minimises | solar, feed-in and surcharge change no planner code |

## 3. Thermal model and learning (#2)

### 3.1 Classes

```mermaid
classDiagram
    direction TB
    class Sample {
        +float t
        +Optional~float~ pond
        +Optional~float~ outdoor
        +Optional~float~ power
        +bool cover
        +to_list() list
        +from_list(row)$ Sample
    }
    class PowerIntegrator {
        +add(t, value)
        +mean(start, end) Optional~float~
        +prune(before)
    }
    class ModelParams {
        +dict power
        +dict gain
        +float k_open
        +Optional~float~ k_cover
        +float offset
        +float start_factor
        +k(cover) float
        +rate(mode) float
        +step(temp, mode, t_out, starting, cover) float
        +copy() ModelParams
        +to_dict() dict
        +from_dict(data)$ ModelParams
    }
    class ModeClassifier {
        +float low_w
        +float high_w
        +mode(power_w) Optional~str~
    }
    class Hour {
        +float t
        +float pond
        +float outdoor
        +float p_low
        +float p_high
        +bool cover
        +int local_hour
        +Optional~float~ slope
        +float w_low
        +float w_high
        +float w_delta
        +is_night bool
    }
    class LearningContext {
        +list~Sample~ samples
        +float now
        +str tz
        +ModeClassifier classifier
        +bool cover
        +hours() list~Hour~
        +window(days) list~Hour~
    }
    class Fitter {
        <<interface>>
        +str kind
        +fit(params, ctx) tuple
    }
    class SlowFit {
        +int days
        +int min_hours
        +float blend
        +fit(params, ctx) tuple
    }
    class CoolingFit {
        +int days
        +float half_life_days
        +fit(params, ctx) tuple
    }
    class Learner {
        +list~Fitter~ fitters
        +learn(params, ctx) tuple
    }
    class FitReport {
        +str kind
        +bool accepted
        +str reason
        +int hours
        +dict old
        +dict new
    }
    class PredictionTracker {
        +predict(target_t, temp)
        +observe(now, temp)
        +mean_abs_error() Optional~float~
    }
    class HistorySource {
        <<interface>>
        +series(entity_ids, start, end) dict
    }
    class RecorderHistory {
        +series(entity_ids, start, end) dict
    }
    class PlannerStore {
        +list~Sample~ samples
        +ModelParams params
        +async_load()
        +add(sample)
        +replace_samples(samples)
        +set_params(params)
        +async_save()
    }
    Fitter <|.. SlowFit
    Fitter <|.. CoolingFit
    Learner o-- "1..*" Fitter
    Learner ..> FitReport : collects
    Fitter ..> LearningContext : reads
    Fitter ..> ModelParams : returns new
    LearningContext o-- ModeClassifier
    LearningContext o-- "*" Sample
    LearningContext ..> Hour : aggregates
    HistorySource <|.. RecorderHistory
    PlannerStore o-- "*" Sample
    PlannerStore o-- "1" ModelParams
```

Module functions: `samples.to_quarters`, `prune`, `merge` (built on `PowerIntegrator`); `learning.hourly`;
`seeding.seed` (uses a `HistorySource`); `history.async_seed_store` (runs `seed` in the recorder executor).

### 3.2 Model step

One quarter hour (Δt = 0.25 h):

```
T' = T + Δt · (gain[m] · s · power[m] − k(cover) · (T − T_out) + offset)
```

`s` is `start_factor` in the first quarter after the heat pump was off, otherwise 1.

### 3.3 Seeding on first start

```mermaid
sequenceDiagram
    participant Setup as async_setup_entry
    participant Store as PlannerStore
    participant Fn as history.async_seed_store
    participant Seed as seeding.seed
    participant Hist as RecorderHistory
    participant Rec as Recorder
    Setup->>Store: async_load()
    Setup->>Fn: async_seed_store(hass, store, entities, now)
    alt needs_seed (fewer than 96 samples)
        Fn->>Seed: seed(samples, RecorderHistory, entities, now) in recorder executor
        Seed->>Hist: series(ids, now − 42 d, now)
        Hist->>Rec: get_significant_states(...)
        Rec-->>Hist: states
        Hist-->>Seed: (epoch, value) lists
        Seed->>Seed: to_quarters, merge (existing win), prune
        Seed-->>Fn: SeedResult(samples, added)
        Fn->>Store: replace_samples(samples) → delayed save
    else enough samples
        Fn-->>Setup: 0
    end
```

### 3.4 Nightly learning

```mermaid
sequenceDiagram
    participant Timer as Daily timer (03:30 local)
    participant Store as PlannerStore
    participant L as Learner
    participant Ctx as LearningContext
    participant Slow as SlowFit
    participant Cool as CoolingFit
    Timer->>Ctx: LearningContext(store.samples, now, tz, classifier, cover)
    Timer->>L: learn(store.params, ctx)
    L->>Slow: fit(params, ctx)
    Slow->>Ctx: window(28 d)
    Ctx->>Ctx: hours() computed once (hourly aggregate)
    Slow-->>L: params′, FitReport
    L->>Cool: fit(params′, ctx)
    Cool->>Ctx: window(7 d) → night hours, same cover state
    Cool-->>L: params″, FitReport
    L-->>Timer: params″, [reports]
    Timer->>Store: set_params(params″)
```

The timer and the wiring to the entities are added with the coordinator (#4, #5).

### 3.5 Hourly aggregation and slope window

```mermaid
flowchart LR
    Q[quarter samples] --> H[hourly means:<br/>pond, outdoor,<br/>p_low, p_high]
    H --> W["window h−2 … h+2<br/>weights ⅛ ¼ ¼ ¼ ⅛"]
    W --> SL["slope = (T[h+2] − T[h−2]) / 4 h"]
    W --> RG[w_low, w_high, w_delta]
    SL & RG --> FIT[least squares]
```

The slope and the regressors cover the same interval. With only the middle hour as regressor, the gains
come out ~30 % too low (errors in variables). See the design of #2, §2.

## 4. Planner (#3)

### 4.1 Classes

```mermaid
classDiagram
    direction TB
    class Interval {
        +float start
        +float end
        +float value
    }
    class AttributeParser {
        <<interface>>
        +parse(attributes, tz) list
    }
    class DictListParser {
        +tuple keys
        +tuple value_keys
        +parse(attributes, tz) list
    }
    class PlainListParser {
        +parse(attributes, tz) list
    }
    class PriceTransform {
        +float multiplier
        +float addition
        +apply(value) float
    }
    class OutdoorForecast {
        +list points
        +quarters(start, n, measured) list
    }
    class SolarSurplus {
        +float base_load_kw
        +quarters(start, n, measured_kw, forecast, forecast_now_kw) list
    }
    class EnergyCosts {
        +list price
        +Optional~list~ feed_in
        +Optional~list~ surplus_kw
        +float expensive_surcharge
        +planning_prices() ndarray
        +matrix(params, planning) ndarray
    }
    class PlanRequest {
        +float start
        +float pond
        +str mode_now
        +float target
        +float band
        +ModelParams params
        +list outdoor
        +EnergyCosts costs
        +float margin
        +bool cover
        +float start_penalty
        +bool allow_high
        +quarters int
    }
    class Plan {
        +list modes
        +list temps
        +list prices
        +float energy_kwh
        +float cost
        +int starts
        +float expensive_share
        +Optional~float~ next_start
        +Optional~float~ next_stop
        +mode str
    }
    class Planner {
        <<interface>>
        +make_plan(request) Plan
    }
    class DynamicProgrammingPlanner {
        +make_plan(request) Plan
    }
    class TuningResult {
        +float surcharge
        +dict costs
        +float days
        +str reason
    }
    AttributeParser <|.. DictListParser
    AttributeParser <|.. PlainListParser
    AttributeParser ..> Interval : points → intervals
    SolarSurplus ..> Interval : forecast
    Planner <|.. DynamicProgrammingPlanner
    DynamicProgrammingPlanner ..> PlanRequest : reads
    DynamicProgrammingPlanner ..> Plan : creates
    PlanRequest o-- EnergyCosts
    PlanRequest o-- ModelParams
    TuningResult <.. Planner : tune_surcharge replays with
```

Module functions: `parse_intervals` (tries the parsers in turn), `quarter_values`, `close_intervals`,
`solar_intervals`, `surplus_now`, `summarize`, `tune_surcharge`.

### 4.2 Planning cycle (core part)

```mermaid
sequenceDiagram
    participant Caller as coordinator (#4, #5)
    participant Prices as prices.parse_intervals
    participant TS as timeseries.quarter_values
    participant FC as OutdoorForecast / SolarSurplus
    participant Costs as EnergyCosts
    participant DP as DynamicProgrammingPlanner
    Caller->>Prices: price sensor attributes (+ forecast sensor)
    Prices-->>Caller: intervals
    Caller->>TS: intervals → price per quarter, PriceTransform
    Caller->>FC: weather forecast, outdoor sensor, PV forecast, surplus sensor
    FC-->>Caller: outdoor and surplus per quarter
    Caller->>Costs: EnergyCosts(price, feed_in, surplus, surcharge)
    Caller->>DP: make_plan(PlanRequest)
    DP->>Costs: matrix(params, planning=True) and matrix(params)
    DP->>DP: backward induction over grid × previous mode
    DP->>DP: forward read-out from the measured pond temperature
    DP-->>Caller: Plan (only the first quarter is executed)
```

### 4.3 Dynamic programming

```mermaid
flowchart TB
    T["for t = N−1 … 0"] --> P["for previous mode p, next mode m"]
    P --> S["T′ = step(grid, m, outdoor[t], starting = p off and m on)"]
    S --> C["cost = energy[t, m] (+ surcharge) + start penalty + band penalty(T′) + V[t+1, m](T′)"]
    C --> M["V[t, p] = min over m; policy[t, p] = argmin"]
    M --> T
    V0["V[N] = −(T − target) · heat value"] --> T
```

### 4.4 Nightly surcharge tuning

```mermaid
sequenceDiagram
    participant Timer as Daily timer
    participant Tune as tune_surcharge
    participant DP as Planner
    Timer->>Tune: samples (14 days, with prices), params, target, band
    loop candidate in 0, 0.15, 0.30, 0.50, 1.00 €/kWh
        loop every hour of the window
            Tune->>DP: make_plan(prices known at that time, surcharge)
            DP-->>Tune: plan
            Tune->>Tune: execute 4 quarters in the model, add real cost
        end
        Tune->>Tune: reject if the pond left the band
    end
    Tune-->>Timer: TuningResult (lowest real cost, ties: smallest)
```

## 5. COP, heat loss and thermal power (#8)

Formulas: [`cop.md`](cop.md).

### 5.1 Classes

```mermaid
classDiagram
    direction TB
    class FlowAccumulator {
        +float run_threshold_w
        +float settle_s
        +update(t, power, t_in, t_out, outdoor, energy)
        +close_hour(t) Optional~CopBucket~
    }
    class CopBucket {
        +float t
        +float seconds
        +float heat_per_flow_kwh
        +float elec_kwh
        +power_w Optional~float~
        +outdoor Optional~float~
        +hours float
        +to_list() list
        +from_list(row)$ CopBucket
    }
    class LossFit {
        +float a_kw
        +float b_kw_per_k
        +int hours
        +loss_kw(delta) float
    }
    class CopResult {
        +Optional~float~ cop
        +float hours
        +dict by_outdoor
        +dict by_power
        +dict hours_by_outdoor
        +dict hours_by_power
    }
    class Hour {
        <<from learning.py>>
    }
    class ModelParams {
        <<from model.py>>
    }
    FlowAccumulator ..> CopBucket : creates per hour
    CopBucket ..> CopResult : cop_flow
    Hour ..> LossFit : fit_loss
    Hour ..> CopResult : cop_pond
    LossFit ..> CopResult : cop_pond
    CopResult ..> CopResult : combine(method)
    ModelParams ..> CopResult : model_check
```

Module functions: `capacity_kwh_per_k`, `heat_loss_w_per_k`, `thermal_power_w` (from `ModelParams`),
`cop_flow`, `fit_loss`, `cop_pond`, `combine` (flow, pond or average), `model_check`.

### 5.2 Flow method: from state changes to COP

```mermaid
sequenceDiagram
    participant HA as state listeners (#5)
    participant Acc as FlowAccumulator
    participant Store as PlannerStore
    participant Calc as cop_flow / cop_pond / combine
    HA->>Acc: update(t, power / t_in / t_out / outdoor / energy)
    Acc->>Acc: integrate the previous state up to t (step function)
    Acc->>Acc: count only if running and settled, split counter increases
    HA->>Acc: close_hour(t) at every full hour
    Acc-->>HA: CopBucket of the past hour
    HA->>Store: keep bucket (42 days)
    HA->>Calc: cop_flow(buckets, flow, now, window)
    HA->>Calc: fit_loss(hours, capacity), cop_pond(hours, loss, capacity, now, window)
    HA->>Calc: combine(method, flow result, pond result)
    Calc-->>HA: CopResult for the sensors
```

### 5.3 Counting state of the flow method

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Settling: power above run threshold
    Settling --> Counting: settle time passed and both water temperatures known
    Settling --> Idle: power below run threshold
    Counting --> Idle: power below run threshold
    Counting --> Counting: update (integrate heat and electricity)
```

## 6. Control and safety (#4)

Design: [`design/2026-11-17-control-and-safety.md`](design/2026-11-17-control-and-safety.md).

### 6.1 Classes

```mermaid
classDiagram
    direction LR
    class SafetyGuard {
        +SafetySettings settings
        -set _active
        +decide(plan_mode, pond, pond_age, target, band, allow_high, previous) Decision
    }
    class SafetySettings {
        +float far_below
        +float hysteresis
        +float stale_after
    }
    class Decision {
        +str mode
        +str reason
    }
    class SetpointStrategy {
        <<interface>>
        +setpoint(mode, inlet, pond, min_temp, max_temp, step) float
    }
    class OffsetSetpoint {
        +dict offsets
        +setpoint(mode, inlet, pond, min_temp, max_temp, step) float
    }
    class MismatchTracker {
        +float grace
        +float repair_after
        +applied(mode, now)
        +observe(measured, now) tuple
    }
    class HeatPumpController {
        +str climate_entity
        +setpoint_for(decision, inlet, pond) Optional~float~
        +async_apply(decision, inlet, pond, control, now) ApplyResult
        +check_following(measured_mode, now) bool
    }
    class ApplyResult {
        +Optional~float~ setpoint
        +bool sent
        +str reason
    }
    SafetyGuard o-- SafetySettings
    SafetyGuard ..> Decision : returns
    SetpointStrategy <|.. OffsetSetpoint
    HeatPumpController o-- SetpointStrategy
    HeatPumpController o-- MismatchTracker
    HeatPumpController ..> ApplyResult : returns
    HeatPumpController ..> Decision : applies
```

### 6.2 Safety rules

```mermaid
stateDiagram-v2
    [*] --> Plan
    Plan --> BelowBand: pond < target − band
    BelowBand --> FarBelow: pond < target − band − 0.3
    FarBelow --> BelowBand: pond ≥ target − band − 0.25
    BelowBand --> Plan: pond ≥ target − band + 0.05
    Plan --> AboveBand: pond > target + band
    AboveBand --> Plan: pond ≤ target + band − 0.05
    Plan --> NoData: pond unknown > 30 min
    NoData --> Plan: pond known
    Plan --> NoPlan: no valid plan
    NoPlan --> Plan: plan available
```

### 6.3 Applying a decision

```mermaid
sequenceDiagram
    participant Co as coordinator (#5)
    participant Guard as SafetyGuard
    participant Ctl as HeatPumpController
    participant SP as OffsetSetpoint
    participant HP as climate entity
    participant IR as issue registry
    Co->>Guard: decide(plan mode, pond, ...)
    Guard-->>Co: Decision
    Co->>Ctl: async_apply(decision, inlet, pond, control, now)
    Ctl->>SP: setpoint(mode, inlet, pond, min, max, step)
    SP-->>Ctl: setpoint
    alt dry run, HVAC off or unavailable
        Ctl-->>Co: ApplyResult(setpoint, sent=false, reason)
    else setpoint differs
        Ctl->>HP: climate.set_temperature
        Ctl-->>Co: ApplyResult(setpoint, sent=true)
    end
    Co->>Ctl: check_following(measured mode, now)
    opt no follow for 2 h
        Ctl->>IR: create repair issue
    end
```

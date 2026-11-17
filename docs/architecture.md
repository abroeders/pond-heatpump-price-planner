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
        end
    end
    S1 & S2 & S3 --> SAMP
    REC --> HIST
    HIST -- HistorySource --> SEED
    SEED --> STORE
    STORE <--> ST
    STORE --> LEARN
    LEARN --> MODEL
    SAMP --> LEARN
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
| Interface segregation | small protocols (`Fitter.fit`, `HistorySource.series`) | implementations need only what they use |

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

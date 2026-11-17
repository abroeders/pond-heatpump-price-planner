# How it works

The planner predicts the pond temperature with a model it learns itself. It chooses for every quarter hour
of the next 24–36 hours whether the heat pump is off, runs at low power or at high power, so that the pond
stays in its band at the lowest cost. Every quarter it plans again with fresh measurements and executes only
the first quarter. Safety rules check every decision before it reaches the heat pump.

## 1. In short

- **Low power is cheaper per unit of heat.** On the reference pond low power (≈ 400 W) delivers about
  1.45× as much heat per kWh as high power (≈ 900 W). The planner therefore prefers long runs at low power.
- **The pond is a heat store.** A pond of 21 m³ needs 24 kWh of heat per degree and cools by only about
  0.07–0.1 K per hour in November. Skipping a few expensive hours costs a few tenths of a degree, which the
  planner makes up in cheaper quarters.
- **Expensive quarters are avoided when that pays off.** Sometimes running through an expensive quarter is
  the cheapest option, for example when the alternative is preheating at high power, which is less
  efficient. The planner optimises on real cost.
- **It learns your pond.** Every night it updates how fast the pond warms and cools. An insulation cover in
  winter shows up within a week, even without telling it.

## 2. The thermal model

Per quarter hour ($\Delta t$ = 0.25 h), with mode $m \in \{\text{off}, \text{low}, \text{high}\}$:

$$
T_{t+1} = T_t + \Delta t \cdot \Big( g_m \cdot s \cdot P_m \;-\; k \cdot (T_t - T_{out,t}) \;+\; c \Big)
$$

| Symbol | Meaning | Reference pond |
|---|---|---|
| $P_m$ | mean electrical power in mode $m$ (kW) | low 0.38, high 0.92 |
| $g_m$ | heating gain (K/h per kW) | low 0.30, high 0.21 |
| $s$ | start factor: 0.75 in the first quarter after off, else 1 | 0.75 |
| $k$ | cooling coefficient (1/h); one value with and one without the insulation cover | 0.012 |
| $c$ | constant offset (K/h): pumps, evaporation, ground | −0.0115 |
| $T_{out}$ | outdoor temperature (weather forecast over the horizon) | |

Until the integration has its own data, these reference values are the defaults.

## 3. Learning

The integration stores one sample per quarter hour for 42 days: pond temperature, outdoor temperature,
mean heat pump power, cover state and price. On first start it fills this from the recorder.

The fits use hourly aggregates. The pond temperature changes slowly and is measured with limited
resolution, so the slope of hour $h$ is taken over four hours:

$$
\frac{dT}{dt}\Big|_h = \frac{\bar T(h+2) - \bar T(h-2)}{4\ \text{h}}
$$

Power and temperature difference are averaged over the same interval (weights ⅛, ¼, ¼, ¼, ⅛). Using only
the middle hour would underestimate the gains by about 30 %.

**Every night at 03:30:**

| Fit | Window | What | How |
|---|---|---|---|
| Slow fit | 28 days | $g_{low}$, $g_{high}$, $c$, mode powers | least squares; results outside sanity bounds are rejected; new values move 30 % towards the fit |
| Cooling fit | 7 days, night hours 19–07 | $k$ for the current cover state | weighted least squares, half-life 3 days, gains fixed |

On the reference data the cooling estimate varies by about 15 % from day to day. A cover that lowers the
cooling by 30–50 % is therefore clear within 3–5 days. The *Insulation cover* switch makes the switch-over
immediate.

## 4. Planning

### Inputs per quarter

- **Prices:** known prices, then the price forecast, converted to the effective price per kWh.
- **Outdoor temperature:** the hourly forecast, corrected towards the outdoor sensor. The correction fades
  out over 6 h.
- **Solar surplus (optional):** the current quarter from the surplus sensor, later quarters from the solar
  forecast. The forecast is scaled to the measurement, and the scaling fades out over 2 h.

### Cost per quarter

For mode $m$ with power $P_m$, solar surplus $S$, purchase price $p$ and feed-in value $f$:

$$
\text{cost}_m = \Delta t \cdot \big( \min(P_m, S) \cdot f + (P_m - \min(P_m, S)) \cdot p \big)
$$

### Optimisation

The planner minimises, over all mode sequences $m_0 \dots m_{N-1}$:

$$
\sum_t \Big( \text{cost}_{m_t,t} + \text{start penalty} \cdot [\text{start at } t] + w_1 d_t + w_2 d_t^2 \Big)
\;-\; (T_N - T_{target}) \cdot v
$$

- **Band penalty:** $d_t$ is how far the predicted temperature is outside the inner band
  $[T_{target} - \text{band} + \text{margin},\; T_{target} + \text{band} - \text{margin}]$, with steep
  weights ($w_1$ = 5 €/K, $w_2$ = 500 €/K²). The band is a soft limit, so there is always a plan.
- **Heat value:** $v$ is the value of heat left in the pond at the end (mean price × low power ÷ low heating
  rate). It stops the plan from emptying the pond just before the horizon.

The minimum is found with dynamic programming over a temperature grid (0.02 K) and the previous mode,
backwards from the horizon. The plan is then read forwards from the measured pond temperature. A 36-hour
plan takes 25–45 ms.

### Expensive-quarter surcharge

A planning-only surcharge on the most expensive 25 % of the quarters of each day. It makes the planner avoid
them more strongly. Every night the integration replays the last 14 days for 0, 0.15, 0.30, 0.50 and 1.00
€/kWh:
- planning every hour with only the prices known at that time;
- choosing the surcharge with the lowest real cost;
- with near-equal cost the smallest one wins;
- candidates that let the pond leave the band are rejected.

On the reference pond this was 0 every time.

## 5. Safety and control

Before the plan reaches the heat pump, these rules apply in order:

| Situation | Mode |
|---|---|
| no pond temperature for 30 min | low |
| more than 0.3 K below the band | high (low if high is not allowed) |
| below the band | at least low |
| above the band | off |
| no plan | simple thermostat |
| otherwise | the plan |

The limits release with 0.05 K hysteresis.

**Setpoint.** The mode becomes a setpoint relative to the heat pump's own water inlet temperature:

$$
\text{setpoint} = \text{round}(T_{inlet}) + \text{offset}_m
$$

The defaults are off −2 K, low 0 K, high +1 K. The setpoint is only sent when it changes, and again when the
inlet temperature changes.

**Checks.**
- If the heat pump does not follow within 30 minutes, the mode sensor shows `mismatch`. After two hours a
  repair issue appears.
- If the heat pump's own HVAC mode is off, the planner leaves it off.

## 6. What it does not do

- It does not turn your other automations off.
- It does not change the heat pump's HVAC mode or preset.
- It does not coordinate with a home battery: the effective price is taken as given.

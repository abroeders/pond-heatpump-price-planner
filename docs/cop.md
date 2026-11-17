# COP, heat loss and thermal power

The integration shows how efficiently the heat pump heats the pond. Two independent methods calculate the
COP (coefficient of performance: heat delivered ÷ electricity used). You choose which one the COP sensor
shows: method 1, method 2, or the average of both. Both methods are always available as attributes.

## Why only over long windows

The heat pump reports its water temperatures in steps of 0.5 °C, and Home Assistant often records them as
whole degrees. The difference between water in and water out is only about 1–2 K. A single step therefore
changes the heat by tens of percent, and a COP per moment or per day jumps between roughly 1.5 and 9.

Over a week or more the steps average out. The COP is therefore always calculated over a rolling window of
at least 7 days (default 14), never per moment or per day.

## Symbols

| Symbol | Meaning | Unit |
|---|---|---|
| $\dot V$ | water flow through the heat pump (setting) | m³/h |
| $V$ | pond volume (setting) | m³ |
| $c_w$ | volumetric heat capacity of water: 1.163 | kWh/(m³·K) |
| $C = V \cdot c_w$ | thermal capacity of the pond | kWh/K |
| $T_{in}, T_{out}$ | water temperature into / out of the heat pump | °C |
| $T_p, T_o$ | pond temperature / outdoor temperature | °C |
| $P$ | electrical power of the heat pump | kW |
| $E$ | electrical energy (energy counter) | kWh |
| $Q$ | heat delivered to the pond | kWh |

## Method 1: flow (live)

The heat in the water that flows through the heat pump:

$$
\dot Q(t) = \dot V \cdot c_w \cdot \big(T_{out}(t) - T_{in}(t)\big) \qquad [\text{kW}]
$$

Heat and electricity are only counted while the heat pump is running and has settled:

$$
\text{counted}(t) \iff P(t) > P_{run} \;\wedge\; t - t_{start} \ge t_{settle}
$$

The defaults are $P_{run}$ = 100 W and $t_{settle}$ = 20 min. Right after a start the water temperatures
are not stable yet.

$$
Q_1 = \int_{\text{counted}} \dot Q(t)\,dt \qquad
E_1 = \int_{\text{counted}} dE \qquad
\mathrm{COP}_1 = \frac{Q_1}{E_1}
$$

The temperatures and the power are step functions: each value holds until the next update. The energy
counter only changes now and then. An increase $\Delta E$ between two counter updates is split over that
time in proportion to the counted share:

$$
E_1 \mathrel{+}= \Delta E \cdot \frac{t_{\text{counted}}}{t_{\text{total}}}
$$

A counter reset is skipped. Without an energy sensor, $E = \int P\,dt$ is used.

The integration stores the heat per unit of flow, $Q_1 / \dot V$, per hour. A changed flow setting
therefore applies to the whole window at once.

**Sensitivity.** $\mathrm{COP}_1$ is proportional to $\dot V$. At 3 m³/h a change of 0.25 m³/h moves
the COP by about 8 %. The flow is rarely measured, so method 2 serves as a check.

## Method 2: the pond itself (check, no flow needed)

The pond is a large heat store. The heat delivered follows from how fast it warms up, plus the heat it
loses at the same time.

### Heat loss

The loss is fitted on hours with the heat pump off for the whole slope window (the circulation pumps keep
running), over the last 21 days:

$$
-C \cdot \frac{dT_p}{dt} = a + b \cdot (T_p - T_o)
$$

- $a$ (kW) is the constant part: evaporation, ground, pumps;
- $b$ (kW/K) is the part that grows with the difference to the outdoor air.

### Heat per hour

For an hour with the heat pump on:

$$
Q_h = C \cdot \frac{dT_p}{dt} + a + b \cdot (T_p - T_o) \qquad [\text{kWh in one hour}]
$$

$$
\mathrm{COP}_2 = \frac{\sum_h Q_h}{\sum_h E_h}
$$

### Slope and averaging window

The pond temperature changes slowly and is measured with limited resolution. The slope of hour $h$ is
therefore taken over four hours, from the middle of hour $h-2$ to the middle of hour $h+2$:

$$
\frac{dT_p}{dt}\Big|_h = \frac{\bar T_p(h+2) - \bar T_p(h-2)}{4\ \text{h}}
$$

Here $\bar T_p$ is the hourly mean. Electricity and temperature difference are averaged over exactly the
same interval, with weights ⅛, ¼, ¼, ¼, ⅛ for hours $h-2 \dots h+2$:

$$
E_h = \sum_{d=-2}^{2} w_d \, \bar P(h+d) \cdot 1\,\text{h}, \qquad
(T_p - T_o)_h = \sum_{d=-2}^{2} w_d \, \big(\bar T_p - \bar T_o\big)(h+d)
$$

Using only the middle hour would make the result about 30 % too low. Start-up losses are included,
because hours that are partly on count with their full electricity.

## Average of both

$$
\mathrm{COP}_{avg} = \tfrac12 \left(\mathrm{COP}_1 + \mathrm{COP}_2\right)
$$

- The same holds for each breakdown (outdoor temperature, power level).
- Where one method has no value, the other one is used.

## Breakdowns

| Breakdown | Groups |
|---|---|
| Outdoor temperature | < 5 °C, 5–10 °C, 10–15 °C, ≥ 15 °C (method 1 uses the heat pump's air inlet sensor if configured, method 2 the outdoor sensor) |
| Power level | low (< 650 W), high (≥ 650 W), the thresholds of the thermal model |

A group with fewer than 24 hours shows no value. Each group shows its number of hours.

## Heat loss coefficient (W/K)

How much heat the pond loses per kelvin of difference with the outdoor air. It comes from the thermal model
that the planner uses: $k$ is the cooling coefficient in 1/h, learned every night, with a separate value
when the insulation cover is on.

$$
U = k \cdot C \cdot 1000 \qquad [\text{W/K}]
$$

The attributes show the loss fit of method 2: $b \cdot 1000$ W/K and $a \cdot 1000$ W. The two describe the
same loss but split it differently into a constant and a temperature-dependent part. Over the usual
temperature range they give a similar total.

## Thermal power (W)

The heat the heat pump delivers to the pond now, from the thermal model:

$$
\dot Q_m = g_m \cdot P_m \cdot C \cdot 1000 \qquad [\text{W}]
$$

- $g_m$ is the learned heating gain of the current mode (K/h per kW);
- $P_m$ is its mean power;
- off gives 0.

The flow-based value is only shown as the mean over the counted running time in the window (attribute):

$$
\overline{\dot Q}_1 = \frac{Q_1}{t_{\text{counted}}}
$$

A flow-based value per moment would jump in steps of $\dot V \cdot c_w \cdot 1\,\text{K}$, about 3.5 kW at
3 m³/h.

## Model check

The planner relies on the heating gains $g_{low}$ and $g_{high}$ of the thermal model. Their ratio is the
model's view of how much more efficient low power is. It is compared with what the COP methods measure:

$$
r_{model} = \frac{g_{low}}{g_{high}}, \qquad r_{method} = \frac{\mathrm{COP}_{low}}{\mathrm{COP}_{high}}
$$

If $r_{model}$ differs by more than 25 % from every method, the diagnostic attribute `model_check` says so.

## Reference values

Reference pond: 21 m³, 10-10 to 16-11-2026, flow set to 3.0 m³/h.

| | COP | low | high | < 5 °C | 5–10 °C | 10–15 °C |
|---|---|---|---|---|---|---|
| Method 1 (flow) | 5.3 | 7.0 | 4.6 | 4.9 | 5.4 | 5.7 |
| Method 2 (pond) | 5.5 | 6.9 | 5.0 | | | |

Heat loss: model ≈ 295 W/K; loss fit $a$ ≈ 630 W, $b$ ≈ 220 W/K. Thermal power: ≈ 2.8 kW in low mode,
≈ 4.7 kW in high mode.

# Price sensor for a day/night tariff

Without a dynamic tariff you can still use the planner. Most fixed contracts have two prices: a normal
(peak) tariff during the day and a lower off-peak tariff at night and in the weekend. With a small template
sensor, Home Assistant publishes these prices for today and tomorrow in a format the integration
recognises. The planner then moves heating to the off-peak hours whenever the pond allows it.

## 1. The template sensor

Home Assistant's template helper in the UI cannot publish attributes, so this is done in YAML. Add it to
`configuration.yaml` (or to a package file), using the *File editor* or *Studio Code Server* add-on.

```yaml
template:
  - trigger:
      - trigger: time_pattern
        minutes: "/15"
      - trigger: homeassistant
        event: start
    variables:
      peak: 0.31            # normal tariff, € per kWh, including taxes
      offpeak: 0.25         # off-peak tariff, € per kWh, including taxes
      offpeak_from: 23      # off-peak starts at this hour (local time)
      offpeak_until: 7      # and ends at this hour
      weekend_offpeak: true # Saturday and Sunday off-peak all day
      holidays: []          # dates that are off-peak all day, e.g. ["2026-12-25", "2026-12-26"]
    sensor:
      - name: "Electricity price day night"
        unique_id: electricity_price_day_night
        unit_of_measurement: "EUR/kWh"
        state: >
          {% set t = now() %}
          {% set low = (weekend_offpeak and t.weekday() >= 5)
                       or t.date().isoformat() in holidays
                       or t.hour >= offpeak_from or t.hour < offpeak_until %}
          {{ offpeak if low else peak }}
        attributes:
          raw_today: >
            {% set ns = namespace(items=[]) %}
            {% set day = today_at('00:00') %}
            {% set t0 = as_timestamp(day) %}
            {% set hours = ((as_timestamp(day + timedelta(days=1)) - t0) / 3600) | round | int %}
            {% for h in range(hours) %}
              {% set start = as_local(as_datetime(t0 + h * 3600)) %}
              {% set low = (weekend_offpeak and start.weekday() >= 5)
                           or start.date().isoformat() in holidays
                           or start.hour >= offpeak_from or start.hour < offpeak_until %}
              {% set ns.items = ns.items + [{'start': start.isoformat(),
                                            'end': as_local(as_datetime(t0 + h * 3600 + 3600)).isoformat(),
                                            'value': offpeak if low else peak}] %}
            {% endfor %}
            {{ ns.items }}
          raw_tomorrow: >
            {% set ns = namespace(items=[]) %}
            {% set day = today_at('00:00') + timedelta(days=1) %}
            {% set t0 = as_timestamp(day) %}
            {% set hours = ((as_timestamp(day + timedelta(days=1)) - t0) / 3600) | round | int %}
            {% for h in range(hours) %}
              {% set start = as_local(as_datetime(t0 + h * 3600)) %}
              {% set low = (weekend_offpeak and start.weekday() >= 5)
                           or start.date().isoformat() in holidays
                           or start.hour >= offpeak_from or start.hour < offpeak_until %}
              {% set ns.items = ns.items + [{'start': start.isoformat(),
                                            'end': as_local(as_datetime(t0 + h * 3600 + 3600)).isoformat(),
                                            'value': offpeak if low else peak}] %}
            {% endfor %}
            {{ ns.items }}
```

**Adjust it to your contract:**

| Setting | Meaning |
|---|---|
| `peak`, `offpeak` | Your two prices in € per kWh, **including** energy tax and VAT (the price on your bill per kWh) |
| `offpeak_from`, `offpeak_until` | The hours (0–23, local time) at which the off-peak tariff starts and ends. 23 and 7 is common in the Netherlands; some grid operators use 21 and 7 |
| `weekend_offpeak` | `true` if Saturday and Sunday are off-peak all day |
| `holidays` | Dates that are off-peak all day, as `"YYYY-MM-DD"` |

Then restart Home Assistant, or reload *Template entities* (*Developer tools → YAML*).

## 2. Check the sensor

1. *Developer tools → States*: `sensor.electricity_price_day_night` shows the current price.
2. Its attributes contain `raw_today` and `raw_tomorrow`, each a list of 24 entries with `start`, `end` and
   `value` (23 or 25 on the days the clock changes).

Then select this sensor in the integration as the **Price sensor** (step *Prices and weather*, or
*Reconfigure*). If the integration refuses it ("no price list in a recognised format"), the attributes are
not lists: check the indentation of the YAML.

## 3. Price options

The template already gives all-in prices, so keep the price options of the integration at their defaults:

| Option | Value |
|---|---|
| Price multiplier | 1 |
| Price addition | 0 |

Leave the price forecast sensor empty: the template publishes tomorrow's prices already, and the planner
looks 24–48 hours ahead with them.

## 4. What the planner does with two tariffs

- **Within the band:** it heats in the off-peak hours as much as the band allows, and keeps the heat pump
  off during the day when the pond can coast.
- **Low power still pays off most.** With two prices the difference is small (often 15–25 %), and low power
  is about 1.45× as efficient as high power. The planner will not switch to high power just to use the
  night tariff, unless the band leaves no other option.
- **A wider band** (for example 0.4 °C instead of 0.25 °C) lets it shift more heating into the night. The
  savings from a wider band are larger with a day/night tariff than with a dynamic tariff, because every
  night is cheap.

## 5. Daylight saving time

The template counts real hours from midnight to the next midnight. On the day the clock goes forward the
lists have 23 entries, on the day it goes back 25, without gaps, so the planner always gets a continuous
price list.

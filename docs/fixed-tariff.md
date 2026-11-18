# Price sensor for a day/night tariff

Without a dynamic tariff you can still use the planner. Most fixed contracts have two prices: a normal
(peak) tariff during the day and a lower off-peak tariff at night and in the weekend. With a small template
sensor, Home Assistant publishes these prices for today and tomorrow in a format the integration
recognises. The planner then moves heating to the off-peak hours whenever the pond allows it.

## 1. The template sensor

Home Assistant's template helper in the UI cannot publish attributes, so this is done in YAML, in two files.
Use the *File editor* or *Studio Code Server* add-on.

The defaults follow the Dutch rules:
- **Weekdays:** off-peak from 23:00 to 7:00.
- **All day:** Saturdays, Sundays and recognised public holidays.

The holidays are calculated for every year:
- **Fixed dates:** New Year's Day, King's Day (26 April when 27 April is a Sunday), Christmas Day and Boxing
  Day.
- **From the Easter date:** Easter Monday, Ascension Day and Whit Monday. Easter Sunday and Whit Sunday are
  Sundays anyway.

### 1a. The tariff rule: `custom_templates/day_night_tariff.jinja`

Create the folder `custom_templates` next to `configuration.yaml` and put this file in it:

```jinja
{# Off-peak (day/night) tariff rule. offpeak(t, ...) returns "true" when time t falls in the off-peak tariff. #}
{% macro easter(year) -%}
  {%- set a = year % 19 %}{% set b = year // 100 %}{% set c = year % 100 %}
  {%- set d = b // 4 %}{% set e = b % 4 %}{% set f = (b + 8) // 25 %}{% set g = (b - f + 1) // 3 %}
  {%- set h = (19 * a + b - d - g + 15) % 30 %}{% set i = c // 4 %}{% set k = c % 4 %}
  {%- set l = (32 + 2 * e + 2 * i - h - k) % 7 %}{% set m = (a + 11 * h + 22 * l) // 451 %}
  {%- set n = h + l - 7 * m + 114 -%}
  {{ '%04d-%02d-%02d' | format(year, n // 31, n % 31 + 1) }}
{%- endmacro %}

{% macro holidays(year) -%}
  {%- set e = as_datetime(easter(year)) -%}
  {%- set kings = 26 if as_datetime('%04d-04-27' | format(year)).weekday() == 6 else 27 -%}
  {{ [
    '%04d-01-01' | format(year),
    (e + timedelta(days=1)).date().isoformat(),
    '%04d-04-%02d' | format(year, kings),
    (e + timedelta(days=39)).date().isoformat(),
    (e + timedelta(days=50)).date().isoformat(),
    '%04d-12-25' | format(year),
    '%04d-12-26' | format(year),
  ] | join(',') }}
{%- endmacro %}

{% macro offpeak(t, offpeak_from=23, offpeak_until=7, extra_days=[]) -%}
  {%- set day = t.date().isoformat() -%}
  {{ 'true' if t.weekday() >= 5
             or day in holidays(t.year).split(',')
             or day in extra_days
             or t.hour >= offpeak_from or t.hour < offpeak_until
     else 'false' }}
{%- endmacro %}
```

### 1b. The sensor: in `configuration.yaml`

```yaml
template:
  - trigger:
      - trigger: time_pattern
        minutes: "/15"
      - trigger: homeassistant
        event: start
    variables:
      peak: 0.31          # normal tariff, € per kWh, including taxes
      offpeak: 0.25       # off-peak tariff, € per kWh, including taxes
      offpeak_from: 23    # off-peak starts at this hour on weekdays (local time)
      offpeak_until: 7    # and ends at this hour
      extra_days: []      # more off-peak days, e.g. ["2030-05-05"] for Liberation Day if your supplier counts it
    sensor:
      - name: "Electricity price day night"
        unique_id: electricity_price_day_night
        unit_of_measurement: "EUR/kWh"
        state: >
          {% from 'day_night_tariff.jinja' import offpeak as is_offpeak %}
          {{ offpeak if is_offpeak(now(), offpeak_from, offpeak_until, extra_days) == 'true' else peak }}
        attributes:
          raw_today: >
            {% from 'day_night_tariff.jinja' import offpeak as is_offpeak %}
            {% set ns = namespace(items=[]) %}
            {% set t0 = as_timestamp(today_at('00:00')) %}
            {% set hours = ((as_timestamp(today_at('00:00') + timedelta(days=1)) - t0) / 3600) | round | int %}
            {% for h in range(hours) %}
              {% set start = as_local(as_datetime(t0 + h * 3600)) %}
              {% set low = is_offpeak(start, offpeak_from, offpeak_until, extra_days) == 'true' %}
              {% set ns.items = ns.items + [{'start': start.isoformat(),
                                            'end': as_local(as_datetime(t0 + h * 3600 + 3600)).isoformat(),
                                            'value': offpeak if low else peak}] %}
            {% endfor %}
            {{ ns.items }}
          raw_tomorrow: >
            {% from 'day_night_tariff.jinja' import offpeak as is_offpeak %}
            {% set ns = namespace(items=[]) %}
            {% set day = today_at('00:00') + timedelta(days=1) %}
            {% set t0 = as_timestamp(day) %}
            {% set hours = ((as_timestamp(day + timedelta(days=1)) - t0) / 3600) | round | int %}
            {% for h in range(hours) %}
              {% set start = as_local(as_datetime(t0 + h * 3600)) %}
              {% set low = is_offpeak(start, offpeak_from, offpeak_until, extra_days) == 'true' %}
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
| `offpeak_from`, `offpeak_until` | The hours (0–23, local time) at which the off-peak tariff starts and ends on weekdays. 23 and 7 is the Dutch rule; some older meters use 21 and 7 |
| `extra_days` | Further off-peak days, as `"YYYY-MM-DD"`, if your supplier counts more than the recognised holidays |

Weekends and the recognised holidays are always off-peak. For another country, change the list in the
`holidays` macro.

Then restart Home Assistant. After later changes, reload *Template entities* (*Developer tools → YAML*);
after changing the `.jinja` file, run the action `homeassistant.reload_custom_templates` first.

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

## 5. Days when the clock changes

On the two days per year when daylight saving time starts or ends, the day has 23 or 25 hours. The
template counts real hours from midnight to the next midnight, so the lists then have 23 or 25 entries,
without gaps.

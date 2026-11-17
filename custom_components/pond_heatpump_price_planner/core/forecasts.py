"""Outdoor temperature and solar surplus per quarter over the planning horizon."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

from .prices import DictListParser, parse_intervals
from .samples import QUARTER
from .timeseries import Interval, quarter_values

OUTDOOR_BIAS_HOURS = 6.0  # the difference sensor - forecast fades out over this time
SOLAR_RATIO_HOURS = 2.0  # the ratio measured / forecast PV fades out over this time
SOLAR_RATIO_BOUNDS = (0.2, 3.0)


def _interpolate(points: Sequence[tuple[float, float]], t: float) -> float:
    if t <= points[0][0]:
        return points[0][1]
    if t >= points[-1][0]:
        return points[-1][1]
    for (t0, v0), (t1, v1) in zip(points, points[1:], strict=False):
        if t0 <= t <= t1:
            return v0 + (v1 - v0) * (t - t0) / (t1 - t0) if t1 > t0 else v0
    return points[-1][1]


@dataclass(frozen=True)
class OutdoorForecast:
    """Hourly weather forecast, interpolated per quarter and corrected towards the outdoor sensor."""

    points: Sequence[tuple[float, float]]  # (epoch, °C), sorted

    def quarters(self, start: float, n: int, measured: float | None) -> list[float]:
        mid = [start + (q + 0.5) * QUARTER for q in range(n)]
        if not self.points:
            return [measured if measured is not None else 10.0] * n
        bias = measured - _interpolate(self.points, start) if measured is not None else 0.0
        out = []
        for t in mid:
            fade = max(0.0, 1.0 - (t - start) / (OUTDOOR_BIAS_HOURS * 3600))
            out.append(_interpolate(self.points, t) + bias * fade)
        return out


def solar_intervals(attributes: Mapping[str, Any], tz: str) -> list[Interval]:
    """PV forecast in kW per interval: 'forecast' lists with 'w' (W) first, else raw lists in kWh/h."""
    watts = parse_intervals(attributes, tz, (DictListParser(keys=("forecast",), value_keys=("w", "watts")),))
    if watts:
        return [Interval(i.start, i.end, i.value / 1000) for i in watts]
    kwh = parse_intervals(
        attributes, tz, (DictListParser(keys=("raw_today", "raw_tomorrow", "detailedForecast")),)
    )
    return [Interval(i.start, i.end, i.value * 3600 / (i.end - i.start)) for i in kwh]


@dataclass(frozen=True)
class SolarSurplus:
    """Surplus of own solar power available for the heat pump, per quarter (kW)."""

    base_load_kw: float = 0.3

    def quarters(
        self,
        start: float,
        n: int,
        measured_kw: float | None,
        forecast: Sequence[Interval] = (),
        forecast_now_kw: float | None = None,
    ) -> list[float]:
        """measured_kw: surplus now (already net of the base load); forecast: PV production in kW."""
        values = quarter_values(forecast, start, n) if forecast else [None] * n
        ratio = 1.0
        if measured_kw is not None and forecast_now_kw:
            ratio = (measured_kw + self.base_load_kw) / forecast_now_kw
            ratio = min(max(ratio, SOLAR_RATIO_BOUNDS[0]), SOLAR_RATIO_BOUNDS[1])
        out = []
        for q, pv in enumerate(values):
            if q == 0 and measured_kw is not None:
                out.append(max(0.0, measured_kw))
                continue
            if pv is None:
                out.append(0.0)
                continue
            fade = max(0.0, 1.0 - q * QUARTER / (SOLAR_RATIO_HOURS * 3600))
            scale = 1.0 + (ratio - 1.0) * fade
            out.append(max(0.0, pv * scale - self.base_load_kw))
        return out


def surplus_now(kind: str, value_w: float | None, heat_pump_w: float, base_load_w: float) -> float | None:
    """Surplus in kW from the configured sensor type: pv_power, grid_export or grid_net (export negative)."""
    if value_w is None:
        return None
    if kind == "pv_power":
        surplus = value_w - base_load_w
    elif kind == "grid_export":
        surplus = value_w + heat_pump_w
    elif kind == "grid_net":
        surplus = -value_w + heat_pump_w
    else:
        raise ValueError(f"unknown surplus sensor type: {kind}")
    return max(0.0, surplus) / 1000

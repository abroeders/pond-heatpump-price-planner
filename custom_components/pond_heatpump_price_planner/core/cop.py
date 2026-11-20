"""COP of the heat pump over long windows, by two independent methods, plus pond heat loss and thermal power.

- Flow method: heat = flow × 1.163 × (water out − water in), counted while running and settled.
- Pond method: heat = capacity × pond warming rate + fitted heat loss, on hours with the heat pump on.

Never per moment or per day: the water temperatures are coarse (whole degrees in the recorder), so only
windows of a week or more are meaningful. See docs/design/2026-11-17-cop-calculation.md.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass, field

import numpy as np

from .learning import Hour
from .model import ModelParams

WATER_KWH_PER_M3_K = 1.163
OUTDOOR_BINS: tuple[tuple[str, float, float], ...] = (
    ("<5", -100.0, 5.0),
    ("5-10", 5.0, 10.0),
    ("10-15", 10.0, 15.0),
    (">=15", 15.0, 100.0),
)
MIN_BIN_HOURS = 24.0
CALIBRATION_OFF_S = 1800.0  # the outlet counts as pond temperature from 30 minutes after a stop
CALIBRATION_DAYS = 21.0


def capacity_kwh_per_k(volume_m3: float | None) -> float | None:
    """Thermal capacity of the pond water."""
    return volume_m3 * WATER_KWH_PER_M3_K if volume_m3 else None


def heat_loss_w_per_k(params: ModelParams, cover: bool, capacity: float | None) -> float | None:
    """Heat loss per kelvin pond-outdoor difference, from the thermal model."""
    return params.k(cover) * capacity * 1000 if capacity else None


def thermal_power_w(params: ModelParams, mode: str, capacity: float | None) -> float | None:
    """Heat delivered to the pond in the given mode, from the thermal model (0 when off)."""
    return params.rate(mode) * capacity * 1000 if capacity else None


@dataclass
class CopBucket:
    """One hour of counted running time for the flow method."""

    t: float  # hour start
    seconds: float = 0.0  # counted (running and settled) time
    heat_per_flow_kwh: float = 0.0  # kWh per (m³/h): heat = this × flow
    elec_kwh: float = 0.0
    power_ws: float = 0.0  # ∫ power dt over counted time (W·s), for the mean power
    outdoor_ks: float = 0.0  # ∫ outdoor dt over counted time with a known outdoor (K·s)
    outdoor_s: float = 0.0
    # sums over counted time, so the inlet choice and the outlet offset also apply to stored hours (#32)
    out_ks: float = 0.0  # ∫ outlet dt
    in_ks: float = 0.0  # ∫ heat pump inlet dt
    pond_ks: float = 0.0  # ∫ pond dt over counted time with a known pond
    pond_s: float = 0.0
    # calibration: heat pump off for a while and water flowing, so the outlet should read the pond
    cal_s: float = 0.0
    cal_ks: float = 0.0  # ∫ (pond − outlet) dt
    has_sums: float = 1.0  # 0 for buckets of older versions: only heat_per_flow_kwh is known

    @property
    def hours(self) -> float:
        return self.seconds / 3600

    @property
    def power_w(self) -> float | None:
        return self.power_ws / self.seconds if self.seconds else None

    @property
    def outdoor(self) -> float | None:
        return self.outdoor_ks / self.outdoor_s if self.outdoor_s else None

    def to_list(self) -> list:
        return [self.t, self.seconds, self.heat_per_flow_kwh, self.elec_kwh, self.power_ws, self.outdoor_ks,
                self.outdoor_s, self.out_ks, self.in_ks, self.pond_ks, self.pond_s, self.cal_s,
                self.cal_ks]  # fmt: skip

    @classmethod
    def from_list(cls, row: Sequence[float]) -> CopBucket:
        if len(row) == 7:  # stored by a version before #32
            return cls(*row, has_sums=0.0)
        return cls(*row)


class FlowAccumulator:
    """Integrates state changes into hourly buckets for the flow method.

    The state between two updates is the state of the earlier update (step function). The energy counter
    increase between two counter updates is attributed to the counted share of that time.
    """

    def __init__(self, run_threshold_w: float = 100.0, settle_s: float = 1200.0) -> None:
        self.run_threshold_w = run_threshold_w
        self.settle_s = settle_s
        self.t: float | None = None
        self.power: float | None = None
        self.t_in: float | None = None
        self.t_out: float | None = None
        self.outdoor: float | None = None
        self.pond: float | None = None
        self.circulation: bool | None = None  # None: unknown, water assumed to flow
        self.run_start: float | None = None
        self.off_since: float | None = None
        self.energy: float | None = None
        self._since_energy_total = 0.0
        self._since_energy_counted: list[tuple[CopBucket, float]] = []
        self._power_kwh_fallback = True  # integrate power until a counter value arrives
        self.bucket: CopBucket | None = None
        self._finished: list[CopBucket] = []  # hours crossed since the last close_hour

    def _counted(self, t: float) -> bool:
        return (
            self.power is not None
            and self.power > self.run_threshold_w
            and self.run_start is not None
            and t - self.run_start >= self.settle_s
            and self.t_in is not None
            and self.t_out is not None
        )

    def _calibrating(self, t: float) -> bool:
        return (
            self.power is not None
            and self.power <= self.run_threshold_w
            and self.off_since is not None
            and t - self.off_since >= CALIBRATION_OFF_S
            and self.circulation is not False
            and self.t_out is not None
            and self.pond is not None
        )

    def _advance(self, until: float) -> None:
        """Integrate from self.t to `until` with the current state."""
        if self.t is None:
            self.t = until
            return
        t = self.t
        while t < until:
            hour = t // 3600 * 3600
            if self.bucket is None or self.bucket.t != hour:
                if self.bucket is not None:
                    self._finished.append(self.bucket)
                self.bucket = CopBucket(hour)
            seg_end = min(until, hour + 3600)
            # the settle point may fall inside the segment
            if self.run_start is not None and t < self.run_start + self.settle_s < seg_end:
                seg_end = self.run_start + self.settle_s
            if self.off_since is not None and t < self.off_since + CALIBRATION_OFF_S < seg_end:
                seg_end = self.off_since + CALIBRATION_OFF_S
            dt = seg_end - t
            self._since_energy_total += dt
            if self._counted(t):
                b = self.bucket
                b.seconds += dt
                b.heat_per_flow_kwh += WATER_KWH_PER_M3_K * (self.t_out - self.t_in) * dt / 3600
                b.power_ws += self.power * dt
                b.out_ks += self.t_out * dt
                b.in_ks += self.t_in * dt
                if self.pond is not None:
                    b.pond_ks += self.pond * dt
                    b.pond_s += dt
                if self.outdoor is not None:
                    b.outdoor_ks += self.outdoor * dt
                    b.outdoor_s += dt
                if self._power_kwh_fallback:
                    b.elec_kwh += self.power * dt / 3.6e6
                else:
                    self._since_energy_counted.append((b, dt))
            elif self._calibrating(t):
                self.bucket.cal_s += dt
                self.bucket.cal_ks += (self.pond - self.t_out) * dt
            t = seg_end
        self.t = until

    def update(
        self,
        t: float,
        *,
        power: float | None = None,
        t_in: float | None = None,
        t_out: float | None = None,
        outdoor: float | None = None,
        energy: float | None = None,
        pond: float | None = None,
        circulation: bool | None = None,
    ) -> None:
        """Apply new sensor values at time t (only the given ones change)."""
        self._advance(t)
        if power is not None:
            if (self.power is None or self.power <= self.run_threshold_w) and power > self.run_threshold_w:
                self.run_start = t
            if power <= self.run_threshold_w:
                self.run_start = None
                if self.power is None or self.power > self.run_threshold_w:
                    self.off_since = t  # a stop, or the start-up with the heat pump off
            else:
                self.off_since = None
            self.power = power
        if t_in is not None:
            self.t_in = t_in
        if t_out is not None:
            self.t_out = t_out
        if outdoor is not None:
            self.outdoor = outdoor
        if pond is not None:
            self.pond = pond
        if circulation is not None:
            self.circulation = circulation
        if energy is not None:
            self._energy(energy)

    def _energy(self, value: float) -> None:
        if self.energy is not None and value >= self.energy and self._since_energy_total > 0:
            delta = value - self.energy
            for bucket, dt in self._since_energy_counted:
                bucket.elec_kwh += delta * dt / self._since_energy_total
        # a counter reset or decrease is skipped: only the new reference is kept
        self.energy = value
        self._power_kwh_fallback = False
        self._since_energy_total = 0.0
        self._since_energy_counted = []

    def close_hour(self, t: float) -> list[CopBucket]:
        """Integrate up to t and return the buckets of all hours finished since the last call.

        t may lie after the hour boundary (a late timer), and an update may already have crossed it.
        """
        self._advance(t)
        if self.bucket is not None and self.bucket.t < t // 3600 * 3600:
            self._finished.append(self.bucket)
            self.bucket = None
        finished, self._finished = self._finished, []
        return finished


@dataclass
class CopResult:
    cop: float | None
    hours: float
    by_outdoor: dict[str, float | None] = field(default_factory=dict)
    by_power: dict[str, float | None] = field(default_factory=dict)
    hours_by_outdoor: dict[str, float] = field(default_factory=dict)
    hours_by_power: dict[str, float] = field(default_factory=dict)


def _ratio(heat: float, elec: float, hours: float, min_hours: float) -> float | None:
    return heat / elec if elec > 0 and hours >= min_hours else None


def _bin_of(outdoor: float | None) -> str | None:
    if outdoor is None:
        return None
    return next((name for name, lo, hi in OUTDOOR_BINS if lo <= outdoor < hi), None)


def _summarize(rows: Sequence[tuple[float, float, float, str | None, str]], min_total: float) -> CopResult:
    """rows: (heat kWh, electricity kWh, hours, outdoor bin, power level)."""
    heat = sum(r[0] for r in rows)
    elec = sum(r[1] for r in rows)
    hours = sum(r[2] for r in rows)
    result = CopResult(_ratio(heat, elec, hours, min_total), hours)
    for name, *_ in OUTDOOR_BINS:
        sel = [r for r in rows if r[3] == name]
        h = sum(r[2] for r in sel)
        result.hours_by_outdoor[name] = h
        result.by_outdoor[name] = _ratio(sum(r[0] for r in sel), sum(r[1] for r in sel), h, MIN_BIN_HOURS)
    for level in ("low", "high"):
        sel = [r for r in rows if r[4] == level]
        h = sum(r[2] for r in sel)
        result.hours_by_power[level] = h
        result.by_power[level] = _ratio(sum(r[0] for r in sel), sum(r[1] for r in sel), h, MIN_BIN_HOURS)
    return result


@dataclass
class OutletOffset:
    offset: float | None  # K added to the outlet temperature
    hours: float  # calibration hours in the window
    source: str  # "learned", "manual" or "none"


def outlet_offset(
    buckets: Sequence[CopBucket], now: float, manual: float | None, days: float = CALIBRATION_DAYS
) -> OutletOffset:
    """The outlet correction: the manual value, else the mean pond − outlet while off with water flowing."""
    start = now - days * 86400
    sel = [b for b in buckets if start <= b.t < now and b.cal_s > 0]
    seconds = sum(b.cal_s for b in sel)
    if manual is not None:
        return OutletOffset(manual, seconds / 3600, "manual")
    if seconds > 0:
        return OutletOffset(sum(b.cal_ks for b in sel) / seconds, seconds / 3600, "learned")
    return OutletOffset(None, 0.0, "none")


def _heat_per_flow(b: CopBucket, inlet: str, offset: float) -> float | None:
    """kWh per (m³/h) with the chosen inlet and the corrected outlet; None when the bucket cannot give it."""
    if not b.has_sums:
        return (
            b.heat_per_flow_kwh + WATER_KWH_PER_M3_K * offset * b.seconds / 3600
            if inlet == "heat_pump"
            else None
        )
    if inlet == "pond":
        if b.pond_s < b.seconds - 1:  # the pond was not known during all counted time
            return None
        inlet_ks = b.pond_ks
    else:
        inlet_ks = b.in_ks
    return WATER_KWH_PER_M3_K * (b.out_ks + offset * b.seconds - inlet_ks) / 3600


def cop_flow(
    buckets: Sequence[CopBucket],
    flow_m3h: float | None,
    now: float,
    window_days: float = 14,
    high_w: float = 650.0,
    min_hours: float = 24.0,
    inlet: str = "heat_pump",
    offset: float = 0.0,
) -> CopResult | None:
    """COP of the flow method over the window; None without a flow."""
    if not flow_m3h:
        return None
    start = now - window_days * 86400
    rows = []
    for b in buckets:
        if not (start <= b.t < now and b.seconds > 0):
            continue
        heat = _heat_per_flow(b, inlet, offset)
        if heat is None:
            continue
        rows.append(
            (
                heat * flow_m3h,
                b.elec_kwh,
                b.hours,
                _bin_of(b.outdoor),
                "high" if (b.power_w or 0) >= high_w else "low",
            )
        )
    return _summarize(rows, min_hours)


@dataclass
class LossFit:
    a_kw: float  # constant loss
    b_kw_per_k: float  # loss per kelvin pond-outdoor difference
    hours: int

    def loss_kw(self, delta: float) -> float:
        return self.a_kw + self.b_kw_per_k * delta


def fit_loss(
    hours: Sequence[Hour], capacity: float, now: float, days: float = 21, min_hours: int = 48
) -> LossFit | None:
    """Fit −capacity · dT/dt = a + b · (pond − outdoor) on hours with the heat pump off.

    Off means: off during the whole slope window of the hour.
    """
    start = now - days * 86400
    rows = [h for h in hours if h.slope is not None and start <= h.t < now and h.w_low == 0 and h.w_high == 0]
    if len(rows) < min_hours:
        return None
    y = -capacity * np.array([h.slope for h in rows])
    x = np.column_stack([np.ones(len(rows)), [h.w_delta for h in rows]])
    (a, b), *_ = np.linalg.lstsq(x, y, rcond=None)
    if b <= 0:
        return None
    return LossFit(float(a), float(b), len(rows))


def cop_pond(
    hours: Sequence[Hour],
    loss: LossFit | None,
    capacity: float | None,
    now: float,
    window_days: float = 14,
    min_hours: float = 24.0,
) -> CopResult | None:
    """COP of the pond method: heat = capacity · slope + loss, on hours with the heat pump running."""
    if loss is None or not capacity:
        return None
    start = now - window_days * 86400
    rows = []
    for h in hours:
        if h.slope is None or not start <= h.t < now:
            continue
        elec = h.w_low + h.w_high  # kWh in one hour, averaged over the slope window
        if elec < 0.05:
            continue
        heat = capacity * h.slope + loss.loss_kw(h.w_delta)
        rows.append((heat, elec, 1.0, _bin_of(h.outdoor), "high" if h.w_high > h.w_low else "low"))
    return _summarize(rows, min_hours)


COP_METHODS = ("flow", "pond", "average")


def _mean(values: Sequence[float | None]) -> float | None:
    known = [v for v in values if v is not None]
    return sum(known) / len(known) if known else None


def combine(method: str, flow: CopResult | None, pond: CopResult | None) -> CopResult | None:
    """The COP to show: the flow method, the pond method, or the average of both.

    The average uses whichever method has a value where the other has none, per bin as well.
    """
    if method == "flow":
        return flow
    if method == "pond":
        return pond
    if method != "average":
        raise ValueError(f"unknown COP method: {method}")
    results = [r for r in (flow, pond) if r is not None]
    if not results:
        return None
    if len(results) == 1:
        return results[0]
    out = CopResult(_mean([r.cop for r in results]), max(r.hours for r in results))
    for name in results[0].by_outdoor:
        out.by_outdoor[name] = _mean([r.by_outdoor.get(name) for r in results])
        out.hours_by_outdoor[name] = max(r.hours_by_outdoor.get(name, 0.0) for r in results)
    for level in results[0].by_power:
        out.by_power[level] = _mean([r.by_power.get(level) for r in results])
        out.hours_by_power[level] = max(r.hours_by_power.get(level, 0.0) for r in results)
    return out


def model_check(params: ModelParams, *results: CopResult | None, tolerance: float = 0.25) -> str | None:
    """Warn when the model's efficiency ratio low/high differs from every COP method.

    Differs means: by more than `tolerance` (relative).
    """
    model_ratio = params.gain["low"] / params.gain["high"] if params.gain["high"] else None
    ratios = [
        r.by_power["low"] / r.by_power["high"]
        for r in results
        if r is not None and r.by_power.get("low") and r.by_power.get("high")
    ]
    if model_ratio is None or not ratios:
        return None
    if all(abs(model_ratio / ratio - 1) > tolerance for ratio in ratios):
        measured = ", ".join(f"{r:.2f}" for r in ratios)
        return f"model efficiency ratio low/high {model_ratio:.2f} differs from the COP methods ({measured})"
    return None

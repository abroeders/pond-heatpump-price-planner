"""Thermal model of the pond and how it is learned from quarter-hour samples.

Per quarter hour (DT = 0.25 h) with mode m in off/low/high:

    T[t+1] = T[t] + DT * (gain_m * s * power_m - k * (T[t] - T_out[t]) + offset)

where s is the start factor in the first quarter after the heat pump was off and k depends on the
insulation cover. See docs/design/2026-11-17-thermal-model.md.
"""

from __future__ import annotations

import time
from dataclasses import asdict, dataclass, field
from datetime import datetime
from zoneinfo import ZoneInfo

import numpy as np

from .samples import Sample

DT = 0.25  # hours per quarter
MODES = ("off", "low", "high")

COVER_DEFAULT_RATIO = 0.6  # k_cover / k_open until k_cover has been learned
DEFAULT_HIGH_LOW_RATIO = 0.69  # gain_high / gain_low until high mode has been learned

GAIN_BOUNDS = (0.02, 1.0)  # K/h per kW
K_BOUNDS = (0.001, 0.05)  # 1/h
OFFSET_BOUNDS = (-0.05, 0.05)  # K/h

NIGHT_START, NIGHT_END = 19, 7  # local hours used for the cooling fit


@dataclass
class ModelParams:
    """Parameters of the thermal model."""

    power: dict[str, float] = field(default_factory=lambda: {"off": 0.005, "low": 0.39, "high": 0.90})
    gain: dict[str, float] = field(default_factory=lambda: {"off": 0.0, "low": 0.30, "high": 0.21})
    k_open: float = 0.012
    k_cover: float | None = None
    offset: float = -0.01
    start_factor: float = 0.75
    learned_at: float | None = None
    samples_used: int = 0

    def k(self, cover: bool) -> float:
        if not cover:
            return self.k_open
        return self.k_cover if self.k_cover is not None else self.k_open * COVER_DEFAULT_RATIO

    def rate(self, mode: str) -> float:
        """Heating rate of a mode in K/h."""
        return self.gain[mode] * self.power[mode]

    def step(
        self, temp: float, mode: str, t_out: float, starting: bool = False, cover: bool = False
    ) -> float:
        """Pond temperature after one quarter hour."""
        heat = self.rate(mode) * (self.start_factor if starting and mode != "off" else 1.0)
        return temp + DT * (heat - self.k(cover) * (temp - t_out) + self.offset)

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict | None) -> ModelParams:
        params = cls()
        if not data:
            return params
        for key, value in data.items():
            if key in ("power", "gain") and isinstance(value, dict):
                getattr(params, key).update({m: float(v) for m, v in value.items() if m in MODES})
            elif hasattr(params, key):
                setattr(params, key, value)
        return params


@dataclass(slots=True)
class Hour:
    """Hourly aggregate of samples, used by the fits."""

    t: float
    pond: float
    outdoor: float
    p_low: float  # mean power in low mode over the hour, kW (0 in quarters with another mode)
    p_high: float  # same for high mode
    cover: bool
    local_hour: int
    slope: float | None = None  # centred dT/dt in K/h over [h-2, h+2]
    # power and pond-outdoor difference averaged over the same 4-hour window as the slope
    w_low: float = 0.0
    w_high: float = 0.0
    w_delta: float = 0.0


@dataclass
class FitReport:
    """Outcome of a fit, shown in diagnostics."""

    kind: str
    accepted: bool
    reason: str = ""
    hours: int = 0
    old: dict = field(default_factory=dict)
    new: dict = field(default_factory=dict)


def mode_of(power_w: float | None, low_w: float, high_w: float) -> str | None:
    """Mode from mean power: off below low_w, high from high_w."""
    if power_w is None:
        return None
    if power_w < low_w:
        return "off"
    return "high" if power_w >= high_w else "low"


def hourly(samples: list[Sample], tz: str, low_w: float, high_w: float) -> list[Hour]:
    """Aggregate quarter samples per hour and add the centred slope (T[h+2] - T[h-2]) / 4 h."""
    zone = ZoneInfo(tz)
    buckets: dict[float, list[Sample]] = {}
    for s in samples:
        if s.pond is None or s.outdoor is None or s.power is None:
            continue
        buckets.setdefault(s.t // 3600 * 3600, []).append(s)
    hours: dict[float, Hour] = {}
    for t, group in buckets.items():
        if len(group) < 3:
            continue
        n = len(group)
        p_low = sum(s.power for s in group if mode_of(s.power, low_w, high_w) == "low") / 1000 / n
        p_high = sum(s.power for s in group if mode_of(s.power, low_w, high_w) == "high") / 1000 / n
        hours[t] = Hour(
            t=t,
            pond=sum(s.pond for s in group) / n,
            outdoor=sum(s.outdoor for s in group) / n,
            p_low=p_low,
            p_high=p_high,
            cover=sum(s.cover for s in group) * 2 > n,
            local_hour=datetime.fromtimestamp(t, zone).hour,
        )
    # the slope runs from the middle of hour h-2 to the middle of hour h+2: half of each outer hour
    weights = ((-2, 0.125), (-1, 0.25), (0, 0.25), (1, 0.25), (2, 0.125))
    for t, h in hours.items():
        window = [(hours.get(t + d * 3600), w) for d, w in weights]
        if any(x is None for x, _ in window):
            continue
        h.slope = (window[-1][0].pond - window[0][0].pond) / 4.0
        h.w_low = sum(x.p_low * w for x, w in window)
        h.w_high = sum(x.p_high * w for x, w in window)
        h.w_delta = sum((x.pond - x.outdoor) * w for x, w in window)
    return [hours[t] for t in sorted(hours)]


def _within(value: float, bounds: tuple[float, float]) -> bool:
    return bounds[0] <= value <= bounds[1]


def fit_slow(
    params: ModelParams,
    samples: list[Sample],
    now: float | None = None,
    tz: str = "UTC",
    low_w: float = 150,
    high_w: float = 650,
    days: int = 28,
    min_hours: int = 300,
    min_mode_hours: int = 20,
    blend: float = 0.3,
) -> tuple[ModelParams, FitReport]:
    """Fit heating gains, offset and mode powers over a long window; blend them into params."""
    now = time.time() if now is None else now
    rows = [
        h
        for h in hourly(samples, tz, low_w, high_w)
        if h.slope is not None and now - days * 86400 <= h.t < now
    ]
    old = {"gain": dict(params.gain), "offset": params.offset, "power": dict(params.power)}
    report = FitReport("slow", False, hours=len(rows), old=old)
    if len(rows) < min_hours:
        report.reason = f"not enough hours ({len(rows)} < {min_hours})"
        return params, report

    dt = np.array([h.slope for h in rows])
    p_low = np.array([h.w_low for h in rows])
    p_high = np.array([h.w_high for h in rows])
    tb = np.array([h.w_delta for h in rows])
    cover = np.array([h.cover for h in rows], dtype=float)
    fit_low = int((p_low > 0.05).sum()) >= min_mode_hours
    fit_high = int((p_high > 0.05).sum()) >= min_mode_hours
    fit_cover = int(cover.sum()) >= 48 and int((1 - cover).sum()) >= 48

    y = dt.copy()
    cols, names = [], []
    if fit_low:
        cols.append(p_low)
        names.append("gain_low")
    else:
        y -= params.gain["low"] * p_low
    if fit_high:
        cols.append(p_high)
        names.append("gain_high")
    else:
        y -= params.gain["high"] * p_high
    if fit_cover:
        cols += [-tb * (1 - cover), -tb * cover]
        names += ["k_open", "k_cover"]
    else:
        cols.append(-tb)
        names.append("k")
    cols.append(np.ones(len(rows)))
    names.append("offset")
    coef, *_ = np.linalg.lstsq(np.column_stack(cols), y, rcond=None)
    fit = dict(zip(names, (float(c) for c in coef), strict=True))
    report.new = fit

    for name, value in fit.items():
        if name.startswith("gain"):
            bounds = GAIN_BOUNDS
        else:
            bounds = K_BOUNDS if name.startswith("k") else OFFSET_BOUNDS
        if not _within(value, bounds):
            report.reason = f"{name} out of bounds ({value:.4f})"
            return params, report

    new = ModelParams.from_dict(params.to_dict())
    if fit_low:
        new.gain["low"] = (1 - blend) * params.gain["low"] + blend * fit["gain_low"]
    if fit_high:
        new.gain["high"] = (1 - blend) * params.gain["high"] + blend * fit["gain_high"]
    elif fit_low and params.learned_at is None:
        new.gain["high"] = new.gain["low"] * DEFAULT_HIGH_LOW_RATIO
    new.offset = (1 - blend) * params.offset + blend * fit["offset"]

    window = [s for s in samples if now - days * 86400 <= s.t < now and s.power is not None]
    for mode in ("low", "high"):
        powers = sorted(s.power for s in window if mode_of(s.power, low_w, high_w) == mode)
        if len(powers) >= 4 * min_mode_hours:
            new.power[mode] = powers[len(powers) // 2] / 1000

    new.learned_at = now
    new.samples_used = len(window)
    report.accepted = True
    report.new = {"gain": dict(new.gain), "offset": new.offset, "power": dict(new.power), "fit": fit}
    return new, report


def fit_k(
    params: ModelParams,
    samples: list[Sample],
    cover: bool,
    now: float | None = None,
    tz: str = "UTC",
    low_w: float = 150,
    high_w: float = 650,
    days: int = 7,
    half_life_days: float = 3.0,
    min_hours: int = 24,
    min_delta: float = 2.0,
) -> tuple[ModelParams, FitReport]:
    """Fit the cooling coefficient for the given cover state from night hours, recent hours weigh more."""
    now = time.time() if now is None else now
    rows = [
        h
        for h in hourly(samples, tz, low_w, high_w)
        if h.slope is not None
        and now - days * 86400 <= h.t < now
        and h.cover == cover
        and (h.local_hour >= NIGHT_START or h.local_hour < NIGHT_END)
    ]
    key = "k_cover" if cover else "k_open"
    report = FitReport("cooling", False, hours=len(rows), old={key: getattr(params, key)})
    if len(rows) < min_hours:
        report.reason = f"not enough night hours ({len(rows)} < {min_hours})"
        return params, report

    tb = np.array([h.w_delta for h in rows])
    gain = params.gain
    y = np.array([h.slope - gain["low"] * h.w_low - gain["high"] * h.w_high - params.offset for h in rows])
    age = np.array([(now - h.t) / 86400 for h in rows])
    w = 0.5 ** (age / half_life_days)
    if float((w * tb).sum() / w.sum()) < min_delta:
        report.reason = "pond and outdoor temperature too close"
        return params, report

    k = float(-(w * y * tb).sum() / (w * tb * tb).sum())
    report.new = {key: k}
    if not _within(k, K_BOUNDS):
        report.reason = f"{key} out of bounds ({k:.4f})"
        return params, report
    new = ModelParams.from_dict(params.to_dict())
    setattr(new, key, k)
    new.learned_at = now
    report.accepted = True
    return new, report


class PredictionTracker:
    """Keeps predictions of the pond temperature and the errors once they can be checked."""

    def __init__(self, window_hours: float = 24) -> None:
        self.window = window_hours * 3600
        self.pending: list[tuple[float, float]] = []  # (target time, predicted temperature)
        self.errors: list[tuple[float, float]] = []  # (target time, absolute error)

    def predict(self, target_t: float, temp: float) -> None:
        self.pending.append((target_t, temp))

    def observe(self, now: float, temp: float | None) -> None:
        """Check all predictions that are due against the measured temperature."""
        due = [p for p in self.pending if p[0] <= now]
        self.pending = [p for p in self.pending if p[0] > now]
        if temp is not None:
            self.errors += [(t, abs(temp - predicted)) for t, predicted in due if now - t < 1800]
        self.errors = [e for e in self.errors if e[0] >= now - self.window]

    def mean_abs_error(self) -> float | None:
        if not self.errors:
            return None
        return sum(e for _, e in self.errors) / len(self.errors)

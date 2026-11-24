"""Learning the thermal model from quarter-hour samples.

Each fit is a strategy (`Fitter`); the `Learner` runs them in order, each one starting from the result of
the previous one. New fits (e.g. solar gain) can be added without changing the existing ones.
"""

from __future__ import annotations

import time
from collections.abc import Sequence
from dataclasses import dataclass, field
from datetime import datetime
from typing import Protocol
from zoneinfo import ZoneInfo

import numpy as np

from .model import BOOST_GAIN_RATIO, ModeClassifier, ModelParams
from .samples import Sample

GAIN_BOUNDS = (0.02, 1.0)  # K/h per kW
K_BOUNDS = (0.001, 0.05)  # 1/h
OFFSET_BOUNDS = (-0.05, 0.05)  # K/h
FITTED_MODES = ("low", "high", "boost")
DEFAULT_HIGH_LOW_RATIO = 0.69  # gain_high / gain_low until high mode has been learned
NIGHT_START, NIGHT_END = 19, 7  # local hours used for the cooling fit

# the slope runs from the middle of hour h-2 to the middle of hour h+2: half of each outer hour
SLOPE_WINDOW = ((-2, 0.125), (-1, 0.25), (0, 0.25), (1, 0.25), (2, 0.125))


@dataclass(slots=True)
class Hour:
    """Hourly aggregate of samples."""

    t: float
    pond: float
    outdoor: float
    p_low: float  # mean power in low mode over the hour, kW (0 in quarters with another mode)
    p_high: float  # same for high mode
    p_boost: float  # same for boost mode
    cover: bool
    local_hour: int
    slope: float | None = None  # centred dT/dt in K/h over [h-2, h+2]
    # power and pond-outdoor difference averaged over the same window as the slope
    w_low: float = 0.0
    w_high: float = 0.0
    w_boost: float = 0.0
    w_delta: float = 0.0

    @property
    def is_night(self) -> bool:
        return self.local_hour >= NIGHT_START or self.local_hour < NIGHT_END


def hourly(samples: Sequence[Sample], tz: str, classifier: ModeClassifier) -> list[Hour]:
    """Aggregate quarter samples per hour and add the window-aligned slope and regressors."""
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
        modes = [classifier.mode(s.power, s.preset) for s in group]
        hours[t] = Hour(
            t=t,
            pond=sum(s.pond for s in group) / n,
            outdoor=sum(s.outdoor for s in group) / n,
            p_low=sum(s.power for s, m in zip(group, modes, strict=True) if m == "low") / 1000 / n,
            p_high=sum(s.power for s, m in zip(group, modes, strict=True) if m == "high") / 1000 / n,
            p_boost=sum(s.power for s, m in zip(group, modes, strict=True) if m == "boost") / 1000 / n,
            cover=sum(s.cover for s in group) * 2 > n,
            local_hour=datetime.fromtimestamp(t, zone).hour,
        )
    for t, h in hours.items():
        window = [(hours.get(t + d * 3600), w) for d, w in SLOPE_WINDOW]
        if any(x is None for x, _ in window):
            continue
        h.slope = (window[-1][0].pond - window[0][0].pond) / 4.0
        h.w_low = sum(x.p_low * w for x, w in window)
        h.w_high = sum(x.p_high * w for x, w in window)
        h.w_boost = sum(x.p_boost * w for x, w in window)
        h.w_delta = sum((x.pond - x.outdoor) * w for x, w in window)
    return [hours[t] for t in sorted(hours)]


@dataclass
class FitReport:
    """Outcome of one fit, shown in diagnostics."""

    kind: str
    accepted: bool
    reason: str = ""
    hours: int = 0
    old: dict = field(default_factory=dict)
    new: dict = field(default_factory=dict)


@dataclass
class LearningContext:
    """Everything a fit needs besides the parameters; the hourly aggregate is computed once."""

    samples: Sequence[Sample]
    now: float = field(default_factory=time.time)
    tz: str = "UTC"
    classifier: ModeClassifier = field(default_factory=ModeClassifier)
    cover: bool = False
    _hours: list[Hour] | None = field(default=None, init=False, repr=False)

    def hours(self) -> list[Hour]:
        if self._hours is None:
            self._hours = hourly(self.samples, self.tz, self.classifier)
        return self._hours

    def window(self, days: float) -> list[Hour]:
        """Hours with a slope in the last `days` days."""
        start = self.now - days * 86400
        return [h for h in self.hours() if h.slope is not None and start <= h.t < self.now]


class Fitter(Protocol):
    """A learning step: returns updated parameters and a report; never changes its input."""

    kind: str

    def fit(self, params: ModelParams, ctx: LearningContext) -> tuple[ModelParams, FitReport]: ...


def _within(value: float, bounds: tuple[float, float]) -> bool:
    return bounds[0] <= value <= bounds[1]


def _bounds_for(name: str) -> tuple[float, float]:
    if name.startswith("gain"):
        return GAIN_BOUNDS
    return K_BOUNDS if name.startswith("k") else OFFSET_BOUNDS


@dataclass
class SlowFit:
    """Heating gains, offset and mode powers over a long window, blended into the parameters."""

    kind: str = "slow"
    days: int = 28
    min_hours: int = 300
    min_mode_hours: int = 20
    blend: float = 0.3

    def fit(self, params: ModelParams, ctx: LearningContext) -> tuple[ModelParams, FitReport]:
        rows = ctx.window(self.days)
        old = {"gain": dict(params.gain), "offset": params.offset, "power": dict(params.power)}
        report = FitReport(self.kind, False, hours=len(rows), old=old)
        if len(rows) < self.min_hours:
            report.reason = f"not enough hours ({len(rows)} < {self.min_hours})"
            return params, report

        fit = self._least_squares(params, rows)
        report.new = fit
        for name, value in fit.items():
            if not _within(value, _bounds_for(name)):
                report.reason = f"{name} out of bounds ({value:.4f})"
                return params, report

        new = params.copy()
        for mode in FITTED_MODES:
            if f"gain_{mode}" in fit:
                new.gain[mode] = self._blend(params.gain[mode], fit[f"gain_{mode}"])
                if mode not in new.fitted:
                    new.fitted.append(mode)
        if "gain_high" not in fit and "gain_low" in fit and params.learned_at is None:
            new.gain["high"] = new.gain["low"] * DEFAULT_HIGH_LOW_RATIO
        if "boost" not in new.fitted:
            new.gain["boost"] = new.gain["high"] * BOOST_GAIN_RATIO  # until boost has been learned
        new.offset = self._blend(params.offset, fit["offset"])
        self._update_powers(new, ctx)
        new.learned_at = ctx.now
        report.accepted = True
        report.new = {"gain": dict(new.gain), "offset": new.offset, "power": dict(new.power), "fit": fit}
        return new, report

    def _blend(self, old: float, fitted: float) -> float:
        return (1 - self.blend) * old + self.blend * fitted

    def _least_squares(self, params: ModelParams, rows: list[Hour]) -> dict[str, float]:
        y = np.array([h.slope for h in rows])
        delta = np.array([h.w_delta for h in rows])
        cover = np.array([h.cover for h in rows], dtype=float)

        cols, names = [], []
        for mode in FITTED_MODES:
            p = np.array([getattr(h, f"w_{mode}") for h in rows])
            if int((p > 0.05).sum()) >= self.min_mode_hours:
                cols.append(p)
                names.append(f"gain_{mode}")
            else:
                y = y - params.gain[mode] * p
        if int(cover.sum()) >= 48 and int((1 - cover).sum()) >= 48:
            cols += [-delta * (1 - cover), -delta * cover]
            names += ["k_open", "k_cover"]
        else:
            cols.append(-delta)
            names.append("k")
        cols.append(np.ones(len(rows)))
        names.append("offset")
        coef, *_ = np.linalg.lstsq(np.column_stack(cols), y, rcond=None)
        return dict(zip(names, (float(c) for c in coef), strict=True))

    def _update_powers(self, params: ModelParams, ctx: LearningContext) -> None:
        start = ctx.now - self.days * 86400
        window = [s for s in ctx.samples if start <= s.t < ctx.now and s.power is not None]
        for mode in FITTED_MODES:
            powers = sorted(s.power for s in window if ctx.classifier.mode(s.power, s.preset) == mode)
            if len(powers) >= 4 * self.min_mode_hours:
                params.power[mode] = powers[len(powers) // 2] / 1000
        params.samples_used = len(window)


@dataclass
class CoolingFit:
    """Cooling coefficient for the current cover state, from night hours; recent hours weigh more."""

    kind: str = "cooling"
    days: int = 7
    half_life_days: float = 3.0
    min_hours: int = 24
    min_delta: float = 2.0

    def fit(self, params: ModelParams, ctx: LearningContext) -> tuple[ModelParams, FitReport]:
        rows = [h for h in ctx.window(self.days) if h.cover == ctx.cover and h.is_night]
        key = "k_cover" if ctx.cover else "k_open"
        report = FitReport(self.kind, False, hours=len(rows), old={key: getattr(params, key)})
        if len(rows) < self.min_hours:
            report.reason = f"not enough night hours ({len(rows)} < {self.min_hours})"
            return params, report

        gain = params.gain
        delta = np.array([h.w_delta for h in rows])
        heat = [gain["low"] * h.w_low + gain["high"] * h.w_high + gain["boost"] * h.w_boost for h in rows]
        y = np.array([h.slope - q - params.offset for h, q in zip(rows, heat, strict=True)])
        w = 0.5 ** (np.array([(ctx.now - h.t) / 86400 for h in rows]) / self.half_life_days)
        if float((w * delta).sum() / w.sum()) < self.min_delta:
            report.reason = "pond and outdoor temperature too close"
            return params, report

        k = float(-(w * y * delta).sum() / (w * delta * delta).sum())
        report.new = {key: k}
        if not _within(k, K_BOUNDS):
            report.reason = f"{key} out of bounds ({k:.4f})"
            return params, report
        new = params.copy()
        setattr(new, key, k)
        new.learned_at = ctx.now
        report.accepted = True
        return new, report


class Learner:
    """Runs the fits in order; each fit starts from the parameters of the previous one."""

    def __init__(self, fitters: Sequence[Fitter] | None = None) -> None:
        self.fitters: list[Fitter] = list(fitters) if fitters is not None else [SlowFit(), CoolingFit()]

    def learn(self, params: ModelParams, ctx: LearningContext) -> tuple[ModelParams, list[FitReport]]:
        reports = []
        for fitter in self.fitters:
            params, report = fitter.fit(params, ctx)
            reports.append(report)
        return params, reports

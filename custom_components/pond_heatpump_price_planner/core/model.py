"""Thermal model of the pond.

Per quarter hour (DT = 0.25 h) with mode m in off/low/high/boost:

    T[t+1] = T[t] + DT * (gain_m * s * power_m - k * (T[t] - T_out[t]) + offset)

where s is the start factor in the first quarter after the heat pump was off and k depends on the
insulation cover. Learning the parameters lives in learning.py. See docs/design/2026-11-17-thermal-model.md.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field

DT = 0.25  # hours per quarter
MODES = ("off", "low", "high", "boost")

COVER_DEFAULT_RATIO = 0.6  # k_cover / k_open until k_cover has been learned
# gain_boost / gain_high until boost has been learned: a capacity preset has a lower COP
BOOST_GAIN_RATIO = 0.9


@dataclass
class ModelParams:
    """Parameters of the thermal model and the prediction of one step."""

    power: dict[str, float] = field(
        default_factory=lambda: {"off": 0.005, "low": 0.39, "high": 0.90, "boost": 1.10}
    )
    gain: dict[str, float] = field(
        default_factory=lambda: {"off": 0.0, "low": 0.30, "high": 0.21, "boost": 0.21 * BOOST_GAIN_RATIO}
    )
    k_open: float = 0.012
    k_cover: float | None = None
    offset: float = -0.01
    start_factor: float = 0.75
    learned_at: float | None = None
    samples_used: int = 0
    fitted: list[str] = field(default_factory=list)  # modes whose gain has been fitted at least once

    def __post_init__(self) -> None:
        # parameters from before boost existed: boost starts from high
        self.power.setdefault("boost", self.power.get("high", 0.0))
        self.gain.setdefault("boost", self.gain.get("high", 0.0) * BOOST_GAIN_RATIO)

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

    def copy(self) -> ModelParams:
        return ModelParams.from_dict(self.to_dict())

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
        if "boost" not in (data.get("gain") or {}):
            params.gain["boost"] = params.gain["high"] * BOOST_GAIN_RATIO  # stored before boost existed
        if "boost" not in (data.get("power") or {}):
            params.power["boost"] = ModelParams().power["boost"]
        return params


@dataclass(frozen=True)
class ModeClassifier:
    """Derives the mode from the mean power of the heat pump and, for boost, its preset."""

    low_w: float = 150.0  # below: off
    high_w: float = 650.0  # from here: high
    capacity_preset: str | None = None  # the preset of boost; None: no boost

    def mode(self, power_w: float | None, preset: str | None = None) -> str | None:
        if power_w is None:
            return None
        if power_w < self.low_w:
            return "off"
        if power_w < self.high_w:
            return "low"
        return "boost" if self.capacity_preset is not None and preset == self.capacity_preset else "high"

"""Safety rules between the plan and the heat pump.

The first rule that applies wins. Limits release with hysteresis, so a pond at a limit does not flip the
mode every quarter. See docs/design/2026-11-17-control-and-safety.md §3.
"""

from __future__ import annotations

from dataclasses import dataclass

MODE_RANK = {"off": 0, "low": 1, "high": 2, "boost": 3}

NO_POND_TEMPERATURE = "no_pond_temperature"
FAR_BELOW_BAND = "far_below_band"
BELOW_BAND = "below_band"
ABOVE_BAND = "above_band"
NO_PLAN = "no_plan"
PLAN = "plan"


@dataclass(frozen=True)
class SafetySettings:
    far_below: float = 0.3  # K below the band for high mode
    hysteresis: float = 0.05  # K
    stale_after: float = 6 * 3600.0  # s without any report; many sensors only report changes


@dataclass(frozen=True)
class Decision:
    mode: str
    reason: str


class SafetyGuard:
    """Decides the mode to apply; keeps which limits are active for the hysteresis."""

    def __init__(self, settings: SafetySettings | None = None) -> None:
        self.settings = settings or SafetySettings()
        self._active: set[str] = set()

    def _limit(self, name: str, crossed: bool, released: bool) -> bool:
        """Activate a limit when crossed; keep it until released."""
        if crossed:
            self._active.add(name)
        elif released:
            self._active.discard(name)
        return name in self._active

    def decide(
        self,
        *,
        plan_mode: str | None,
        pond: float | None,
        pond_age: float,
        target: float,
        band: float,
        allow_high: bool = True,
        allow_boost: bool = False,
        previous: str = "off",
    ) -> Decision:
        s = self.settings
        if pond is None or pond_age > s.stale_after:
            return Decision("low", NO_POND_TEMPERATURE)

        lower, upper = target - band, target + band
        h = s.hysteresis
        far = self._limit(FAR_BELOW_BAND, pond < lower - s.far_below, pond >= lower - s.far_below + h)
        below = self._limit(BELOW_BAND, pond < lower, pond >= lower + h)
        above = self._limit(ABOVE_BAND, pond > upper, pond <= upper - h)

        boost = allow_high and allow_boost
        if far:
            return Decision("boost" if boost else "high" if allow_high else "low", FAR_BELOW_BAND)
        if below:
            mode = plan_mode if plan_mode is not None and MODE_RANK[plan_mode] >= MODE_RANK["low"] else "low"
            if mode == "boost" and not boost:
                mode = "high"
            if mode == "high" and not allow_high:
                mode = "low"
            return Decision(mode, BELOW_BAND)
        if above:
            return Decision("off", ABOVE_BAND)
        if plan_mode is None:
            if pond < target:
                return Decision("low", NO_PLAN)
            if pond > target + band / 2:
                return Decision("off", NO_PLAN)
            return Decision(previous, NO_PLAN)
        return Decision(plan_mode, PLAN)


@dataclass
class MismatchTracker:
    """Notices when the heat pump does not follow the applied mode."""

    grace: float = 1800.0  # s before a mismatch counts
    repair_after: float = 7200.0  # s before a repair issue is raised
    since: float | None = None  # when the current mismatch started
    applied_at: float | None = None
    expected: str | None = None

    def applied(self, mode: str, now: float) -> None:
        if mode != self.expected:
            self.expected = mode
            self.applied_at = now
            self.since = None

    def observe(self, measured: str | None, now: float) -> tuple[bool, bool]:
        """Returns (mismatch, raise repair)."""
        if self.expected is None or measured is None or self.applied_at is None:
            return False, False
        follows = (measured == "off") == (self.expected == "off")  # low and high may mix while modulating
        if follows or now - self.applied_at < self.grace:
            self.since = None
            return False, False
        if self.since is None:
            self.since = now
        return True, now - self.since >= self.repair_after - self.grace

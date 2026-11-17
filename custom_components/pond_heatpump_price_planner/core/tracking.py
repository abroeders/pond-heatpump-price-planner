"""Tracking how well the model predicted the pond temperature."""

from __future__ import annotations

MAX_LATE = 1800  # seconds: a prediction checked later than this is dropped


class PredictionTracker:
    """Keeps predictions of the pond temperature and their errors once they can be checked."""

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
            self.errors += [(t, abs(temp - predicted)) for t, predicted in due if now - t < MAX_LATE]
        self.errors = [e for e in self.errors if e[0] >= now - self.window]

    def mean_abs_error(self) -> float | None:
        if not self.errors:
            return None
        return sum(e for _, e in self.errors) / len(self.errors)

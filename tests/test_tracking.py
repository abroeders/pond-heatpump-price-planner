import pytest
from core.tracking import PredictionTracker


def test_prediction_tracker():
    tr = PredictionTracker(window_hours=24)
    tr.predict(3600, 15.0)
    tr.predict(7200, 15.2)
    tr.observe(3600, 15.1)
    assert tr.mean_abs_error() == pytest.approx(0.1)
    tr.observe(7200 + 3600, 15.0)  # checked too late: dropped
    assert tr.mean_abs_error() == pytest.approx(0.1)
    tr.observe(3600 + 25 * 3600, None)
    assert tr.mean_abs_error() is None

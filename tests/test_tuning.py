import pytest
from conftest import epoch
from core.model import ModelParams
from core.samples import QUARTER, Sample
from core.tuning import tune_surcharge
from replay import known_until


def history(days, price_of, outdoor=9.0, start=None):
    start = start if start is not None else epoch("2026-11-01T00:00:00+01:00")
    return [
        Sample(start + i * QUARTER, 15.0, outdoor, 390.0, False, price_of(i)) for i in range(int(days * 96))
    ]


def test_picks_the_cheapest_candidate_and_reports_all():
    samples = history(2, lambda i: 0.30 if (i % 96) < 64 else 0.45)
    now = samples[-1].t + QUARTER
    res = tune_surcharge(samples, ModelParams(), 15.0, 0.25, known_until, now, days=2, candidates=(0.0, 1.0))
    assert set(res.costs) == {0.0, 1.0}
    assert res.surcharge == min(res.costs, key=lambda c: (round(res.costs[c], 2), c))
    assert res.days == pytest.approx(2.0)


def test_equal_cost_prefers_the_smallest_surcharge():
    samples = history(2, lambda i: 0.30)  # flat price: the surcharge cannot matter
    now = samples[-1].t + QUARTER
    res = tune_surcharge(samples, ModelParams(), 15.0, 0.25, known_until, now, days=2, candidates=(0.5, 0.0))
    assert res.surcharge == 0.0


def test_not_enough_history():
    samples = history(0.5, lambda i: 0.30)
    res = tune_surcharge(samples, ModelParams(), 15.0, 0.25, known_until, samples[-1].t + QUARTER)
    assert res.surcharge == 0.0 and "not enough" in res.reason
    gaps = history(2, lambda i: None if i % 3 else 0.30)
    res = tune_surcharge(gaps, ModelParams(), 15.0, 0.25, known_until, gaps[-1].t + QUARTER, days=2)
    assert "not enough" in res.reason


def test_rejects_candidates_that_leave_the_band():
    cold = history(2, lambda i: 0.30, outdoor=-15.0)  # far too cold for this heat pump
    res = tune_surcharge(
        cold, ModelParams(), 15.0, 0.25, known_until, cold[-1].t + QUARTER, days=2, candidates=(0.0,)
    )
    assert res.costs == {} and "left the band" in res.reason

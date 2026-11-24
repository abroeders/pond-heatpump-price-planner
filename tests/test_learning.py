import pytest
from conftest import TZ, simulate
from core.learning import CoolingFit, FitReport, Learner, LearningContext, SlowFit, hourly
from core.model import ModeClassifier, ModelParams

TRUE = ModelParams(gain={"off": 0.0, "low": 0.20, "high": 0.13}, k_open=0.010, offset=-0.004)


def ctx(samples, cover=False):
    return LearningContext(samples, now=samples[-1].t + 900, tz=TZ, cover=cover)


def test_hourly_slope_needs_full_window():
    hours = hourly(simulate(TRUE, days=1), TZ, ModeClassifier())
    assert len(hours) == 24
    assert all(h.slope is None for h in hours[:2] + hours[-2:])
    assert all(h.slope is not None for h in hours[2:-2])


def test_slow_fit_recovers_parameters():
    p, report = SlowFit(blend=1.0).fit(ModelParams(), ctx(simulate(TRUE, days=28)))
    assert report.accepted, report.reason
    assert p.gain["low"] == pytest.approx(0.20, rel=0.1)
    assert p.gain["high"] == pytest.approx(0.13, rel=0.15)
    assert report.new["fit"]["k"] == pytest.approx(0.010, rel=0.1)
    assert p.power["low"] == pytest.approx(0.39, rel=0.05)


def test_slow_fit_blends_does_not_mutate_and_rejects():
    params = ModelParams()
    samples = simulate(TRUE, days=28)
    p, _ = SlowFit().fit(params, ctx(samples))
    assert p.gain["low"] == pytest.approx(0.7 * 0.30 + 0.3 * 0.20, rel=0.03)
    assert params.gain["low"] == 0.30
    _, short = SlowFit().fit(params, ctx(samples[: 96 * 5]))
    assert not short.accepted and "not enough" in short.reason


def test_cooling_fit_follows_insulation_cover_within_a_week():
    # cooling drops by 40 % at day 21; after 7 more days the fit must have followed
    samples = simulate(TRUE, days=28, k_change=(21, 0.006))
    p, report = CoolingFit().fit(TRUE, ctx(samples))
    assert report.accepted, report.reason
    assert p.k_open == pytest.approx(0.006, rel=0.1)


def test_cooling_fit_for_cover_state_and_rejection():
    samples = simulate(TRUE, days=10)
    for s in samples:
        s.cover = True
    p, report = CoolingFit().fit(TRUE, ctx(samples, cover=True))
    assert report.accepted and p.k_cover == pytest.approx(0.010, rel=0.1) and p.k_open == TRUE.k_open
    _, none = CoolingFit().fit(TRUE, ctx(samples, cover=False))
    assert not none.accepted


class _Recorder:
    kind = "recorder"

    def __init__(self):
        self.seen = []

    def fit(self, params, context):
        self.seen.append(params.offset)
        new = params.copy()
        new.offset += 1
        return new, FitReport(self.kind, True)


def test_learner_chains_fitters():
    a, b = _Recorder(), _Recorder()
    p, reports = Learner([a, b]).learn(ModelParams(offset=0.0), ctx(simulate(TRUE, days=1)))
    assert a.seen == [0.0] and b.seen == [1.0] and p.offset == 2.0
    assert [r.kind for r in reports] == ["recorder", "recorder"]


def test_learner_default_fitters():
    assert [f.kind for f in Learner().fitters] == ["slow", "cooling"]


def test_reference_dataset(reference_samples):
    # reference pond 10-10..16-11-2026: low ~0.30, high ~0.21 K/h per kW, k ~0.012 /h
    context = LearningContext(reference_samples, now=reference_samples[-1].t + 900, tz=TZ)
    p, report = SlowFit(days=40, blend=1.0).fit(ModelParams(), context)
    assert report.accepted, report.reason
    assert p.gain["low"] == pytest.approx(0.30, rel=0.1)
    assert p.gain["high"] == pytest.approx(0.21, rel=0.1)
    assert 1.3 < p.gain["low"] / p.gain["high"] < 1.7
    assert report.new["fit"]["k"] == pytest.approx(0.012, rel=0.1)
    q, k_report = CoolingFit().fit(p, context)
    assert k_report.accepted and 0.009 < q.k_open < 0.018


TRUE_BOOST = ModelParams(
    power={"off": 0.005, "low": 0.39, "high": 0.90, "boost": 1.15},
    gain={"off": 0.0, "low": 0.20, "high": 0.13, "boost": 0.10},
    k_open=0.010,
    offset=-0.004,
)


def boost_ctx(samples):
    return LearningContext(
        samples, now=samples[-1].t + 900, tz=TZ, classifier=ModeClassifier(capacity_preset="quick")
    )


def test_slow_fit_learns_boost_separately_from_high():
    samples = simulate(TRUE_BOOST, days=28, boost="quick")
    p, report = SlowFit(blend=1.0).fit(ModelParams(), boost_ctx(samples))
    assert report.accepted, report.reason
    assert p.gain["boost"] == pytest.approx(0.10, rel=0.2)
    assert p.gain["high"] == pytest.approx(0.13, rel=0.15)
    assert p.power["boost"] == pytest.approx(1.15, rel=0.05)
    assert p.power["high"] == pytest.approx(0.90, rel=0.05)
    assert "boost" in p.fitted
    # without the preset the same quarters count as high and spoil it
    mixed, _ = SlowFit(blend=1.0).fit(ModelParams(), ctx(samples))
    assert mixed.power["high"] > 0.95


def test_boost_follows_high_until_it_has_been_learned():
    p, report = SlowFit(blend=1.0).fit(ModelParams(), ctx(simulate(TRUE, days=28)))
    assert report.accepted and "boost" not in p.fitted
    assert p.gain["boost"] == pytest.approx(0.9 * p.gain["high"])


def test_cooling_fit_subtracts_boost_heat():
    samples = simulate(TRUE_BOOST, days=7, boost="quick")
    p, report = CoolingFit().fit(TRUE_BOOST.copy(), boost_ctx(samples))
    assert report.accepted, report.reason
    assert p.k_open == pytest.approx(0.010, rel=0.15)

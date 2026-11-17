import pytest
from conftest import TZ, simulate
from core.model import DT, ModelParams, PredictionTracker, fit_k, fit_slow, hourly, mode_of

TRUE = ModelParams(gain={"off": 0.0, "low": 0.20, "high": 0.13}, k_open=0.010, offset=-0.004)


def test_step_matches_hand_calculation():
    p = ModelParams()
    t = p.step(15.0, "low", 5.0)
    assert t == pytest.approx(15.0 + DT * (0.30 * 0.39 - 0.012 * 10 - 0.01))
    starting = p.step(15.0, "low", 5.0, starting=True)
    assert starting == pytest.approx(15.0 + DT * (0.75 * 0.30 * 0.39 - 0.012 * 10 - 0.01))
    assert p.step(15.0, "off", 5.0, starting=True) == pytest.approx(15.0 + DT * (-0.12 - 0.01))


def test_cover_uses_default_ratio_until_learned():
    p = ModelParams()
    assert p.k(True) == pytest.approx(0.012 * 0.6)
    p.k_cover = 0.004
    assert p.k(True) == 0.004 and p.k(False) == 0.012


def test_params_roundtrip_and_partial_dict():
    p = ModelParams(k_cover=0.004)
    assert ModelParams.from_dict(p.to_dict()) == p
    q = ModelParams.from_dict({"gain": {"low": 0.3}, "unknown": 1})
    assert q.gain["low"] == 0.3 and q.gain["high"] == 0.21


def test_mode_of():
    assert mode_of(None, 150, 650) is None
    assert mode_of(5, 150, 650) == "off"
    assert mode_of(390, 150, 650) == "low"
    assert mode_of(900, 150, 650) == "high"


def test_hourly_slope_needs_neighbours():
    samples = simulate(TRUE, days=1)
    hours = hourly(samples, TZ, 150, 650)
    assert len(hours) == 24
    assert hours[0].slope is None and hours[1].slope is None
    assert all(h.slope is not None for h in hours[2:-2])
    assert all(h.slope is None for h in hours[-2:])


def test_fit_slow_recovers_parameters():
    samples = simulate(TRUE, days=28)
    now = samples[-1].t + 900
    p, report = fit_slow(ModelParams(), samples, now, TZ, blend=1.0)
    assert report.accepted, report.reason
    assert p.gain["low"] == pytest.approx(0.20, rel=0.1)
    assert p.gain["high"] == pytest.approx(0.13, rel=0.15)
    assert report.new["fit"]["k"] == pytest.approx(0.010, rel=0.1)
    assert p.power["low"] == pytest.approx(0.39, rel=0.05)


def test_fit_slow_blends_and_rejects():
    samples = simulate(TRUE, days=28)
    now = samples[-1].t + 900
    p, _ = fit_slow(ModelParams(), samples, now, TZ)
    assert 0.20 < p.gain["low"] < 0.30  # 30 % of the way from the default to the fit
    assert p.gain["low"] == pytest.approx(0.7 * 0.30 + 0.3 * 0.20, rel=0.03)
    _, short = fit_slow(ModelParams(), samples[: 96 * 5], now, TZ)
    assert not short.accepted and "not enough" in short.reason


def test_fit_k_follows_insulation_cover_within_a_week():
    # cooling drops by 40 % at day 21; after 7 more days the fast fit must have followed
    samples = simulate(TRUE, days=28, k_change=(21, 0.006))
    now = samples[-1].t + 900
    p, report = fit_k(TRUE, samples, cover=False, now=now, tz=TZ)
    assert report.accepted, report.reason
    assert p.k_open == pytest.approx(0.006, rel=0.1)


def test_fit_k_for_cover_state_and_rejections():
    samples = simulate(TRUE, days=10)
    for s in samples:
        s.cover = True
    now = samples[-1].t + 900
    p, report = fit_k(TRUE, samples, cover=True, now=now, tz=TZ)
    assert report.accepted and p.k_cover == pytest.approx(0.010, rel=0.1) and p.k_open == TRUE.k_open
    _, none = fit_k(TRUE, samples, cover=False, now=now, tz=TZ)
    assert not none.accepted


def test_reference_dataset(reference_samples):
    # reference pond 10-10..16-11-2026: low ~0.30, high ~0.21 K/h per kW, k ~0.012 /h
    now = reference_samples[-1].t + 900
    p, report = fit_slow(ModelParams(), reference_samples, now, TZ, days=40, blend=1.0)
    assert report.accepted, report.reason
    assert p.gain["low"] == pytest.approx(0.30, rel=0.1)
    assert p.gain["high"] == pytest.approx(0.21, rel=0.1)
    assert 1.3 < p.gain["low"] / p.gain["high"] < 1.7
    assert report.new["fit"]["k"] == pytest.approx(0.012, rel=0.1)
    q, k_report = fit_k(p, reference_samples, cover=False, now=now, tz=TZ)
    assert k_report.accepted and 0.009 < q.k_open < 0.018


def test_prediction_tracker():
    tr = PredictionTracker(window_hours=24)
    tr.predict(3600, 15.0)
    tr.predict(7200, 15.2)
    tr.observe(3600, 15.1)
    assert tr.mean_abs_error() == pytest.approx(0.1)
    tr.observe(7200 + 3600, 15.0)  # too late to compare: dropped
    assert tr.mean_abs_error() == pytest.approx(0.1)
    tr.observe(3600 + 25 * 3600, None)
    assert tr.mean_abs_error() is None

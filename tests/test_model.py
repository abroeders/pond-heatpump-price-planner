import pytest
from core.model import DT, ModeClassifier, ModelParams


def test_step_matches_hand_calculation():
    p = ModelParams()
    assert p.step(15.0, "low", 5.0) == pytest.approx(15.0 + DT * (0.30 * 0.39 - 0.012 * 10 - 0.01))
    starting = p.step(15.0, "low", 5.0, starting=True)
    assert starting == pytest.approx(15.0 + DT * (0.75 * 0.30 * 0.39 - 0.012 * 10 - 0.01))
    assert p.step(15.0, "off", 5.0, starting=True) == pytest.approx(15.0 + DT * (-0.12 - 0.01))


def test_cover_uses_default_ratio_until_learned():
    p = ModelParams()
    assert p.k(True) == pytest.approx(0.012 * 0.6)
    p.k_cover = 0.004
    assert p.k(True) == 0.004 and p.k(False) == 0.012


def test_params_roundtrip_copy_and_partial_dict():
    p = ModelParams(k_cover=0.004)
    assert ModelParams.from_dict(p.to_dict()) == p
    c = p.copy()
    c.gain["low"] = 1.0
    assert p.gain["low"] == 0.30  # copy is independent
    q = ModelParams.from_dict({"gain": {"low": 0.3}, "unknown": 1})
    assert q.gain["low"] == 0.3 and q.gain["high"] == 0.21


def test_mode_classifier():
    c = ModeClassifier()
    assert c.mode(None) is None
    assert c.mode(5) == "off"
    assert c.mode(390) == "low"
    assert c.mode(900) == "high"
    assert ModeClassifier(low_w=500, high_w=1000).mode(900) == "low"

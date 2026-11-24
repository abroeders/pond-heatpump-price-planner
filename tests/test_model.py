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


def test_boost_parameters_default_to_high():
    p = ModelParams(power={"off": 0.0, "low": 0.4, "high": 0.9}, gain={"off": 0.0, "low": 0.3, "high": 0.2})
    assert p.power["boost"] == 0.9 and p.gain["boost"] == pytest.approx(0.18)
    old = ModelParams.from_dict({"gain": {"low": 0.3, "high": 0.15}, "power": {"high": 0.95}})
    assert old.gain["boost"] == pytest.approx(0.135)  # stored before boost existed: boost starts from high
    assert old.power["boost"] == 1.10
    assert ModelParams.from_dict(old.to_dict()) == old


def test_mode_classifier_boost_needs_the_capacity_preset():
    c = ModeClassifier(capacity_preset="quick_heat")
    assert c.mode(1100, "quick_heat") == "boost"
    assert c.mode(1100, "quiet_heat") == "high"
    assert c.mode(1100) == "high"  # unknown preset: the efficient one
    assert c.mode(390, "quick_heat") == "low"
    assert c.mode(5, "quick_heat") == "off"
    assert ModeClassifier().mode(1100, "quick_heat") == "high"  # no boost configured

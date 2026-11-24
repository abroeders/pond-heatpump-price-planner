import pytest
from core.safety import (
    ABOVE_BAND,
    BELOW_BAND,
    FAR_BELOW_BAND,
    NO_PLAN,
    NO_POND_TEMPERATURE,
    PLAN,
    Decision,
    MismatchTracker,
    SafetyGuard,
)
from core.setpoint import OffsetSetpoint


def decide(guard, pond, plan_mode="off", **kw):
    args = dict(plan_mode=plan_mode, pond=pond, pond_age=0, target=15.0, band=0.25)
    args.update(kw)
    return guard.decide(**args)


def test_plan_is_followed_inside_the_band():
    assert decide(SafetyGuard(), 15.0, "low") == Decision("low", PLAN)


def test_missing_or_stale_pond_temperature_gives_low():
    g = SafetyGuard()
    assert decide(g, None) == Decision("low", NO_POND_TEMPERATURE)
    assert decide(g, 15.0, pond_age=7 * 3600) == Decision("low", NO_POND_TEMPERATURE)
    # a sensor that only reports changes may be quiet for hours: that is not missing
    assert decide(g, 15.0, "off", pond_age=3 * 3600) == Decision("off", PLAN)


def test_far_below_gives_high_or_low_when_high_is_not_allowed():
    assert decide(SafetyGuard(), 14.4) == Decision("high", FAR_BELOW_BAND)
    assert decide(SafetyGuard(), 14.4, allow_high=False) == Decision("low", FAR_BELOW_BAND)


def test_below_band_never_lowers_the_plan():
    assert decide(SafetyGuard(), 14.7, "off") == Decision("low", BELOW_BAND)
    assert decide(SafetyGuard(), 14.7, "high") == Decision("high", BELOW_BAND)
    assert decide(SafetyGuard(), 14.7, "high", allow_high=False) == Decision("low", BELOW_BAND)


def test_above_band_gives_off():
    assert decide(SafetyGuard(), 15.3, "high") == Decision("off", ABOVE_BAND)


def test_hysteresis_at_the_lower_limit():
    g = SafetyGuard()
    assert decide(g, 14.74).reason == BELOW_BAND
    assert decide(g, 14.77).reason == BELOW_BAND  # not yet 0.05 K back inside
    assert decide(g, 14.80).reason == PLAN


def test_hysteresis_at_the_upper_and_far_limits():
    g = SafetyGuard()
    assert decide(g, 15.26, "low").reason == ABOVE_BAND
    assert decide(g, 15.22, "low").reason == ABOVE_BAND
    assert decide(g, 15.20, "low").reason == PLAN
    assert decide(g, 14.44).reason == FAR_BELOW_BAND
    assert decide(g, 14.47).reason == FAR_BELOW_BAND
    assert decide(g, 14.50).reason == BELOW_BAND


def test_no_plan_acts_as_thermostat():
    g = SafetyGuard()
    assert decide(g, 14.9, None) == Decision("low", NO_PLAN)
    assert decide(g, 15.2, None) == Decision("off", NO_PLAN)
    assert decide(g, 15.05, None, previous="low") == Decision("low", NO_PLAN)


@pytest.mark.parametrize(
    ("mode", "inlet", "pond", "expected"),
    [
        ("low", 14.4, 15.0, 14),
        ("low", 14.5, 15.0, 15),
        ("high", 14.0, 15.0, 15),
        ("off", 14.0, 15.0, 12),
        ("low", None, 15.3, 15),
        ("off", 8.0, 8.0, 7),  # clamped to the minimum
    ],
)
def test_offset_setpoint(mode, inlet, pond, expected):
    assert OffsetSetpoint().setpoint(mode, inlet, pond, min_temp=7, max_temp=60, step=1) == expected


def test_start_offset_while_not_running():
    sp = OffsetSetpoint()
    # inlet 14: a stopped heat pump only starts on 16 (measured on the reference heat pump)
    assert sp.setpoint("low", 14.0, 14.6, 7, 60, 1, running=False) == 16
    assert sp.setpoint("high", 14.0, 14.6, 7, 60, 1, running=False) == 16
    assert sp.setpoint("off", 14.0, 14.6, 7, 60, 1, running=False) == 12
    assert sp.setpoint("low", 14.0, 14.6, 7, 60, 1, running=True) == 14
    # the start offset never lowers the mode's setpoint
    assert (
        OffsetSetpoint({"off": -2, "low": 0, "high": 3, "start": 2}).setpoint(
            "high", 14.0, 14.6, 7, 60, 1, False
        )
        == 17
    )
    # without a start offset nothing changes
    assert OffsetSetpoint({"off": -2, "low": 0, "high": 1}).setpoint("low", 14.0, 14.6, 7, 60, 1, False) == 14


def test_offset_setpoint_half_degree_step_and_custom_offsets():
    sp = OffsetSetpoint({"off": -3, "low": 0.5, "high": 2})
    assert sp.setpoint("low", 14.3, 15.0, 7, 60, 0.5) == 15.0
    assert sp.setpoint("off", 14.3, 15.0, 7, 60, 0.5) == 11.5


def test_mismatch_after_grace_and_repair_after_two_hours():
    m = MismatchTracker()
    m.applied("low", 0)
    assert m.observe("off", 600) == (False, False)  # still starting up
    assert m.observe("off", 1800) == (True, False)
    assert m.observe("off", 1800 + 5399) == (True, False)
    assert m.observe("off", 1800 + 5400) == (True, True)
    assert m.observe("low", 9000) == (False, False)  # follows again
    assert m.observe("high", 9100) == (False, False)  # high while low was asked is fine


def test_mismatch_resets_on_new_mode_and_without_data():
    m = MismatchTracker()
    assert m.observe("off", 0) == (False, False)
    m.applied("off", 0)
    assert m.observe(None, 5000) == (False, False)
    m.applied("low", 100)
    assert m.observe("off", 1000) == (False, False)


def test_far_below_gives_boost_when_available():
    assert decide(SafetyGuard(), 14.4, allow_boost=True) == Decision("boost", FAR_BELOW_BAND)
    assert decide(SafetyGuard(), 14.4, allow_boost=True, allow_high=False) == Decision("low", FAR_BELOW_BAND)


def test_below_band_keeps_boost_only_when_available():
    assert decide(SafetyGuard(), 14.7, "boost", allow_boost=True) == Decision("boost", BELOW_BAND)
    assert decide(SafetyGuard(), 14.7, "boost") == Decision("high", BELOW_BAND)
    assert decide(SafetyGuard(), 15.0, "boost", allow_boost=True) == Decision("boost", PLAN)


def test_boost_setpoint_uses_its_own_offset_and_the_start_offset():
    s = OffsetSetpoint()
    assert s.setpoint("boost", 14.0, 14.0, 7, 35, 1) == 15.0
    assert s.setpoint("boost", 14.0, 14.0, 7, 35, 1, running=False) == 16.0
    assert OffsetSetpoint({"boost": 2}).setpoint("boost", 14.0, 14.0, 7, 35, 1) == 16.0

from core.preset import CapacityPreset, NoPreset, preset_strategy


def test_capacity_preset_only_for_boost():
    s = CapacityPreset("quiet_heat", "quick_heat")
    assert s.preset("boost") == "quick_heat"
    assert [s.preset(m) for m in ("off", "low", "high")] == ["quiet_heat"] * 3


def test_no_preset_without_two_different_presets():
    assert isinstance(preset_strategy(None, None), NoPreset)
    assert isinstance(preset_strategy("quiet_heat", None), NoPreset)
    assert isinstance(preset_strategy("quiet_heat", "quiet_heat"), NoPreset)
    assert preset_strategy("quiet_heat", "quick_heat") == CapacityPreset("quiet_heat", "quick_heat")
    assert NoPreset().preset("boost") is None

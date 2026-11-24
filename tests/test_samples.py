from core.samples import (
    QUARTER,
    PowerIntegrator,
    Sample,
    fill_presets,
    merge,
    prune,
    quarter_start,
    to_quarters,
)


def test_quarter_start():
    assert quarter_start(1000.0) == 900.0
    assert quarter_start(900.0) == 900.0


def test_power_integrator_is_time_weighted():
    p = PowerIntegrator()
    p.add(0, 100)
    p.add(600, 400)  # 100 W for 10 min, 400 W for 5 min
    assert p.mean(0, 900) == 200


def test_power_integrator_holds_value_from_before_the_interval():
    p = PowerIntegrator()
    p.add(-3600, 390)
    assert p.mean(0, 900) == 390


def test_power_integrator_unavailable_and_coverage():
    p = PowerIntegrator()
    p.add(0, 400)
    p.add(300, None)  # unavailable after 5 min
    assert p.mean(0, 900) is None  # only a third known
    p.add(450, 400)
    assert p.mean(0, 900) == 400  # 5 + 7.5 min known, both 400 W


def test_power_integrator_out_of_order_and_prune():
    p = PowerIntegrator()
    p.add(600, 400)
    p.add(0, 100)
    assert p.mean(0, 900) == 200
    p.prune(700)
    assert p.mean(900, 1800) == 400


def test_to_quarters_takes_end_temperature_and_mean_power():
    series = {
        "pond": [(0, 14.0), (800, 14.1)],
        "outdoor": [(0, 5.0)],
        "power": [(0, 0.0), (450, 400.0)],
    }
    q = to_quarters(series, 0, 2 * QUARTER)
    assert [s.t for s in q] == [0, QUARTER]
    assert q[0].pond == 14.1 and q[0].outdoor == 5.0 and q[0].power == 200
    assert q[1].power == 400


def test_sample_roundtrip_prune_and_merge():
    s = Sample(900.0, 14.2, 6.1, 390.0, True, 0.31)
    assert Sample.from_list(s.to_list()) == s
    old_format = Sample.from_list([0, 1.0, 2.0, 3.0, 1])  # stored before prices were kept
    assert old_format.cover is True and old_format.price is None
    assert Sample.from_list([0, 1.0, 2.0, 3.0]).cover is False
    old = [Sample(0, 1, 1, 1), Sample(900, 1, 1, 1)]
    new = [Sample(900, 2, 2, 2)]
    assert [x.pond for x in merge(old, new)] == [1, 2]
    assert prune(old, now=42 * 86400 + 900, days=42) == [Sample(900, 1, 1, 1)]


def test_sample_keeps_the_preset_and_reads_older_rows():
    s = Sample(900.0, 14.2, 6.1, 1100.0, False, 0.31, "quick_heat")
    assert Sample.from_list(s.to_list()) == s
    assert Sample.from_list([0, 1.0, 2.0, 3.0, 0, 0.3]).preset is None  # stored before presets were kept


def test_to_quarters_takes_the_preset_at_the_end_of_the_quarter():
    series = {
        "pond": [(0, 14.0)],
        "outdoor": [(0, 5.0)],
        "power": [(0, 900.0)],
        "preset": [(0, "quiet_heat"), (1000, "quick_heat")],
    }
    q = to_quarters(series, 0, 2 * QUARTER)
    assert [s.preset for s in q] == ["quiet_heat", "quick_heat"]
    assert to_quarters({k: v for k, v in series.items() if k != "preset"}, 0, QUARTER)[0].preset is None


def test_fill_presets_only_fills_missing_presets_after_the_first_change():
    samples = [Sample(i * QUARTER, 14, 5, 900) for i in range(4)]
    samples[3].preset = "kept"
    filled = fill_presets(samples, [(QUARTER + 100, "quiet_heat"), (2 * QUARTER + 100, "quick_heat")])
    assert filled == 2
    assert [s.preset for s in samples] == [None, "quiet_heat", "quick_heat", "kept"]
    assert fill_presets(samples, []) == 0

import math
import random

import pytest
from conftest import TZ, epoch
from core.cop import (
    CopBucket,
    CopResult,
    FlowAccumulator,
    LossFit,
    capacity_kwh_per_k,
    combine,
    cop_flow,
    cop_pond,
    fit_loss,
    heat_loss_w_per_k,
    model_check,
    outlet_offset,
    thermal_power_w,
)
from core.learning import hourly
from core.model import ModeClassifier, ModelParams
from core.samples import QUARTER, Sample

H = 3600.0


def test_capacity_heat_loss_and_thermal_power():
    c = capacity_kwh_per_k(21)
    assert c == pytest.approx(24.423)
    p = ModelParams()
    assert heat_loss_w_per_k(p, False, c) == pytest.approx(0.012 * c * 1000)
    assert heat_loss_w_per_k(p, True, c) == pytest.approx(0.012 * 0.6 * c * 1000)
    assert thermal_power_w(p, "low", c) == pytest.approx(0.30 * 0.39 * c * 1000)
    assert thermal_power_w(p, "off", c) == 0
    assert capacity_kwh_per_k(None) is None and heat_loss_w_per_k(p, False, None) is None


def test_accumulator_skips_settling_time_and_idle():
    acc = FlowAccumulator(run_threshold_w=100, settle_s=1200)
    acc.update(0, power=5, t_in=14, t_out=14)
    acc.update(600, power=400, t_out=15)  # start at 10 min
    (b,) = acc.close_hour(H)
    # counted from 600 + 1200 = 1800 to 3600: half an hour
    assert b.seconds == pytest.approx(1800)
    assert b.heat_per_flow_kwh == pytest.approx(1.163 * 1 * 0.5)
    assert b.elec_kwh == pytest.approx(0.4 * 0.5)  # power integrated: no energy counter
    assert b.power_w == pytest.approx(400)


def test_accumulator_uses_energy_counter_and_ignores_reset():
    acc = FlowAccumulator(settle_s=0)
    acc.update(0, power=400, t_in=14, t_out=15, energy=100.0)
    acc.update(1800, energy=100.3)  # 0.3 kWh in the first half hour, all counted
    acc.update(2700, power=5)  # stops: the rest of the counter increase is only partly counted
    acc.update(3600, energy=100.5)
    (b,) = acc.close_hour(3600)
    assert b.elec_kwh == pytest.approx(0.3 + 0.2 * 900 / 1800)
    acc.update(3700, power=400, energy=0.0)  # counter reset
    acc.update(5400, energy=0.2)
    (b2,) = acc.close_hour(2 * H)
    assert b2.elec_kwh == pytest.approx(0.2)


def test_accumulator_needs_both_water_temperatures():
    acc = FlowAccumulator(settle_s=0)
    acc.update(0, power=400, t_in=14)
    acc.update(1800, power=400)
    assert acc.close_hour(H)[0].seconds == 0


def test_late_timer_keeps_the_finished_hour():
    acc = FlowAccumulator(settle_s=0)
    acc.update(0, power=400, t_in=14, t_out=15)
    (b,) = acc.close_hour(H + 1)  # the hourly timer runs at hh:00:01
    assert b.t == 0 and b.seconds == pytest.approx(H)
    assert acc.close_hour(2 * H + 1)[0].seconds == pytest.approx(H)


def test_update_after_the_hour_keeps_the_finished_hour():
    acc = FlowAccumulator(settle_s=0)
    acc.update(0, power=400, t_in=14, t_out=15)
    acc.update(H + 0.5, power=410)  # a sensor update just after the hour, before the timer
    (b,) = acc.close_hour(H + 1)
    assert b.t == 0 and b.seconds == pytest.approx(H)


def test_one_update_crossing_several_hours_keeps_them_all():
    acc = FlowAccumulator(settle_s=0)
    acc.update(0, power=400, t_in=14, t_out=15)
    acc.update(3 * H + 60, power=400)
    assert [b.t for b in acc.close_hour(3 * H + 61)] == [0, H, 2 * H]
    assert acc.close_hour(3 * H + 62) == []


def test_bucket_roundtrip():
    b = CopBucket(3600, 1800, 0.5, 0.2, 400 * 1800, 5 * 1800, 1800)
    assert CopBucket.from_list(b.to_list()) == b
    assert b.outdoor == 5 and b.hours == 0.5


def test_old_bucket_list_loads_without_sums():
    b = CopBucket.from_list([3600, 1800, 0.5, 0.2, 400 * 1800, 5 * 1800, 1800])
    assert not b.has_sums and b.out_ks == 0 and b.cal_s == 0
    assert cop_flow([b], 3.0, 2 * H, min_hours=0, inlet="heat_pump").cop == pytest.approx(0.5 * 3 / 0.2)
    assert cop_flow([b], 3.0, 2 * H, min_hours=0, inlet="pond").hours == 0  # cannot use the pond


def test_calibration_starts_30_minutes_after_a_stop():
    acc = FlowAccumulator(settle_s=0)
    acc.update(0, power=400, t_in=14, t_out=15, pond=14.6)
    acc.update(600, power=5)  # stops
    acc.update(1800, t_out=14)
    (b,) = acc.close_hour(H)
    assert b.cal_s == pytest.approx(H - 600 - 1800)  # from 2400 s
    assert b.cal_ks == pytest.approx(0.6 * b.cal_s)
    assert b.seconds == pytest.approx(600)
    assert b.out_ks == pytest.approx(15 * 600) and b.pond_ks == pytest.approx(14.6 * 600)


def test_no_calibration_without_flow_or_pond_and_after_start_up_only_later():
    acc = FlowAccumulator(settle_s=0)
    acc.update(0, power=5, t_out=14)  # start-up with the heat pump off: wait 30 minutes
    acc.update(2400, pond=14.5)  # pond known only from 40 min
    acc.update(3000, circulation=False)  # no flow from 50 min
    (b,) = acc.close_hour(H)
    assert b.cal_s == pytest.approx(600)
    acc.update(H + 600, circulation=True)
    (b2,) = acc.close_hour(2 * H)
    assert b2.cal_s == pytest.approx(H - 600)


def test_outlet_offset_learned_manual_and_none():
    b = CopBucket(0, cal_s=1800, cal_ks=0.28 * 1800)
    learned = outlet_offset([b], H, None)
    assert learned.source == "learned" and learned.offset == pytest.approx(0.28) and learned.hours == 0.5
    assert outlet_offset([b], H, 0.3).offset == 0.3 and outlet_offset([b], H, 0.3).source == "manual"
    assert outlet_offset([b], 30 * 86400, None).source == "none"  # outside the 21 days


def test_pond_inlet_and_learned_offset_recover_the_cop_from_biased_sensors():
    """Whole-degree sensors as on the W'eau: the inlet stays at 14 and the outlet reads 0.28 K low."""
    rng = random.Random(3)
    cop, flow = 4.5, 2.75
    true_dt = cop * 0.4 / (flow * 1.163)
    acc = FlowAccumulator(settle_s=1200)
    buckets = []
    for i in range(21 * 96):
        t = i * QUARTER
        buckets += acc.close_hour(t)
        on = (i % 96) < 72  # 18 h a day on, 6 h off
        pond = 14.6 + 0.05 * math.sin(i / 20)
        t_out = pond + (true_dt if on else 0) - 0.28 + rng.uniform(-0.5, 0.5)
        acc.update(t, power=400 if on else 5, t_in=14, t_out=round(t_out), pond=round(pond / 0.06) * 0.06)
    now = 21 * 86400
    offset = outlet_offset(buckets, now, None)
    assert offset.offset == pytest.approx(0.28, abs=0.05) and offset.hours > 50
    raw = cop_flow(buckets, flow, now, window_days=21)
    fixed = cop_flow(buckets, flow, now, window_days=21, inlet="pond", offset=offset.offset)
    assert raw.cop > 1.3 * cop  # the stuck inlet overestimates
    assert fixed.cop == pytest.approx(cop, rel=0.05)


def synthetic_buckets(days: int, cop: float, flow: float, quantum: float, seed: int = 2):
    """Running 12 h a day at 400 W; the true ΔT gives the COP; water temperatures quantised."""
    rng = random.Random(seed)
    true_dt = cop * 0.4 / (flow * 1.163)
    acc = FlowAccumulator(settle_s=0)
    out = []
    for i in range(days * 96):
        t = i * QUARTER
        out += acc.close_hour(t)
        on = (i % 96) < 48
        t_in = 14 + 0.3 * math.sin(i / 10) + rng.uniform(-0.5, 0.5)
        t_out = t_in + (true_dt if on else 0)
        acc.update(
            t,
            power=400 if on else 5,
            t_in=round(t_in / quantum) * quantum,
            t_out=round(t_out / quantum) * quantum,
            outdoor=8.0,
        )
    return out


def test_flow_method_recovers_cop_over_two_weeks_but_not_per_day():
    buckets = synthetic_buckets(14, cop=5.0, flow=3.0, quantum=1.0)
    now = 14 * 86400
    res = cop_flow(buckets, 3.0, now, window_days=14)
    assert res.cop == pytest.approx(5.0, rel=0.05)
    assert res.by_outdoor["5-10"] == pytest.approx(5.0, rel=0.05)
    daily = [cop_flow(buckets, 3.0, (d + 1) * 86400, window_days=1, min_hours=1).cop for d in range(14)]
    assert max(abs(c / 5.0 - 1) for c in daily) > 0.3  # why there is no daily COP
    assert cop_flow(buckets, None, now) is None


def reference_hours(reference):
    rows = [r for r in reference if r["t"] < epoch("2026-11-17T00:00:00+01:00")]
    samples = [Sample(r["t"], r["pond"], r["outdoor"], r["power_w"]) for r in rows]
    return rows, hourly(samples, TZ, ModeClassifier())


def test_reference_flow_method(reference):
    rows, _ = reference_hours(reference)
    acc, buckets = FlowAccumulator(), []
    for r in rows:
        buckets += acc.close_hour(r["t"])
        acc.update(r["t"], power=r["power_w"], t_in=r["water_in"], t_out=r["water_out"], outdoor=r["air_in"])
    res = cop_flow(buckets, 3.0, rows[-1]["t"] + QUARTER, window_days=40)
    assert res.cop == pytest.approx(5.3, abs=0.2)
    assert 1.3 < res.by_power["low"] / res.by_power["high"] < 1.7


def test_reference_pond_method(reference):
    rows, hours = reference_hours(reference)
    now = rows[-1]["t"] + QUARTER
    capacity = capacity_kwh_per_k(21)
    loss = fit_loss(hours, capacity, now, days=40)
    assert loss is not None and 0.1 < loss.b_kw_per_k < 0.4
    res = cop_pond(hours, loss, capacity, now, window_days=40)
    assert res.cop == pytest.approx(5.5, abs=0.3)
    assert 1.3 < res.by_power["low"] / res.by_power["high"] < 1.7


def test_fit_loss_needs_off_hours_and_pond_needs_inputs():
    assert fit_loss([], 24.4, 0) is None
    assert cop_pond([], None, 24.4, 0) is None
    assert cop_pond([], LossFit(0.6, 0.2, 100), None, 0) is None


def test_model_check():
    params = ModelParams()  # ratio 0.30 / 0.21 = 1.43
    close = CopResult(5.0, 100, by_power={"low": 6.9, "high": 4.7})
    far = CopResult(5.0, 100, by_power={"low": 6.0, "high": 5.9})
    assert model_check(params, close) is None
    assert model_check(params, far) is not None
    assert model_check(params, close, far) is None  # one method agrees
    assert model_check(params, None) is None


def test_combine_methods():
    flow = CopResult(5.4, 400, by_outdoor={"<5": 5.0, "5-10": None}, by_power={"low": 7.0, "high": 4.6})
    pond = CopResult(5.6, 700, by_outdoor={"<5": None, "5-10": 5.4}, by_power={"low": 6.8, "high": 5.0})
    assert combine("flow", flow, pond) is flow
    assert combine("pond", flow, pond) is pond
    avg = combine("average", flow, pond)
    assert avg.cop == pytest.approx(5.5)
    assert avg.by_outdoor == {"<5": 5.0, "5-10": 5.4}  # the method with a value fills the gap
    assert avg.by_power["low"] == pytest.approx(6.9) and avg.by_power["high"] == pytest.approx(4.8)
    assert combine("average", None, pond) is pond
    assert combine("average", None, None) is None
    with pytest.raises(ValueError):
        combine("other", flow, pond)

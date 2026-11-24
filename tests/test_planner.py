import time

import numpy as np
import pytest
from core.costs import EnergyCosts
from core.model import ModelParams
from core.planner import DynamicProgrammingPlanner, PlanRequest

N = 144


def request(price, outdoor=10.0, **kw):
    defaults = dict(start=0.0, pond=15.0, mode_now="off", target=15.0, band=0.25, params=ModelParams())
    defaults.update(kw)
    costs = price if isinstance(price, EnergyCosts) else EnergyCosts(price)
    out = outdoor if isinstance(outdoor, list) else [outdoor] * len(costs.price)
    return PlanRequest(outdoor=out, costs=costs, **defaults)


def plan(price, **kw):
    return DynamicProgrammingPlanner().make_plan(request(price, **kw))


def block_price(base=0.30, high=0.60, block=range(40, 52)):
    price = [base] * N
    for q in block:
        price[q] = high
    return price


def test_preheats_before_an_expensive_block_and_stays_in_band():
    p = plan(block_price())
    assert all(m == "off" for m in p.modes[40:52])
    assert any(m != "off" for m in p.modes[28:40])
    assert min(p.temps) >= 14.75 and max(p.temps) <= 15.25
    assert p.expensive_share < 0.05


def test_no_preheating_when_low_cannot_keep_up():
    # at 5 °C low mode barely covers the loss: heating in the block is the cheapest option
    p = plan(block_price(), outdoor=5.0)
    assert any(m != "off" for m in p.modes[40:52])


def test_high_only_with_a_large_price_ratio():
    flat = plan([0.30] * N)
    assert "high" not in flat.modes
    price = [0.10] * 8 + [0.60] * (N - 8)  # cheap start, then 6x as expensive
    assert "high" in plan(price, pond=14.9).modes[:8]
    assert "high" not in plan(price, pond=14.9, allow_high=False).modes


def test_start_penalty_reduces_starts():
    rng = np.random.default_rng(3)
    price = list(0.30 + 0.15 * rng.random(N))
    free = plan(price, start_penalty=0.0)
    costly = plan(price, start_penalty=0.5)
    assert costly.starts <= free.starts
    assert costly.starts <= 2


def test_soft_band_heats_immediately_when_far_below():
    p = plan([0.30] * N, pond=13.5)
    assert p.modes[0] != "off" and all(m != "off" for m in p.modes[:8])
    assert p.temps[7] > 13.5


def test_solar_surplus_moves_heating_into_sunny_quarters():
    price = [0.30] * N
    surplus = [0.0] * N
    for q in range(44, 60):
        surplus[q] = 1.0
    costs = EnergyCosts(price, feed_in=[0.05] * N, surplus_kw=surplus)
    p = plan(costs)
    assert sum(m != "off" for m in p.modes[44:60]) >= 12
    same = plan(EnergyCosts(price, feed_in=price, surplus_kw=surplus))  # net metering: no effect
    assert same.modes == plan(price).modes


def test_expensive_surcharge_avoids_expensive_quarters():
    rng = np.random.default_rng(5)
    price = list(0.25 + 0.20 * rng.random(N))
    plain = plan(EnergyCosts(price), outdoor=7.0)
    avoid = plan(EnergyCosts(price, expensive_surcharge=1.0), outdoor=7.0)
    assert avoid.expensive_share <= plain.expensive_share
    assert avoid.expensive_share < 0.05


def test_plan_summary_fields():
    p = plan(block_price())
    assert len(p.modes) == len(p.temps) == len(p.prices) == N
    assert p.mode == p.modes[0]
    assert p.energy_kwh == pytest.approx(sum(ModelParams().power[m] * 0.25 for m in p.modes[:96]))
    if p.next_start is not None:
        assert p.modes[int(p.next_start // 900)] != "off"


def test_runtime_per_plan():
    req = request(block_price())
    planner = DynamicProgrammingPlanner()
    t0 = time.perf_counter()
    for _ in range(5):
        planner.make_plan(req)
    assert (time.perf_counter() - t0) / 5 < 0.1  # 50 ms on a desktop; margin for CI runners


def test_empty_request_raises():
    with pytest.raises(ValueError):
        plan([])


def test_boost_only_when_allowed():
    cold = plan([0.30] * N, outdoor=-8.0, pond=14.6)
    assert "boost" not in cold.modes
    assert "boost" not in plan([0.30] * N, outdoor=-8.0, pond=14.6, allow_boost=True, allow_high=False).modes


def test_boost_when_high_cannot_keep_the_pond_in_the_band():
    # at -8 °C high (0.19 K/h) cannot cover the loss (k · 23 K ≈ 0.28 K/h); boost (0.36 K/h) can
    params = ModelParams(
        power={"off": 0.005, "low": 0.39, "high": 0.90, "boost": 1.20},
        gain={"off": 0.0, "low": 0.30, "high": 0.21, "boost": 0.30},
    )
    without = plan([0.30] * N, outdoor=-8.0, params=params)
    with_boost = plan([0.30] * N, outdoor=-8.0, params=params, allow_boost=True)
    assert min(without.temps) < 14.75
    assert "boost" in with_boost.modes
    assert min(with_boost.temps) >= 14.75


def test_no_boost_when_high_is_enough():
    p = plan([0.30] * N, outdoor=8.0, allow_boost=True)
    assert "boost" not in p.modes


def test_preset_penalty_limits_switching_between_high_and_boost():
    rng = np.random.default_rng(5)
    price = list(0.30 + 0.2 * rng.random(N))
    params = ModelParams(
        power={"off": 0.005, "low": 0.39, "high": 0.90, "boost": 1.20},
        gain={"off": 0.0, "low": 0.30, "high": 0.21, "boost": 0.30},
    )

    def changes(p):
        pairs = zip(p.modes, p.modes[1:], strict=False)
        return sum("boost" in (a, b) and a != b and "off" not in (a, b) for a, b in pairs)

    free = plan(price, outdoor=-8.0, params=params, allow_boost=True, preset_penalty=0.0)
    costly = plan(price, outdoor=-8.0, params=params, allow_boost=True, preset_penalty=1.0)
    assert changes(costly) <= changes(free)
    assert changes(costly) <= 2

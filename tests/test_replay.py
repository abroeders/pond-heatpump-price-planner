"""Closed-loop replay on one week of the reference data (the full period: scripts/replay.py)."""

import pytest
from conftest import epoch
from replay import offline_optimum, replay, thermostat


@pytest.fixture(scope="module")
def week(reference):
    first, last = epoch("2026-11-10T00:00:00+01:00"), epoch("2026-11-16T23:45:00+01:00")
    return [r for r in reference if first <= r["t"] <= last]


def test_replay_close_to_optimum_and_within_band(week):
    r = replay(week, target=15.0, start_penalty=0.1)
    o = offline_optimum(week, target=15.0, start_penalty=0.1)
    t = thermostat(week, target=15.0)
    assert r.max_deviation <= 0.25
    assert r.cost <= o.cost * 1.05
    assert r.cost < t.cost
    assert r.starts_per_day <= 2.0
    assert r.expensive_share < t.expensive_share

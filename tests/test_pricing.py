import pytest
from core.prices import PriceTransform
from core.pricing import current_price, price_series
from core.timeseries import Interval

H = 3600.0
ID = PriceTransform()


def hourly(start_h, values):
    return [Interval((start_h + i) * H, (start_h + i + 1) * H, v) for i, v in enumerate(values)]


def test_known_prices_then_forecast():
    known = hourly(0, [0.2] * 10)
    forecast = hourly(5, [0.9] * 30)  # overlaps the known part: known wins
    s = price_series(known, forecast, 0, 36, PriceTransform(1.21, 0.1), PriceTransform(1.21, 0.1), ID)
    assert s.known == 40 and s.forecast == 25 * 4 and s.quarters == 35 * 4  # forecast ends at 35 h
    assert s.buy[0] == pytest.approx(0.2 * 1.21 + 0.1)
    assert s.buy[40] == pytest.approx(0.9 * 1.21 + 0.1)
    assert s.feed_in[0] == pytest.approx(0.2) and s.status == "ok"


def test_horizon_caps_and_stops_at_the_first_gap():
    known = hourly(0, [0.2] * 6) + hourly(8, [0.3] * 40)
    s = price_series(known, [], 0, 36, ID, ID, ID)
    assert s.quarters == 24 and s.status == "ok"  # stops at the gap after 6 h


def test_short_prices_are_extended_with_the_mean():
    s = price_series(hourly(0, [0.2, 0.4]), [], 0, 36, ID, ID, ID)
    assert s.status == "limited_prices" and s.quarters == 96
    assert s.buy[-1] == pytest.approx(0.3)


def test_no_prices_and_forecast_only():
    none = price_series([], [], 0, 36, ID, ID, ID)
    assert none.status == "no_prices" and set(none.buy) == {1.0} and none.quarters == 96
    only = price_series([], hourly(0, [0.5] * 24), 0, 36, ID, PriceTransform(2, 0), ID)
    assert only.status == "forecast_only" and only.buy[0] == 1.0 and only.known == 0


def test_current_price():
    known = hourly(0, [0.2, 0.3])
    assert current_price(known, 1.5 * H, PriceTransform(2, 0)) == pytest.approx(0.6)
    assert current_price(known, 5 * H, ID) is None


def test_day_ahead_known_until():
    from conftest import epoch
    from core.pricing import day_ahead_known_until

    morning = epoch("2026-11-17T10:00:00+01:00")
    afternoon = epoch("2026-11-17T14:00:00+01:00")
    assert day_ahead_known_until(morning, "Europe/Amsterdam") == epoch("2026-11-18T00:00:00+01:00")
    assert day_ahead_known_until(afternoon, "Europe/Amsterdam") == epoch("2026-11-19T00:00:00+01:00")

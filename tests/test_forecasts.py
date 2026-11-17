import pytest
from core.forecasts import OutdoorForecast, SolarSurplus, solar_intervals, surplus_now
from core.timeseries import Interval

TZ = "Europe/Amsterdam"


def test_outdoor_interpolates_and_bias_fades():
    f = OutdoorForecast([(0, 10.0), (3600, 12.0), (6 * 3600, 12.0)])
    q = f.quarters(0, 4, measured=None)
    assert q[0] == pytest.approx(10.25) and q[3] == pytest.approx(11.75)
    biased = f.quarters(0, 30, measured=11.0)  # sensor 1 K warmer than the forecast now
    assert biased[0] == pytest.approx(10.25 + 1.0 * (1 - 450 / 21600))
    assert biased[-1] == pytest.approx(12.0)  # bias gone after 6 h


def test_outdoor_without_forecast_uses_sensor():
    assert OutdoorForecast([]).quarters(0, 3, measured=7.5) == [7.5, 7.5, 7.5]


def test_solar_intervals_prefer_watts_then_kwh():
    pv = {
        "forecast": [{"start": "2026-11-18T12:00:00+01:00", "kwh": 0.966, "w": 966}],
        "raw_today": [
            {"start": "2026-11-17T12:00:00+01:00", "end": "2026-11-17T13:00:00+01:00", "value": 0.5}
        ],
    }
    assert solar_intervals(pv, TZ)[0].value == pytest.approx(0.966)
    del pv["forecast"]
    assert solar_intervals(pv, TZ)[0].value == pytest.approx(0.5)


def test_surplus_from_sensor_types():
    assert surplus_now("pv_power", 1500, 0, 300) == pytest.approx(1.2)
    assert surplus_now("grid_export", 200, 390, 300) == pytest.approx(0.59)
    assert surplus_now("grid_net", 100, 390, 300) == pytest.approx(0.29)  # importing 100 W while running
    assert surplus_now("grid_net", 500, 0, 300) == 0
    assert surplus_now("pv_power", None, 0, 300) is None
    with pytest.raises(ValueError):
        surplus_now("other", 1, 0, 0)


def test_solar_surplus_scales_forecast_to_measurement():
    forecast = [Interval(0, 7200, 1.0)]  # 1 kW forecast for two hours
    s = SolarSurplus(base_load_kw=0.3)
    q = s.quarters(0, 8, measured_kw=1.7, forecast=forecast, forecast_now_kw=1.0)
    assert q[0] == pytest.approx(1.7)  # measured now
    assert q[1] == pytest.approx(1.0 * (1 + 1.0 * (1 - 900 / 7200)) - 0.3)  # ratio 2 fading out
    assert q[7] == pytest.approx(1.0 * (1 + 1.0 * (1 - 6300 / 7200)) - 0.3)
    assert s.quarters(0, 2, None)[1] == 0.0

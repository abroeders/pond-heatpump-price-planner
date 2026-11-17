from datetime import datetime
from zoneinfo import ZoneInfo

import pytest
from core.prices import DictListParser, PriceTransform, parse_intervals
from core.timeseries import Interval, close_intervals, last_known_end, quarter_values

TZ = "Europe/Amsterdam"


def ts(iso: str) -> float:
    return datetime.fromisoformat(iso).timestamp()


# formats as published by real sensors (shortened)
EPEX_SPOT = {
    "raw_today": [
        {"start": "2026-11-17T00:00:00+01:00", "end": "2026-11-17T00:15:00+01:00", "value": 0.195},
        {"start": "2026-11-17T00:15:00+01:00", "end": "2026-11-17T00:30:00+01:00", "value": 0.197},
    ],
    "raw_tomorrow": [
        {"start": "2026-11-18T00:00:00+01:00", "end": "2026-11-18T00:15:00+01:00", "value": 0.096},
    ],
    "today": [0.195, 0.197],  # plain list next to the raw list: ignored, raw wins
}
TIBBER_STYLE = {
    "today": [
        {"time": "2026-11-17T00:00:00.000+01:00", "energy": 0.1956, "total": 0.3724},
        {"time": "2026-11-17T01:00:00.000+01:00", "energy": 0.1931, "total": 0.3693},
    ],
    "tomorrow": [],
}
GRID_REWARD_STYLE = {
    "today": "0.3724, 0.3693",
    "today_raw": [
        {"time": "2026-11-17T00:00:00.000+01:00", "price": 0.3724, "rating": "High"},
        {"time": "2026-11-17T01:00:00.000+01:00", "price": 0.3693, "rating": "High"},
    ],
}


def test_epex_spot_quarters():
    iv = parse_intervals(EPEX_SPOT, TZ)
    assert [i.value for i in iv] == [0.195, 0.197, 0.096]
    assert iv[0].end - iv[0].start == 900


def test_tibber_style_uses_total_and_hour_length():
    iv = parse_intervals(TIBBER_STYLE, TZ)
    assert [i.value for i in iv] == [0.3724, 0.3693]
    assert iv[0].end == ts("2026-11-17T01:00:00+01:00")
    assert iv[1].end - iv[1].start == 3600  # last entry: at most one hour


def test_grid_reward_style_reads_raw_list():
    assert [i.value for i in parse_intervals(GRID_REWARD_STYLE, TZ)] == [0.3724, 0.3693]


def test_plain_lists_from_local_midnight():
    attrs = {"today": [0.1] * 24, "tomorrow": [0.2] * 96}
    iv = parse_intervals(attrs, TZ)
    zone = ZoneInfo(TZ)
    midnight = datetime.combine(datetime.now(zone).date(), datetime.min.time(), zone).timestamp()
    assert iv[0].start == midnight and iv[0].end - iv[0].start == 3600
    assert len(iv) == 24 + 96 and iv[-1].end - iv[-1].start == 900


def test_unknown_attributes_give_nothing():
    assert parse_intervals({"foo": 1, "today": "a,b"}, TZ) == []


def test_hourly_prices_spread_over_quarters():
    iv = parse_intervals(TIBBER_STYLE, TZ)
    start = ts("2026-11-17T00:00:00+01:00")
    values = quarter_values(iv, start, 10)
    assert values[:4] == [0.3724] * 4 and values[4:8] == [0.3693] * 4 and values[8:] == [None, None]
    assert last_known_end(iv) == start + 7200


def test_close_intervals_caps_open_end():
    iv = close_intervals([(0, None, 1.0), (7200, None, 2.0)])
    assert iv == [Interval(0, 3600, 1.0), Interval(7200, 10800, 2.0)]


def test_custom_parser_and_transform():
    parser = DictListParser(keys=("forecast",), value_keys=("w",))
    iv = parse_intervals({"forecast": [{"start": "2026-11-18T12:00:00+01:00", "w": 966}]}, TZ, (parser,))
    assert iv[0].value == 966
    assert PriceTransform(1.21, 0.1357).apply(0.2) == pytest.approx(0.3777)

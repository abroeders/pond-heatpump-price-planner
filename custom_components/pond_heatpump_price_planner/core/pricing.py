"""Prices per quarter over the planning horizon: known prices first, then the optional price forecast."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from .prices import PriceTransform
from .samples import QUARTER
from .timeseries import Interval, quarter_values

MIN_QUARTERS = 16  # plan at least 4 h ahead; missing prices are filled with the mean
FALLBACK_HOURS = 24  # without any price: plan this far on a flat price


@dataclass(frozen=True)
class PriceSeries:
    buy: list[float]  # effective purchase price per quarter (€/kWh)
    feed_in: list[float]  # value of own solar power per quarter (€/kWh)
    known: int  # quarters with a known (not forecast) price
    forecast: int  # quarters with a forecast price after the known ones
    status: str  # ok, forecast_only, limited_prices, no_prices

    @property
    def quarters(self) -> int:
        return len(self.buy)


def price_series(
    known: Sequence[Interval],
    forecast: Sequence[Interval],
    start: float,
    horizon_hours: float,
    buy: PriceTransform,
    forecast_buy: PriceTransform,
    feed_in: PriceTransform,
) -> PriceSeries:
    """Combine known and forecast prices into series from `start`, as long as prices are available."""
    max_n = int(horizon_hours * 3600 // QUARTER)
    raw_known = quarter_values(known, start, max_n)
    raw_forecast = quarter_values(forecast, start, max_n) if forecast else [None] * max_n

    buy_values: list[float | None] = []
    feed_values: list[float | None] = []
    n_known = n_forecast = 0
    for k, f in zip(raw_known, raw_forecast, strict=True):
        if k is not None and n_forecast == 0:
            buy_values.append(buy.apply(k))
            feed_values.append(feed_in.apply(k))
            n_known += 1
        elif f is not None:
            buy_values.append(forecast_buy.apply(f))
            feed_values.append(feed_in.apply(f))
            n_forecast += 1
        else:
            break

    if not buy_values:
        n = int(FALLBACK_HOURS * 3600 // QUARTER)
        return PriceSeries([1.0] * n, [1.0] * n, 0, 0, "no_prices")
    status = "ok" if n_known else "forecast_only"
    if len(buy_values) < MIN_QUARTERS:
        mean_buy = sum(buy_values) / len(buy_values)
        mean_feed = sum(feed_values) / len(feed_values)
        n = int(FALLBACK_HOURS * 3600 // QUARTER)
        buy_values += [mean_buy] * (n - len(buy_values))
        feed_values += [mean_feed] * (n - len(feed_values))
        status = "limited_prices"
    return PriceSeries(list(buy_values), list(feed_values), n_known, n_forecast, status)


def current_price(known: Sequence[Interval], t: float, transform: PriceTransform) -> float | None:
    """Effective price of the quarter that contains t."""
    value = quarter_values(known, t - t % QUARTER, 1)[0]
    return transform.apply(value) if value is not None else None


def day_ahead_known_until(t: float, tz: str, publish_hour: int = 13) -> float:
    """End of the last day with known day-ahead prices at time t (tomorrow is published around 13:00)."""
    zone = ZoneInfo(tz)
    local = datetime.fromtimestamp(t, zone)
    days = 2 if local.hour >= publish_hour else 1
    return datetime.combine(local.date() + timedelta(days=days), datetime.min.time(), zone).timestamp()

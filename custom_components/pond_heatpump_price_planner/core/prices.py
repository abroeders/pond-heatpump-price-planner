"""Reading price (and solar forecast) lists from sensor attributes.

Price sensors publish their prices in different attribute formats. Each format is a parser (strategy);
`parse_intervals` asks them in turn (chain of responsibility) and collects what they recognise.
New formats are added by adding a parser to `PARSERS`.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import datetime, time, timedelta
from typing import Any, Protocol
from zoneinfo import ZoneInfo

from .timeseries import Interval, close_intervals

START_KEYS = ("start", "time", "startsAt", "start_time", "from", "datetime")
END_KEYS = ("end", "end_time", "till", "to")
VALUE_KEYS = ("value", "total", "price", "energy")


def _epoch(value: Any) -> float | None:
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, datetime):
        return value.timestamp()
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()
        except ValueError:
            return None
    return None


def _number(value: Any) -> float | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


class AttributeParser(Protocol):
    """Recognises one attribute format and returns (start, end or None, value) points."""

    def parse(self, attributes: Mapping[str, Any], tz: str) -> list[tuple[float, float | None, float]]: ...


@dataclass(frozen=True)
class DictListParser:
    """Lists of dicts with a start key and a value key, e.g. raw_today: [{start, end, value}]."""

    keys: tuple[str, ...] = (
        "raw_today",
        "raw_tomorrow",
        "today_raw",
        "tomorrow_raw",
        "today",
        "tomorrow",
        "prices",
        "data",
        "forecast",
    )
    value_keys: tuple[str, ...] = VALUE_KEYS

    def parse(self, attributes: Mapping[str, Any], tz: str) -> list[tuple[float, float | None, float]]:
        out = []
        for key in self.keys:
            items = attributes.get(key)
            if not isinstance(items, list):
                continue
            for item in items:
                if not isinstance(item, Mapping):
                    continue
                start = next((_epoch(item[k]) for k in START_KEYS if k in item), None)
                end = next((_epoch(item[k]) for k in END_KEYS if k in item), None)
                value = next((_number(item[k]) for k in self.value_keys if k in item), None)
                if start is not None and value is not None:
                    out.append((start, end, value))
        return out


@dataclass(frozen=True)
class PlainListParser:
    """Lists of plain numbers for today and tomorrow (24 hourly or 96 quarter values from local midnight)."""

    keys: tuple[tuple[str, int], ...] = (("today", 0), ("tomorrow", 1))

    def parse(self, attributes: Mapping[str, Any], tz: str) -> list[tuple[float, float | None, float]]:
        zone = ZoneInfo(tz)
        today = datetime.now(zone).date()
        out = []
        for key, day_offset in self.keys:
            items = attributes.get(key)
            if not isinstance(items, list) or not items or not all(_number(x) is not None for x in items):
                continue
            if len(items) not in (23, 24, 25, 92, 96, 100):
                continue
            step = 3600 if len(items) <= 25 else 900
            midnight = datetime.combine(today + timedelta(days=day_offset), time(0), zone).timestamp()
            for i, value in enumerate(items):
                start = midnight + i * step
                out.append((start, start + step, float(value)))
        return out


PARSERS: tuple[AttributeParser, ...] = (DictListParser(), PlainListParser())


def parse_intervals(
    attributes: Mapping[str, Any], tz: str, parsers: Sequence[AttributeParser] = PARSERS
) -> list[Interval]:
    """Intervals from the first parser that recognises the attributes."""
    for parser in parsers:
        points = parser.parse(attributes, tz)
        if points:
            # the same start may appear in several lists (e.g. today and raw_today): keep the first
            unique: dict[float, tuple[float, float | None, float]] = {}
            for p in points:
                unique.setdefault(p[0], p)
            return close_intervals(list(unique.values()))
    return []


@dataclass(frozen=True)
class PriceTransform:
    """effective = price * multiplier + addition (e.g. bare exchange price to all-in)."""

    multiplier: float = 1.0
    addition: float = 0.0

    def apply(self, value: float) -> float:
        return value * self.multiplier + self.addition

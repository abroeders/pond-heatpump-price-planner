"""Shared test helpers: the reference dataset and a synthetic pond."""

from __future__ import annotations

import csv
import math
import random
from datetime import datetime
from pathlib import Path

import pytest
from core.model import ModelParams
from core.samples import QUARTER, Sample

DATA = Path(__file__).parent / "data"
REFERENCE = DATA / "reference_2026-10-10_2026-11-16.csv"
TZ = "Europe/Amsterdam"


def epoch(iso: str) -> float:
    return datetime.fromisoformat(iso.replace("Z", "+00:00")).timestamp()


def load_reference() -> list[dict]:
    """Quarter-hour data of the reference pond: pond, outdoor, power_w, water_in/out, air_in, price."""
    rows = []
    with REFERENCE.open() as f:
        for r in csv.DictReader(f):
            rows.append({"t": epoch(r["t"]), **{k: float(v) for k, v in r.items() if k != "t"}})
    return rows


@pytest.fixture(scope="session")
def reference() -> list[dict]:
    return load_reference()


@pytest.fixture(scope="session")
def reference_samples(reference) -> list[Sample]:
    return [Sample(r["t"], r["pond"], r["outdoor"], r["power_w"]) for r in reference]


def simulate(
    params: ModelParams,
    days: float,
    start: float = 1_760_000_400.0,
    target: float = 15.0,
    band: float = 0.25,
    k_change: tuple[float, float] | None = None,
    noise: float = 0.005,
    seed: int = 1,
) -> list[Sample]:
    """Synthetic pond under a low-mode thermostat, with a few high-mode runs.

    k_change = (day, new_k_open) changes the true cooling coefficient at that day (insulation cover).
    """
    rng = random.Random(seed)
    p = ModelParams.from_dict(params.to_dict())
    temp, on, prev = target, False, "off"
    out = []
    for i in range(int(days * 96)):
        t = start + i * QUARTER
        day = i / 96
        if k_change and day >= k_change[0]:
            p.k_open = k_change[1]
        outdoor = 10 + 4 * math.sin(2 * math.pi * (day - 0.375)) + rng.gauss(0, 0.3)
        goal = target + (0.5 if int(day) // 2 % 2 else 0.0)  # varied set point, so low is not always on
        if temp < goal - band:
            on = True
        elif temp > goal + band:
            on = False
        mode = "low" if on else "off"
        if int(day) % 3 == 1 and 12 <= (i % 96) / 4 < 16:
            mode = "high"
        temp = p.step(temp, mode, outdoor, starting=(prev == "off" and mode != "off"))
        prev = mode
        measured = round(temp + rng.gauss(0, noise), 2)
        power = p.power[mode] * 1000 * (1 + rng.gauss(0, 0.03))
        out.append(Sample(t, measured, round(outdoor, 1), power))
    return out

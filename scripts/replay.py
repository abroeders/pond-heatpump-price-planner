"""Replay the planner on the reference dataset and print the result.

Usage: python scripts/replay.py [start-date] [end-date]   (default: 2026-10-20 2026-11-16)
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path[:0] = [str(ROOT / "custom_components" / "pond_heatpump_price_planner"), str(ROOT / "tests")]

from conftest import epoch, load_reference  # noqa: E402
from replay import offline_optimum, replay, thermostat  # noqa: E402

first = epoch((sys.argv[1] if len(sys.argv) > 1 else "2026-10-20") + "T00:00:00+02:00")
last = epoch((sys.argv[2] if len(sys.argv) > 2 else "2026-11-16") + "T23:45:00+01:00")
rows = [r for r in load_reference() if first <= r["t"] <= last]
print(f"{len(rows) / 96:.1f} days")
for name, result in (
    ("thermostat low", thermostat(rows)),
    ("planner (replay)", replay(rows)),
    ("offline optimum", offline_optimum(rows)),
):
    print(
        f"{name:18s} € {result.cost:6.2f}  {result.energy:5.0f} kWh  starts/day {result.starts_per_day:4.1f}"
        f"  expensive {result.expensive_share * 100:4.1f} %  max dev {result.max_deviation:.2f} K"
        f"  {result.plan_ms:5.1f} ms/plan"
    )

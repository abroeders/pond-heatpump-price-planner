"""Energy cost per quarter and mode, including an optional solar surplus valued at the feed-in price.

`expensive_surcharge` makes the most expensive quarters of each day look more expensive to the planner
(a preference, not a ban); reported costs always use the real prices.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass

import numpy as np

from .model import DT, MODES, ModelParams

QUARTERS_PER_DAY = 96


@dataclass(frozen=True)
class EnergyCosts:
    """Cost (€) of running each mode during each quarter."""

    price: Sequence[float]  # purchase €/kWh per quarter
    feed_in: Sequence[float] | None = None  # feed-in €/kWh per quarter (value of own solar power)
    surplus_kw: Sequence[float] | None = None  # solar surplus per quarter
    expensive_surcharge: float = 0.0  # €/kWh added for planning to the most expensive quarters
    expensive_quantile: float = 0.75  # quarters above this quantile of each 24 h block are "expensive"

    def planning_prices(self) -> np.ndarray:
        """Purchase prices as the planner sees them: with the surcharge on expensive quarters."""
        price = np.asarray(self.price, dtype=float)
        if self.expensive_surcharge <= 0:
            return price
        out = price.copy()
        for d in range(0, len(price), QUARTERS_PER_DAY):
            block = price[d : d + QUARTERS_PER_DAY]
            out[d : d + QUARTERS_PER_DAY] += self.expensive_surcharge * (
                block > np.quantile(block, self.expensive_quantile)
            )
        return out

    def matrix(self, params: ModelParams, planning: bool = False) -> np.ndarray:
        """Array [quarter, mode] in €, modes in the order of MODES; `planning` includes the surcharge."""
        price = self.planning_prices() if planning else np.asarray(self.price, dtype=float)
        n = len(price)
        feed = np.asarray(self.feed_in, dtype=float) if self.feed_in is not None else price
        surplus = np.asarray(self.surplus_kw, dtype=float) if self.surplus_kw is not None else np.zeros(n)
        out = np.empty((n, len(MODES)))
        for m, mode in enumerate(MODES):
            p = params.power[mode]
            covered = np.minimum(p, surplus)
            out[:, m] = DT * (covered * feed + (p - covered) * price)
        return out

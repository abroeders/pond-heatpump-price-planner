"""Download diagnostics: options, model, last reports and a plan summary."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .coordinator import PlannerCoordinator


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    c: PlannerCoordinator = entry.runtime_data
    plan = c.data.plan
    return {
        "links": dict(entry.data),
        "options": c.options,
        "settings": c.settings,
        "params": c.params.to_dict(),
        "extra": c.store.extra,
        "samples": len(c.store.samples),
        "cop_buckets": len(c.store.buckets),
        "outlet_offset": vars(c.data.outlet_offset) if c.data.outlet_offset else None,
        "decision": vars(c.data.decision) if c.data.decision else None,
        "applied": vars(c.data.applied) if c.data.applied else None,
        "price_status": c.data.price_status,
        "plan": {
            "modes": "".join({"off": ".", "low": "l", "high": "H"}[m] for m in plan.modes),
            "energy_kwh": plan.energy_kwh,
            "cost": plan.cost,
            "starts": plan.starts,
            "expensive_share": plan.expensive_share,
        }
        if plan
        else None,
        "prediction_error": c.data.prediction_error,
        "model_check": c.data.model_check,
    }

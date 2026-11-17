"""Sensors: the plan, the COP and the pond, and diagnostics of the model."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory, UnitOfEnergy, UnitOfPower, UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import SET_COP_METHOD, SET_COVER, SET_FLOW
from .coordinator import PlannerCoordinator, PlannerData
from .core.cop import CopResult
from .core.model import MODES
from .entity import PlannerEntity

PLAN_ATTRIBUTE_QUARTERS = 144


def _ts(epoch: float | None) -> datetime | None:
    return datetime.fromtimestamp(epoch, UTC) if epoch else None


def _round(value: float | None, digits: int) -> float | None:
    return round(value, digits) if value is not None else None


def _plan_list(c: PlannerCoordinator) -> list[dict[str, Any]]:
    plan = c.data.plan
    if plan is None:
        return []
    known = c.data.known_quarters
    surplus = c.data.surplus
    out = []
    for i, m in enumerate(plan.modes[:PLAN_ATTRIBUTE_QUARTERS]):
        item = {
            "start": _ts(plan.start + i * 900).isoformat(),
            "mode": m,
            "temp": round(plan.temps[i], 2),
            "price": round(plan.prices[i], 4),
            "known": i < known,
        }
        if surplus is not None and i < len(surplus):
            item["surplus"] = round(surplus[i], 3)
        out.append(item)
    return out


def _cop_attrs(result: CopResult | None, c: PlannerCoordinator) -> dict[str, Any]:
    if result is None:
        return {}
    return {
        "by_outdoor": {k: _round(v, 2) for k, v in result.by_outdoor.items()},
        "by_power": {k: _round(v, 2) for k, v in result.by_power.items()},
        "hours": round(result.hours, 1),
        "hours_by_outdoor": {k: round(v, 1) for k, v in result.hours_by_outdoor.items()},
        "hours_by_power": {k: round(v, 1) for k, v in result.hours_by_power.items()},
        "window_days": c.options["cop_window"],
    }


@dataclass(frozen=True, kw_only=True)
class PlannerSensorDescription(SensorEntityDescription):
    value_fn: Callable[[PlannerCoordinator], Any]
    attrs_fn: Callable[[PlannerCoordinator], dict[str, Any]] | None = None


def _d(c: PlannerCoordinator) -> PlannerData:
    return c.data


SENSORS: tuple[PlannerSensorDescription, ...] = (
    PlannerSensorDescription(
        key="mode",
        device_class=SensorDeviceClass.ENUM,
        options=list(MODES),
        value_fn=lambda c: _d(c).decision.mode if _d(c).decision else None,
        attrs_fn=lambda c: {
            "reason": _d(c).decision.reason if _d(c).decision else None,
            "plan_mode": _d(c).plan.mode if _d(c).plan else None,
            "measured_mode": _d(c).measured_mode,
            "control": bool(c.settings["control"]),
            "would_set": _d(c).applied.setpoint if _d(c).applied else None,
            "apply_result": _d(c).applied.reason if _d(c).applied else None,
            "mismatch": _d(c).mismatch,
            "price_status": _d(c).price_status,
            "horizon_end": _ts(_d(c).plan.start + len(_d(c).plan.modes) * 900) if _d(c).plan else None,
            "plan": _plan_list(c),
        },
    ),
    PlannerSensorDescription(
        key="next_start",
        device_class=SensorDeviceClass.TIMESTAMP,
        value_fn=lambda c: _ts(_d(c).plan.next_start) if _d(c).plan else None,
    ),
    PlannerSensorDescription(
        key="next_stop",
        device_class=SensorDeviceClass.TIMESTAMP,
        value_fn=lambda c: _ts(_d(c).plan.next_stop) if _d(c).plan else None,
    ),
    PlannerSensorDescription(
        key="planned_energy",
        device_class=SensorDeviceClass.ENERGY,
        native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=1,
        value_fn=lambda c: _round(_d(c).plan.energy_kwh, 2) if _d(c).plan else None,
    ),
    PlannerSensorDescription(
        key="planned_cost",
        device_class=SensorDeviceClass.MONETARY,
        native_unit_of_measurement="EUR",
        suggested_display_precision=2,
        value_fn=lambda c: _round(_d(c).plan.cost, 2) if _d(c).plan else None,
        attrs_fn=lambda c: {
            "expensive_share": _round(_d(c).plan.expensive_share, 3) if _d(c).plan else None,
            "starts": _d(c).plan.starts if _d(c).plan else None,
        },
    ),
    PlannerSensorDescription(
        key="predicted_temperature",
        device_class=SensorDeviceClass.TEMPERATURE,
        native_unit_of_measurement=UnitOfTemperature.CELSIUS,
        suggested_display_precision=2,
        value_fn=lambda c: (
            _round(_d(c).plan.temps[min(15, len(_d(c).plan.temps) - 1)], 2) if _d(c).plan else None
        ),
    ),
    PlannerSensorDescription(
        key="cop",
        state_class=None,
        suggested_display_precision=1,
        value_fn=lambda c: _round(_d(c).cop.cop, 2) if _d(c).cop else None,
        attrs_fn=lambda c: {**_cop_attrs(_d(c).cop, c), "method": c.settings[SET_COP_METHOD]},
    ),
    PlannerSensorDescription(
        key="cop_flow",
        suggested_display_precision=1,
        value_fn=lambda c: _round(_d(c).cop_flow.cop, 2) if _d(c).cop_flow else None,
        attrs_fn=lambda c: {**_cop_attrs(_d(c).cop_flow, c), "flow": c.settings[SET_FLOW]},
    ),
    PlannerSensorDescription(
        key="cop_pond",
        suggested_display_precision=1,
        value_fn=lambda c: _round(_d(c).cop_pond.cop, 2) if _d(c).cop_pond else None,
        attrs_fn=lambda c: {
            **_cop_attrs(_d(c).cop_pond, c),
            "loss_a_w": _round(_d(c).loss.a_kw * 1000, 0) if _d(c).loss else None,
            "loss_b_w_per_k": _round(_d(c).loss.b_kw_per_k * 1000, 0) if _d(c).loss else None,
        },
    ),
    PlannerSensorDescription(
        key="heat_loss",
        native_unit_of_measurement="W/K",
        suggested_display_precision=0,
        value_fn=lambda c: _round(_d(c).heat_loss_w_per_k, 0),
        attrs_fn=lambda c: {
            "loss_a_w": _round(_d(c).loss.a_kw * 1000, 0) if _d(c).loss else None,
            "loss_b_w_per_k": _round(_d(c).loss.b_kw_per_k * 1000, 0) if _d(c).loss else None,
            "cover": bool(c.settings[SET_COVER]),
        },
    ),
    PlannerSensorDescription(
        key="thermal_power",
        device_class=SensorDeviceClass.POWER,
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=UnitOfPower.WATT,
        suggested_display_precision=0,
        value_fn=lambda c: _round(_d(c).thermal_power_w, 0),
        attrs_fn=lambda c: {"flow_mean_w": _round(_d(c).flow_mean_w, 0), "mode": _d(c).measured_mode},
    ),
    PlannerSensorDescription(
        key="cooling_coefficient",
        entity_category=EntityCategory.DIAGNOSTIC,
        native_unit_of_measurement="1/h",
        suggested_display_precision=4,
        value_fn=lambda c: _round(c.params.k(bool(c.settings[SET_COVER])), 5),
        attrs_fn=lambda c: {"k_open": c.params.k_open, "k_cover": c.params.k_cover},
    ),
    PlannerSensorDescription(
        key="heating_rate_low",
        entity_category=EntityCategory.DIAGNOSTIC,
        native_unit_of_measurement="K/h",
        suggested_display_precision=3,
        value_fn=lambda c: _round(c.params.rate("low"), 4),
        attrs_fn=lambda c: {"gain": c.params.gain["low"], "power_kw": c.params.power["low"]},
    ),
    PlannerSensorDescription(
        key="heating_rate_high",
        entity_category=EntityCategory.DIAGNOSTIC,
        native_unit_of_measurement="K/h",
        suggested_display_precision=3,
        value_fn=lambda c: _round(c.params.rate("high"), 4),
        attrs_fn=lambda c: {"gain": c.params.gain["high"], "power_kw": c.params.power["high"]},
    ),
    PlannerSensorDescription(
        key="prediction_error",
        entity_category=EntityCategory.DIAGNOSTIC,
        device_class=SensorDeviceClass.TEMPERATURE_DELTA,
        native_unit_of_measurement=UnitOfTemperature.KELVIN,
        suggested_display_precision=2,
        value_fn=lambda c: _round(_d(c).prediction_error, 3),
        attrs_fn=lambda c: {"checked": len(c.tracker.errors)},
    ),
    PlannerSensorDescription(
        key="model_status",
        entity_category=EntityCategory.DIAGNOSTIC,
        device_class=SensorDeviceClass.TIMESTAMP,
        value_fn=lambda c: _ts(c.params.learned_at),
        attrs_fn=lambda c: {
            "reports": c.store.extra.get("reports", []),
            "model_check": _d(c).model_check,
            "samples": len(c.store.samples),
            "links": dict(c.links),  # linked entities, used by the Lovelace card as defaults
        },
    ),
    PlannerSensorDescription(
        key="surcharge",
        entity_category=EntityCategory.DIAGNOSTIC,
        native_unit_of_measurement="EUR/kWh",
        suggested_display_precision=2,
        value_fn=lambda c: _d(c).surcharge,
        attrs_fn=lambda c: {
            "auto": bool(c.options["surcharge_auto"]),
            **{k: v for k, v in c.store.extra.get("tuning", {}).items() if k != "surcharge"},
        },
    ),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    coordinator: PlannerCoordinator = entry.runtime_data
    async_add_entities(PlannerSensor(coordinator, d) for d in SENSORS)


class PlannerSensor(PlannerEntity, SensorEntity):
    entity_description: PlannerSensorDescription
    _unrecorded_attributes = frozenset({"plan", "reports", "hours_by_outdoor", "hours_by_power"})

    def __init__(self, coordinator: PlannerCoordinator, description: PlannerSensorDescription) -> None:
        super().__init__(coordinator, description.key)
        self.entity_description = description

    @property
    def native_value(self) -> Any:
        return self.entity_description.value_fn(self.coordinator)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        fn = self.entity_description.attrs_fn
        return fn(self.coordinator) if fn else None

"""The coordinator of one planner: timers, listeners, the planning cycle, nightly learning and the COP.

Entities observe the coordinator (`PlannerData`); all computation is delegated to the core.
See docs/design/2026-11-17-entities-and-configuration.md §4.
"""

from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass, field
from datetime import datetime
from functools import partial
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_time_change,
)
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import (
    CONF_AIR_INLET,
    CONF_CLIMATE,
    CONF_ENERGY,
    CONF_INLET,
    CONF_OUTDOOR,
    CONF_OUTLET,
    CONF_POND,
    CONF_POWER,
    DEFAULT_OPTIONS,
    DOMAIN,
    LEARN_TIME,
    OPT_ALLOW_HIGH,
    OPT_COP_WINDOW,
    OPT_HIGH_W,
    OPT_HORIZON,
    OPT_LOW_W,
    OPT_MARGIN,
    OPT_OFFSET_HIGH,
    OPT_OFFSET_LOW,
    OPT_OFFSET_OFF,
    OPT_RUN_THRESHOLD,
    OPT_SETTLE,
    OPT_START_PENALTY,
    OPT_SURCHARGE,
    OPT_SURCHARGE_AUTO,
    PREDICTION_HOURS,
    REPLAN_DEBOUNCE,
    SET_BAND,
    SET_CONTROL,
    SET_COP_METHOD,
    SET_COVER,
    SET_FLOW,
    SET_TARGET,
    SET_VOLUME,
    TARGET_MAX,
    TARGET_MIN,
    TUNING_DAYS,
)
from .control import ApplyResult, HeatPumpController
from .core.cop import (
    CopResult,
    FlowAccumulator,
    LossFit,
    capacity_kwh_per_k,
    combine,
    cop_flow,
    cop_pond,
    fit_loss,
    heat_loss_w_per_k,
    model_check,
    thermal_power_w,
)
from .core.costs import EnergyCosts
from .core.learning import FitReport, Learner, LearningContext, hourly
from .core.model import ModeClassifier, ModelParams
from .core.planner import DynamicProgrammingPlanner, Plan, PlanRequest
from .core.pricing import day_ahead_known_until
from .core.safety import Decision, SafetyGuard
from .core.samples import QUARTER, PowerIntegrator, Sample, quarter_start
from .core.seeding import SeedEntities
from .core.setpoint import OffsetSetpoint
from .core.tracking import PredictionTracker
from .core.tuning import TuningResult, tune_surcharge
from .history import async_seed_store
from .inputs import InputReader
from .storage import PlannerStore

_LOGGER = logging.getLogger(__name__)


@dataclass
class PlannerData:
    """What the entities show."""

    plan: Plan | None = None
    decision: Decision | None = None
    applied: ApplyResult | None = None
    measured_mode: str | None = None
    mismatch: bool = False
    price_status: str = "no_prices"
    pond: float | None = None
    cop: CopResult | None = None
    cop_flow: CopResult | None = None
    cop_pond: CopResult | None = None
    loss: LossFit | None = None
    heat_loss_w_per_k: float | None = None
    thermal_power_w: float | None = None
    flow_mean_w: float | None = None
    prediction_error: float | None = None
    surcharge: float = 0.0
    model_check: str | None = None
    updated: float = 0.0
    extra: dict[str, Any] = field(default_factory=dict)


class PlannerCoordinator(DataUpdateCoordinator[PlannerData]):
    """Owns the state of one config entry and runs its cycles."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        super().__init__(
            hass, _LOGGER, name=f"{DOMAIN} {entry.title}", config_entry=entry, update_interval=None
        )
        self.entry = entry
        self.links: dict[str, Any] = dict(entry.data)
        self.options: dict[str, Any] = {**DEFAULT_OPTIONS, **entry.options}
        self.store = PlannerStore(hass, entry.entry_id)
        self.inputs = InputReader(hass, self.links, self.options)
        self.classifier = ModeClassifier(float(self.options[OPT_LOW_W]), float(self.options[OPT_HIGH_W]))
        self.planner = DynamicProgrammingPlanner()
        self.learner = Learner()
        self.guard = SafetyGuard()
        self.controller = HeatPumpController(
            hass,
            entry.entry_id,
            self.links[CONF_CLIMATE],
            OffsetSetpoint(
                {
                    "off": self.options[OPT_OFFSET_OFF],
                    "low": self.options[OPT_OFFSET_LOW],
                    "high": self.options[OPT_OFFSET_HIGH],
                }
            ),
        )
        self.power = PowerIntegrator()
        self.flow = FlowAccumulator(
            float(self.options[OPT_RUN_THRESHOLD]), float(self.options[OPT_SETTLE]) * 60
        )
        self.tracker = PredictionTracker()
        self.data = PlannerData()
        self._lock = asyncio.Lock()
        self._unsubs: list = []
        self._replan_handle = None
        self._last_mode: str | None = None

    # --- lifecycle ---------------------------------------------------------------------------------
    @property
    def settings(self) -> dict[str, Any]:
        return self.store.settings

    @property
    def target(self) -> float:
        """Target temperature, within the limits of the climate entity."""
        return min(max(float(self.settings[SET_TARGET]), TARGET_MIN), TARGET_MAX)

    @property
    def params(self) -> ModelParams:
        return self.store.params

    async def async_start(self) -> None:
        await self.store.async_load()
        await async_seed_store(
            self.hass,
            self.store,
            SeedEntities(self.links[CONF_POND], self.links[CONF_OUTDOOR], self.links[CONF_POWER]),
            time.time(),
        )
        now = time.time()
        power = self.inputs.power_w()
        if power is not None:
            self.power.add(now, power)
            self.flow.update(now, power=power)
        watched = [
            self.links.get(k)
            for k in (CONF_POWER, CONF_INLET, CONF_OUTLET, CONF_ENERGY, CONF_OUTDOOR, CONF_AIR_INLET)
        ]
        self._unsubs += [
            async_track_state_change_event(self.hass, [e for e in watched if e], self._on_state),
            async_track_time_change(self.hass, self._on_quarter, minute=[0, 15, 30, 45], second=5),
            async_track_time_change(self.hass, self._on_hour, minute=0, second=1),
            async_track_time_change(
                self.hass, self._on_night, hour=LEARN_TIME[0], minute=LEARN_TIME[1], second=0
            ),
        ]
        await self.hass.async_add_executor_job(self._update_cop, now)
        if self.params.learned_at is None and len(self.store.samples) >= 96 * 14:
            self.hass.async_create_task(self.async_learn())
        await self.async_replan()

    async def async_stop(self) -> None:
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        if self._replan_handle is not None:
            self._replan_handle()
        await self.store.async_save()

    async def _async_update_data(self) -> PlannerData:
        return self.data

    # --- listeners ---------------------------------------------------------------------------------
    @callback
    def _on_state(self, event: Event[EventStateChangedData]) -> None:
        state = event.data["new_state"]
        if state is None:
            return
        value: float | None
        try:
            value = None if state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN) else float(state.state)
        except ValueError:
            value = None
        t = time.time()
        entity_id = event.data["entity_id"]
        if entity_id == self.links.get(CONF_POWER):
            self.power.add(t, value)
            if value is not None:
                self.flow.update(t, power=value)
        if entity_id == self.links.get(CONF_INLET) and value is not None:
            self.flow.update(t, t_in=value)
            if self.data.decision is not None and self.settings[SET_CONTROL]:
                self.hass.async_create_task(self._async_reapply())
        if entity_id == self.links.get(CONF_OUTLET) and value is not None:
            self.flow.update(t, t_out=value)
        if entity_id == self.links.get(CONF_ENERGY) and value is not None:
            self.flow.update(t, energy=value)
        outdoor_key = CONF_AIR_INLET if self.links.get(CONF_AIR_INLET) else CONF_OUTDOOR
        if entity_id == self.links.get(outdoor_key) and value is not None:
            self.flow.update(t, outdoor=value)

    async def _on_quarter(self, now: datetime) -> None:
        t = now.timestamp()
        q = quarter_start(t) - QUARTER  # the quarter that just ended
        pond = self.inputs.pond()
        self.store.add(
            Sample(
                t=q,
                pond=pond,
                outdoor=self.inputs.outdoor(),
                power=self.power.mean(q, q + QUARTER),
                cover=bool(self.settings[SET_COVER]),
                price=self.inputs.price_now(q),
            )
        )
        self.power.prune(q)
        self.tracker.observe(t, pond)
        await self.async_replan()

    async def _on_hour(self, now: datetime) -> None:
        bucket = self.flow.close_hour(now.timestamp())
        if bucket is not None:
            self.store.add_bucket(bucket)
        await self.hass.async_add_executor_job(self._update_cop, now.timestamp())
        self.async_set_updated_data(self.data)

    async def _on_night(self, now: datetime) -> None:
        await self.async_learn()

    # --- planning ----------------------------------------------------------------------------------
    def schedule_replan(self) -> None:
        """Replan shortly after a setting changed (debounced)."""
        if self._replan_handle is not None:
            self._replan_handle()

        async def _run(_now: datetime) -> None:
            self._replan_handle = None
            await self.async_replan()

        self._replan_handle = async_call_later(self.hass, REPLAN_DEBOUNCE, _run)

    def _surcharge(self) -> float:
        if self.options[OPT_SURCHARGE_AUTO]:
            return float(self.store.extra.get("tuning", {}).get("surcharge", 0.0))
        return float(self.options[OPT_SURCHARGE])

    async def async_replan(self) -> None:
        async with self._lock:
            now = time.time()
            start = quarter_start(now)
            target, band = self.target, float(self.settings[SET_BAND])
            pond = self.inputs.pond()
            power = self.inputs.power_w()
            measured = self.classifier.mode(power)
            prices = self.inputs.prices(start)
            forecast = await self.inputs.async_outdoor_forecast(now)
            outdoor = forecast.quarters(start, prices.quarters, self.inputs.outdoor())
            surplus = self.inputs.surplus(start, prices.quarters, power or 0.0)
            costs = EnergyCosts(
                prices.buy,
                feed_in=prices.feed_in if surplus is not None else None,
                surplus_kw=surplus,
                expensive_surcharge=self._surcharge(),
            )
            plan: Plan | None = None
            if pond is not None:
                request = PlanRequest(
                    start=start,
                    pond=pond,
                    mode_now=self._last_mode or measured or "off",
                    target=target,
                    band=band,
                    params=self.params,
                    outdoor=outdoor,
                    costs=costs,
                    margin=float(self.options[OPT_MARGIN]),
                    cover=bool(self.settings[SET_COVER]),
                    start_penalty=float(self.options[OPT_START_PENALTY]),
                    allow_high=bool(self.options[OPT_ALLOW_HIGH]),
                )
                try:
                    plan = await self.hass.async_add_executor_job(self.planner.make_plan, request)
                except ValueError as err:
                    _LOGGER.warning("Planning failed: %s", err)
            decision = self.guard.decide(
                plan_mode=plan.mode if plan else None,
                pond=pond,
                pond_age=self.inputs.age(CONF_POND, now),
                target=target,
                band=band,
                allow_high=bool(self.options[OPT_ALLOW_HIGH]),
                previous=self._last_mode or "off",
            )
            applied = await self.controller.async_apply(
                decision,
                self.inputs.inlet(),
                pond if pond is not None else target,
                bool(self.settings[SET_CONTROL]),
                now,
            )
            if applied.reason in ("sent", "unchanged"):
                self._last_mode = decision.mode
            elif not self.settings[SET_CONTROL]:
                self._last_mode = measured
            mismatch = self.controller.check_following(measured, now) if self.settings[SET_CONTROL] else False
            if plan is not None:
                i = min(PREDICTION_HOURS * 4, len(plan.temps)) - 1
                self.tracker.predict(start + (i + 1) * QUARTER, plan.temps[i])

            d = self.data
            d.plan, d.decision, d.applied, d.measured_mode, d.mismatch = (
                plan,
                decision,
                applied,
                measured,
                mismatch,
            )
            d.price_status, d.pond, d.surcharge = prices.status, pond, self._surcharge()
            d.prediction_error = self.tracker.mean_abs_error()
            capacity = capacity_kwh_per_k(self.settings[SET_VOLUME])
            d.thermal_power_w = thermal_power_w(self.params, measured or "off", capacity)
            d.heat_loss_w_per_k = heat_loss_w_per_k(self.params, bool(self.settings[SET_COVER]), capacity)
            d.updated = now
            self.async_set_updated_data(d)

    async def _async_reapply(self) -> None:
        """The inlet temperature changed: the setpoint for the same decision may change too."""
        async with self._lock:
            pond = self.inputs.pond()
            if self.data.decision is None or pond is None:
                return
            self.data.applied = await self.controller.async_apply(
                self.data.decision, self.inputs.inlet(), pond, bool(self.settings[SET_CONTROL]), time.time()
            )
        self.async_set_updated_data(self.data)

    # --- settings ----------------------------------------------------------------------------------
    async def async_set_setting(self, key: str, value: Any) -> None:
        self.store.set_setting(key, value)
        if key in (SET_TARGET, SET_BAND, SET_COVER, SET_CONTROL):
            self.schedule_replan()
        if key in (SET_VOLUME, SET_FLOW, SET_COP_METHOD, SET_COVER):
            await self.hass.async_add_executor_job(self._update_cop, time.time())
            capacity = capacity_kwh_per_k(self.settings[SET_VOLUME])
            self.data.heat_loss_w_per_k = heat_loss_w_per_k(
                self.params, bool(self.settings[SET_COVER]), capacity
            )
            self.data.thermal_power_w = thermal_power_w(
                self.params, self.data.measured_mode or "off", capacity
            )
        self.async_set_updated_data(self.data)

    # --- COP ---------------------------------------------------------------------------------------
    def _update_cop(self, now: float) -> None:
        """Recalculate COP and pond loss (executor)."""
        window = float(self.options[OPT_COP_WINDOW])
        capacity = capacity_kwh_per_k(self.settings[SET_VOLUME])
        flow = self.settings[SET_FLOW]
        flow_result = cop_flow(self.store.buckets, flow, now, window, float(self.options[OPT_HIGH_W]))
        hours = hourly(self.store.samples, self.hass.config.time_zone, self.classifier)
        loss = fit_loss(hours, capacity, now) if capacity else None
        pond_result = cop_pond(hours, loss, capacity, now, window)
        d = self.data
        d.cop_flow, d.cop_pond, d.loss = flow_result, pond_result, loss
        d.cop = combine(self.settings[SET_COP_METHOD], flow_result, pond_result)
        d.model_check = model_check(self.params, flow_result, pond_result)
        counted = [b for b in self.store.buckets if now - window * 86400 <= b.t < now and b.seconds]
        seconds = sum(b.seconds for b in counted)
        d.flow_mean_w = (
            sum(b.heat_per_flow_kwh for b in counted) * flow / seconds * 3.6e6 if flow and seconds else None
        )

    # --- learning ----------------------------------------------------------------------------------
    async def async_learn(self) -> None:
        """Nightly: learn the model, then tune the surcharge (both in the executor)."""
        now = time.time()
        tz = self.hass.config.time_zone
        ctx = LearningContext(
            list(self.store.samples),
            now=now,
            tz=tz,
            classifier=self.classifier,
            cover=bool(self.settings[SET_COVER]),
        )
        params, reports = await self.hass.async_add_executor_job(self.learner.learn, self.params, ctx)
        self.store.set_params(params)
        self.store.extra["reports"] = [_report_dict(r) for r in reports]
        if self.options[OPT_SURCHARGE_AUTO]:
            result: TuningResult = await self.hass.async_add_executor_job(
                partial(
                    tune_surcharge,
                    list(self.store.samples),
                    params,
                    self.target,
                    float(self.settings[SET_BAND]),
                    partial(day_ahead_known_until, tz=tz),
                    now,
                    days=TUNING_DAYS,
                    start_penalty=float(self.options[OPT_START_PENALTY]),
                    horizon_hours=float(self.options[OPT_HORIZON]),
                )
            )
            self.store.extra["tuning"] = {
                "surcharge": result.surcharge,
                "costs": {str(k): round(v, 2) for k, v in result.costs.items()},
                "days": round(result.days, 1),
                "reason": result.reason,
                "at": now,
            }
        self.store.schedule_save()
        await self.hass.async_add_executor_job(self._update_cop, now)
        await self.async_replan()


def _report_dict(report: FitReport) -> dict[str, Any]:
    return {
        "kind": report.kind,
        "accepted": report.accepted,
        "reason": report.reason,
        "hours": report.hours,
        "new": report.new,
    }

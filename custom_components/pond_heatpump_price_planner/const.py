"""Constants for the Pond Heat Pump Price Planner integration."""

DOMAIN = "pond_heatpump_price_planner"
DEFAULT_NAME = "Pond heat pump"

# links to other entities (config flow, entry.data)
CONF_POND = "pond_temperature"
CONF_CLIMATE = "heat_pump"
CONF_POWER = "power"
CONF_INLET = "inlet_temperature"
CONF_OUTDOOR = "outdoor_temperature"
CONF_PRICE = "price"
CONF_PRICE_FORECAST = "price_forecast"
CONF_WEATHER = "weather"
CONF_SURPLUS = "surplus"
CONF_SURPLUS_TYPE = "surplus_type"
CONF_SOLAR_FORECAST = "solar_forecast"
CONF_OUTLET = "outlet_temperature"
CONF_ENERGY = "energy"
CONF_AIR_INLET = "air_inlet_temperature"

SURPLUS_TYPES = ("pv_power", "grid_export", "grid_net")

# tuning (options flow, entry.options)
OPT_PRICE_MULTIPLIER = "price_multiplier"
OPT_PRICE_ADDITION = "price_addition"
OPT_FORECAST_MULTIPLIER = "forecast_multiplier"
OPT_FORECAST_ADDITION = "forecast_addition"
OPT_FEED_IN_MULTIPLIER = "feed_in_multiplier"
OPT_FEED_IN_ADDITION = "feed_in_addition"
OPT_BASE_LOAD = "base_load"
OPT_START_PENALTY = "start_penalty"
OPT_MARGIN = "margin"
OPT_ALLOW_HIGH = "allow_high"
OPT_SURCHARGE_AUTO = "surcharge_auto"
OPT_SURCHARGE = "surcharge"
OPT_HORIZON = "horizon"
OPT_OFFSET_OFF = "offset_off"
OPT_OFFSET_LOW = "offset_low"
OPT_OFFSET_HIGH = "offset_high"
OPT_OFFSET_START = "offset_start"
OPT_LOW_W = "low_w"
OPT_HIGH_W = "high_w"
OPT_COP_WINDOW = "cop_window"
OPT_RUN_THRESHOLD = "run_threshold"
OPT_SETTLE = "settle_minutes"

DEFAULT_OPTIONS = {
    OPT_PRICE_MULTIPLIER: 1.0,
    OPT_PRICE_ADDITION: 0.0,
    OPT_FORECAST_MULTIPLIER: 1.0,
    OPT_FORECAST_ADDITION: 0.0,
    OPT_FEED_IN_MULTIPLIER: 1.0,
    OPT_FEED_IN_ADDITION: 0.0,
    OPT_BASE_LOAD: 300,
    OPT_START_PENALTY: 0.05,
    OPT_MARGIN: 0.07,
    OPT_ALLOW_HIGH: True,
    OPT_SURCHARGE_AUTO: True,
    OPT_SURCHARGE: 0.0,
    OPT_HORIZON: 36,
    OPT_OFFSET_OFF: -2,
    OPT_OFFSET_LOW: 0,
    OPT_OFFSET_HIGH: 1,
    OPT_OFFSET_START: 2,
    OPT_LOW_W: 150,
    OPT_HIGH_W: 650,
    OPT_COP_WINDOW: 14,
    OPT_RUN_THRESHOLD: 100,
    OPT_SETTLE: 20,
}

# settings held by entities, stored with the samples
SET_TARGET = "target"
SET_BAND = "band"
SET_VOLUME = "volume"
SET_FLOW = "flow"
SET_CONTROL = "control"
SET_COVER = "cover"
SET_COP_METHOD = "cop_method"

DEFAULT_SETTINGS = {
    SET_TARGET: 15.0,
    SET_BAND: 0.25,
    SET_VOLUME: None,
    SET_FLOW: None,
    SET_CONTROL: False,
    SET_COVER: False,
    SET_COP_METHOD: "average",
}

TARGET_MIN, TARGET_MAX, TARGET_STEP = 5.0, 28.0, 0.1  # °C, climate entity

CARD_FILE = "pond-heatpump-planner-card.js"
CARD_URL = f"/{DOMAIN}/{CARD_FILE}"

LEARN_TIME = (3, 30)  # local time of the nightly learning
TUNING_DAYS = 14
PREDICTION_HOURS = 4
REPLAN_DEBOUNCE = 2.0  # s

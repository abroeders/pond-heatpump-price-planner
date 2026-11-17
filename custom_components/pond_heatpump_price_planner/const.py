"""Constants for the Pond Heat Pump Price Planner integration."""

DOMAIN = "pond_heatpump_price_planner"
DEFAULT_NAME = "Pond heat pump"

# planner defaults (options in #5)
DEFAULT_BAND = 0.25  # K
DEFAULT_MARGIN = 0.07  # K inside the band
DEFAULT_START_PENALTY = 0.05  # € per start
EXPENSIVE_SURCHARGE_AUTO = None  # default: tuned nightly on recent history (core/tuning.py)
TUNING_DAYS = 14
DEFAULT_HORIZON_HOURS = 36

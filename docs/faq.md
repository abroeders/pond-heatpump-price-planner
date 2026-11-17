# FAQ

**Why does the planner prefer low power?**
On the reference pond, low power delivers about 1.45× as much heat per kWh as high power. Within one day,
all-in prices rarely differ enough to make up for that, so long runs at low power are usually cheapest.

**Will it ever run in an expensive quarter?**
Yes, when that is the cheapest way to keep the pond in its band, for example on cold days when low power
barely keeps up and preheating would need high power. It optimises on real cost.

**Why is there no COP per day?**
The water temperatures are reported in coarse steps, while the difference between water in and out is only
1–2 K. A daily COP jumps between about 1.5 and 9. Over 7 days or more the steps average out. See
[COP](cop.md).

**Does it work with my heat pump?**
If Home Assistant can change its setpoint through a `climate` entity, and the heat pump modulates its power
with the difference between setpoint and water temperature, yes. Check the setpoint offsets for your heat
pump (see [configuration](configuration.md#finding-the-setpoint-offsets-for-another-heat-pump)).

**Can it heat a swimming pool or a buffer tank?**
The model fits any body of water that is heated by one heat pump and loses heat to the outdoor air. It is
built and tested for a pond.

**I have a home battery. Does the planner take it into account?**
No. It uses the price you configure. If your battery covers expensive hours anyway, the price differences
the heat pump sees are smaller, and the advantage of low power counts even more.

**What happens with net metering?**
With the default feed-in settings, own solar power is worth as much as bought power, and solar does not
change the plan. Once net metering ends, set the feed-in options to what an exported kWh is worth.

**What happens during a Home Assistant restart?**
The samples, model and settings are stored. After the restart the planner plans again at once. The heat pump
keeps its last setpoint in the meantime.

**What does the insulation cover switch do?**
It tells the model that the cooling is lower, so the switch-over is immediate. Without it the nightly
cooling fit follows the cover within about a week.

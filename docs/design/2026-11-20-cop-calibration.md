# COP: pond sensor as inlet and a calibrated outlet

- Issue: #32
- Status: **approved** (2026-11-20)
- Date: 2026-11-20

## 1. Purpose

The flow method computes heat = flow × 1.163 × (outlet − inlet). On the W'eau heat pump both water sensors are
whole degrees and read low. Over 10 days (Influx, 112 settled running hours, 3.5 hours off with flow):

| | Inlet | Pond | Outlet |
|---|---|---|---|
| running | 14.05 | 14.62 | 15.19 |
| off, water flowing (all should equal the pond) | 14.05 | 14.57 | 14.29 |

The inlet never leaves 14, so its error (−0.57 K) does not average out. The outlet flips between 14, 15 and 16,
so its mean is useful, but it reads 0.28 K low. With a true difference of about 0.85 K:

| Inlet / outlet | ΔT | COP |
|---|---|---|
| heat pump inlet / raw outlet (now) | 1.14 K | 6.0 |
| pond / raw outlet | 0.57 K | 3.0 |
| pond / outlet + 0.28 K | ≈ 0.85 K | ≈ 4.5 |

## 2. Options and link

| Key | Default | Values | Meaning |
|---|---|---|---|
| `cop_inlet` | `heat_pump` | `heat_pump`, `pond` | inlet temperature of the flow method |
| `cop_outlet_correction` | empty | −2…2 K, step 0.01 | added to the outlet; empty = the learned offset |

New optional link in the COP step of the config flow (and reconfigure): `circulation`, a binary sensor that is
on while water flows through the heat pump. Without it, water is assumed to always flow.

## 3. Bucket

`CopBucket` gets new sums over the **counted** time (running and settled), so a later change of inlet or
offset applies to the stored hours too:

| Field | Meaning |
|---|---|
| `out_ks` | ∫ outlet dt |
| `in_ks` | ∫ heat pump inlet dt |
| `pond_ks`, `pond_s` | ∫ pond dt and its time (pond known) |

and two over the **calibration** time:

| Field | Meaning |
|---|---|
| `cal_s` | time with the heat pump off for at least 30 minutes, water flowing, outlet and pond known |
| `cal_ks` | ∫ (pond − outlet) dt over that time |

`to_list` appends the new fields; `from_list` fills missing ones with 0, so stored buckets of older versions load.
`heat_per_flow_kwh` stays for those older buckets.

## 4. Accumulator

`FlowAccumulator.update` gets `pond` and `circulation` (bool). It tracks `off_since`: the time the power fell to or
below the run threshold (at start-up with the heat pump off: the start-up time, so the first 30 minutes are not
counted). `_advance` adds, per segment:
- counted time (as now): `out_ks`, `in_ks`, and `pond_ks`/`pond_s` when the pond is known;
- calibration time when `power ≤ run threshold`, `t − off_since ≥ 1800 s`, `circulation is not False`, and outlet
  and pond are known: `cal_s`, `cal_ks`.

## 5. Calculation

```python
@dataclass
class OutletOffset:
    offset: float | None  # K added to the outlet
    hours: float  # calibration hours in the window
    source: str  # "learned", "manual" or "none"


def outlet_offset(
    buckets: Sequence[CopBucket], now: float, manual: float | None, days: float = 21
) -> OutletOffset: ...
```

- `manual` set → that value, source `manual`.
- Else Σ `cal_ks` / Σ `cal_s` over the last 21 days when `cal_s > 0`, source `learned`; else `None`, source `none`
  (offset 0 is used).

`cop_flow(buckets, flow, now, window, high_w, min_hours, inlet="heat_pump", offset=0.0)` computes the heat per
bucket as

- buckets with the new sums: 1.163 × flow × (`out_ks` + offset × `seconds` − inlet sum) / 3600, where the inlet
  sum is `in_ks` or, for `pond`, `pond_ks` (only when `pond_s == seconds`; otherwise the bucket is skipped);
- older buckets: `heat_per_flow_kwh` (+ offset × seconds × 1.163 / 3600) for `heat_pump`; skipped for `pond`.

## 6. Sensor

`cop_flow` keeps showing a value from the existing 24 running hours. New attributes:

| Attribute | Meaning |
|---|---|
| `inlet` | `heat_pump` or `pond` |
| `outlet_offset` | K, 2 decimals, or `null` |
| `offset_source` | `learned`, `manual`, `none` |
| `calibration_hours` | 1 decimal |
| `calibrating` | true while the source is not `manual` and there are fewer than 6 calibration hours |

`combine` (average / flow / pond) uses the corrected flow result. Diagnostics add the offset.

## 7. Tests

- Accumulator: calibration only after 30 minutes off, not with circulation off, not without pond or outlet;
  new sums while counting; start-up with the heat pump off.
- `outlet_offset`: learned, manual, none, window.
- `cop_flow`: pond inlet with offset recovers the true COP from synthetic whole-degree data with biased sensors
  (inlet stuck, outlet −0.28 K) within 5 %; older buckets; buckets without a full pond time are skipped.
- `CopBucket` round trip of old and new lists.
- Home Assistant: options and link in the flows; attributes; `calibrating`.

## 8. Documentation

`docs/configuration.md` (options, link), `docs/cop.md` (why, how to read the calibration), `docs/entities.md`
(attributes), `docs/architecture.md` (CopBucket, FlowAccumulator, OutletOffset; counting state diagram with the
calibration state), changelog.

from core.samples import QUARTER, Sample
from core.seeding import SeedEntities, backfill_presets, needs_seed, seed

ENTITIES = SeedEntities("sensor.pond", "sensor.outdoor", "sensor.power")


class FakeHistory:
    def __init__(self, data):
        self.data = data
        self.calls = []

    def series(self, entity_ids, start, end):
        self.calls.append((tuple(entity_ids), start, end))
        return self.data

    def attribute(self, entity_id, attribute, start, end):
        self.calls.append((entity_id, attribute, start, end))
        return self.data.get(f"{entity_id}.{attribute}", [])


def test_seed_builds_quarters_and_existing_samples_win():
    now = 10 * QUARTER
    history = FakeHistory(
        {
            "sensor.pond": [(0, 14.0), (5 * QUARTER, 14.5)],
            "sensor.outdoor": [(0, 5.0)],
            "sensor.power": [(0, 390.0)],
        }
    )
    existing = [Sample(9 * QUARTER, 99.0, 1.0, 1.0)]
    result = seed(existing, history, ENTITIES, now)
    assert history.calls[0][0] == ("sensor.pond", "sensor.outdoor", "sensor.power")
    assert len(result.samples) == 10 and result.added == 9
    assert result.samples[0].pond == 14.0 and result.samples[0].power == 390.0
    assert result.samples[5].pond == 14.5
    assert result.samples[-1].pond == 99.0  # existing sample kept


def test_seed_without_history_and_needs_seed():
    assert seed([], FakeHistory({}), ENTITIES, 1000.0).added == 0
    assert needs_seed([]) and not needs_seed([Sample(i * QUARTER, 1, 1, 1) for i in range(96)])


def test_seed_takes_the_preset_from_the_climate_history():
    now = 4 * QUARTER
    history = FakeHistory(
        {
            "sensor.pond": [(0, 14.0)],
            "sensor.outdoor": [(0, 5.0)],
            "sensor.power": [(0, 1100.0)],
            "climate.hp.preset_mode": [(0, "quiet_heat"), (2 * QUARTER + 10, "quick_heat")],
        }
    )
    entities = SeedEntities("sensor.pond", "sensor.outdoor", "sensor.power", "climate.hp")
    result = seed([], history, entities, now)
    assert [s.preset for s in result.samples] == ["quiet_heat", "quiet_heat", "quick_heat", "quick_heat"]
    assert ("climate.hp", "preset_mode", now - 42 * 86400, now) in history.calls


def test_backfill_presets_reads_from_the_first_sample_without_a_preset():
    samples = [Sample(i * QUARTER, 14, 5, 1100, preset="quiet_heat" if i == 0 else None) for i in range(3)]
    history = FakeHistory({"climate.hp.preset_mode": [(0, "quick_heat")]})
    assert backfill_presets(samples, history, "climate.hp", 3 * QUARTER) == 2
    assert history.calls == [("climate.hp", "preset_mode", QUARTER, 3 * QUARTER)]
    assert [s.preset for s in samples] == ["quiet_heat", "quick_heat", "quick_heat"]
    assert backfill_presets(samples, history, "climate.hp", 3 * QUARTER) == 0  # nothing missing: no query
    assert len(history.calls) == 1

from core.samples import QUARTER, Sample
from core.seeding import SeedEntities, needs_seed, seed

ENTITIES = SeedEntities("sensor.pond", "sensor.outdoor", "sensor.power")


class FakeHistory:
    def __init__(self, data):
        self.data = data
        self.calls = []

    def series(self, entity_ids, start, end):
        self.calls.append((tuple(entity_ids), start, end))
        return self.data


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

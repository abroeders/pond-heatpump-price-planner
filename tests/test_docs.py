"""The documentation covers every link, option and entity, and its internal links resolve."""

import json
import re
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
STRINGS = json.loads((ROOT / "custom_components/pond_heatpump_price_planner/strings.json").read_text())


def text(name: str) -> str:
    return (DOCS / name).read_text()


def test_every_link_and_option_is_in_the_configuration_reference():
    doc = text("configuration.md")
    links = {k for step in STRINGS["config"]["step"].values() for k in step["data"]} - {"name"}
    options = set(STRINGS["options"]["step"]["init"]["data"])
    missing = sorted(k for k in links | options if f"`{k}`" not in doc)
    assert not missing, f"not documented in configuration.md: {missing}"


def test_every_entity_is_in_the_entities_reference():
    doc = text("entities.md")
    keys = {k for platform in STRINGS["entity"].values() for k in platform}
    missing = sorted(k for k in keys if f"`{k}`" not in doc)
    assert not missing, f"not documented in entities.md: {missing}"


MARKDOWN = sorted([ROOT / "README.md", *DOCS.glob("*.md"), *(DOCS / "design").glob("*.md")])
LINK = re.compile(r"\]\(([^)#\s]+)(#[^)\s]*)?\)")
FENCE = re.compile(r"```.*?```", re.S)


def anchors(path: Path) -> set[str]:
    out = set()
    for line in path.read_text().splitlines():
        if line.startswith("#"):
            title = line.lstrip("#").strip().lower()
            out.add(re.sub(r"[^\w\- ]", "", title).replace(" ", "-"))
    return out


@pytest.mark.parametrize("path", MARKDOWN, ids=lambda p: str(p.relative_to(ROOT)))
def test_internal_links_resolve(path: Path):
    broken = []
    for target, anchor in LINK.findall(FENCE.sub("", path.read_text())):
        if target.startswith(("http://", "https://", "mailto:")):
            continue
        dest = (path.parent / target).resolve()
        if not dest.exists():
            broken.append(target)
        elif anchor and dest.suffix == ".md" and anchor[1:] not in anchors(dest):
            broken.append(target + anchor)
    assert not broken, f"broken links in {path.name}: {broken}"

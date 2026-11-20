"""Names and attribute texts of a planner in the language of its options, independent of Home Assistant."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.helpers.translation import async_get_translations

from .const import DOMAIN, LANGUAGES


class PlannerTexts:
    """Facade over Home Assistant's translation helper; the integration's translation files are the source.

    Entity keys are unique over all platforms, so a key alone identifies an entity.
    """

    def __init__(self, language: str | None, strings: dict[str, str]) -> None:
        self.language = language  # None: automatic, entity names are left to Home Assistant
        self._strings = strings

    @classmethod
    async def async_load(cls, hass: HomeAssistant, option: str) -> PlannerTexts:
        fixed = option if option in LANGUAGES else None  # anything else, LANGUAGE_AUTO included: automatic
        system = hass.config.language.split("-")[0]
        language = fixed or (system if system in LANGUAGES else "en")
        raw = await async_get_translations(hass, language, "entity", [DOMAIN])
        prefix = f"component.{DOMAIN}.entity."
        # "<platform>.<key>.<rest>" → "<key>.<rest>"
        strings = {k[len(prefix) :].split(".", 1)[1]: v for k, v in raw.items() if k.startswith(prefix)}
        return cls(fixed, strings)

    def entity_name(self, key: str) -> str | None:
        """The fixed name of an entity, or None to let Home Assistant translate it."""
        if self.language is None:
            return None
        return self._strings.get(f"{key}.name")

    def attribute_text(self, key: str, attribute: str, code: str | None) -> str | None:
        """Readable text for the code of an attribute; the code itself when there is no text."""
        if code is None:
            return None
        return self._strings.get(f"{key}.state_attributes.{attribute}.state.{code}", code)

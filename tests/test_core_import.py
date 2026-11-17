"""The core package must import without Home Assistant."""

import importlib
import sys


def test_core_imports_without_home_assistant():
    core = importlib.import_module("core")
    assert core.__doc__
    assert "homeassistant" not in sys.modules

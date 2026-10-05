import pytest
from app.config import settings


@pytest.fixture(autouse=True)
def configure_test_environment(monkeypatch):
    """Ensures automated pytest runs enable test debug affordances without leaking to real runs."""
    monkeypatch.setattr(settings, "APP_DEBUG", True)
    monkeypatch.setattr(settings, "OTP_ALLOW_CONSOLE_FALLBACK", True)

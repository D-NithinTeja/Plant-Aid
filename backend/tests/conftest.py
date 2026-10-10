import pytest
from app.config import settings

# Import-time ceiling: the slowapi decorators on /auth/forgot-password capture the
# limit string when app.routers.* is imported, so raise it here (before test modules
# import app.main) to keep multi-request reset flows in the suite deterministic.
# RATE_LIMIT_LOGIN is intentionally left at its production value because
# test_inference.py::test_rate_limiting_auth_endpoint asserts the 429 behavior.
settings.RATE_LIMIT_PASSWORD_RESET = "1000/minute"


@pytest.fixture(autouse=True)
def configure_test_environment(monkeypatch):
    """Ensures automated pytest runs enable test debug affordances without leaking to real runs."""
    monkeypatch.setattr(settings, "APP_DEBUG", True)
    monkeypatch.setattr(settings, "OTP_ALLOW_CONSOLE_FALLBACK", True)

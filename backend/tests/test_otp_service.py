import smtplib
from unittest.mock import MagicMock, patch

import pytest

from app.config import settings
from app.services.otp_service import OTPService


@pytest.fixture
def otp_service_instance():
    return OTPService()


def test_console_provider_dispatches(otp_service_instance, monkeypatch):
    monkeypatch.setattr(settings, "OTP_PROVIDER", "console")
    assert otp_service_instance.send_otp("farmer@test.com", "123456") is True


def test_smtp_starttls_success(otp_service_instance, monkeypatch):
    monkeypatch.setattr(settings, "OTP_PROVIDER", "smtp")
    monkeypatch.setattr(settings, "SMTP_HOST", "smtp.gmail.com")
    monkeypatch.setattr(settings, "SMTP_PORT", 587)
    monkeypatch.setattr(settings, "SMTP_USERNAME", "test@gmail.com")
    monkeypatch.setattr(settings, "SMTP_PASSWORD", "app_password_123")
    monkeypatch.setattr(settings, "SMTP_USE_STARTTLS", True)

    mock_smtp = MagicMock()
    with patch("smtplib.SMTP", return_value=mock_smtp):
        mock_smtp.__enter__.return_value = mock_smtp
        result = otp_service_instance.send_otp("recipient@test.com", "654321")
        assert result is True
        mock_smtp.starttls.assert_called_once()
        mock_smtp.login.assert_called_once_with("test@gmail.com", "app_password_123")
        mock_smtp.send_message.assert_called_once()


def test_smtp_ssl_success(otp_service_instance, monkeypatch):
    monkeypatch.setattr(settings, "OTP_PROVIDER", "smtp")
    monkeypatch.setattr(settings, "SMTP_HOST", "smtp.gmail.com")
    monkeypatch.setattr(settings, "SMTP_PORT", 465)
    monkeypatch.setattr(settings, "SMTP_USERNAME", "test@gmail.com")
    monkeypatch.setattr(settings, "SMTP_PASSWORD", "app_password_123")
    monkeypatch.setattr(settings, "SMTP_USE_STARTTLS", False)

    mock_smtp_ssl = MagicMock()
    with patch("smtplib.SMTP_SSL", return_value=mock_smtp_ssl):
        mock_smtp_ssl.__enter__.return_value = mock_smtp_ssl
        result = otp_service_instance.send_otp("recipient@test.com", "654321")
        assert result is True
        mock_smtp_ssl.login.assert_called_once_with("test@gmail.com", "app_password_123")
        mock_smtp_ssl.send_message.assert_called_once()


def test_smtp_unconfigured_fallback_to_console(otp_service_instance, monkeypatch):
    monkeypatch.setattr(settings, "OTP_PROVIDER", "smtp")
    monkeypatch.setattr(settings, "SMTP_HOST", "")
    monkeypatch.setattr(settings, "SMTP_USERNAME", "")
    monkeypatch.setattr(settings, "SMTP_PASSWORD", "")
    monkeypatch.setattr(settings, "OTP_ALLOW_CONSOLE_FALLBACK", True)

    # When unconfigured and fallback enabled, returns True (console fallback)
    assert otp_service_instance.send_otp("recipient@test.com", "112233") is True


def test_smtp_unconfigured_no_fallback_returns_false(otp_service_instance, monkeypatch):
    monkeypatch.setattr(settings, "OTP_PROVIDER", "smtp")
    monkeypatch.setattr(settings, "SMTP_HOST", "")
    monkeypatch.setattr(settings, "SMTP_USERNAME", "")
    monkeypatch.setattr(settings, "SMTP_PASSWORD", "")
    monkeypatch.setattr(settings, "OTP_ALLOW_CONSOLE_FALLBACK", False)

    # When fallback disabled, returns False
    assert otp_service_instance.send_otp("recipient@test.com", "112233") is False


def test_resend_api_success(otp_service_instance, monkeypatch):
    monkeypatch.setattr(settings, "OTP_PROVIDER", "resend")
    monkeypatch.setattr(settings, "RESEND_API_KEY", "re_test_key_123")
    monkeypatch.setattr(settings, "RESEND_FROM_EMAIL", "onboarding@resend.dev")

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_client = MagicMock()
    mock_client.post.return_value = mock_response
    mock_client.__enter__.return_value = mock_client

    with patch("httpx.Client", return_value=mock_client):
        result = otp_service_instance.send_otp("recipient@test.com", "778899")
        assert result is True
        mock_client.post.assert_called_once()

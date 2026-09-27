import logging

import httpx

from app.config import settings

logger = logging.getLogger("plant_aid.otp_service")
logging.basicConfig(level=logging.INFO)


class OTPService:
    def __init__(self):
        self.provider = settings.OTP_PROVIDER.lower()

    def send_otp(self, destination: str, otp_code: str) -> bool:
        """
        Dispatches the 2FA OTP to the user.

        `destination` is a phone number or an email address; the channel is derived from it
        (an '@' means email), and the configured provider decides the transport. When the
        provider is misconfigured or the send fails, the code falls back to console dispatch
        so a local run is never blocked on third-party credentials.
        """
        channel = "email" if "@" in destination else "sms"

        if self.provider == "twilio" and channel == "sms":
            return self._send_twilio_sms(destination, otp_code)
        elif self.provider == "sendgrid" and channel == "email":
            return self._send_sendgrid_email(destination, otp_code)
        else:
            return self._send_console(destination, otp_code, channel)

    def _send_console(self, destination: str, otp_code: str, channel: str) -> bool:
        logger.info(
            f"\n"
            f"====================================================\n"
            f"[2FA OTP DISPATCH — {channel.upper()}]\n"
            f"To: {destination}\n"
            f"Your Plant-Aid Verification Code is: {otp_code}\n"
            f"Valid for {settings.OTP_EXPIRE_MINUTES} minutes.\n"
            f"===================================================="
        )
        return True

    def _send_twilio_sms(self, phone: str, otp_code: str) -> bool:
        if not (
            settings.TWILIO_ACCOUNT_SID
            and settings.TWILIO_AUTH_TOKEN
            and settings.TWILIO_PHONE_NUMBER
        ):
            logger.warning(
                "Twilio credentials incomplete, falling back to console dispatch."
            )
            return self._send_console(phone, otp_code, "sms")

        url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
        data = {
            "From": settings.TWILIO_PHONE_NUMBER,
            "To": phone,
            "Body": f"Your Plant-Aid 2FA verification code is: {otp_code}. Valid for {settings.OTP_EXPIRE_MINUTES} minutes.",
        }
        try:
            with httpx.Client() as client:
                res = client.post(
                    url,
                    data=data,
                    auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
                )
                res.raise_for_status()
                return True
        except Exception as e:
            logger.error(f"Failed to send Twilio SMS: {e}")
            return self._send_console(phone, otp_code, "sms")

    def _send_sendgrid_email(self, email: str, otp_code: str) -> bool:
        if not settings.SENDGRID_API_KEY:
            logger.warning(
                "SendGrid API key missing, falling back to console dispatch."
            )
            return self._send_console(email, otp_code, "email")

        url = "https://api.sendgrid.com/v3/mail/send"
        headers = {
            "Authorization": f"Bearer {settings.SENDGRID_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "personalizations": [{"to": [{"email": email}]}],
            "from": {
                "email": settings.SENDGRID_FROM_EMAIL,
                "name": "Plant-Aid Security",
            },
            "subject": "Your Plant-Aid 2FA Code",
            "content": [
                {
                    "type": "text/html",
                    "value": f"<p>Your Plant-Aid 2FA verification code is: <strong>{otp_code}</strong>.</p><p>This code expires in {settings.OTP_EXPIRE_MINUTES} minutes.</p>",
                }
            ],
        }
        try:
            with httpx.Client() as client:
                res = client.post(url, json=payload, headers=headers)
                res.raise_for_status()
                return True
        except Exception as e:
            logger.error(f"Failed to send SendGrid email: {e}")
            return self._send_console(email, otp_code, "email")


otp_service = OTPService()

import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Plant-Aid API"
    APP_DEBUG: bool = True

    # Security / JWT
    SECRET_KEY: str = "super-secret-plant-aid-jwt-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 60 minutes per Implementation.md §2.2
    OTP_EXPIRE_MINUTES: int = 5  # 5-min TTL per Implementation.md §2.2
    MAX_OTP_ATTEMPTS: int = 5  # 5 failed attempts cap per Implementation.md §2.2

    # Database
    DATABASE_URL: str = "sqlite:///./plant_aid.db"

    # AWS S3 Settings
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "plant-aid-media-bucket"
    S3_PRESIGNED_EXPIRATION_SECONDS: int = (
        900  # 15 minutes TTL per Implementation.md §6.2
    )

    # Media Storage Fallback
    UPLOAD_DIR: str = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "uploads"
    )

    # 2FA OTP Provider (console | twilio | sendgrid)
    OTP_PROVIDER: str = "console"
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    SENDGRID_API_KEY: str = ""
    SENDGRID_FROM_EMAIL: str = "no-reply@plant-aid.org"

    model_config = SettingsConfigDict(env_prefix="PLANT_AID_", extra="ignore")


settings = Settings()

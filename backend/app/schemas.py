import datetime
import uuid
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# --- User & Auth Schemas ---
class UserRegister(BaseModel):
    user_name: str = Field(..., min_length=2, max_length=100)
    email_address: EmailStr
    phone_number: str | None = Field(None, max_length=25)
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    login_id: str | None = None  # Can be email or phone number
    email_address: EmailStr | None = None  # Backwards compatibility
    password: str

    def get_identifier(self) -> str:
        return (self.login_id or self.email_address or "").strip()


class TwoFactorChallengeResponse(BaseModel):
    session_id: str
    expires_in: int = 300
    message: str
    otp_code_dev: str | None = (
        None  # Populated when APP_DEBUG=True for seamless local testing
    )
    user_id: int | None = None  # Optional back-compat for legacy tests


class TwoFactorVerifyRequest(BaseModel):
    session_id: str | None = None
    user_id: int | None = None  # Backwards compatibility
    otp_code: str = Field(..., min_length=6, max_length=6)


class TokenResponse(BaseModel):
    token_type: str = "bearer"
    access_token: str
    expires_in: int
    user_id: int
    user_name: str
    email_address: str


class UserResponse(BaseModel):
    id: int
    user_name: str
    email_address: str
    phone_number: str | None = None
    is_2fa_enabled: bool
    account_status: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# --- Remedy & Disease Schemas ---
class RemedySchema(BaseModel):
    id: int
    disease_id: str
    remedy_type: str
    title: str
    description: str
    application_instructions: str | None = None
    category: str

    model_config = ConfigDict(from_attributes=True)


class DiseaseSchema(BaseModel):
    id: str
    numeric_id: int | None = None
    plant_species: str
    disease_name: str
    scientific_name: str | None = None
    severity_level: str
    remedies: list[RemedySchema] = []

    model_config = ConfigDict(from_attributes=True)


class GroupedRemediesSchema(BaseModel):
    organic_biological: list[RemedySchema] = []
    chemical_fungicide: list[RemedySchema] = []
    preventive_cultural: list[RemedySchema] = []


class DiseaseRemedyDetailResponse(BaseModel):
    disease_id: str
    numeric_id: int | None = None
    disease_name: str
    plant_species: str
    scientific_name: str | None = None
    severity_level: str
    remedies: list[RemedySchema] = []
    grouped_remedies: GroupedRemediesSchema


# --- Bounding Box & Inference Schemas ---
class BoundingBoxSchema(BaseModel):
    x_min: float
    y_min: float
    x_max: float
    y_max: float


class InferenceFramePayload(BaseModel):
    mime_type: str = "image/jpeg"
    encoding: str = "base64"
    image_b64: str
    capture_timestamp: str | None = None


class InferenceResponse(BaseModel):
    disease_id: int | str
    disease_name: str
    confidence: float
    confidence_score: float | None = None
    plant_species: str | None = None
    scientific_name: str | None = None
    bounding_box: BoundingBoxSchema | None = None
    frame_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_healthy_or_uncertain: bool = False
    s3_storage_uri: str | None = None
    remedies: list[RemedySchema] = []
    diagnosis_timestamp: datetime.datetime | None = None


# --- History Log Schemas ---
class HistoryLogCreate(BaseModel):
    disease_id: str
    disease_name: str
    confidence_score: float
    s3_storage_uri: str
    bounding_box: BoundingBoxSchema | None = None


class HistoryLogResponse(BaseModel):
    id: int
    user_id: int
    disease_id: str
    disease_name: str
    confidence_score: float
    s3_storage_uri: str
    media_url: str | None = None
    bounding_box_json: str | None = None
    diagnosis_timestamp: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

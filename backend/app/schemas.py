import datetime
import uuid
from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field

# --- User & Auth Schemas ---
class UserRegister(BaseModel):
    user_name: str = Field(..., min_length=2, max_length=100)
    email_address: EmailStr
    phone_number: Optional[str] = Field(None, max_length=25)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    login_id: Optional[str] = None  # Can be email or phone number
    email_address: Optional[EmailStr] = None # Backwards compatibility
    password: str

    def get_identifier(self) -> str:
        return (self.login_id or self.email_address or "").strip()

class TwoFactorChallengeResponse(BaseModel):
    session_id: str
    expires_in: int = 300
    message: str
    otp_code_dev: Optional[str] = None  # Populated when APP_DEBUG=True for seamless local testing
    user_id: Optional[int] = None      # Optional back-compat for legacy tests

class TwoFactorVerifyRequest(BaseModel):
    session_id: Optional[str] = None
    user_id: Optional[int] = None      # Backwards compatibility
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
    phone_number: Optional[str] = None
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
    application_instructions: Optional[str] = None
    category: str

    model_config = ConfigDict(from_attributes=True)

class DiseaseSchema(BaseModel):
    id: str
    numeric_id: Optional[int] = None
    plant_species: str
    disease_name: str
    scientific_name: Optional[str] = None
    severity_level: str
    remedies: List[RemedySchema] = []

    model_config = ConfigDict(from_attributes=True)

class GroupedRemediesSchema(BaseModel):
    organic_biological: List[RemedySchema] = []
    chemical_fungicide: List[RemedySchema] = []
    preventive_cultural: List[RemedySchema] = []

class DiseaseRemedyDetailResponse(BaseModel):
    disease_id: str
    numeric_id: Optional[int] = None
    disease_name: str
    plant_species: str
    scientific_name: Optional[str] = None
    severity_level: str
    remedies: List[RemedySchema] = []
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
    capture_timestamp: Optional[str] = None

class InferenceResponse(BaseModel):
    disease_id: int | str
    disease_name: str
    confidence: float
    confidence_score: Optional[float] = None
    plant_species: Optional[str] = None
    scientific_name: Optional[str] = None
    bounding_box: Optional[BoundingBoxSchema] = None
    frame_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_healthy_or_uncertain: bool = False
    s3_storage_uri: Optional[str] = None
    remedies: List[RemedySchema] = []
    diagnosis_timestamp: Optional[datetime.datetime] = None


# --- History Log Schemas ---
class HistoryLogCreate(BaseModel):
    disease_id: str
    disease_name: str
    confidence_score: float
    s3_storage_uri: str
    bounding_box: Optional[BoundingBoxSchema] = None

class HistoryLogResponse(BaseModel):
    id: int
    user_id: int
    disease_id: str
    disease_name: str
    confidence_score: float
    s3_storage_uri: str
    bounding_box_json: Optional[str] = None
    diagnosis_timestamp: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

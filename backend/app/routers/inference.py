import base64
import datetime
import json
import uuid
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Header,
    HTTPException,
    Request,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.limiter import limiter
from app.models import Disease, DiseaseHistoryLog, User
from app.schemas import (
    BoundingBoxSchema,
    InferenceFramePayload,
    InferenceResponse,
    RemedySchema,
)
from app.security import decode_access_token, get_now_utc
from app.services.ml_engine import ml_engine
from app.services.storage import storage_service

router = APIRouter(tags=["Real-Time Model Inference"])


def get_optional_user(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
) -> Optional[User]:
    """Extracts user if valid Bearer token provided, otherwise returns None for guest scans."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    return db.query(User).filter(User.id == int(payload["sub"])).first()


def _decode_base64_image(base64_str: str) -> tuple[bytes, str]:
    """Helper to decode base64 string and determine mime type."""
    mime_type = "image/jpeg"
    try:
        if "," in base64_str:
            header_part, base64_data = base64_str.split(",", 1)
            if "png" in header_part.lower():
                mime_type = "image/png"
        else:
            base64_data = base64_str
        image_bytes = base64.b64decode(base64_data)
        return image_bytes, mime_type
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid base64 encoded image string",
        )


def _get_remedies_for_disease(
    db: Session, class_key: str, disease_id: int
) -> list[RemedySchema]:
    """Helper to resolve remedies matching disease slug or numeric index."""
    disease_obj = db.query(Disease).filter(Disease.id == class_key).first()
    if not disease_obj:
        disease_obj = db.query(Disease).filter(Disease.numeric_id == disease_id).first()
    if disease_obj and disease_obj.remedies:
        return [RemedySchema.model_validate(r) for r in disease_obj.remedies]
    return []


@router.post("/frame", response_model=InferenceResponse, summary="Stream frame inference")
@limiter.limit(settings.RATE_LIMIT_INFERENCE)
async def process_inference_frame(
    request: Request,
    payload: InferenceFramePayload,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Real-Time Leaf Frame Inference endpoint (Task 5.5 per Implementation.md §4.3).
    Receives base64 video frame, executes two-layer localization (Leaf ROI + infection focus),
    calibrates confidence against tau = 0.55, and returns normalized bounding box without persistent DB write.
    """
    image_bytes, _ = _decode_base64_image(payload.image_b64)
    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No image bytes provided."
        )

    # 1. Run ML Engine Inference (CPU mode)
    prediction = ml_engine.predict(image_bytes)

    # 2. Query Remedies
    remedies_list = _get_remedies_for_disease(
        db, prediction["class_key"], prediction["disease_id"]
    )

    frame_id = str(uuid.uuid4())
    bbox = (
        BoundingBoxSchema(**prediction["bounding_box"])
        if prediction.get("bounding_box")
        else None
    )

    return InferenceResponse(
        disease_id=prediction["disease_id"],
        disease_name=prediction["disease_name"],
        plant_species=prediction["plant_species"],
        scientific_name=prediction.get("scientific_name"),
        confidence=prediction["confidence"],
        confidence_score=prediction["confidence_score"],
        bounding_box=bbox,
        frame_id=frame_id,
        is_healthy_or_uncertain=prediction["is_healthy_or_uncertain"],
        s3_storage_uri=None,
        remedies=remedies_list,
        diagnosis_timestamp=get_now_utc(),
    )


@router.post("/predict", response_model=InferenceResponse, summary="File or Form inference")
@limiter.limit(settings.RATE_LIMIT_INFERENCE)
async def predict_plant_disease(
    request: Request,
    file: Optional[UploadFile] = File(None),
    base64_image: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Multipart/Form upload inference endpoint.
    Uploads frame to storage and records diagnosis history if user is authenticated.
    """
    image_bytes = None
    mime_type = "image/jpeg"

    if file:
        if file.content_type not in [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/octet-stream",
        ]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image MIME type. Only JPEG and PNG files are supported.",
            )
        image_bytes = await file.read()
        mime_type = file.content_type or "image/jpeg"
    elif base64_image:
        image_bytes, mime_type = _decode_base64_image(base64_image)

    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image provided. Upload a file or pass base64 image data.",
        )

    # 1. Run inference using ML Engine
    prediction = ml_engine.predict(image_bytes)

    # 2. Upload raw frame to S3 / media storage with hierarchical key
    user_id = current_user.id if current_user else 0
    frame_id = str(uuid.uuid4())
    s3_uri = storage_service.upload_image(
        image_bytes=image_bytes,
        mime_type=mime_type,
        user_id=user_id,
        frame_id=frame_id,
    )

    # 3. Query remedies from Database
    remedies_list = _get_remedies_for_disease(
        db, prediction["class_key"], prediction["disease_id"]
    )

    # 4. Write History Log Record to Database with S3 Compensation Rollback (Task 4.2)
    now = get_now_utc()
    if current_user:
        history_entry = DiseaseHistoryLog(
            user_id=current_user.id,
            disease_id=prediction["class_key"],
            disease_name=prediction["disease_name"],
            confidence_score=prediction["confidence_score"],
            s3_storage_uri=s3_uri,
            bounding_box_json=json.dumps(prediction["bounding_box"]),
            diagnosis_timestamp=now,
        )
        db.add(history_entry)
        try:
            db.commit()
        except Exception:
            db.rollback()
            # Prevent orphaned media if database transaction fails
            storage_service.delete_object(s3_uri)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database persistence failed. Media upload was rolled back.",
            )

    bbox = (
        BoundingBoxSchema(**prediction["bounding_box"])
        if prediction.get("bounding_box")
        else None
    )

    return InferenceResponse(
        disease_id=prediction["disease_id"],
        disease_name=prediction["disease_name"],
        plant_species=prediction["plant_species"],
        scientific_name=prediction.get("scientific_name"),
        confidence=prediction["confidence_score"],
        confidence_score=prediction["confidence_score"],
        bounding_box=bbox,
        frame_id=frame_id,
        is_healthy_or_uncertain=prediction["is_healthy_or_uncertain"],
        s3_storage_uri=s3_uri,
        remedies=remedies_list,
        diagnosis_timestamp=now,
    )

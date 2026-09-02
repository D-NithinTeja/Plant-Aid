import base64
import datetime
import json
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Disease, DiseaseHistoryLog, User
from app.schemas import BoundingBoxSchema, InferenceResponse, RemedySchema
from app.security import decode_access_token, get_now_utc
from app.services.inference_stub import inference_stub
from app.services.storage import storage_service

router = APIRouter(prefix="/api/inference", tags=["Real-Time Model Inference"])


def get_optional_user(
    authorization: str | None = Header(None), db: Session = Depends(get_db)
) -> User | None:
    """Extracts user if valid Bearer token provided, otherwise returns None for guest scans."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    return db.query(User).filter(User.id == int(payload["sub"])).first()


@router.post("/predict", response_model=InferenceResponse)
async def predict_plant_disease(
    file: UploadFile | None = File(None),
    base64_image: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    """
    Processes plant leaf image frames (via file upload or base64 payload).
    Runs inference (stubbed), uploads frame to AWS S3/storage, queries remedies, and logs history.
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
                status_code=400,
                detail="Invalid image MIME type. Only JPEG and PNG files are supported.",
            )
        image_bytes = await file.read()
        mime_type = file.content_type or "image/jpeg"
    elif base64_image:
        try:
            # Handle potential data URI scheme (e.g. data:image/png;base64,...)
            if "," in base64_image:
                header_part, base64_data = base64_image.split(",", 1)
                if "png" in header_part:
                    mime_type = "image/png"
            else:
                base64_data = base64_image
            image_bytes = base64.b64decode(base64_data)
        except Exception:
            raise HTTPException(
                status_code=400, detail="Invalid base64 encoded image string"
            )

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="No image provided. Upload a file or pass base64 image data.",
        )

    # 1. Run inference (stubbed PyTorch model execution)
    prediction = inference_stub.run_inference(image_bytes)

    # 2. Upload raw frame to S3 / media storage
    user_id = current_user.id if current_user else 0
    s3_uri = storage_service.upload_image(
        image_bytes=image_bytes, mime_type=mime_type, user_id=user_id
    )

    # 3. Query remedies from Database
    disease_obj = (
        db.query(Disease).filter(Disease.id == prediction["disease_id"]).first()
    )
    remedies_list = []
    if disease_obj and disease_obj.remedies:
        remedies_list = [RemedySchema.model_validate(r) for r in disease_obj.remedies]

    # 4. Write History Log Record to PostgreSQL/Database (if user authenticated or default guest)
    now = get_now_utc()
    if current_user:
        history_entry = DiseaseHistoryLog(
            user_id=current_user.id,
            disease_id=prediction["disease_id"],
            disease_name=prediction["disease_name"],
            confidence_score=prediction["confidence_score"],
            s3_storage_uri=s3_uri,
            bounding_box_json=json.dumps(prediction["bounding_box"]),
            diagnosis_timestamp=now,
        )
        db.add(history_entry)
        db.commit()

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
        frame_id=str(uuid.uuid4()),
        s3_storage_uri=s3_uri,
        remedies=remedies_list,
        diagnosis_timestamp=now,
    )

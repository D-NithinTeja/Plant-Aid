import datetime
import json
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DiseaseHistoryLog, User
from app.schemas import (
    HistoryLogCreate,
    HistoryLogCreateResponse,
    HistoryLogResponse,
    PaginatedHistoryResponse,
)
from app.security import get_current_user, get_now_utc
from app.services.disease_lookup import resolve_disease
from app.services.storage import storage_service

router = APIRouter(tags=["Disease History & Media Storage Management"])


def _to_response(log: DiseaseHistoryLog) -> HistoryLogResponse:
    """Helper to convert model to schema with active presigned media URL."""
    resp = HistoryLogResponse.model_validate(log)
    resp.media_url = storage_service.generate_presigned_url(log.s3_storage_uri)
    return resp


@router.post(
    "",
    response_model=HistoryLogCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Explicitly log confirmed diagnosis record",
)
def create_history_log_item(
    payload: HistoryLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Explicitly logs a confirmed plant disease diagnosis record (Task 4.3 per Implementation.md §6.2).
    Triggered when the user clicks 'Save Diagnosis' rather than on every ephemeral video frame.
    Enforces S3 compensation rollback if the database commit fails.
    """
    disease_obj = resolve_disease(db, payload.disease_id)
    if not disease_obj:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unknown disease reference '{payload.disease_id}'. Use a catalogued disease id, numeric index, or name.",
        )

    disease_name = payload.disease_name or disease_obj.disease_name

    # Import base64 decoding helper
    from app.routers.inference import _decode_base64_image

    s3_storage_uri = payload.s3_storage_uri
    if not s3_storage_uri and payload.image_b64:
        image_bytes, mime_type = _decode_base64_image(payload.image_b64)
        if image_bytes:
            frame_id = str(uuid.uuid4())
            s3_storage_uri = storage_service.upload_image(
                image_bytes=image_bytes,
                mime_type=mime_type,
                user_id=current_user.id,
                frame_id=frame_id,
            )
    if not s3_storage_uri:
        # Fallback storage URI if neither is provided
        s3_storage_uri = f"s3://plant-aid-storage/frames/{current_user.id}/{uuid.uuid4()}.jpg"

    bbox_json = (
        json.dumps(payload.bounding_box.model_dump())
        if payload.bounding_box
        else None
    )
    now = get_now_utc()

    log_entry = DiseaseHistoryLog(
        user_id=current_user.id,
        disease_id=disease_obj.id,
        disease_name=disease_name,
        confidence_score=payload.confidence_score,
        s3_storage_uri=s3_storage_uri,
        bounding_box_json=bbox_json,
        diagnosis_timestamp=now,
    )
    db.add(log_entry)
    try:
        db.commit()
        db.refresh(log_entry)
    except Exception:
        db.rollback()
        # Compensation rollback: delete newly uploaded media if database transaction fails
        if s3_storage_uri:
            storage_service.delete_object(s3_storage_uri)
        raise HTTPException(
            status_code=500,
            detail="Failed to persist diagnosis history record. Media compensation executed.",
        )

    return HistoryLogCreateResponse(
        log_id=log_entry.id,
        status="confirmed",
        timestamp=log_entry.diagnosis_timestamp,
    )


def _parse_dt(dt_str: Optional[str]) -> Optional[datetime.datetime]:
    """Helper to parse ISO datetime strings robustly across URL decodings and formats."""
    if not dt_str:
        return None
    clean = dt_str.strip().replace(" ", "+").replace("Z", "+00:00")
    try:
        dt = datetime.datetime.fromisoformat(clean)
        return dt.replace(tzinfo=None)
    except Exception:
        return None


def _get_visible_log_or_404(db: Session, log_id: int, user_id: int) -> DiseaseHistoryLog:
    """Fetches one of the caller's non-deleted history rows, or raises 404."""
    log = (
        db.query(DiseaseHistoryLog)
        .filter(
            DiseaseHistoryLog.id == log_id,
            DiseaseHistoryLog.user_id == user_id,
            DiseaseHistoryLog.deleted_at.is_(None),
        )
        .first()
    )
    if not log:
        raise HTTPException(status_code=404, detail="History log entry not found")
    return log


@router.get(
    "",
    response_model=PaginatedHistoryResponse,
    summary="Get paginated history dashboard records",
)
def get_user_history(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    size: Optional[int] = Query(None, ge=1, le=100, description="Items per page (alias for limit)"),
    disease_id: Optional[str] = Query(None, description="Filter by disease ID"),
    date_from: Optional[str] = Query(
        None, description="Filter records on or after this timestamp (ISO format)"
    ),
    date_to: Optional[str] = Query(
        None, description="Filter records on or before this timestamp (ISO format)"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves paginated diagnosis history records for the authenticated user (Task 4.4 per Implementation.md §6.2).
    Includes active, time-limited presigned URLs for image thumbnails and supports disease and date filtering.
    """
    actual_limit = size if size is not None else limit

    query = db.query(DiseaseHistoryLog).filter(
        DiseaseHistoryLog.user_id == current_user.id,
        DiseaseHistoryLog.deleted_at.is_(None),
    )

    dt_from = _parse_dt(date_from)
    dt_to = _parse_dt(date_to)

    if disease_id:
        query = query.filter(DiseaseHistoryLog.disease_id == disease_id)
    if dt_from:
        query = query.filter(DiseaseHistoryLog.diagnosis_timestamp >= dt_from)
    if dt_to:
        query = query.filter(DiseaseHistoryLog.diagnosis_timestamp <= dt_to)

    total = query.count()
    total_pages = (total + actual_limit - 1) // actual_limit if total > 0 else 1

    records = (
        query.order_by(DiseaseHistoryLog.diagnosis_timestamp.desc())
        .offset((page - 1) * actual_limit)
        .limit(actual_limit)
        .all()
    )

    return PaginatedHistoryResponse(
        items=[_to_response(log) for log in records],
        total=total,
        page=page,
        limit=actual_limit,
        total_pages=total_pages,
    )


@router.get(
    "/{log_id}",
    response_model=HistoryLogResponse,
    summary="Get single diagnosis history record",
)
def get_history_log_item(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves a single diagnosis history log record by ID with an active presigned media URL."""
    log = _get_visible_log_or_404(db, log_id, current_user.id)
    return _to_response(log)


@router.delete(
    "/{log_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete diagnosis history record",
)
def delete_history_log_item(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Removes a diagnosis from the user's dashboard and cleans up associated S3 / disk media.
    The record itself is soft-deleted rather than dropped, so the audit trail survives (NF.5).
    """
    log = _get_visible_log_or_404(db, log_id, current_user.id)

    media_uri = log.s3_storage_uri
    log.deleted_at = get_now_utc()
    db.commit()

    # Clean up associated media object (Task 4.2)
    storage_service.delete_object(media_uri)

import datetime
import json
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Disease, DiseaseHistoryLog, User
from app.schemas import (
    HistoryLogCreate,
    HistoryLogCreateResponse,
    HistoryLogResponse,
    PaginatedHistoryResponse,
)
from app.security import get_current_user, get_now_utc
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
    disease_name = payload.disease_name
    if not disease_name:
        disease_obj = db.query(Disease).filter(Disease.id == payload.disease_id).first()
        if disease_obj:
            disease_name = disease_obj.disease_name
        else:
            disease_name = payload.disease_id.replace("_", " ").title()

    bbox_json = (
        json.dumps(payload.bounding_box.model_dump())
        if payload.bounding_box
        else None
    )
    now = get_now_utc()

    log_entry = DiseaseHistoryLog(
        user_id=current_user.id,
        disease_id=payload.disease_id,
        disease_name=disease_name,
        confidence_score=payload.confidence_score,
        s3_storage_uri=payload.s3_storage_uri,
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
        storage_service.delete_object(payload.s3_storage_uri)
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


@router.get(
    "",
    response_model=PaginatedHistoryResponse,
    summary="Get paginated history dashboard records",
)
def get_user_history(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
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
    query = db.query(DiseaseHistoryLog).filter(
        DiseaseHistoryLog.user_id == current_user.id
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
    total_pages = (total + limit - 1) // limit if total > 0 else 1

    records = (
        query.order_by(DiseaseHistoryLog.diagnosis_timestamp.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return PaginatedHistoryResponse(
        items=[_to_response(log) for log in records],
        total=total,
        page=page,
        limit=limit,
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
    log = (
        db.query(DiseaseHistoryLog)
        .filter(
            DiseaseHistoryLog.id == log_id, DiseaseHistoryLog.user_id == current_user.id
        )
        .first()
    )
    if not log:
        raise HTTPException(status_code=404, detail="History log entry not found")
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
    """Deletes a diagnosis history log entry and cleans up associated S3 / disk media."""
    log = (
        db.query(DiseaseHistoryLog)
        .filter(
            DiseaseHistoryLog.id == log_id, DiseaseHistoryLog.user_id == current_user.id
        )
        .first()
    )
    if not log:
        raise HTTPException(status_code=404, detail="History log entry not found")

    media_uri = log.s3_storage_uri
    db.delete(log)
    db.commit()

    # Clean up associated media object (Task 4.2)
    storage_service.delete_object(media_uri)

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DiseaseHistoryLog, User
from app.schemas import HistoryLogResponse
from app.security import get_current_user
from app.services.storage import storage_service

router = APIRouter(
    prefix="/api/history", tags=["Disease History & Media Storage Management"]
)


def _to_response(log: DiseaseHistoryLog) -> HistoryLogResponse:
    """Helper to convert model to schema with active presigned media URL."""
    resp = HistoryLogResponse.model_validate(log)
    resp.media_url = storage_service.generate_presigned_url(log.s3_storage_uri)
    return resp


@router.get("", response_model=List[HistoryLogResponse])
def get_user_history(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Retrieves diagnosis history log records for the authenticated user with active presigned media URLs."""
    logs = (
        db.query(DiseaseHistoryLog)
        .filter(DiseaseHistoryLog.user_id == current_user.id)
        .order_by(DiseaseHistoryLog.diagnosis_timestamp.desc())
        .all()
    )
    return [_to_response(log) for log in logs]


@router.get("/{log_id}", response_model=HistoryLogResponse)
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


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
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

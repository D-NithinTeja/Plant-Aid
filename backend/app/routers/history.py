from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DiseaseHistoryLog, User
from app.schemas import HistoryLogResponse
from app.security import get_current_user

router = APIRouter(
    prefix="/api/history", tags=["Disease History & Media Storage Management"]
)


@router.get("", response_model=list[HistoryLogResponse])
def get_user_history(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Retrieves diagnosis history log records for the authenticated user."""
    logs = (
        db.query(DiseaseHistoryLog)
        .filter(DiseaseHistoryLog.user_id == current_user.id)
        .order_by(DiseaseHistoryLog.diagnosis_timestamp.desc())
        .all()
    )
    return logs


@router.get("/{log_id}", response_model=HistoryLogResponse)
def get_history_log_item(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves a single diagnosis history log record by ID."""
    log = (
        db.query(DiseaseHistoryLog)
        .filter(
            DiseaseHistoryLog.id == log_id, DiseaseHistoryLog.user_id == current_user.id
        )
        .first()
    )
    if not log:
        raise HTTPException(status_code=404, detail="History log entry not found")
    return log


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history_log_item(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Deletes a diagnosis history log entry."""
    log = (
        db.query(DiseaseHistoryLog)
        .filter(
            DiseaseHistoryLog.id == log_id, DiseaseHistoryLog.user_id == current_user.id
        )
        .first()
    )
    if not log:
        raise HTTPException(status_code=404, detail="History log entry not found")

    db.delete(log)
    db.commit()

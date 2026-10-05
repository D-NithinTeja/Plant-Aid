import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Disease, DiseaseHistoryLog, Remedy, User
from app.schemas import (
    AdminHistoryItem,
    AdminPaginatedHistoryResponse,
    AdminPaginatedUsersResponse,
    AdminUserItem,
    RemedyCreate,
    RemedySchema,
    RemedyUpdate,
    UserRoleUpdate,
    UserStatusUpdate,
)
from app.security import require_admin
from app.services.disease_lookup import resolve_disease
from app.services.storage import storage_service

router = APIRouter(
    prefix="/admin",
    tags=["Platform Administration & Governance"],
    dependencies=[Depends(require_admin)],
)


# --- User Governance Endpoints ---
@router.get(
    "/users",
    response_model=AdminPaginatedUsersResponse,
    summary="List and filter registered users",
)
def list_users(
    search: Optional[str] = Query(None, description="Search by name, email, or phone"),
    role: Optional[str] = Query(None, description="Filter by user or admin"),
    account_status: Optional[str] = Query(None, alias="status", description="Filter by account status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Lists registered users with scan counts, search capability, and pagination."""
    query = db.query(User)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.user_name.ilike(search_pattern),
                User.email_address.ilike(search_pattern),
                User.phone_number.ilike(search_pattern),
            )
        )

    if role:
        query = query.filter(User.role == role)

    if account_status:
        query = query.filter(User.account_status == account_status)

    total = query.count()
    users = (
        query.order_by(User.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    # Subquery / dictionary for scan counts
    user_ids = [u.id for u in users]
    history_counts = {}
    if user_ids:
        counts = (
            db.query(DiseaseHistoryLog.user_id, func.count(DiseaseHistoryLog.id))
            .filter(
                DiseaseHistoryLog.user_id.in_(user_ids),
                DiseaseHistoryLog.deleted_at.is_(None),
            )
            .group_by(DiseaseHistoryLog.user_id)
            .all()
        )
        history_counts = {user_id: count for user_id, count in counts}

    items = []
    for u in users:
        item = AdminUserItem.model_validate(u)
        item.history_count = history_counts.get(u.id, 0)
        items.append(item)

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return AdminPaginatedUsersResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.patch(
    "/users/{user_id}/role",
    response_model=AdminUserItem,
    summary="Promote or demote user role",
)
def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """
    Updates the role of a user between 'user' and 'admin'.
    Includes a safety lock preventing admins from demoting themselves.
    """
    if user_id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Safety lock: Administrators cannot alter their own administrative role.",
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found.",
        )

    target_user.role = payload.role
    db.commit()
    db.refresh(target_user)

    history_count = (
        db.query(func.count(DiseaseHistoryLog.id))
        .filter(
            DiseaseHistoryLog.user_id == target_user.id,
            DiseaseHistoryLog.deleted_at.is_(None),
        )
        .scalar()
        or 0
    )

    resp = AdminUserItem.model_validate(target_user)
    resp.history_count = history_count
    return resp


@router.patch(
    "/users/{user_id}/status",
    response_model=AdminUserItem,
    summary="Update user account status (e.g., ACTIVE or SUSPENDED)",
)
def update_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """
    Updates user account status (ACTIVE, SUSPENDED, PENDING_VERIFICATION).
    Includes a safety lock preventing admins from suspending their own account.
    """
    if user_id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Safety lock: Administrators cannot suspend their own account.",
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found.",
        )

    target_user.account_status = payload.account_status
    if payload.account_status == "SUSPENDED":
        # Invalidate active challenges or sessions
        target_user.active_session_id = None
        target_user.active_2fa_otp = None
        target_user.otp_expiry_time = None

    db.commit()
    db.refresh(target_user)

    history_count = (
        db.query(func.count(DiseaseHistoryLog.id))
        .filter(
            DiseaseHistoryLog.user_id == target_user.id,
            DiseaseHistoryLog.deleted_at.is_(None),
        )
        .scalar()
        or 0
    )

    resp = AdminUserItem.model_validate(target_user)
    resp.history_count = history_count
    return resp


# --- Global Diagnosis History Oversight ---
@router.get(
    "/history",
    response_model=AdminPaginatedHistoryResponse,
    summary="List all plant disease diagnosis logs platform-wide",
)
def list_global_history(
    disease_id: Optional[str] = Query(None, description="Filter by disease identifier or index"),
    user_id: Optional[int] = Query(None, description="Filter by user id"),
    search: Optional[str] = Query(None, description="Search user name, email, or disease name"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Queries global diagnosis logs across all operators with operator metadata."""
    query = (
        db.query(DiseaseHistoryLog)
        .join(User, DiseaseHistoryLog.user_id == User.id)
        .filter(DiseaseHistoryLog.deleted_at.is_(None))
    )

    if disease_id:
        disease_obj = resolve_disease(db, disease_id)
        target_id = disease_obj.id if disease_obj else disease_id
        query = query.filter(DiseaseHistoryLog.disease_id == target_id)

    if user_id:
        query = query.filter(DiseaseHistoryLog.user_id == user_id)

    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.user_name.ilike(pattern),
                User.email_address.ilike(pattern),
                DiseaseHistoryLog.disease_name.ilike(pattern),
            )
        )

    total = query.count()
    logs = (
        query.order_by(DiseaseHistoryLog.diagnosis_timestamp.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    items = []
    for log in logs:
        media_url = storage_service.generate_presigned_url(log.s3_storage_uri)
        item = AdminHistoryItem(
            id=log.id,
            user_id=log.user_id,
            disease_id=log.disease_id,
            disease_name=log.disease_name,
            confidence_score=log.confidence_score,
            s3_storage_uri=log.s3_storage_uri,
            media_url=media_url,
            bounding_box_json=log.bounding_box_json,
            diagnosis_timestamp=log.diagnosis_timestamp,
            user_name=log.user.user_name if log.user else "Unknown User",
            email_address=log.user.email_address if log.user else "N/A",
        )
        items.append(item)

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return AdminPaginatedHistoryResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


# --- Remedy & Catalog Management CRUD ---
@router.post(
    "/remedies",
    response_model=RemedySchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new disease remedy",
)
def create_remedy(
    payload: RemedyCreate,
    db: Session = Depends(get_db),
):
    """Adds a new recommended remedy to the disease treatment catalog."""
    disease = resolve_disease(db, payload.disease_id)
    if not disease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target disease '{payload.disease_id}' does not exist.",
        )

    new_remedy = Remedy(
        disease_id=disease.id,
        remedy_type=payload.remedy_type,
        title=payload.title,
        description=payload.description,
        application_instructions=payload.application_instructions,
        category=payload.category,
    )
    db.add(new_remedy)
    db.commit()
    db.refresh(new_remedy)

    return RemedySchema.model_validate(new_remedy)


@router.put(
    "/remedies/{remedy_id}",
    response_model=RemedySchema,
    summary="Update an existing remedy",
)
def update_remedy(
    remedy_id: int,
    payload: RemedyUpdate,
    db: Session = Depends(get_db),
):
    """Updates fields of an existing disease remedy."""
    target_remedy = db.query(Remedy).filter(Remedy.id == remedy_id).first()
    if not target_remedy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Remedy with ID {remedy_id} not found.",
        )

    if payload.remedy_type is not None:
        target_remedy.remedy_type = payload.remedy_type
    if payload.title is not None:
        target_remedy.title = payload.title
    if payload.description is not None:
        target_remedy.description = payload.description
    if payload.application_instructions is not None:
        target_remedy.application_instructions = payload.application_instructions
    if payload.category is not None:
        target_remedy.category = payload.category

    db.commit()
    db.refresh(target_remedy)

    return RemedySchema.model_validate(target_remedy)


@router.delete(
    "/remedies/{remedy_id}",
    summary="Delete a remedy from the catalog",
)
def delete_remedy(
    remedy_id: int,
    db: Session = Depends(get_db),
):
    """Permanently deletes a remedy item from the catalog."""
    target_remedy = db.query(Remedy).filter(Remedy.id == remedy_id).first()
    if not target_remedy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Remedy with ID {remedy_id} not found.",
        )

    db.delete(target_remedy)
    db.commit()

    return {
        "status": "deleted",
        "remedy_id": remedy_id,
        "message": f"Remedy {remedy_id} successfully deleted.",
    }

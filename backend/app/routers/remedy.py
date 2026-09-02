from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Disease, Remedy
from app.schemas import DiseaseSchema, RemedySchema

router = APIRouter(prefix="/api", tags=["Treatment & Remedy Lookup"])


@router.get("/diseases", response_model=list[DiseaseSchema])
def list_diseases(db: Session = Depends(get_db)):
    """Lists all cataloged plant diseases with remedies."""
    diseases = db.query(Disease).all()
    return diseases


@router.get("/diseases/{disease_id}", response_model=DiseaseSchema)
def get_disease(disease_id: str, db: Session = Depends(get_db)):
    """Fetches details and treatment remedies for a specific disease ID."""
    disease = db.query(Disease).filter(Disease.id == disease_id.upper()).first()
    if not disease:
        # Try case-insensitive search or name match
        disease = (
            db.query(Disease)
            .filter(Disease.disease_name.ilike(f"%{disease_id}%"))
            .first()
        )

    if not disease:
        raise HTTPException(
            status_code=404, detail="Disease not found in lookup database"
        )
    return disease


@router.get("/remedies/search", response_model=list[RemedySchema])
def search_remedies(
    q: str = Query(..., description="Query string for searching remedies"),
    category: str | None = Query(
        None,
        description="Filter by category: Organic / Biological, Chemical / Fungicide, Preventive Cultural Practice",
    ),
    db: Session = Depends(get_db),
):
    """Searches treatment remedies by title, description, or disease."""
    query = db.query(Remedy)
    if q:
        query = query.filter(
            (Remedy.title.ilike(f"%{q}%")) | (Remedy.description.ilike(f"%{q}%"))
        )
    if category:
        query = query.filter(Remedy.category == category)

    return query.all()

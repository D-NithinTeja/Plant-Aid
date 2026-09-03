from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Disease, Remedy
from app.schemas import (
    DiseaseRemedyDetailResponse,
    DiseaseSchema,
    GroupedRemediesSchema,
    RemedySchema,
)

router = APIRouter(tags=["Treatment & Remedy Lookup"])


def _find_disease(db: Session, disease_id: str) -> Disease | None:
    """Helper to locate a disease by numeric ID, slug ID, or disease name."""
    disease = None
    if disease_id.isdigit():
        disease = (
            db.query(Disease).filter(Disease.numeric_id == int(disease_id)).first()
        )
    if not disease:
        disease = db.query(Disease).filter(Disease.id.ilike(disease_id)).first()
    if not disease:
        disease = (
            db.query(Disease)
            .filter(Disease.disease_name.ilike(f"%{disease_id}%"))
            .first()
        )
    return disease


@router.get("/remedies/{disease_id}", response_model=DiseaseRemedyDetailResponse)
def get_remedies_for_disease(disease_id: str, db: Session = Depends(get_db)):
    """
    Fetches treatment recommendations for a given disease ID (Module 0.4 per Implementation.md §5).
    Accepts numeric index (e.g. 1), slug key (e.g. 'early_leaf_spot'), or exact name.
    Returns remedies grouped by Organic / Biological, Chemical / Fungicide, and Preventive Cultural Practice.
    """
    disease = _find_disease(db, disease_id)
    if not disease:
        raise HTTPException(
            status_code=404,
            detail=f"Disease with ID or name '{disease_id}' not found in lookup database.",
        )

    all_remedies = [RemedySchema.model_validate(r) for r in disease.remedies]

    organic = [
        r
        for r in all_remedies
        if "organic" in r.category.lower() or "biological" in r.category.lower()
    ]
    chemical = [
        r
        for r in all_remedies
        if "chemical" in r.category.lower() or "fungicide" in r.category.lower()
    ]
    preventive = [
        r
        for r in all_remedies
        if "preventive" in r.category.lower() or "cultural" in r.category.lower()
    ]

    grouped = GroupedRemediesSchema(
        organic_biological=organic,
        chemical_fungicide=chemical,
        preventive_cultural=preventive,
    )

    return DiseaseRemedyDetailResponse(
        disease_id=disease.id,
        numeric_id=disease.numeric_id,
        disease_name=disease.disease_name,
        plant_species=disease.plant_species,
        scientific_name=disease.scientific_name,
        severity_level=disease.severity_level,
        remedies=all_remedies,
        grouped_remedies=grouped,
    )


@router.get("/remedies", response_model=list[RemedySchema])
def list_or_search_remedies(
    q: str | None = Query(
        None, description="Search term matching title or description"
    ),
    category: str | None = Query(
        None,
        description="Category filter: Organic / Biological, Chemical / Fungicide, Preventive Cultural Practice",
    ),
    db: Session = Depends(get_db),
):
    """Lists all remedies or searches by query keyword and category."""
    query = db.query(Remedy)
    if q:
        query = query.filter(
            or_(Remedy.title.ilike(f"%{q}%"), Remedy.description.ilike(f"%{q}%"))
        )
    if category:
        query = query.filter(Remedy.category.ilike(f"%{category}%"))

    return query.all()


@router.get("/diseases", response_model=list[DiseaseSchema])
def list_diseases(db: Session = Depends(get_db)):
    """Lists all cataloged plant diseases with remedies."""
    return db.query(Disease).order_by(Disease.numeric_id.asc().nulls_last()).all()


@router.get("/diseases/{disease_id}", response_model=DiseaseSchema)
def get_disease(disease_id: str, db: Session = Depends(get_db)):
    """Fetches full disease record and remedy list by ID or name."""
    disease = _find_disease(db, disease_id)
    if not disease:
        raise HTTPException(
            status_code=404,
            detail=f"Disease with ID or name '{disease_id}' not found in lookup database.",
        )
    return disease

"""Shared disease-catalogue lookup.

Both the remedy router and the history router need to resolve a caller-supplied disease
reference (numeric index, slug key, or human-readable name) to a D2 row. Keeping one
implementation means the two routes cannot drift into accepting different sets of references —
which is exactly how history rows ended up keyed differently from the remedy join.
"""

from sqlalchemy.orm import Session

from app.models import Disease


def resolve_disease(db: Session, disease_ref: str | int | None) -> Disease | None:
    """
    Resolves a disease reference to its catalogue row, or None when nothing matches.

    Resolution order: numeric index (`1`), slug key (`early_leaf_spot`, case-insensitive),
    then a contains-match on the display name so a client echoing back
    "Groundnut Rust" resolves as surely as `rust`.
    """
    key = str(disease_ref or "").strip()
    if not key:
        return None

    if key.isdigit():
        disease = db.query(Disease).filter(Disease.numeric_id == int(key)).first()
        if disease:
            return disease

    disease = db.query(Disease).filter(Disease.id.ilike(key)).first()
    if disease:
        return disease

    return db.query(Disease).filter(Disease.disease_name.ilike(f"%{key}%")).first()

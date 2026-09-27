import datetime
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.main import app
from app.models import Disease, DiseaseHistoryLog, User
from app.security import create_access_token, hash_password
from seed import seed_database

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_module_db():
    Base.metadata.create_all(bind=engine)
    seed_database()


@pytest.fixture
def auth_user():
    db: Session = SessionLocal()
    user = db.query(User).filter(User.email_address == "history_tester@example.com").first()
    if not user:
        user = User(
            user_name="History User",
            email_address="history_tester@example.com",
            phone_number="+17778889999",
            password_hash=hash_password("StrongPass123!"),
            account_status="ACTIVE",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    user_id = user.id
    db.close()
    return {"Authorization": f"Bearer {token}"}, user_id


def test_explicit_diagnosis_logging_success(auth_user):
    headers, user_id = auth_user
    payload = {
        "disease_id": "early_leaf_spot",
        "confidence_score": 0.94,
        "s3_storage_uri": "s3://plant-aid-media-bucket/frames/1/2026/09/03/explicit-frame.jpg",
        "bounding_box": {"x_min": 0.1, "y_min": 0.2, "x_max": 0.8, "y_max": 0.9},
    }

    res = client.post("/api/history", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert "log_id" in data
    assert data["status"] == "confirmed"
    assert "timestamp" in data


def test_explicit_diagnosis_logging_unauthorized():
    payload = {
        "disease_id": "early_leaf_spot",
        "confidence_score": 0.85,
        "s3_storage_uri": "s3://plant-aid-media-bucket/frames/1/test.jpg",
    }
    res = client.post("/api/history", json=payload)
    assert res.status_code == 401


def test_explicit_diagnosis_logging_invalid_confidence(auth_user):
    headers, _ = auth_user
    payload = {
        "disease_id": "early_leaf_spot",
        "confidence_score": 1.5,  # Invalid: > 1.0
        "s3_storage_uri": "s3://plant-aid-media-bucket/test.jpg",
    }
    res = client.post("/api/history", json=payload, headers=headers)
    assert res.status_code == 422


def test_paginated_history_dashboard(auth_user):
    headers, user_id = auth_user

    # Add 4 additional log items for testing pagination
    for i in range(4):
        client.post(
            "/api/history",
            json={
                "disease_id": "late_leaf_spot" if i % 2 == 0 else "rust",
                "confidence_score": 0.80 + (i * 0.03),
                "s3_storage_uri": f"s3://plant-aid-media-bucket/frames/user/frame_{i}.jpg",
            },
            headers=headers,
        )

    # Page 1, limit 2
    res_p1 = client.get("/api/history?page=1&limit=2", headers=headers)
    assert res_p1.status_code == 200
    p1 = res_p1.json()
    assert p1["page"] == 1
    assert p1["limit"] == 2
    assert len(p1["items"]) == 2
    assert p1["total"] >= 5
    assert p1["total_pages"] >= 3

    # Check presigned URL enrichment
    first_item = p1["items"][0]
    assert "media_url" in first_item
    assert first_item["media_url"] is not None

    # Page 2, limit 2
    res_p2 = client.get("/api/history?page=2&limit=2", headers=headers)
    assert res_p2.status_code == 200
    p2 = res_p2.json()
    assert p2["page"] == 2
    assert len(p2["items"]) == 2
    assert p2["items"][0]["id"] != p1["items"][0]["id"]


def test_history_filtering_by_disease(auth_user):
    headers, _ = auth_user
    res = client.get("/api/history?disease_id=rust", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert all(item["disease_id"] == "rust" for item in data["items"])


def test_history_filtering_by_date(auth_user):
    headers, _ = auth_user
    future_date = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1)).isoformat()
    res = client.get(f"/api/history?date_from={future_date}", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) == 0


def test_get_single_history_item(auth_user):
    headers, _ = auth_user
    # Log an item
    create_res = client.post(
        "/api/history",
        json={
            "disease_id": "healthy_leaf",
            "confidence_score": 0.99,
            "s3_storage_uri": "s3://plant-aid-media-bucket/frames/single-test.jpg",
        },
        headers=headers,
    )
    log_id = create_res.json()["log_id"]

    get_res = client.get(f"/api/history/{log_id}", headers=headers)
    assert get_res.status_code == 200
    item = get_res.json()
    assert item["id"] == log_id
    assert item["disease_id"] == "healthy_leaf"
    assert item["media_url"] is not None

    # Test 404 for nonexistent
    assert client.get("/api/history/999999", headers=headers).status_code == 404


def test_delete_history_item(auth_user):
    headers, _ = auth_user
    # Log an item
    create_res = client.post(
        "/api/history",
        json={
            "disease_id": "nutrition_deficiency",
            "confidence_score": 0.88,
            "s3_storage_uri": "s3://plant-aid-media-bucket/frames/del-test.jpg",
        },
        headers=headers,
    )
    log_id = create_res.json()["log_id"]

    del_res = client.delete(f"/api/history/{log_id}", headers=headers)
    assert del_res.status_code == 204

    # Second delete returns 404
    assert client.delete(f"/api/history/{log_id}", headers=headers).status_code == 404

    # A soft-deleted record is hidden from the dashboard, its direct lookup, and the total count
    assert client.get(f"/api/history/{log_id}", headers=headers).status_code == 404
    listed = client.get("/api/history?limit=100", headers=headers).json()
    assert all(entry["id"] != log_id for entry in listed["items"])
    assert all(entry["id"] != log_id for entry in client.get("/api/history?page=2&limit=100", headers=headers).json()["items"])


def test_delete_is_soft_and_preserves_audit_row(auth_user):
    """Ticket 03 / NF.5: the row survives deletion in the database with a deletion marker."""
    headers, _ = auth_user
    create_res = client.post(
        "/api/history",
        json={
            "disease_id": "rust",
            "confidence_score": 0.93,
            "s3_storage_uri": "s3://plant-aid-media-bucket/frames/audit-test.jpg",
        },
        headers=headers,
    )
    log_id = create_res.json()["log_id"]

    total_before = client.get("/api/history?limit=1", headers=headers).json()["total"]

    assert client.delete(f"/api/history/{log_id}", headers=headers).status_code == 204

    # Gone from the user's view...
    assert client.get(f"/api/history/{log_id}", headers=headers).status_code == 404
    total_after = client.get("/api/history?limit=1", headers=headers).json()["total"]
    assert total_after == total_before - 1

    # ...but retained in the database for the audit trail.
    db: Session = SessionLocal()
    try:
        row = (
            db.query(DiseaseHistoryLog)
            .filter(DiseaseHistoryLog.id == log_id)
            .first()
        )
        assert row is not None
        assert row.deleted_at is not None
    finally:
        db.close()


def test_history_aliased_path(auth_user):
    headers, _ = auth_user
    # Verify /history alias works the same as /api/history
    res = client.get("/history?page=1&limit=5", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data


def test_history_log_normalizes_disease_reference(auth_user):
    """Ticket 01: slug, numeric index, and disease name all normalize to the canonical slug."""
    headers, _ = auth_user

    cases = [
        ("rust", "rust"),
        ("4", "late_leaf_spot"),
        ("Groundnut Rust", "rust"),
        ("early_leaf_spot", "early_leaf_spot"),
    ]
    for raw, expected in cases:
        res = client.post(
            "/api/history",
            json={
                "disease_id": raw,
                "confidence_score": 0.9,
                "s3_storage_uri": "s3://plant-aid-media-bucket/frames/normalize.jpg",
            },
            headers=headers,
        )
        assert res.status_code == 201, raw
        log_id = res.json()["log_id"]

        item = client.get(f"/api/history/{log_id}", headers=headers).json()
        assert item["disease_id"] == expected, raw

        # The dashboard filter agrees with the stored canonical key
        filtered = client.get(
            f"/api/history?disease_id={expected}", headers=headers
        ).json()
        assert any(entry["id"] == log_id for entry in filtered["items"]), raw


def test_history_log_rejects_unknown_disease_reference(auth_user):
    """Ticket 01: an uncatalogued disease reference is refused rather than stored as free text."""
    headers, _ = auth_user
    res = client.post(
        "/api/history",
        json={
            "disease_id": "not_a_real_disease",
            "confidence_score": 0.9,
            "s3_storage_uri": "s3://plant-aid-media-bucket/frames/unknown.jpg",
        },
        headers=headers,
    )
    assert res.status_code == 422
    assert "not_a_real_disease" in res.json()["detail"]

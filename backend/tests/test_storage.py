import os
import re
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.main import app
from app.models import DiseaseHistoryLog, User
from app.security import create_access_token, hash_password
from app.services.storage import StorageService, storage_service

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def auth_header():
    db: Session = SessionLocal()
    user = db.query(User).filter(User.email_address == "storage_test@example.com").first()
    if not user:
        user = User(
            user_name="Storage Tester",
            email_address="storage_test@example.com",
            phone_number="+19998887777",
            password_hash=hash_password("Password123!"),
            account_status="ACTIVE",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    user_id = user.id
    db.close()
    return {"Authorization": f"Bearer {token}"}, user_id


def test_hierarchical_key_and_upload():
    """Task 4.1: Test hierarchical key pattern: frames/{user_id}/{yyyy}/{mm}/{dd}/{frame_id}.jpg"""
    dummy_bytes = b"fake-jpeg-binary-content-4.1"
    user_id = 42
    frame_id = "test-frame-12345"

    uri = storage_service.upload_image(
        image_bytes=dummy_bytes,
        mime_type="image/jpeg",
        user_id=user_id,
        frame_id=frame_id,
    )

    # Check that the returned URI contains frames/{user_id}/...
    assert f"frames/{user_id}/" in uri
    assert f"{frame_id}.jpg" in uri

    # Verify that the file was written to disk at the matching hierarchy
    rel_path = uri[len("/uploads/"):].replace("/", os.sep)
    abs_path = os.path.join(settings.UPLOAD_DIR, rel_path)
    assert os.path.exists(abs_path)
    with open(abs_path, "rb") as f:
        assert f.read() == dummy_bytes

    # Cleanup
    storage_service.delete_object(uri)
    assert not os.path.exists(abs_path)


def test_generate_presigned_url():
    """Task 4.1: Test presigned URL generation for both S3 URIs and local storage fallbacks."""
    # 1. Local fallback URI should return direct URL
    local_uri = "/uploads/frames/1/2026/09/03/frame1.jpg"
    presigned_local = storage_service.generate_presigned_url(local_uri)
    assert presigned_local == local_uri

    # 2. S3 URI should generate a presigned URL with expiration
    s3_uri = "s3://plant-aid-media-bucket/frames/1/2026/09/03/frame1.jpg"
    presigned_s3 = storage_service.generate_presigned_url(s3_uri, expiration_seconds=900)
    assert "plant-aid-media-bucket" in presigned_s3
    assert "frames/1/2026/09/03/frame1.jpg" in presigned_s3
    assert "Expires=" in presigned_s3 or "X-Amz-Expires=" in presigned_s3


def test_storage_compensation_delete_object():
    """Task 4.2: Test delete_object cleans up uploaded files on rollback."""
    dummy_bytes = b"compensate-me-file"
    uri = storage_service.upload_image(
        image_bytes=dummy_bytes,
        mime_type="image/png",
        user_id=99,
        frame_id="compensate-test-99",
    )

    rel_path = uri[len("/uploads/"):].replace("/", os.sep)
    abs_path = os.path.join(settings.UPLOAD_DIR, rel_path)
    assert os.path.exists(abs_path)

    # Call compensation deletion
    deleted = storage_service.delete_object(uri)
    assert deleted is True
    assert not os.path.exists(abs_path)

    # Calling delete on already deleted file should return False gracefully
    assert storage_service.delete_object(uri) is False


def test_inference_compensation_rollback_on_db_error(auth_header):
    """Task 4.2: Simulate DB commit failure during inference to verify S3 compensation rollback."""
    headers, user_id = auth_header

    # Patch Session.commit to raise an exception simulating a database crash/constraint error
    with patch.object(Session, "commit", side_effect=RuntimeError("Simulated DB Crash")):
        with patch.object(storage_service, "delete_object", wraps=storage_service.delete_object) as mock_delete:
            response = client.post(
                "/api/inference/predict",
                files={"file": ("test_leaf.jpg", b"fake-jpg-content", "image/jpeg")},
                headers=headers,
            )
            # Should fail with 500 error and detail indicating media compensation
            assert response.status_code == 500
            assert "rolled back" in response.json()["detail"].lower()
            # Verify that delete_object was triggered to avoid orphaned media
            assert mock_delete.called


def test_history_delete_cleans_up_media(auth_header):
    """Task 4.2: Deleting a history entry from /api/history/{id} deletes the media from storage."""
    headers, user_id = auth_header
    db: Session = SessionLocal()

    # Upload test image
    uri = storage_service.upload_image(
        image_bytes=b"history-media-cleanup",
        mime_type="image/jpeg",
        user_id=user_id,
        frame_id="history-del-test",
    )
    rel_path = uri[len("/uploads/"):].replace("/", os.sep)
    abs_path = os.path.join(settings.UPLOAD_DIR, rel_path)
    assert os.path.exists(abs_path)

    # Insert history log
    log = DiseaseHistoryLog(
        user_id=user_id,
        disease_id="early_leaf_spot",
        disease_name="Groundnut Early Leaf Spot",
        confidence_score=0.92,
        s3_storage_uri=uri,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    log_id = log.id
    db.close()

    # Delete via API
    del_res = client.delete(f"/api/history/{log_id}", headers=headers)
    assert del_res.status_code == 204

    # File on storage should be deleted
    assert not os.path.exists(abs_path)

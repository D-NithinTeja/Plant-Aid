import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import base64
import io
from PIL import Image
import numpy as np
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import torch

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.limiter import limiter
from app.main import app
from app.models import DiseaseHistoryLog, User
from app.security import create_access_token, hash_password
from app.services.ml_engine import MLEngine, ml_engine
from seed import seed_database

client = TestClient(app)


def _create_synthetic_leaf_b64(color=(34, 139, 34)) -> str:
    """Creates a base64 encoded synthetic RGB image with a centered leaf-green rectangle."""
    arr = np.zeros((200, 200, 3), dtype=np.uint8)
    # Fill center with green color
    arr[40:160, 40:160] = color
    pil_img = Image.fromarray(arr)
    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


@pytest.fixture(scope="module", autouse=True)
def setup_module():
    Base.metadata.create_all(bind=engine)
    seed_database()


@pytest.fixture
def auth_user():
    db: Session = SessionLocal()
    user = db.query(User).filter(User.email_address == "inference_tester@example.com").first()
    if not user:
        user = User(
            user_name="Inference Tester",
            email_address="inference_tester@example.com",
            phone_number="+15551112222",
            password_hash=hash_password("Pass12345!"),
            account_status="ACTIVE",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    user_id = user.id
    db.close()
    return {"Authorization": f"Bearer {token}"}, user_id


def test_ml_engine_cpu_device_and_fallback():
    """Task 5.1: Verify engine loads cleanly and runs safely in Fallback mode if weights absent."""
    assert str(ml_engine.device) in ("cpu", "cuda")
    assert len(ml_engine.classes) == 6
    assert "early_leaf_spot" in ml_engine.classes
    assert "healthy_leaf" in ml_engine.classes
    assert ml_engine.is_fallback is True or ml_engine.model is not None


def test_ml_engine_device_auto_fallback_without_crash(monkeypatch):
    """Task 5.1: Verify engine gracefully falls back to CPU if CUDA is requested on non-CUDA hardware."""
    monkeypatch.setattr(settings, "ML_DEVICE", "cuda")
    engine_inst = MLEngine()
    expected_device = "cuda" if torch.cuda.is_available() else "cpu"
    assert str(engine_inst.device) == expected_device


def test_layer1_leaf_roi_extraction():
    """Task 5.2: Layer 1 HSV green-mask leaf segmentation extracts tight bounding box."""
    arr = np.zeros((100, 100, 3), dtype=np.uint8)
    arr[20:80, 20:80] = [34, 139, 34]  # Forest Green

    roi = ml_engine.extract_leaf_roi(arr)
    assert roi["detected"] is True
    assert 0.15 <= roi["x_min"] <= 0.25
    assert 0.15 <= roi["y_min"] <= 0.25
    assert 0.75 <= roi["x_max"] <= 0.85
    assert 0.75 <= roi["y_max"] <= 0.85


def test_layer1_leaf_roi_non_leaf_fallback():
    """Task 5.2: Non-green image safely defaults to centered ROI."""
    arr = np.zeros((100, 100, 3), dtype=np.uint8)
    arr[:] = [200, 0, 0]  # Solid red background

    roi = ml_engine.extract_leaf_roi(arr)
    assert roi["detected"] is False
    assert roi["x_min"] == 0.1
    assert roi["y_min"] == 0.1


def test_layer2_gradcam_heatmap_and_leaf_roi_intersection():
    """Task 5.3: Layer 2 Grad-CAM attention heatmap is bounded and intersected with Leaf ROI mask."""
    # Synthetic frame with green leaf canvas and centered spot
    arr = np.zeros((100, 100, 3), dtype=np.uint8)
    arr[20:80, 20:80] = [34, 139, 34]
    arr[40:55, 40:55] = [139, 69, 19]  # Brown necrotic spot (lesion)

    roi = ml_engine.extract_leaf_roi(arr)
    assert roi["detected"] is True

    heatmap, cam_b64 = ml_engine.compute_gradcam_heatmap(
        image_np=arr,
        winning_class_idx=0,
        leaf_mask=roi["mask"],
        is_healthy=False,
    )

    # Values must be normalized in [0, 1]
    assert heatmap.shape == (100, 100)
    assert float(heatmap.min()) >= 0.0
    assert float(heatmap.max()) <= 1.0

    # Outside leaf mask must be zeroed out (intersection property)
    outside_mask = roi["mask"] == 0
    assert np.all(heatmap[outside_mask] == 0.0)

    # Optional base64 CAM heatmap mask must be valid JPEG data
    assert cam_b64 is not None
    decoded_cam = base64.b64decode(cam_b64)
    pil_cam = Image.open(io.BytesIO(decoded_cam))
    assert pil_cam.size == (100, 100)

    # Bounding box must be bounded within leaf ROI
    bbox = ml_engine.compute_two_layer_bbox(
        image_np=arr,
        leaf_roi=roi,
        is_healthy=False,
        heatmap=heatmap,
    )
    assert roi["x_min"] <= bbox["x_min"] < bbox["x_max"] <= roi["x_max"]
    assert roi["y_min"] <= bbox["y_min"] < bbox["y_max"] <= roi["y_max"]


def test_confidence_calibration_uncertainty_flag():
    """Task 5.4: Verify tau = 0.55 calibration sets is_healthy_or_uncertain appropriately."""
    b64_img = _create_synthetic_leaf_b64()
    image_bytes = base64.b64decode(b64_img)
    pred = ml_engine.predict(image_bytes)

    assert "is_healthy_or_uncertain" in pred
    assert isinstance(pred["is_healthy_or_uncertain"], bool)
    if pred["class_key"] == "healthy_leaf" or pred["confidence"] < 0.55:
        assert pred["is_healthy_or_uncertain"] is True
    else:
        assert pred["is_healthy_or_uncertain"] is False


def test_streaming_frame_endpoint_contract():
    """Task 5.5: POST /api/inference/frame matches exact contract without writing to history DB."""
    db: Session = SessionLocal()
    count_before = db.query(DiseaseHistoryLog).count()
    db.close()

    payload = {
        "mime_type": "image/jpeg",
        "encoding": "base64",
        "image_b64": _create_synthetic_leaf_b64(),
        "capture_timestamp": "2026-09-07T12:00:00Z",
    }

    res = client.post("/api/inference/frame", json=payload)
    assert res.status_code == 200
    data = res.json()

    # Exact contract check
    assert "disease_id" in data
    assert "disease_name" in data
    assert "confidence" in data
    assert "bounding_box" in data
    assert "frame_id" in data
    assert "is_healthy_or_uncertain" in data
    assert "cam_heatmap_b64" in data
    assert len(data["remedies"]) > 0

    bbox = data["bounding_box"]
    assert 0.0 <= bbox["x_min"] <= bbox["x_max"] <= 1.0
    assert 0.0 <= bbox["y_min"] <= bbox["y_max"] <= 1.0

    # Verify ephemeral stream did NOT write to persistent history table
    db = SessionLocal()
    count_after = db.query(DiseaseHistoryLog).count()
    db.close()
    assert count_after == count_before


def test_multipart_predict_endpoint(auth_user):
    """Task 5.5: POST /api/inference/predict file upload with S3 compensation and DB record."""
    headers, _ = auth_user
    img_b64 = _create_synthetic_leaf_b64()
    image_bytes = base64.b64decode(img_b64)

    res = client.post(
        "/api/inference/predict",
        files={"file": ("leaf.jpg", image_bytes, "image/jpeg")},
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["s3_storage_uri"] is not None
    assert "disease_name" in data
    assert data["confidence"] > 0.0


def test_inference_aliased_routes():
    """Verify both /api/inference/frame and /inference/frame are accessible."""
    payload = {
        "mime_type": "image/jpeg",
        "encoding": "base64",
        "image_b64": _create_synthetic_leaf_b64(),
    }
    res = client.post("/inference/frame", json=payload)
    assert res.status_code == 200
    assert "disease_id" in res.json()


def test_rate_limiting_auth_endpoint():
    """Task 5.6: Verify rate limiting returns HTTP 429 Too Many Requests upon exceeding threshold."""
    # settings.RATE_LIMIT_LOGIN is 10/minute
    # Make rapid requests with invalid credentials until rate limit is triggered
    status_codes = []
    for _ in range(15):
        res = client.post(
            "/api/auth/login",
            json={"email_address": "ratelimit_tester@example.com", "password": "WrongPassword!"},
        )
        status_codes.append(res.status_code)
        if res.status_code == 429:
            break

    assert 429 in status_codes

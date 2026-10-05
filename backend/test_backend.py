import base64
import io
import os
import sys
import unittest

from fastapi.testclient import TestClient

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from app.database import Base, engine
from app.main import app


class BackendTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        settings.APP_DEBUG = True
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    def test_01_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "healthy"})

    def test_02_auth_and_2fa_flow(self):
        # 1. Register User
        test_email = "testfarmer@example.com"
        reg_payload = {
            "user_name": "Test Farmer",
            "email_address": test_email,
            "phone_number": "+1234567890",
            "password": "SecurePassword123!",
        }
        res_reg = self.client.post("/api/auth/register", json=reg_payload)
        if res_reg.status_code in (400, 409):
            pass  # User already exists from previous test run
        else:
            self.assertEqual(res_reg.status_code, 201)

        # 2. Login -> Triggers 2FA
        login_payload = {"email_address": test_email, "password": "SecurePassword123!"}
        res_login = self.client.post("/api/auth/login", json=login_payload)
        self.assertEqual(res_login.status_code, 200)
        login_data = res_login.json()
        self.assertIn("session_id", login_data)
        self.assertNotIn("user_id", login_data)
        self.assertIn("otp_code_dev", login_data)

        session_id = login_data["session_id"]
        otp_code = login_data["otp_code_dev"]

        # 3. Verify 2FA -> Returns JWT (challenge session only, no user id exposure)
        verify_payload = {"session_id": session_id, "otp_code": otp_code}
        res_verify = self.client.post("/api/auth/verify-2fa", json=verify_payload)
        self.assertEqual(res_verify.status_code, 200)
        token_data = res_verify.json()
        self.assertIn("access_token", token_data)

        # Save token for subsequent tests
        BackendTestSuite.access_token = token_data["access_token"]
        BackendTestSuite.headers = {
            "Authorization": f"Bearer {BackendTestSuite.access_token}"
        }

        # 4. Get Current User Profile
        res_me = self.client.get("/api/auth/me", headers=BackendTestSuite.headers)
        self.assertEqual(res_me.status_code, 200)
        self.assertEqual(res_me.json()["email_address"], test_email)

    def test_03_remedy_lookup(self):
        # 1. List all diseases (Bearer JWT required per §5.2)
        res = self.client.get("/api/diseases", headers=BackendTestSuite.headers)
        self.assertEqual(res.status_code, 200)
        diseases = res.json()
        self.assertGreater(len(diseases), 0)

        # 2. Get a specific disease from the catalogue
        first_id = diseases[0]["id"]
        res_single = self.client.get(
            f"/api/diseases/{first_id}", headers=BackendTestSuite.headers
        )
        self.assertEqual(res_single.status_code, 200)
        data = res_single.json()
        self.assertEqual(data["id"], first_id)
        self.assertGreater(len(data["remedies"]), 0)

    def test_04_inference_and_media_upload(self):
        # Create dummy JPEG image bytes
        dummy_image = io.BytesIO(
            b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00"
        )

        # Test multipart file upload prediction
        res = self.client.post(
            "/api/inference/predict",
            files={"file": ("leaf_test.jpg", dummy_image, "image/jpeg")},
            headers=getattr(BackendTestSuite, "headers", {}),
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("disease_id", data)
        self.assertIn("confidence_score", data)
        self.assertIn("bounding_box", data)
        self.assertIn("s3_storage_uri", data)
        self.assertIn("remedies", data)

        # Explicitly persist diagnosis to history (Implementation.md §6.2)
        history_payload = {
            "disease_id": str(data["disease_id"]),
            "disease_name": data["disease_name"],
            "confidence_score": data["confidence_score"],
            "s3_storage_uri": data["s3_storage_uri"],
            "bounding_box": data["bounding_box"],
        }
        res_history = self.client.post(
            "/api/history",
            json=history_payload,
            headers=getattr(BackendTestSuite, "headers", {}),
        )
        self.assertEqual(res_history.status_code, 201)

    def test_05_disease_history(self):
        # Fetch history logs for logged-in user
        headers = getattr(BackendTestSuite, "headers", {})
        res = self.client.get("/api/history", headers=headers)
        self.assertEqual(res.status_code, 200)
        history_data = res.json()
        items = history_data["items"] if isinstance(history_data, dict) and "items" in history_data else history_data
        self.assertGreater(len(items), 0)
        log_item = items[0]
        self.assertIn("s3_storage_uri", log_item)
        self.assertIn("confidence_score", log_item)


if __name__ == "__main__":
    unittest.main()

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models import User

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup test users after tests
    db = SessionLocal()
    db.query(User).filter(User.email_address.like("%@testauth.com")).delete()
    db.commit()
    db.close()

def test_user_registration_success():
    payload = {
        "user_name": "Auth Tester",
        "email_address": "user1@testauth.com",
        "phone_number": "+15550001111",
        "password": "StrongPassword123!"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email_address"] == "user1@testauth.com"
    assert data["phone_number"] == "+15550001111"
    assert data["is_2fa_enabled"] is True
    assert "password_hash" not in data

def test_user_registration_duplicate_409():
    payload = {
        "user_name": "Auth Tester 2",
        "email_address": "duplicate@testauth.com",
        "phone_number": "+15550002222",
        "password": "StrongPassword123!"
    }
    res1 = client.post("/auth/register", json=payload)
    assert res1.status_code == 201

    # Duplicate email
    res2 = client.post("/auth/register", json={
        "user_name": "Another Name",
        "email_address": "duplicate@testauth.com",
        "phone_number": "+15550009999",
        "password": "OtherPassword123!"
    })
    assert res2.status_code == 409

    # Duplicate phone
    res3 = client.post("/auth/register", json={
        "user_name": "Third Name",
        "email_address": "unique@testauth.com",
        "phone_number": "+15550002222",
        "password": "OtherPassword123!"
    })
    assert res3.status_code == 409

def test_login_invalid_credentials():
    response = client.post("/auth/login", json={
        "login_id": "nonexistent@testauth.com",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401

def test_login_and_2fa_verification_flow():
    # 1. Register
    reg_payload = {
        "user_name": "Flow Tester",
        "email_address": "flow@testauth.com",
        "phone_number": "+15550003333",
        "password": "FlowPassword123!"
    }
    client.post("/auth/register", json=reg_payload)

    # 2. Login via email
    login_res = client.post("/auth/login", json={
        "login_id": "flow@testauth.com",
        "password": "FlowPassword123!"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "session_id" in login_data
    assert login_data["expires_in"] == 300
    otp_code = login_data["otp_code_dev"]
    session_id = login_data["session_id"]

    # 3. Bad OTP attempt
    bad_verify = client.post("/auth/verify-2fa", json={
        "session_id": session_id,
        "otp_code": "000000"
    })
    assert bad_verify.status_code == 401
    assert "remaining" in bad_verify.json()["detail"]

    # 4. Valid OTP attempt
    valid_verify = client.post("/auth/verify-2fa", json={
        "session_id": session_id,
        "otp_code": otp_code
    })
    assert valid_verify.status_code == 200
    token_data = valid_verify.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 5. Access profile with Bearer JWT
    me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email_address"] == "flow@testauth.com"

def test_2fa_brute_force_lockout():
    # Register and login
    client.post("/auth/register", json={
        "user_name": "Lockout Tester",
        "email_address": "lockout@testauth.com",
        "phone_number": "+15550004444",
        "password": "LockPassword123!"
    })
    login_res = client.post("/auth/login", json={
        "login_id": "lockout@testauth.com",
        "password": "LockPassword123!"
    })
    session_id = login_res.json()["session_id"]

    # Fail 5 times
    for _ in range(5):
        client.post("/auth/verify-2fa", json={
            "session_id": session_id,
            "otp_code": "111111"
        })

    # 6th attempt should be blocked with lockout
    locked = client.post("/auth/verify-2fa", json={
        "session_id": session_id,
        "otp_code": "111111"
    })
    assert locked.status_code == 401
    assert "Too many failed" in locked.json()["detail"] or "Invalid or expired" in locked.json()["detail"]

def test_api_prefix_aliasing():
    # Verify /api/auth routes are also accessible
    res = client.post("/api/auth/register", json={
        "user_name": "Alias Tester",
        "email_address": "alias@testauth.com",
        "password": "AliasPassword123!"
    })
    assert res.status_code == 201

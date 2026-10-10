import pytest
from app.config import settings
from app.database import Base, SessionLocal, engine
from app.main import app
from app.models import User
from fastapi.testclient import TestClient

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
        "password": "StrongPassword123!",
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
        "password": "StrongPassword123!",
    }
    res1 = client.post("/auth/register", json=payload)
    assert res1.status_code == 201

    # Duplicate email
    res2 = client.post(
        "/auth/register",
        json={
            "user_name": "Another Name",
            "email_address": "duplicate@testauth.com",
            "phone_number": "+15550009999",
            "password": "OtherPassword123!",
        },
    )
    assert res2.status_code == 409

    # Duplicate phone
    res3 = client.post(
        "/auth/register",
        json={
            "user_name": "Third Name",
            "email_address": "unique@testauth.com",
            "phone_number": "+15550002222",
            "password": "OtherPassword123!",
        },
    )
    assert res3.status_code == 409


def test_login_invalid_credentials():
    response = client.post(
        "/auth/login",
        json={"login_id": "nonexistent@testauth.com", "password": "WrongPassword!"},
    )
    assert response.status_code == 401


def test_login_and_2fa_verification_flow():
    # 1. Register
    reg_payload = {
        "user_name": "Flow Tester",
        "email_address": "flow@testauth.com",
        "phone_number": "+15550003333",
        "password": "FlowPassword123!",
    }
    client.post("/auth/register", json=reg_payload)

    # 2. Login via email
    login_res = client.post(
        "/auth/login",
        json={"login_id": "flow@testauth.com", "password": "FlowPassword123!"},
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "session_id" in login_data
    assert login_data["expires_in"] == 300
    otp_code = login_data["otp_code_dev"]
    session_id = login_data["session_id"]

    # 3. Bad OTP attempt
    bad_verify = client.post(
        "/auth/verify-2fa", json={"session_id": session_id, "otp_code": "000000"}
    )
    assert bad_verify.status_code == 401
    assert "remaining" in bad_verify.json()["detail"]

    # 4. Valid OTP attempt
    valid_verify = client.post(
        "/auth/verify-2fa", json={"session_id": session_id, "otp_code": otp_code}
    )
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
    client.post(
        "/auth/register",
        json={
            "user_name": "Lockout Tester",
            "email_address": "lockout@testauth.com",
            "phone_number": "+15550004444",
            "password": "LockPassword123!",
        },
    )
    login_res = client.post(
        "/auth/login",
        json={"login_id": "lockout@testauth.com", "password": "LockPassword123!"},
    )
    session_id = login_res.json()["session_id"]

    # Fail 5 times
    for _ in range(5):
        client.post(
            "/auth/verify-2fa", json={"session_id": session_id, "otp_code": "111111"}
        )

    # 6th attempt should be blocked with the lockout-specific outcome, not a generic failure
    locked = client.post(
        "/auth/verify-2fa", json={"session_id": session_id, "otp_code": "111111"}
    )
    assert locked.status_code == 401
    assert "Too many failed verification attempts" in locked.json()["detail"]


def test_login_response_hides_internal_user_id():
    """Task 2.4 + Ticket 07: the 2FA challenge exposes a session id, never the numeric user id."""
    client.post(
        "/auth/register",
        json={
            "user_name": "Opaque Tester",
            "email_address": "opaque@testauth.com",
            "phone_number": "+15550005555",
            "password": "OpaquePassword123!",
        },
    )
    login_res = client.post(
        "/auth/login",
        json={"login_id": "opaque@testauth.com", "password": "OpaquePassword123!"},
    )
    assert login_res.status_code == 200
    data = login_res.json()
    assert data["session_id"]
    assert "user_id" not in data
    # The debug echo is explicitly a debug affordance, not part of the production payload
    assert ("otp_code_dev" in data) is settings.APP_DEBUG


def test_verify_2fa_rejects_unknown_session():
    """Ticket 07: verification is bound to the challenge session, so an unknown id is refused."""
    res = client.post(
        "/auth/verify-2fa",
        json={"session_id": "00000000-0000-0000-0000-000000000000", "otp_code": "123456"},
    )
    assert res.status_code == 401
    assert "Invalid or expired challenge session" in res.json()["detail"]


def test_api_prefix_aliasing():
    # Verify /api/auth routes are also accessible
    res = client.post(
        "/api/auth/register",
        json={
            "user_name": "Alias Tester",
            "email_address": "alias@testauth.com",
            "password": "AliasPassword123!",
        },
    )
    assert res.status_code == 201


def test_registration_initiates_challenge_and_activates_user():
    """Registration creates pending user and issues challenge; verify-2fa activates user."""
    payload = {
        "user_name": "Activation Tester",
        "email_address": "activate@testauth.com",
        "password": "ActivatePassword123!",
    }
    reg_res = client.post("/auth/register", json=payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert reg_data["account_status"] == "PENDING_VERIFICATION"
    assert "session_id" in reg_data
    session_id = reg_data["session_id"]
    otp_code = reg_data["otp_code_dev"]

    # Verify challenge
    verify_res = client.post(
        "/auth/verify-2fa",
        json={"session_id": session_id, "otp_code": otp_code},
    )
    assert verify_res.status_code == 200
    token = verify_res.json()["access_token"]

    # Check active status via /auth/me
    me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["account_status"] == "ACTIVE"


def test_resend_otp_flow_and_rate_limit():
    """User can resend OTP up to MAX_OTP_RESENDS (3), after which 429 is returned."""
    # Register user
    reg_res = client.post(
        "/auth/register",
        json={
            "user_name": "Resend Tester",
            "email_address": "resend@testauth.com",
            "password": "ResendPassword123!",
        },
    )
    assert reg_res.status_code == 201
    session_id = reg_res.json()["session_id"]
    initial_otp = reg_res.json()["otp_code_dev"]

    # Resend 1
    res1 = client.post("/auth/resend-otp", json={"session_id": session_id})
    assert res1.status_code == 200
    otp1 = res1.json()["otp_code_dev"]

    # Resend 2
    res2 = client.post("/auth/resend-otp", json={"session_id": session_id})
    assert res2.status_code == 200
    otp2 = res2.json()["otp_code_dev"]

    # Resend 3
    res3 = client.post("/auth/resend-otp", json={"session_id": session_id})
    assert res3.status_code == 200
    otp3 = res3.json()["otp_code_dev"]

    # Resend 4: Exceeds limit -> 429
    res4 = client.post("/auth/resend-otp", json={"session_id": session_id})
    assert res4.status_code == 429
    assert "Maximum OTP resend limit reached" in res4.json()["detail"]

    # The latest OTP (otp3) should still successfully verify
    verify_res = client.post(
        "/auth/verify-2fa",
        json={"session_id": session_id, "otp_code": otp3},
    )
    assert verify_res.status_code == 200
    assert "access_token" in verify_res.json()


def test_resend_otp_invalid_session():
    """Resend with unknown session_id returns 401."""
    res = client.post(
        "/auth/resend-otp",
        json={"session_id": "nonexistent-session-uuid"},
    )
    assert res.status_code == 401
    assert "Invalid or expired challenge session" in res.json()["detail"]


def test_last_login_at_tracks_successful_login_and_subsequent_update():
    """Verifies last_login_at is initially null, sets on 2FA verify, and updates on next login."""
    import time

    email = f"track_login_{time.time()}@testauth.com"
    password = "SecurePassword123!"

    # 1. Register user
    reg_res = client.post(
        "/auth/register",
        json={"user_name": "Login Tracker", "email_address": email, "password": password},
    )
    assert reg_res.status_code == 201
    user_data = reg_res.json()
    assert user_data.get("last_login_at") is None

    # 2. Login step 1: /auth/login initiates challenge but does not set last_login_at
    login_res = client.post(
        "/auth/login",
        json={"login_id": email, "password": password},
    )
    assert login_res.status_code == 200
    session_id_1 = login_res.json()["session_id"]
    otp_1 = login_res.json()["otp_code_dev"]

    # Check via direct DB query that last_login_at is still None
    with SessionLocal() as db:
        user_db = db.query(User).filter(User.email_address == email).first()
        assert user_db is not None
        assert user_db.last_login_at is None

    # 3. Successful 2FA verification: sets last_login_at
    verify_res_1 = client.post(
        "/auth/verify-2fa",
        json={"session_id": session_id_1, "otp_code": otp_1},
    )
    assert verify_res_1.status_code == 200
    token_1 = verify_res_1.json()["access_token"]

    # Check /auth/me returns non-null last_login_at
    me_res_1 = client.get("/auth/me", headers={"Authorization": f"Bearer {token_1}"})
    assert me_res_1.status_code == 200
    first_login_time = me_res_1.json()["last_login_at"]
    assert first_login_time is not None

    time.sleep(0.05)

    # 4. Subsequent login
    login_res_2 = client.post(
        "/auth/login",
        json={"login_id": email, "password": password},
    )
    assert login_res_2.status_code == 200
    session_id_2 = login_res_2.json()["session_id"]
    otp_2 = login_res_2.json()["otp_code_dev"]

    verify_res_2 = client.post(
        "/auth/verify-2fa",
        json={"session_id": session_id_2, "otp_code": otp_2},
    )
    assert verify_res_2.status_code == 200
    token_2 = verify_res_2.json()["access_token"]

    me_res_2 = client.get("/auth/me", headers={"Authorization": f"Bearer {token_2}"})
    assert me_res_2.status_code == 200
    second_login_time = me_res_2.json()["last_login_at"]
    assert second_login_time is not None
    assert second_login_time > first_login_time


def test_failed_attempts_do_not_update_last_login_at():
    """Failed passwords and failed OTP challenges do not alter last_login_at."""
    import time

    email = f"failed_attempts_{time.time()}@testauth.com"
    password = "CorrectPassword123!"

    # Register
    reg_res = client.post(
        "/auth/register",
        json={"user_name": "Failure Tester", "email_address": email, "password": password},
    )
    assert reg_res.status_code == 201

    # Failed password attempt
    bad_pass_res = client.post(
        "/auth/login",
        json={"login_id": email, "password": "WrongPassword999!"},
    )
    assert bad_pass_res.status_code == 401

    with SessionLocal() as db:
        user_db = db.query(User).filter(User.email_address == email).first()
        assert user_db.last_login_at is None

    # Valid login step 1
    good_login = client.post(
        "/auth/login",
        json={"login_id": email, "password": password},
    )
    assert good_login.status_code == 200
    session_id = good_login.json()["session_id"]

    # Invalid OTP attempt
    bad_otp_res = client.post(
        "/auth/verify-2fa",
        json={"session_id": session_id, "otp_code": "000000"},
    )
    assert bad_otp_res.status_code == 401

    with SessionLocal() as db:
        user_db = db.query(User).filter(User.email_address == email).first()
        assert user_db.last_login_at is None


def test_forgot_password_unknown_email_no_enumeration():
    """Unknown email gets the same generic 200 message and no debug OTP echo."""
    res = client.post(
        "/auth/forgot-password", json={"email_address": "ghost@testauth.com"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "If an account exists" in data["message"]
    assert data["otp_code_dev"] is None


def test_forgot_and_reset_password_happy_path():
    """Full flow: request reset -> verify OTP -> old password rejected, new password works."""
    import time

    email = f"reset_flow_{time.time()}@testauth.com"
    old_password = "OldPassword123!"
    new_password = "NewPassword456!"

    # Register + activate via 2FA
    reg = client.post(
        "/auth/register",
        json={"user_name": "Reset Tester", "email_address": email, "password": old_password},
    )
    assert reg.status_code == 201
    verify = client.post(
        "/auth/verify-2fa",
        json={
            "session_id": reg.json()["session_id"],
            "otp_code": reg.json()["otp_code_dev"],
        },
    )
    assert verify.status_code == 200

    # Request reset code
    forgot = client.post("/auth/forgot-password", json={"email_address": email})
    assert forgot.status_code == 200
    reset_otp = forgot.json()["otp_code_dev"]
    assert reset_otp

    # Wrong code rejected with attempts-remaining detail
    wrong = client.post(
        "/auth/reset-password",
        json={"email_address": email, "otp_code": "000000", "new_password": new_password},
    )
    assert wrong.status_code == 401
    assert "Invalid reset code" in wrong.json()["detail"]

    # Correct code resets the password
    ok = client.post(
        "/auth/reset-password",
        json={"email_address": email, "otp_code": reset_otp, "new_password": new_password},
    )
    assert ok.status_code == 200

    # Old password no longer accepted; new password signs in via 2FA challenge
    assert (
        client.post("/auth/login", json={"login_id": email, "password": old_password}).status_code
        == 401
    )
    assert (
        client.post("/auth/login", json={"login_id": email, "password": new_password}).status_code
        == 200
    )

    # Reset session cleared: the same OTP cannot be replayed
    replay = client.post(
        "/auth/reset-password",
        json={"email_address": email, "otp_code": reset_otp, "new_password": "AnotherPass789!"},
    )
    assert replay.status_code == 401


def test_reset_password_brute_force_lockout():
    """MAX_OTP_ATTEMPTS wrong reset codes invalidate the reset challenge."""
    import time

    email = f"reset_lockout_{time.time()}@testauth.com"
    reg = client.post(
        "/auth/register",
        json={
            "user_name": "Reset Lockout",
            "email_address": email,
            "password": "LockoutPass123!",
        },
    )
    assert reg.status_code == 201

    forgot = client.post("/auth/forgot-password", json={"email_address": email})
    assert forgot.status_code == 200

    # Burn MAX_OTP_ATTEMPTS with wrong codes
    for _ in range(settings.MAX_OTP_ATTEMPTS):
        res = client.post(
            "/auth/reset-password",
            json={
                "email_address": email,
                "otp_code": "999999",
                "new_password": "Whatever123!",
            },
        )
        assert res.status_code == 401

    # Next attempt is rejected as lockout, not a generic wrong-code failure
    locked = client.post(
        "/auth/reset-password",
        json={
            "email_address": email,
            "otp_code": "999999",
            "new_password": "Whatever123!",
        },
    )
    assert locked.status_code == 401
    assert "Too many failed attempts" in locked.json()["detail"]

    # Challenge state cleared, so even the genuine OTP no longer works
    with SessionLocal() as db:
        user_db = db.query(User).filter(User.email_address == email).first()
        assert user_db.active_session_id is None
        assert user_db.active_2fa_otp is None


def test_reset_password_unknown_email_generic_401():
    """Unknown email on reset mirrors the invalid-session 401 (no existence probe)."""
    res = client.post(
        "/auth/reset-password",
        json={
            "email_address": "nobody@testauth.com",
            "otp_code": "123456",
            "new_password": "Whatever123!",
        },
    )
    assert res.status_code == 401
    assert "Invalid or expired reset session" in res.json()["detail"]


import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.main import app
from app.models import Disease, DiseaseHistoryLog, Remedy, User
from app.security import create_access_token, hash_password

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_test_users():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Ensure admin user exists
    admin = db.query(User).filter(User.email_address == "admin_unit_test@plantaid.org").first()
    if not admin:
        admin = User(
            user_name="Super Admin",
            email_address="admin_unit_test@plantaid.org",
            password_hash=hash_password("AdminPass123!"),
            role="admin",
            account_status="ACTIVE",
            is_2fa_enabled=False,
        )
        db.add(admin)

    # Ensure standard user exists
    regular_user = db.query(User).filter(User.email_address == "farmer_unit_test@plantaid.org").first()
    if not regular_user:
        regular_user = User(
            user_name="Farmer Jane",
            email_address="farmer_unit_test@plantaid.org",
            password_hash=hash_password("FarmerPass123!"),
            role="user",
            account_status="ACTIVE",
            is_2fa_enabled=False,
        )
        db.add(regular_user)

    db.commit()
    yield
    # Cleanup created entities
    cleanup_db = SessionLocal()
    cleanup_db.query(Remedy).filter(Remedy.title.like("%Admin Test Remedy%")).delete()
    cleanup_db.query(User).filter(User.email_address.in_([
        "admin_unit_test@plantaid.org",
        "farmer_unit_test@plantaid.org",
        "temporary_target@plantaid.org"
    ])).delete()
    cleanup_db.commit()
    cleanup_db.close()


def get_token_for(email: str, role: str = "user") -> str:
    db = SessionLocal()
    user = db.query(User).filter(User.email_address == email).first()
    user_id = user.id
    db.close()
    return create_access_token(data={"sub": str(user_id), "email": email, "role": role})


def test_admin_endpoint_requires_auth():
    res = client.get("/api/admin/users")
    assert res.status_code == 401


def test_admin_endpoint_forbidden_for_regular_user():
    user_token = get_token_for("farmer_unit_test@plantaid.org", role="user")
    headers = {"Authorization": f"Bearer {user_token}"}
    res = client.get("/api/admin/users", headers=headers)
    assert res.status_code == 403
    assert "Administrative privileges required" in res.json()["detail"]


def test_admin_list_users_success():
    admin_token = get_token_for("admin_unit_test@plantaid.org", role="admin")
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/admin/users", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert data["total"] >= 2
    assert any(u["email_address"] == "admin_unit_test@plantaid.org" for u in data["items"])
    assert any(u["email_address"] == "farmer_unit_test@plantaid.org" for u in data["items"])
    # Verify last_login_at is exposed in the AdminUserItem schema
    for u in data["items"]:
        assert "last_login_at" in u
        assert u["last_login_at"] is None or isinstance(u["last_login_at"], str)


def test_admin_promote_and_demote_user():
    admin_token = get_token_for("admin_unit_test@plantaid.org", role="admin")
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Fetch regular user ID
    db = SessionLocal()
    regular_user = db.query(User).filter(User.email_address == "farmer_unit_test@plantaid.org").first()
    user_id = regular_user.id
    db.close()

    # Promote to admin
    res = client.patch(f"/api/admin/users/{user_id}/role", json={"role": "admin"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["role"] == "admin"

    # Demote back to user
    res_demote = client.patch(f"/api/admin/users/{user_id}/role", json={"role": "user"}, headers=headers)
    assert res_demote.status_code == 200
    assert res_demote.json()["role"] == "user"


def test_admin_self_demotion_safety_lock():
    admin_token = get_token_for("admin_unit_test@plantaid.org", role="admin")
    headers = {"Authorization": f"Bearer {admin_token}"}

    db = SessionLocal()
    admin = db.query(User).filter(User.email_address == "admin_unit_test@plantaid.org").first()
    admin_id = admin.id
    db.close()

    # Attempt to demote self
    res = client.patch(f"/api/admin/users/{admin_id}/role", json={"role": "user"}, headers=headers)
    assert res.status_code == 400
    assert "Safety lock" in res.json()["detail"]


def test_admin_suspend_and_reactivate_user():
    admin_token = get_token_for("admin_unit_test@plantaid.org", role="admin")
    headers = {"Authorization": f"Bearer {admin_token}"}

    db = SessionLocal()
    regular_user = db.query(User).filter(User.email_address == "farmer_unit_test@plantaid.org").first()
    user_id = regular_user.id
    db.close()

    # Suspend user
    res = client.patch(f"/api/admin/users/{user_id}/status", json={"account_status": "SUSPENDED"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["account_status"] == "SUSPENDED"

    # Suspended user cannot login
    login_res = client.post("/auth/login", json={
        "login_id": "farmer_unit_test@plantaid.org",
        "password": "FarmerPass123!"
    })
    assert login_res.status_code == 403
    assert "suspended" in login_res.json()["detail"].lower()

    # Reactivate user
    reactivate_res = client.patch(f"/api/admin/users/{user_id}/status", json={"account_status": "ACTIVE"}, headers=headers)
    assert reactivate_res.status_code == 200
    assert reactivate_res.json()["account_status"] == "ACTIVE"


def test_admin_self_suspension_safety_lock():
    admin_token = get_token_for("admin_unit_test@plantaid.org", role="admin")
    headers = {"Authorization": f"Bearer {admin_token}"}

    db = SessionLocal()
    admin = db.query(User).filter(User.email_address == "admin_unit_test@plantaid.org").first()
    admin_id = admin.id
    db.close()

    # Attempt to suspend self
    res = client.patch(f"/api/admin/users/{admin_id}/status", json={"account_status": "SUSPENDED"}, headers=headers)
    assert res.status_code == 400
    assert "Safety lock" in res.json()["detail"]


def test_admin_global_history_oversight():
    admin_token = get_token_for("admin_unit_test@plantaid.org", role="admin")
    headers = {"Authorization": f"Bearer {admin_token}"}

    res = client.get("/api/admin/history", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data


def test_admin_remedy_crud_cycle():
    admin_token = get_token_for("admin_unit_test@plantaid.org", role="admin")
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create Remedy
    create_payload = {
        "disease_id": "early_leaf_spot",
        "remedy_type": "Admin Biological Treatment",
        "title": "Admin Test Remedy - Trichoderma Bio-Shield",
        "description": "Lab tested high efficiency bio-shield against early leaf spot.",
        "application_instructions": "Foliar mist applied at 2.5g/L during morning hours.",
        "category": "Organic / Biological",
    }
    create_res = client.post("/api/admin/remedies", json=create_payload, headers=headers)
    assert create_res.status_code == 201
    remedy_data = create_res.json()
    remedy_id = remedy_data["id"]
    assert remedy_data["title"] == create_payload["title"]

    # 2. Update Remedy
    update_payload = {
        "title": "Admin Test Remedy - Updated Bio-Shield Protocol",
        "description": "Refined protocol with 3.0g/L dilution.",
    }
    update_res = client.put(f"/api/admin/remedies/{remedy_id}", json=update_payload, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["title"] == update_payload["title"]
    assert update_res.json()["description"] == update_payload["description"]

    # 3. Delete Remedy
    delete_res = client.delete(f"/api/admin/remedies/{remedy_id}", headers=headers)
    assert delete_res.status_code == 200
    assert delete_res.json()["status"] == "deleted"

    # Verify deleted
    get_res = client.put(f"/api/admin/remedies/{remedy_id}", json={"title": "Ghost"}, headers=headers)
    assert get_res.status_code == 404

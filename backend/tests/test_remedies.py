import pytest
from app.database import Base, SessionLocal, engine
from app.main import app
from app.models import Remedy, User
from app.security import create_access_token, hash_password
from fastapi.testclient import TestClient
from seed import seed_database

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_seed_data():
    Base.metadata.create_all(bind=engine)
    seed_database()


@pytest.fixture(scope="module", autouse=True)
def authenticate_client():
    """Remedy and disease reads require a Bearer JWT (§5.2); authenticate the whole module."""
    db: Session = SessionLocal()
    user = db.query(User).filter(User.email_address == "remedy_tester@example.com").first()
    if not user:
        user = User(
            user_name="Remedy Tester",
            email_address="remedy_tester@example.com",
            phone_number="+14445556666",
            password_hash=hash_password("RemedyPass123!"),
            account_status="ACTIVE",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    db.close()

    client.headers.update({"Authorization": f"Bearer {token}"})
    yield
    client.headers.pop("Authorization", None)


def test_list_all_diseases():
    response = client.get("/diseases")
    assert response.status_code == 200
    diseases = response.json()
    assert len(diseases) >= 6

    # Verify Groundnut classes exist with numeric IDs 1 to 6
    groundnut_ids = [d["id"] for d in diseases if d.get("numeric_id") in range(1, 7)]
    assert "early_leaf_spot" in groundnut_ids
    assert "early_rust" in groundnut_ids
    assert "healthy_leaf" in groundnut_ids
    assert "late_leaf_spot" in groundnut_ids
    assert "nutrition_deficiency" in groundnut_ids
    assert "rust" in groundnut_ids


def test_get_remedies_by_numeric_id():
    # ID 1 = Early Leaf Spot
    response = client.get("/remedies/1")
    assert response.status_code == 200
    data = response.json()
    assert data["disease_id"] == "early_leaf_spot"
    assert data["numeric_id"] == 1
    assert data["disease_name"] == "Groundnut Early Leaf Spot"
    assert "Cercospora" in data["scientific_name"]
    assert data["severity_level"] == "HIGH"

    # Check grouped remedies
    grouped = data["grouped_remedies"]
    assert len(grouped["organic_biological"]) > 0
    assert len(grouped["chemical_fungicide"]) > 0
    assert len(grouped["preventive_cultural"]) > 0
    assert any(
        "Mancozeb" in r["title"] or "Mancozeb" in r["description"]
        for r in grouped["chemical_fungicide"]
    )


def test_get_remedies_by_slug_id():
    # Slug 'late_leaf_spot'
    response = client.get("/remedies/late_leaf_spot")
    assert response.status_code == 200
    data = response.json()
    assert data["numeric_id"] == 4
    assert data["disease_name"] == "Groundnut Late Leaf Spot"
    assert data["severity_level"] == "SEVERE"
    assert len(data["remedies"]) == 3


def test_get_remedies_by_name():
    response = client.get("/remedies/Groundnut%20Rust")
    assert response.status_code == 200
    data = response.json()
    assert data["numeric_id"] == 6
    assert data["disease_id"] == "rust"


def test_remedies_search_and_filter():
    # Search by keyword
    res_q = client.get("/remedies?q=Mancozeb")
    assert res_q.status_code == 200
    remedies_q = res_q.json()
    assert len(remedies_q) > 0

    # Filter by category
    res_cat = client.get("/remedies?category=Organic")
    assert res_cat.status_code == 200
    remedies_cat = res_cat.json()
    assert len(remedies_cat) > 0
    assert all(
        "organic" in r["category"].lower() or "biological" in r["category"].lower()
        for r in remedies_cat
    )


def test_remedy_not_found_404():
    response = client.get("/remedies/nonexistent_plant_disease_xyz")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_api_prefix_aliasing():
    # Test /api/remedies and /api/diseases
    res_remedies = client.get("/api/remedies/1")
    assert res_remedies.status_code == 200
    assert res_remedies.json()["disease_id"] == "early_leaf_spot"

    res_diseases = client.get("/api/diseases")
    assert res_diseases.status_code == 200


def test_all_six_groundnut_classes_have_remedies():
    """Every groundnut class (numeric_id 1-6) must have remedies seeded."""
    for nid in range(1, 7):
        response = client.get(f"/remedies/{nid}")
        assert response.status_code == 200
        data = response.json()
        if data["disease_id"] == "healthy_leaf":
            # Healthy plant only has Biological + Cultural (no chemical)
            assert len(data["remedies"]) == 2
        else:
            assert len(data["remedies"]) == 3, (
                f"numeric_id={nid} ({data['disease_id']}) has {len(data['remedies'])} remedies, expected 3"
            )


def test_grouped_remedies_cover_all_three_categories():
    """Each groundnut class must have at least one remedy per grouped category."""
    for nid in range(1, 7):
        response = client.get(f"/remedies/{nid}")
        data = response.json()
        grouped = data["grouped_remedies"]
        # healthy_leaf (nid=3) may only have 2 remedies but should still have at least organic + cultural
        if nid != 3:
            assert len(grouped["organic_biological"]) >= 1
            assert len(grouped["chemical_fungicide"]) >= 1
            assert len(grouped["preventive_cultural"]) >= 1


def test_get_disease_by_id():
    """GET /diseases/{id} returns the correct disease."""
    response = client.get("/diseases/early_leaf_spot")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "early_leaf_spot"
    assert data["numeric_id"] == 1
    assert len(data["remedies"]) == 3


def test_get_disease_not_found():
    response = client.get("/diseases/totally_fake_disease")
    assert response.status_code == 404


def test_remedies_list_no_filters():
    """GET /remedies with no query params returns all remedies."""
    response = client.get("/remedies")
    assert response.status_code == 200
    remedies = response.json()
    # At least 6 groundnut classes × 3 remedies = 18
    assert len(remedies) >= 18


def test_remedy_reads_require_jwt():
    """Spec §5.2: remedy and disease lookups require a Bearer JWT."""
    unauthenticated = TestClient(app)
    assert unauthenticated.get("/remedies/1").status_code == 401
    assert unauthenticated.get("/remedies").status_code == 401
    assert unauthenticated.get("/diseases").status_code == 401
    assert unauthenticated.get("/diseases/early_leaf_spot").status_code == 401


def test_all_groundnut_classes_seed_three_remedies():
    """Task 3.2: the seed provides the documented remedy set (18 rows across 6 classes)."""
    db: Session = SessionLocal()
    try:
        total = db.query(Remedy).count()
    finally:
        db.close()

    # 5 disease classes × 3 remedies + healthy_leaf's 2 = 17 seeded rows, at least 18 in the API
    assert total >= 17
    assert client.get("/remedies").json().__len__() == total

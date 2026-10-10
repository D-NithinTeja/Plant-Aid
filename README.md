# 🌿 Plant-Aid: Real-Time Plant Disease Identification & Treatment Recommendation System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.1+-EE4C2C.svg?style=flat&logo=pytorch)](https://pytorch.org)
[![Tests](https://img.shields.io/badge/Tests-59%20Passing-16a34a.svg?style=flat)]()

**Plant-Aid** is a real-time, edge-ready artificial intelligence crop diagnostic and treatment advisory platform. Designed for farmers, agronomists, and agricultural extension workers, Plant-Aid enables live camera scanning of plant foliage to instantly localize lesions, classify crop diseases, calibrate diagnostic confidence, and provide actionable organic, chemical, and preventive treatment plans.

> **⚠️ Frontend status: removed, pending rebuild.**
> This branch (`frontend-cleanup`) deletes the previous React application so the user interface
> can be rebuilt from scratch. **The backend is fully functional and independently runnable** —
> everything documented below except the UI exists and is tested.
> The design reference material (screen mockups, exported screenshots, and `DESIGN.md`) is
> preserved in [`frontend_prototype/`](frontend_prototype/) for the rebuild.
> Work remaining before the UI returns is tracked in [`Docs/DEVELOPMENT_PLAN.md`](Docs/DEVELOPMENT_PLAN.md).

---

## 📸 Architecture

```
[ Camera Stream / Upload ]
           │
           ▼
[ Layer 1: OpenCV HSV Leaf Mask ] ──► Extracts Foliage ROI [x_min, y_min, x_max, y_max]
           │
           ▼
[ Layer 2: Deep Vision Classifier ] ──► ConvNeXt-Tiny (6 Groundnut Classes)
           │
           ▼
[ Calibration Threshold (τ = 0.55) ] ──► Flags Uncertain Frames vs Verified Alerts
           │
           ▼
[ Remedies & History Store ] ──► Actionable Organic / Chemical / Cultural Treatments
```

Localization is a **two-layer, training-free overlay**: an HSV green-dominance mask isolates the
leaf region, then an HSV hue-distance saliency map inside that region marks the suspected
infection area. It is deliberately *not* gradient-weighted class activation — the in-request path
uses saliency to stay inside the CPU latency budget, while true Grad-CAM (`backend/ml/gradcam.py`)
is used for offline sample generation and report figures. See `Docs/Implementation.md` §4.2.

### Frontend design reference

The previous UI is gone, but its design intent is not. `frontend_prototype/` contains per-screen
HTML mockups and exported PNGs, plus `plant_aid_enterprise/DESIGN.md` (palette and typography) and
the logo asset:

| Screen | Prototype path |
|---|---|
| Get started / landing | `frontend_prototype/get_started/` |
| Login + OTP verification | `frontend_prototype/login_otp_verification/` |
| Dashboard | `frontend_prototype/dashboard/` |
| Scan & diagnose | `frontend_prototype/scan_diagnose/` |
| Diagnosis detail (heatmap overlay) | `frontend_prototype/diagnosis_detail_grad_cam_heatmap/` |
| Diagnosis history | `frontend_prototype/diagnosis_history/` |
| Profile & settings | `frontend_prototype/user_profile_settings/` |
| Logo | `frontend_prototype/plant_aid_logo/Logo.png` |

The rebuild must call only endpoints that exist; note in particular that **persisting a diagnosis
is an explicit `POST /api/history` action**, not a side effect of uploading a frame.

---

## 🔬 Taxonomy & Supported Disease Classes

The model is trained and calibrated against 6 official Groundnut (*Arachis hypogaea*) classes aligned with database store D2:

| # | Disease Slug | Scientific Name | Category | Primary Presentation |
|---|---|---|---|---|
| **1** | `early_leaf_spot` | *Cercospora arachidicola* | Fungal | Circular brown lesions with conspicuous yellow chlorotic halos |
| **2** | `early_rust` | *Puccinia arachidis* | Fungal | Small, scattered speckled dark-brown pustules on lower leaves |
| **3** | `healthy_leaf` | *Arachis hypogaea* | Healthy | Uniform green chlorophyll pigmentation without lesions |
| **4** | `late_leaf_spot` | *Phaeoisariopsis personata* | Fungal | Dark brown-to-black circular spots without prominent yellow rings |
| **5** | `nutrition_deficiency` | *Nutritional Chlorosis* | Abiotic | Interveinal leaf yellowing, stunted margins, or pale foliage |
| **6** | `rust` | *Puccinia arachidis Speg.* | Fungal | Dense orange-brown pustules on lower leaf surfaces |

`backend/ml/ml_config.py` is the single source of truth for this catalogue; the inference engine
imports it directly and `ml/export.py` emits it to `labels.json`.

---

## 🛠️ Repository Layout

```
Plant-Aid/
├── backend/
│   ├── alembic/                # Database migrations (history disease FK, soft delete)
│   ├── app/
│   │   ├── routers/            # API endpoints (auth, inference, remedy, history)
│   │   ├── services/           # ML engine, S3 storage, 2FA OTP, disease lookup
│   │   ├── config.py           # Centralized application configuration (Pydantic Settings)
│   │   ├── database.py         # SQLAlchemy engine & session maker
│   │   ├── limiter.py          # SlowAPI rate limiting (JWT subject, IP fallback)
│   │   ├── models.py           # Database models (User, Disease, Remedy, History)
│   │   ├── schemas.py          # Pydantic schemas (Request / Response contracts)
│   │   └── security.py         # Bcrypt hashing, constant-time compare, JWT tokens
│   ├── ml/                     # Training, evaluation, Grad-CAM, export, labels.json
│   ├── tests/                  # Automated verification test suites (59 tests)
│   ├── requirements.txt        # Backend dependencies
│   ├── seed.py                 # Database seed script (6 groundnut classes; 4 non-groundnut rows retained)
│   └── test_backend.py         # End-to-end integration tests
├── frontend_prototype/         # UI design reference: HTML mockups, screenshots, DESIGN.md, logo
├── Docs/                       # Comprehensive specifications, plans, and SRS documents
└── README.md                   # Project documentation
```

> **Frontend:** there is no `frontend/` directory on this branch by design. The React app is
> scheduled for a from-scratch rebuild; start from the prototype reference above.

---

## 🐳 Quick Start with Docker Compose

To run Plant-Aid with zero manual configuration using Docker Compose:

```bash
# 1. Copy the environment configuration
cp .env.example .env

# 2. Build and launch services
docker compose up --build
```

* **Frontend UI**: [http://localhost](http://localhost) (Port 80)
* **Backend API**: [http://localhost:8000](http://localhost:8000)
* **Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

To run **backend only**:
```bash
docker compose up --build backend
```

For full details on inspecting logs, restarting, and data persistence, see [`Docs/DOCKER_QUICKSTART.md`](Docs/DOCKER_QUICKSTART.md).

---

## 🚀 How to Run the Backend Locally

### Prerequisites
* **Python 3.12+** (tested on Python 3.12 and 3.13)
* **uv** (recommended for ultra-fast Python environment management) or standard `pip`

*(Node.js and npm become prerequisites again once the frontend is rebuilt — they are not needed to
run, test, or use the API today.)*

---

### Step 1: Start the Backend API

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   # Using uv (recommended)
   uv venv
   uv pip install -r requirements.txt

   # Or using standard python
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Apply database migrations:
   ```bash
   uv run alembic upgrade head
   ```

4. Seed the database with diseases, remedies, and initial test accounts:
   ```bash
   uv run python seed.py
   ```

5. Launch the FastAPI server:
   ```bash
   uv run uvicorn app.main:app --reload --port 8000
   ```
   * The API server will be available at **`http://localhost:8000`**
   * Interactive Swagger UI documentation is available at **`http://localhost:8000/docs`**

> **No REST client?** Until the UI is rebuilt, exercise the API through Swagger UI at `/docs` or
> `curl`. `POST /api/auth/login` returns an `otp_code_dev` field while `APP_DEBUG=true`, so you can
> complete the 2FA flow locally without a real SMS or email provider.

---

## 🧪 Running Automated Test Suites

The backend includes a 59-test suite covering authentication, 2FA lockout, S3 storage compensation
rollback, remedy catalog lookups, history pagination and soft deletion, ML two-layer localization,
JWT enforcement, magic-byte upload validation, and API rate limiting:

```bash
cd backend
uv run pytest -v
```

Expected output:
```
======================== 59 passed, 3 warnings in ~15s ========================
```

> The migrated database is required for the suites that touch history columns. Run
> `uv run alembic upgrade head` first if you cloned fresh.

---

## ⚙️ Environment Variables Reference

Configure environment variables in a `.env` file or export them with the `PLANT_AID_` prefix:

| Variable | Default Value | Description |
|---|---|---|
| `PLANT_AID_SECRET_KEY` | `super-secret-...` | Secret key used for signing JWT tokens |
| `PLANT_AID_APP_DEBUG` | `True` | **Debug only.** While true, `/auth/login` echoes `otp_code_dev`. Must be `False` in production |
| `PLANT_AID_DATABASE_URL` | `sqlite:///./plant_aid.db` | SQLAlchemy database connection string |
| `PLANT_AID_ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT token lifespan in minutes |
| `PLANT_AID_OTP_EXPIRE_MINUTES` | `5` | Two-Factor Authentication OTP expiration window |
| `PLANT_AID_MAX_OTP_ATTEMPTS` | `5` | Maximum failed 2FA verification attempts before lockout |
| `PLANT_AID_OTP_PROVIDER` | `console` | 2FA provider: `console` (prints to stdout), `twilio`, or `sendgrid` |
| `PLANT_AID_ML_DEVICE` | `cpu` | Device for inference engine: `cpu` or `cuda` |
| `PLANT_AID_ML_CONFIDENCE_THRESHOLD` | `0.55` | Confidence threshold ($\tau$) to differentiate uncertain frames |
| `PLANT_AID_AWS_ACCESS_KEY_ID` | `""` | AWS S3 access key (uses local disk fallback if omitted) |
| `PLANT_AID_AWS_SECRET_ACCESS_KEY` | `""` | AWS S3 secret key |
| `PLANT_AID_S3_BUCKET_NAME` | `plant-aid-media-bucket` | Target S3 bucket for leaf image storage |

---

## 📡 API Endpoints

Every endpoint that reads or writes user data requires a Bearer JWT (NF.3), including inference and
the remedy/disease catalogues. All routes are also served under an identical `/api/...` prefix.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user account (`201` / `409`) |
| `POST` | `/auth/login` | Public (10/min) | Authenticate credentials and issue a 2FA challenge (`200` / `401` / `429`) |
| `POST` | `/auth/verify-2fa` | Challenge session | Verify the 6-digit OTP and issue a JWT (`200` / `401`) |
| `GET` | `/auth/me` | JWT | Fetch the authenticated user profile |
| `POST` | `/inference/frame` | JWT (60/min) | Real-time streaming frame inference with bounding box (`200` / `400` / `401` / `429`) |
| `POST` | `/inference/predict` | JWT (60/min) | Multipart image upload inference; stores the frame and returns its URI (writes no history) |
| `GET` | `/remedies/{disease_id}` | JWT | Treatment recommendations for a disease (optional `language` param) |
| `GET` | `/remedies` | JWT | List or search the remedy catalogue |
| `GET` | `/diseases` | JWT | List the disease catalogue with remedies |
| `GET` | `/diseases/{disease_id}` | JWT | One disease record with its remedies |
| `POST` | `/history` | JWT | Explicitly log a confirmed diagnosis (`201` / `422`) |
| `GET` | `/history` | JWT | Paginated, filterable diagnosis history |
| `GET` | `/history/{log_id}` | JWT | One history record with a presigned media URL |
| `DELETE` | `/history/{log_id}` | JWT | Soft-delete a record and remove its media (`204`) |
| `GET` | `/health` | Public | Liveness probe |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

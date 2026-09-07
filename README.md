# 🌿 Plant-Aid: Real-Time Plant Disease Identification & Treatment Recommendation System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.1+-EE4C2C.svg?style=flat&logo=pytorch)](https://pytorch.org)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-06B6D4.svg?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Tests-44%20Passing-16a34a.svg?style=flat)]()

**Plant-Aid** is a real-time, edge-ready artificial intelligence crop diagnostic and treatment advisory platform. Designed for farmers, agronomists, and agricultural extension workers, Plant-Aid enables live camera scanning of plant foliage to instantly localize lesions, classify crop diseases, calibrate diagnostic confidence, and provide actionable organic, chemical, and preventive treatment plans.

---

## 📸 Architecture & Design System

The application features a modern, clean agricultural design system built with emerald and forest green palettes, fluid mobile-first ergonomics, and responsive desktop workflows:

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

### Key UI Capabilities
1. **Landing Page**: Modern hero section highlighting real-time AI crop diagnostics, feature benefits, and seamless authentication access.
2. **Dashboard**: Personal greeting, quick action cards (*Scan with Camera* and *Upload Image*), and recent diagnosis feeds.
3. **Live Camera Scan**: WebRTC rear camera feed (`facingMode: "environment"`) with corner-bracket viewfinder framing, sub-second 1.5s background streaming loop, camera flip, and gallery upload.
4. **Analysis Result**: Leaf thumbnail with localized bounding box overlay, disease identification, calibrated confidence bar, and symptom summaries.
5. **Treatment Plan**: Numbered actionable steps followed by expandable treatment categories (*Organic*, *Chemical*, *Preventive Cultural*, *Environmental*, and *Things to Avoid*).
6. **Diagnosis History**: Filterable and searchable dashboard displaying past scans with presigned thumbnail URLs and severity badges.
7. **Profile & Security**: User account management with Two-Factor Authentication (2FA) protection status.

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

---

## 🛠️ Repository Layout

```
Plant-Aid/
├── backend/
│   ├── alembic/                # Database migrations (Alembic)
│   ├── app/
│   │   ├── routers/            # Canonical API endpoints (auth, inference, remedies, history)
│   │   ├── services/           # ML engine, S3 storage, 2FA OTP service
│   │   ├── config.py           # Centralized application configuration (Pydantic Settings)
│   │   ├── database.py         # SQLAlchemy engine & session maker
│   │   ├── limiter.py          # SlowAPI rate limiting configuration
│   │   ├── models.py           # Database models (User, Disease, Remedy, History)
│   │   ├── schemas.py          # Pydantic schemas (Request / Response contracts)
│   │   └── security.py         # Bcrypt hashing, constant-time compare, JWT tokens
│   ├── ml/                     # ML architecture, Grad-CAM, labels.json, export utilities
│   ├── tests/                  # Automated verification test suites (44 tests)
│   ├── requirements.txt        # Backend dependencies
│   ├── seed.py                 # Database seed script for 6 diseases and 18 remedies
│   └── test_backend.py         # End-to-end integration tests
├── frontend/
│   ├── src/
│   │   ├── components/         # Modular React components (auth, scan, analysis, treatment, etc.)
│   │   ├── services/           # Axios client, auth, inference, remedies, and history APIs
│   │   ├── App.jsx             # Main application coordinator & state shell
│   │   └── index.css           # Tailwind directives and base typography
│   ├── index.html              # HTML entry point with mobile viewport configuration
│   ├── tailwind.config.js      # Custom theme colors and radiuses
│   ├── vite.config.js          # Vite config with backend API proxying
│   └── package.json            # Frontend dependencies (React 19, Lucide, Tailwind, Axios)
├── Docs/                       # Comprehensive specifications, plans, and SRS documents
└── README.md                   # Project documentation
```

---

## 🚀 How to Run the Project Locally

### Prerequisites
* **Python 3.12+** (tested on Python 3.12 and 3.13)
* **uv** (recommended for ultra-fast Python environment management) or standard `pip`
* **Node.js 18+** & **npm**

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

3. Seed the database with diseases, remedies, and initial test accounts:
   ```bash
   uv run python seed.py
   ```

4. Launch the FastAPI server:
   ```bash
   uv run uvicorn app.main:app --reload --port 8000
   ```
   * The API server will be available at **`http://localhost:8000`**
   * Interactive Swagger UI documentation is available at **`http://localhost:8000/docs`**

---

### Step 2: Start the Frontend Application

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   * The user interface will launch at **`http://localhost:5173`**

---

## 🧪 Running Automated Test Suites

The backend includes a 44-test suite covering authentication, 2FA lockout, S3 storage compensation rollback, remedy catalog lookups, history pagination, ML two-layer localization, and API rate limiting:

```bash
cd backend
uv run pytest -v
```

Expected output:
```
======================== 44 passed, 1 warning in 5.49s ========================
```

To run a production build test on the frontend:
```bash
cd frontend
npm run build
```

---

## ⚙️ Environment Variables Reference

Configure environment variables in a `.env` file or export them with the `PLANT_AID_` prefix:

| Variable | Default Value | Description |
|---|---|---|
| `PLANT_AID_SECRET_KEY` | `super-secret-...` | Secret key used for signing JWT tokens |
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

## 📡 Key API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public (Rate-limited) | Authenticate user credentials and issue a 2FA challenge |
| `POST` | `/api/auth/verify-2fa` | Public | Verify 6-digit OTP and issue JWT access token |
| `GET` | `/api/auth/me` | Authenticated | Fetch authenticated user profile |
| `POST` | `/api/inference/frame` | Public / Auth (Rate-limited) | Real-time ephemeral streaming frame inference with bounding box |
| `POST` | `/api/inference/predict` | Public / Auth (Rate-limited) | Multipart image file upload inference with S3 compensation rollback |
| `GET` | `/api/diseases` | Public | List all 6 groundnut disease categories |
| `GET` | `/api/remedies/{disease_id}`| Public | Fetch treatment recommendations for a disease |
| `POST` | `/api/history` | Authenticated | Explicitly log confirmed diagnosis record to user dashboard |
| `GET` | `/api/history` | Authenticated | Retrieve paginated, filterable diagnosis history records |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

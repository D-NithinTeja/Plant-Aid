# Implementation Document — Real-Time Plant Disease Identification System

**Project:** Plant-Aid — Real-Time Plant Disease Identification through the Web
**Team:** DONTHULA NITHIN TEJA (241IT028), GHANTA BHAVANA SRI SAI (241IT029), YASH ROSHAN (241IT083)
**Department of Information Technology, National Institute of Technology Karnataka, Surathkal**

This document describes the implementation of the system module by module, following the module decomposition (0.1 – 0.5) defined in the Design Document (SA/SD methodology). Each module section maps its implementation artifacts back to the functional requirements (F.1 – F.6) and non-functional requirements (NF.1 – NF.5) of the SRS, and to the persistent data stores (D1 – D4) of the Data Dictionary.

---

## 1. Implementation Overview

### 1.1 Technology Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Frontend | React.js (JavaScript, HTML5, CSS3) | Responsive GUI, camera capture, dashboards |
| Backend | Python 3.11+ / FastAPI | RESTful API layer, auth, orchestration |
| Machine Learning | PyTorch (CUDA-enabled) + `timm` | CNN inference (ConvNeXt-Tiny) for disease classification |
| Database | PostgreSQL | User accounts, disease/remedy master data, history logs |
| Object Storage | AWS S3 (via `boto3`) | Raw frame/image storage |
| Auth | JWT (`python-jose`), OTP via Twilio (SMS) / SendGrid (Email) | 2FA and token-based sessions |
| Communications | HTTPS + REST (HTTP POST polling) | Client–server transport |

### 1.2 Repository / Project Structure

```
Plant-Aid/
├── Docs/                          # SRS, DFD/Design Document, Implementation doc
├── frontend/                      # React.js application (Module 0.2 + UI shells of all modules)
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── auth/              # Register, Login, OTPEntry forms
│       │   ├── camera/            # CameraStream, FrameCapture, UploadPanel
│       │   ├── dashboard/         # ResultPanel, BoundingBoxOverlay, HistoryTable
│       │   └── recommendations/   # RemedyTabs (Organic / Chemical / Preventive)
│       ├── services/
│       │   ├── api.js             # Axios wrapper: baseURL, JWT interceptor, refresh
│       │   ├── inference.js       # Frame capture loop + POST /inference
│       │   └── auth.js            # Login / 2FA / token storage helpers
│       ├── App.jsx
│       └── index.js
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app factory, CORS, router registration
│   │   ├── core/
│   │   │   ├── config.py          # Env-driven settings (DB URL, AWS keys, JWT secret)
│   │   │   └── security.py        # Password hashing, JWT issue/verify, OTP utilities
│   │   ├── routers/
│   │   │   ├── auth.py            # Module 0.1 endpoints
│   │   │   ├── inference.py       # Module 0.3 endpoints
│   │   │   ├── remedies.py        # Module 0.4 endpoints
│   │   │   └── history.py         # Module 0.5 endpoints
│   │   ├── models/                # SQLAlchemy ORM models (users, diseases, remedies, history)
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── otp_service.py     # Twilio / SendGrid integration
│   │   │   ├── s3_service.py      # boto3 upload / presigned URL helpers
│   │   │   └── ml_engine.py       # Model load, tensor conversion, forward pass
│   │   └── db/
│   │       ├── database.py        # Session/engine setup
│   │       └── migrations/        # Alembic migrations for D1–D3
│   ├── ml/
│   │   ├── train.py               # Offline training on BD crop/vegetable disease dataset
│   │   ├── export.py              # Checkpoint → inference artifact (.pt / TorchScript)
│   │   └── labels.json            # Class-id → disease-name mapping
│   └── requirements.txt
├── infra/
│   └── docker-compose.yml         # Postgres + backend + frontend for local dev
└── README.md
```

### 1.3 Cross-Cutting Implementation Decisions

- **REST over WebSockets:** Frames are polled via HTTP POST every 1–2 s using `setInterval` on the frontend (per SRS F.2), avoiding WebSocket state management.
- **Stateless auth:** All protected endpoints require a Bearer JWT issued only after a verified 2FA session (NF.3).
- **Environment-driven configuration:** Secrets (JWT secret, DB credentials, AWS keys, Twilio/SendGrid keys) are injected via environment variables, never hard-coded.
- **Rate limiting (C.5):** FastAPI middleware (`slowapi`) throttles inference and auth endpoints per user per minute.
- **MIME validation (C.6):** Enforced on both the client (file input `accept`) and the server (content-type + magic-byte sniffing) for a fixed allow-list: `image/jpeg`, `image/png`.

---

## 2. Module 0.1 — User Registration & 2FA Authentication

**Designer:** GHANTA BHAVANA SRI SAI — **Requirements covered:** F.6, NF.3 — **Data store:** D1 (User DB)

### 2.1 Responsibility

User account creation, credential validation, mandatory two-factor authentication (SMS/Email OTP challenge–response), and issuance of a JWT access token on successful 2FA verification.

### 2.2 Implementation Details

1. **Registration (`Register User`)**
   - `POST /auth/register` accepts `registration-data = user-name + email-address + phone-number + password`.
   - Password is hashed with **bcrypt** (`passlib[bcrypt]`, cost factor 12); the raw password is never stored or logged.
   - Uniqueness of email/phone is enforced by a DB constraint; a duplicate returns `409 Conflict`.
   - The resulting `user-account-record` (D1) is written with `is-2fa-enabled = true`, `account-status = active`, `created-at = now()`.

2. **Login, step 1 (`Verify Credentials`)**
   - `POST /auth/login` accepts `login-credentials = (email | phone) + password`.
   - bcrypt verify against the stored hash. On mismatch: generic `401` (no user-enumeration hints).

3. **Login, step 2 (`Initiate 2FA`)**
   - On credential success the server generates a cryptographically random 6-digit OTP (`secrets.randbelow`) and stores `active-2fa-otp` + `otp-expiry-time` (TTL = 5 min) on the user row (D1 fields `active-2fa-otp`, `otp-expiry-time`).
   - The OTP is dispatched through the **`otp_service`** abstraction with two backends:
     - **Twilio SMS API** for phone numbers,
     - **SendGrid Email API** for email addresses.
   - The response returns a short-lived, single-use `2fa-challenge` `session-id` (signed, 5-min TTL) — *not* a JWT.

4. **Login, step 3 (`Verify 2FA OTP`)**
   - `POST /auth/verify-2fa` accepts `2fa-security-otp = 2fa-otp-code + session-id`.
   - Server compares the submitted code against the stored hash (constant-time compare), checks expiry and single-use, then invalidates the stored OTP.
   - Failed attempts are capped (5 per session) to resist brute force.

5. **Token issuance (`Generate JWT Token`)**
   - On 2FA success the server builds `authenticated-jwt-token = token-type ("bearer") + access-token-string + expires-in + user-id` using `python-jose` (HS256, secret from env).
   - Access-token TTL: 60 minutes; claims: `sub = user-id`, `iat`, `exp`, `scope`.
   - A `GET /auth/me` endpoint lets the frontend validate the session and hydrate the dashboard.

### 2.3 Endpoint Summary

| Endpoint | Method | Input | Output / Errors |
| --- | --- | --- | --- |
| `/auth/register` | POST | registration-data | `201` user-id / `409` duplicate |
| `/auth/login` | POST | login-credentials | `200` {session-id} / `401` bad credentials |
| `/auth/verify-2fa` | POST | 2fa-security-otp | `200` authenticated-jwt-token / `401` invalid-expired OTP |
| `/auth/me` | GET | Bearer JWT | `200` user profile / `401` invalid token |

### 2.4 Frontend Components

- `Register.jsx`, `Login.jsx`: form validation (email regex, phone format, password strength).
- `OTPEntry.jsx`: 6-digit input with countdown timer and resend control; on success stores the JWT in memory (+ refresh-safe storage) and routes to the dashboard.

---

## 3. Module 0.2 — Image Frame Capture & Preprocessing

**Designer:** GHANTA BHAVANA SRI SAI — **Requirements covered:** F.1, F.2, NF.1, NF.2

### 3.1 Responsibility

Access the device camera through the browser's **MediaDevices API**, capture frames at 1–2 s intervals, support manual JPEG/PNG upload with MIME validation, standardize resolution, and ship frames to the backend as Base64 HTTP POST payloads.

### 3.2 Implementation Details

1. **Camera access (`Accessing WebCam/SmartPhone Camera`)**
   - `navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } })` — rear camera preferred on mobile (NF.1).
   - The stream is bound to a `<video>` element; a `CameraStream` component handles permission denial, device-not-found, and insecure-context (non-HTTPS) errors explicitly (browser compatibility per C.2).
   - Stream is released (`track.stop()`) on component unmount / tab blur to save battery.

2. **Frame capture loop (`Capturing Image Frames at 1–2 s intervals`)**
   - An `inference.js` service runs `setInterval(captureAndPost, 1500)` (1.5 s period) while "Live Scan" mode is active.
   - Each tick draws the current video frame onto an offscreen `<canvas>` and calls `canvas.toDataURL("image/jpeg", 0.8)` → **Base64 string** (SRS F.2 input format).
   - **Overlap guard:** a new capture is skipped if the previous POST is still in flight (`isInFlight` flag), so slow networks cannot stack requests.

3. **MIME validation (`MIME type validation`, C.6)**
   - Upload panel accepts only `image/jpeg` and `image/png` (input `accept` attribute + client-side check of `file.type` and extension).
   - Server side re-validates (Module 0.3) — client checks are UX, not security.

4. **Preprocessing & resizing (`Preprocessing & Resizing Frame`)**
   - Canvas is drawn at a fixed **640×480** working resolution (aspect-preserving letterbox) to bound payload size (~100–200 KB/frame at JPEG q=0.8).
   - `preprocessed-frame-payload = mime-type + payload-encoding ("base64") + base64-image-string + capture-timestamp` (Data Dictionary §3.1.2) is sent as JSON.

5. **Transport (`Sending HTTP POST requests`)**
   - `POST /inference/frame` with `Authorization: Bearer <JWT>`, body: `{ "mime_type": "image/jpeg", "encoding": "base64", "image_b64": "...", "capture_timestamp": "..." }`.
   - Axios interceptor attaches the token; `401` responses trigger re-authentication flow.

### 3.3 Frontend Components

| Component | Role |
| --- | --- |
| `CameraStream.jsx` | getUserMedia lifecycle, video preview, error states |
| `FrameCapture.jsx` | canvas snapshot + interval loop + in-flight guard |
| `UploadPanel.jsx` | drag-and-drop / file-picker for manual JPEG/PNG upload (F.1) |
| `BoundingBoxOverlay.jsx` | absolutely-positioned leaf-ROI box + Grad-CAM heatmap layer, scaled from normalized [0,1] coords over the preview |

---

## 4. Module 0.3 — Real-Time PyTorch Model Inference

**Designer:** YASH ROSHAN — **Requirements covered:** F.3, NF.4 — **Data stores:** consumes D2 (labels), feeds D3/D4

### 4.1 Responsibility

Accept Base64/Blob frames over REST, decode and convert them to PyTorch float tensors, run the CNN forward pass on a CUDA GPU within the 1–2 s latency budget, and return the predicted disease class, confidence score, and bounding box coordinates.

### 4.2 Implementation Details

1. **Accept REST payload (`Accept REST Payload`)**
   - `POST /inference/frame` (FastAPI, async). Pydantic schema validates `mime_type ∈ {image/jpeg, image/png}` (server-side C.6 enforcement via magic-byte sniff with `python-magic`), then rate-limits per user (C.5).

2. **Decode & convert to tensor (`Convert Image to Tensor`)**
   - `base64.b64decode` → `BytesIO` → `PIL.Image.open().convert("RGB")`.
   - TorchVision transforms: `Resize((224, 224)) → ToTensor() → Normalize(ImageNet mean/std)` producing `image-tensor-matrix` with `tensor-shape = [1, 3, 224, 224]` (Data Dictionary §3.1.3) and `.to(device)` where `device = "cuda" if torch.cuda.is_available() else "cpu"` (C.3).
   - **No `CenterCrop` at inference:** the dataset is field-style imagery (leaf on a soil background) where lesions frequently sit near the frame edges — a center crop would amputate them. Direct resize is used instead; `RandomResizedCrop` remains a *training-only* augmentation.

3. **Model artifact**
   - CNN fine-tuned on the project's **groundnut disease dataset** (9,991 field photographs, 256×256 RGB; six filename-labeled classes: `early_leaf_spot`, `early_rust`, `healthy_leaf`, `late_leaf_spot`, `nutrition_deficiency`, `rust` — see `plan.md` for the full audit). Backbone: **ConvNeXt-Tiny** (2022, "A ConvNet for the 2020s" — modern mainstream CNN), loaded ImageNet-pretrained via the `timm` library (`timm.create_model("convnext_tiny", pretrained=True, num_classes=6)`) with the classification head replaced for the groundnut class count. **EfficientNetV2-S** (2021) is trained as an ablation baseline for the report's model-comparison table. The dataset provides **image-level labels only** — no bounding-box annotations exist, which drives the localization strategy in step 5 below.
   - Training (`ml/train.py`): AdamW, label-smoothing cross-entropy, standard augmentation (random crop/flip/color jitter), early stopping on validation F1; best checkpoint exported via `torch.jit.script` for low-overhead inference.
   - `labels.json` maps `class-id → (disease-id, disease-name)` consistent with D2 `disease-master-record`.
   - The model is loaded **once** at startup into a module-level singleton (`ml_engine.py`), set to `eval()` with `torch.inference_mode()`, never per-request.

4. **Forward pass & classification (`Disease Classification with Confidence Score`)**
   - Logits → `torch.softmax(dim=1)` → top-1 `(class-id, probability)`.
   - Confidence below a tuned threshold (e.g. 0.55) returns `class = "healthy_or_uncertain"` so borderline frames are not logged as diseases.

5. **Bounding box formation (`Bounding Box Formation`)**
   - **Dataset constraint:** the groundnut corpus is labeled at image level only, so no true object detector can be trained from it. Localization is therefore a two-layer, training-free overlay:
   - **Layer 1 — leaf region of interest:** frames are field photographs (green leaf against brown soil), so an HSV green-dominance mask followed by largest-connected-contour extraction yields a reliable `leaf-roi` box with no extra model and no annotation effort.
   - **Layer 2 — Grad-CAM attention:** Grad-CAM on the last convolutional block of the trained classifier produces a heatmap for the winning class; thresholded connected components inside the leaf ROI yield `formated-bounding-box = x-min + y-min + x-max + y-max`, normalized to [0,1] so the frontend can scale it to any preview size. The UI renders the CAM heatmap inside the leaf ROI as a **"suspected infection region"** overlay — deliberately *not* described as lesion detection, since image-level labels cannot support that claim.
   - CAM is computed on demand only for the winning class to keep within the latency budget.
   - **Optional upgrade path:** if crisper boxes are later required, hand-annotate leaf boxes for ~500–1,000 images (Roboflow/CVAT) and fine-tune YOLOv8n as a leaf detector feeding crops to this classifier. Out of scope for v1.

6. **Latency engineering (NF.4, 1–2 s window)**
   - GPU inference for a 224×224 single image is ~30–80 ms; the dominant costs are network + decode + CAM. Measured end-to-end target: ≤ 1.5 s per frame.
   - Optional optimizations: half-precision (`model.half()` on CUDA), `torch.jit.script` artifact, and a `torch.cuda.synchronize`-free async response path.

### 4.3 Response Contract

```json
{
  "disease_id": 42,
  "disease_name": "Tomato Late Blight",
  "confidence": 0.93,
  "bounding_box": { "x_min": 0.21, "y_min": 0.34, "x_max": 0.68, "y_max": 0.81 },
  "frame_id": "…",
  "is_healthy_or_uncertain": false
}
```

---

## 5. Module 0.4 — Treatment Recommendation Lookup

**Designer:** YASH ROSHAN — **Requirements covered:** F.4 — **Data store:** D2 (Disease & Remedy DB)

### 5.1 Responsibility

Given a predicted `disease-id`, query the persistent database and return the full set of remedies — organic/biological, chemical/fungicide, and preventive cultural practices — serialized for UI rendering.

### 5.2 Implementation Details

1. **Input (`Disease ID as Input`)**
   - `GET /remedies/{disease_id}` (Bearer JWT required). The frontend calls this once per *stable* diagnosis — repeated frames of the same disease within a session do not re-query (client-side cache keyed by `disease_id`, TTL 10 min).

2. **Query (`Query Persistent Database`)**
   - SQLAlchemy query joining `diseases` ↔ `remedies` (one-to-many) filtered by `disease_id`; `language-preference` (optional query param) selects localized remedy text when available.

3. **Treatment records (`Extract Treatments from Database`)**
   - Each `treatment-tabs = remedy-id + disease-id + remedy-type + title + description + application-instructions`, with `remedy-type ∈ { "Organic / Biological", "Chemical / Fungicide", "Preventive Cultural Practice" }` (Data Dictionary §3.1.4).
   - Seed data: the remedy catalogue is populated per disease class from curated agricultural-extension sources during dataset preparation and loaded via an Alembic seed migration into D2.

4. **Serialization (`Serialize Treatment Data to Output to UI`)**
   - Pydantic response model emits `formatted-remedy-payload = disease-name + confidence-score + formated-bounding-box + { treatment-record }*`, grouped by remedy-type so the UI can render three tabs directly.

### 5.3 Frontend Rendering

`RemedyTabs.jsx` renders three tabs (Organic / Chemical / Preventive); each record shows title, description, and application instructions; chemical records additionally display any safety notes stored in the description field.

---

## 6. Module 0.5 — Disease History & Media Storage Management

**Designer:** DONTHULA NITHIN TEJA — **Requirements covered:** F.5, NF.5 — **Data stores:** D3 (History Log), D4 (AWS S3)

### 6.1 Responsibility

Persist every confirmed diagnosis: upload the raw frame to AWS S3, extract its object URI, and append a history record to PostgreSQL; expose a per-user history dashboard.

### 6.2 Implementation Details

1. **Upload raw frame to AWS S3 (`Upload Raw Frame to AWS S3`)**
   - `s3_service.py` (boto3, credentials from env/IAM role) executes `put_object` with `s3-upload-payload = bucket-name + object-key + mime-type + raw-image-binary`.
   - Object key layout: `s3://{bucket}/frames/{user_id}/{yyyy}/{mm}/{dd}/{frame_id}.jpg` — user-scoped, time-partitioned, collision-free.

2. **Extract object URI (`Extract Object URI`)**
   - The service composes `s3-storage-uri = s3://{bucket}/{object-path-key}` and stores *the URI*, not the binary, in PostgreSQL (D3) — matching the Data Dictionary separation of D3 (metadata) and D4 (media).
   - History-dashboard thumbnails are served via **time-limited presigned GET URLs** (15-min expiry) rather than public buckets.

3. **Write history log record (`Write History Log Record`)**
   - When a diagnosis is confirmed (confidence ≥ threshold and user accepts/logs it — a "Log diagnosis" action avoids spamming history with every polled frame), the backend writes:
     `diagnosis-log-record = log-id + user-id + disease-id + confidence-score + s3-storage-uri + (bounding-box-json) + diagnosis-timestamp` into D3.
   - The write is transactional (SQLAlchemy session); response: `history-log-confirmation = log-id + status-flag + timestamp`.

4. **History dashboard (`Create History Dashboard Table`)**
   - `GET /history` (paginated, newest-first, filterable by plant/disease/date-range) joins D3 with D2 to enrich each row with the human-readable disease name.
   - `HistoryTable.jsx` renders the table with thumbnail (presigned URL), disease, confidence, and timestamp; a detail view shows the stored bounding box overlaid on the archived image.

### 6.3 Retention & Reliability

- S3 objects are versioned; history rows are never hard-deleted (soft-delete flag), satisfying NF.5 (persistent, reliable record keeping).
- Backend failures between S3 upload and DB write are handled with a compensation step: if the DB write fails, the orphaned S3 object is deleted in a cleanup task.

---

## 7. Persistent Data Store Schemas (as implemented)

Implemented in PostgreSQL via SQLAlchemy ORM + Alembic migrations (logical definitions from Design Document §3.2):

**D1 — User DB (`users` table)**
`user_id (PK, uuid) | user_name | email_address (unique) | phone_number (unique) | password_hash (bcrypt) | is_2fa_enabled (bool) | active_2fa_otp (nullable) | otp_expiry_time (nullable) | account_status | created_at`

**D2 — Disease & Remedy DB (`diseases` + `remedies` tables)**
- `diseases`: `disease_id (PK) | plant_species | disease_name | scientific_name | severity_level`
- `remedies`: `remedy_id (PK) | disease_id (FK → diseases) | remedy_type | title | description | application_instructions`

**D3 — Disease History Log (`diagnosis_history` table)**
`log_id (PK, uuid) | user_id (FK → users) | disease_id (FK → diseases) | confidence_score (numeric) | s3_storage_uri (text) | bounding_box_json (jsonb, nullable) | diagnosis_timestamp (timestamptz)`

**D4 — AWS S3 Object Storage** (no relational schema)
`{object-path-key} + raw-image-binary + content-type + upload-metadata` under bucket `plantaid-frames` (name from env), server-side encryption enabled (SSE-S3).

---

## 8. API Surface Summary

| # | Endpoint | Module | Auth | Purpose |
| --- | --- | --- | --- | --- |
| 1 | `POST /auth/register` | 0.1 | none | Create account |
| 2 | `POST /auth/login` | 0.1 | none | Verify credentials → 2FA challenge |
| 3 | `POST /auth/verify-2fa` | 0.1 | challenge session | Verify OTP → JWT |
| 4 | `GET /auth/me` | 0.1 | JWT | Session validation |
| 5 | `POST /inference/frame` | 0.3 | JWT | Classify one frame (Base64) |
| 6 | `GET /remedies/{disease_id}` | 0.4 | JWT | Treatment recommendations |
| 7 | `POST /history` | 0.5 | JWT | Log a confirmed diagnosis |
| 8 | `GET /history` | 0.5 | JWT | Paginated history dashboard |

---

## 9. Requirement Traceability Matrix

| Requirement | Implementing Module(s) | Key Artifacts |
| --- | --- | --- |
| F.1 Image capture/upload | 0.2 | `CameraStream`, `UploadPanel`, getUserMedia integration |
| F.2 Near real-time stream analysis | 0.2 + 0.3 | `setInterval` capture loop, Base64 POST `/inference/frame` |
| F.3 Disease classification | 0.3 | `ml_engine.py`, ConvNeXt-Tiny (+ EfficientNetV2-S ablation) with Grad-CAM |
| F.4 Treatment recommendations | 0.4 | `GET /remedies/{disease_id}`, D2 seed data, `RemedyTabs` |
| F.5 Disease history logging | 0.5 | `s3_service.py`, D3 writes, `GET /history` |
| F.6 Two-factor authentication | 0.1 | OTP service (Twilio/SendGrid), JWT issuance |
| NF.1 Platform (desktop + mobile web) | 0.2 | Responsive React layout, rear-camera `facingMode` |
| NF.2 Browser support | 0.2 | Standards-based MediaDevices/canvas APIs |
| NF.3 Secure API access | 0.1 + all | JWT guard dependency, HTTPS everywhere |
| NF.4 Performance (1–2 s) | 0.3 | GPU inference, TorchScript, half-precision |
| NF.5 Reliability of storage | 0.5 | Transactional D3 writes, versioned S3, SSE |

---

## 10. Deployment & Environments

- **Local development:** `infra/docker-compose.yml` brings up PostgreSQL (:5432), the FastAPI backend (:8000, hot reload), and the React frontend (:3000). ML inference runs on CPU locally with the same artifact.
- **Cloud (production):**
  - Frontend: static build served via S3 + CloudFront (or Netlify/Vercel), HTTPS enforced.
  - Backend: FastAPI on an AWS EC2 **GPU instance** (CUDA) behind an ALB; Uvicorn workers.
  - Database: Amazon RDS for PostgreSQL (automated backups, Multi-AZ option).
  - Storage: S3 bucket with SSE + versioning (D4).
  - Secrets: AWS Secrets Manager / environment variables — never in the repository.
- **Observability:** structured JSON logging, per-endpoint latency histograms (to verify the 1–2 s NF.4 budget), and rate-limit counters (C.5).

---

## Version

| Version | Last updated | Reason for change |
| --- | --- | --- |
| 1.0 | 29/08/26 | Initial implementation document, mapped to SRS & SA/SD design modules 0.1–0.5 |

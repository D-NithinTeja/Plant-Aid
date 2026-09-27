# Implementation Document — Real-Time Plant Disease Identification System

**Project:** Plant-Aid — Real-Time Plant Disease Identification through the Web
**Team:** DONTHULA NITHIN TEJA (241IT028), GHANTA BHAVANA SRI SAI (241IT029), YASH ROSHAN (241IT083)
**Department of Information Technology, National Institute of Technology Karnataka, Surathkal**

This document describes the implementation of the system module by module, following the module decomposition (0.1 – 0.5) defined in the Design Document (SA/SD methodology). Each module section maps its implementation artifacts back to the functional requirements (F.1 – F.6) and non-functional requirements (NF.1 – NF.5) of the SRS, and to the persistent data stores (D1 – D4) of the Data Dictionary.

---

## 1. Implementation Overview

> **Frontend status (28/09/26): the React application has been removed pending a rebuild.**
> Branch `frontend-cleanup` deletes `frontend/` so the UI can be redone from scratch; the design
> reference (per-screen HTML mockups, exported screenshots, `DESIGN.md`, logo) is preserved in
> `frontend_prototype/`. **Module 0.2, and every "UI shell" item below, is therefore unimplemented
> on this branch.** Modules 0.1 and 0.3–0.5 remain complete and tested, and the endpoint contracts
> in §8 define the interface the rebuild must satisfy.

### 1.1 Technology Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Frontend | *Removed pending rebuild* — previously React 19 + Vite + Tailwind CSS | Responsive GUI, camera capture, dashboards (Module 0.2) |
| Backend | Python 3.11+ / FastAPI | RESTful API layer, auth, orchestration |
| Machine Learning | PyTorch (CUDA-enabled) + `timm` | CNN inference (ConvNeXt-Tiny) for disease classification |
| Database | PostgreSQL (SQLite for local dev) | User accounts, disease/remedy master data, history logs |
| Object Storage | AWS S3 (via `boto3`), local-disk fallback | Raw frame/image storage |
| Auth | JWT (`pyjwt`, HS256), OTP via Twilio (SMS) / SendGrid (Email) / console (dev) | 2FA and token-based sessions |
| Tooling | `uv` (Python env, deps, scripts, tests) | Reproducible local and CI runs |
| Communications | HTTPS + REST (HTTP POST polling) | Client–server transport |

### 1.2 Repository / Project Structure

The tree below reflects the repository as implemented. Paths differ from the original
design sketch (flat modules instead of `core/`, `models/`, `schemas/` packages); they are
functionally equivalent and this document is the authority on the shipped layout.

```
Plant-Aid/
├── Docs/                          # SRS, design document, implementation doc, dev plan
├── frontend_prototype/            # UI design reference: HTML mockups, screenshots, DESIGN.md, logo
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app factory, CORS, router registration
│   │   ├── config.py              # Env-driven settings (DB URL, AWS keys, JWT secret, thresholds)
│   │   ├── security.py            # Password hashing, JWT issue/verify, OTP utilities
│   │   ├── database.py            # Session/engine setup
│   │   ├── models.py              # SQLAlchemy ORM models (users, diseases, remedies, history)
│   │   ├── schemas.py             # Pydantic request/response schemas
│   │   ├── limiter.py             # slowapi limiter keyed by JWT subject, IP fallback
│   │   ├── routers/
│   │   │   ├── auth.py            # Module 0.1 endpoints
│   │   │   ├── inference.py       # Module 0.3 endpoints
│   │   │   ├── remedy.py          # Module 0.4 endpoints
│   │   │   └── history.py         # Module 0.5 endpoints
│   │   └── services/
│   │       ├── otp_service.py     # Console / Twilio / SendGrid dispatch
│   │       ├── storage.py         # S3 upload, presigned URLs, local-disk fallback
│   │       ├── disease_lookup.py  # Shared disease-reference resolution (slug / numeric / name)
│   │       └── ml_engine.py       # Model load, tensor conversion, two-layer localization
│   ├── alembic/                   # Migrations for D1–D3
│   ├── ml/
│   │   ├── ml_config.py           # Class catalogue (single source of truth for class keys)
│   │   ├── train.py               # Offline training on the groundnut disease dataset
│   │   ├── evaluate.py            # Metrics, confusion matrix, error review
│   │   ├── gradcam.py             # Grad-CAM sample generation (offline / report figures)
│   │   ├── export.py              # Checkpoint → TorchScript artifact, emits labels.json
│   │   └── labels.json            # Class-index → disease mapping (emitted by export)
│   ├── seed.py                    # D2 seed: 6 groundnut classes + their remedies
│   ├── tests/                     # pytest suite (59 tests)
│   └── requirements.txt
└── README.md
```

**Not present:** `frontend/` (removed pending rebuild — see the status note above), and
`infra/docker-compose.yml` (scoped to Phase 7 of the development plan, still outstanding).

### 1.3 Cross-Cutting Implementation Decisions

- **REST over WebSockets:** Frames are polled via HTTP POST every 1–2 s using `setInterval` on the frontend (per SRS F.2), avoiding WebSocket state management.
- **Stateless auth:** Every endpoint that reads or writes user data requires a Bearer JWT issued only after a verified 2FA session (NF.3). That includes inference, remedy lookup, disease lookup, and history.
- **Environment-driven configuration:** Secrets (JWT secret, DB credentials, AWS keys, Twilio/SendGrid keys) are injected via environment variables, never hard-coded.
- **Rate limiting (C.5):** `slowapi` throttles inference (60/min) and login (10/min). The limiter keys on the JWT `sub` claim when a valid token is present and falls back to the client IP for anonymous callers.
- **MIME validation (C.6):** Enforced on both the client (file input `accept`) and the server by inspecting the payload's **magic bytes** (`FF D8 FF` for JPEG, `89 50 4E 47 0D 0A 1A 0A` for PNG) for a fixed allow-list of `image/jpeg` and `image/png`. The caller-supplied `Content-Type` and any data-URI prefix are treated as untrusted hints only.
- **Tooling standard:** `uv` is the mandated runner for Python environments, dependencies, scripts, and tests (`uv run python …`, `uv run pytest`). **Sanctioned exception:** `backend/ml/COLAB.md` documents a Google Colab training workflow that cannot use `uv`; plain `pip install` / `python` commands are correct there and only there.

---

## 2. Module 0.1 — User Registration & 2FA Authentication

**Designer:** GHANTA BHAVANA SRI SAI — **Requirements covered:** F.6, NF.3 — **Data store:** D1 (User DB)

### 2.1 Responsibility

User account creation, credential validation, mandatory two-factor authentication (SMS/Email OTP challenge–response), and issuance of a JWT access token on successful 2FA verification.

### 2.2 Implementation Details

1. **Registration (`Register User`)**
   - `POST /auth/register` accepts `registration-data = user-name + email-address + phone-number + password`.
   - Password is hashed with **bcrypt** (cost factor 12); the raw password is never stored or logged.
   - Uniqueness of email/phone is enforced in the service layer; a duplicate returns `409 Conflict`.
   - The resulting `user-account-record` (D1) is written with `is-2fa-enabled = true`, `account-status = active`, `created-at = now()`.

2. **Login, step 1 (`Verify Credentials`)**
   - `POST /auth/login` accepts `login-credentials = (email | phone) + password`.
   - bcrypt verify against the stored hash. On mismatch: generic `401` (no user-enumeration hints).

3. **Login, step 2 (`Initiate 2FA`)**
   - On credential success the server generates a cryptographically random 6-digit OTP (`secrets.randbelow`) and stores `active-2fa-otp` + `otp-expiry-time` (TTL = 5 min) on the user row (D1 fields `active-2fa-otp`, `otp-expiry-time`), along with an opaque single-use `session_id` (UUIDv4) and a `failed-otp-attempts` counter reset to 0.
   - The OTP is dispatched through the **`otp_service`** abstraction with three backends:
     - **Twilio SMS API** for phone numbers,
     - **SendGrid Email API** for email addresses,
     - **console** (default in local dev) which logs the code instead of sending it.
   - The response returns `{ session_id, expires_in, message }` — *not* a JWT, and *not* the internal `user_id`.
   - When `APP_DEBUG=true` the payload additionally echoes `otp_code_dev` so local and automated flows can complete without a live SMS/email provider. It is omitted in production (`APP_DEBUG=false`); see `backend/.env.example`.

4. **Login, step 3 (`Verify 2FA OTP`)**
   - `POST /auth/verify-2fa` accepts `2fa-security-otp = otp-code + session-id`. The `session_id` is the only lookup path — the client never needs to know the numeric user id.
   - Server compares the submitted code against the stored value (constant-time compare), checks expiry and single-use, then invalidates the stored OTP.
   - Failed attempts are capped (5 per session); the lockout attempt returns `401` with a lockout-specific message and invalidates the challenge.

5. **Token issuance (`Generate JWT Token`)**
   - On 2FA success the server builds `authenticated-jwt-token = token-type ("bearer") + access-token-string + expires-in + user-id` using `pyjwt` (HS256, secret from env).
   - Access-token TTL: 60 minutes; claims: `sub = user-id`, `iat`, `exp`.
   - A `GET /auth/me` endpoint lets the frontend validate the session and hydrate the dashboard. All three auth routes are additionally served under the `/api/auth/*` prefix.

### 2.3 Endpoint Summary

| Endpoint | Method | Input | Output / Errors |
| --- | --- | --- | --- |
| `/auth/register` | POST | registration-data | `201` user-id / `409` duplicate |
| `/auth/login` | POST | login-credentials | `200` {session-id, expires-in, message} / `401` bad credentials / `429` rate-limited |
| `/auth/verify-2fa` | POST | otp-code + session-id | `200` authenticated-jwt-token / `401` invalid, expired, or locked-out OTP |
| `/auth/me` | GET | Bearer JWT | `200` user profile / `401` invalid token |

### 2.4 Frontend Components

> **Removed pending rebuild.** The components below were deleted with `frontend/` on the
> `frontend-cleanup` branch and are listed here as the specification the rebuild must meet.

- `Register.jsx`, `Login.jsx`: form validation (email regex, phone format, password strength).
- `OTPEntry.jsx`: 6-digit input with countdown timer and resend control; on success stores the JWT in memory (+ refresh-safe storage) and routes to the dashboard.

---

## 3. Module 0.2 — Image Frame Capture & Preprocessing

**Designer:** GHANTA BHAVANA SRI SAI — **Requirements covered:** F.1, F.2, NF.1, NF.2

> **Status: unimplemented on this branch.** The entire module is client-side (browser camera +
> canvas capture), so removing `frontend/` removed it. Below is the specification for the rebuild,
> verified to match the endpoint the backend actually serves.

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
   - Server side re-validates (Module 0.3) by magic bytes — client checks are UX, not security.

4. **Preprocessing & resizing (`Preprocessing & Resizing Frame`)**
   - Canvas is drawn at a fixed **640×480** working resolution (aspect-preserving letterbox) to bound payload size (~100–200 KB/frame at JPEG q=0.8).
   - `preprocessed-frame-payload = mime-type + payload-encoding ("base64") + base64-image-string + capture-timestamp` (Data Dictionary §3.1.2) is sent as JSON.

5. **Transport (`Sending HTTP POST requests`)**
   - `POST /inference/frame` with `Authorization: Bearer <JWT>`, body: `{ "mime_type": "image/jpeg", "encoding": "base64", "image_b64": "...", "capture_timestamp": "..." }`.
   - Axios interceptor attaches the token; `401` responses trigger re-authentication flow.

### 3.3 Frontend Components

> **Removed pending rebuild.** Specification for the rebuild:

| Component | Role |
| --- | --- |
| `CameraStream.jsx` | getUserMedia lifecycle, video preview, error states |
| `FrameCapture.jsx` | canvas snapshot + interval loop + in-flight guard |
| `UploadPanel.jsx` | drag-and-drop / file-picker for manual JPEG/PNG upload (F.1) |
| `BoundingBoxOverlay.jsx` | absolutely-positioned leaf-ROI box + attention-heatmap layer, scaled from normalized [0,1] coords over the preview |

---

## 4. Module 0.3 — Real-Time PyTorch Model Inference

**Designer:** YASH ROSHAN — **Requirements covered:** F.3, NF.4 — **Data stores:** consumes D2 (labels), feeds D3/D4

### 4.1 Responsibility

Accept Base64/Blob frames over REST, decode and convert them to PyTorch float tensors, run the CNN forward pass on a CUDA GPU within the 1–2 s latency budget, and return the predicted disease class, confidence score, and bounding box coordinates.

### 4.2 Implementation Details

1. **Accept REST payload (`Accept REST Payload`)**
   - `POST /inference/frame` (FastAPI, async, **Bearer JWT required**). Pydantic schema validates `mime_type ∈ {image/jpeg, image/png}`; the server then verifies the decoded bytes against a JPEG/PNG **magic-byte allow-list** (C.6), and rate-limits at 60 requests/minute keyed by the JWT subject (C.5).
   - `POST /inference/predict` accepts a multipart upload or a form-encoded Base64 body, applies the same content sniffing, stores the frame (D4), and returns the same response contract with an `s3_storage_uri`. It deliberately does **not** write a history row — persistence happens only through the explicit `POST /history` call (§6.2).

2. **Decode & convert to tensor (`Convert Image to Tensor`)**
   - `base64.b64decode` → `BytesIO` → `PIL.Image.open().convert("RGB")`.
   - TorchVision transforms: `Resize((224, 224)) → ToTensor() → Normalize(ImageNet mean/std)` producing `image-tensor-matrix` with `tensor-shape = [1, 3, 224, 224]` (Data Dictionary §3.1.3) and `.to(device)` where `device = "cuda" if torch.cuda.is_available() else "cpu"` (C.3).
   - **No `CenterCrop` at inference:** the dataset is field-style imagery (leaf on a soil background) where lesions frequently sit near the frame edges — a center crop would amputate them. Direct resize is used instead; `RandomResizedCrop` remains a *training-only* augmentation.

3. **Model artifact**
   - CNN fine-tuned on the project's **groundnut disease dataset** (999 evaluated images, 256×256 RGB; six filename-labeled classes: `early_leaf_spot`, `early_rust`, `healthy_leaf`, `late_leaf_spot`, `nutrition_deficiency`, `rust` — see `plan.md` for the full audit). Backbone: **ConvNeXt-Tiny** (2022, "A ConvNet for the 2020s" — modern mainstream CNN), loaded ImageNet-pretrained via the `timm` library (`timm.create_model("convnext_tiny", pretrained=True, num_classes=6)`) with the classification head replaced for the groundnut class count. **EfficientNetV2-S** (2021) is trained as an ablation baseline for the report's model-comparison table. The dataset provides **image-level labels only** — no bounding-box annotations exist, which drives the localization strategy in step 5 below.
   - Training (`ml/train.py`): AdamW, label-smoothing cross-entropy, standard augmentation (random crop/flip/color jitter), warmup + cosine annealing, early stopping on validation F1; the best checkpoint is exported via `torch.jit.script` for low-overhead inference.
   - The class catalogue lives in **`ml/ml_config.py`** as the single source of truth; `ml/export.py` emits it to `labels.json` (`class-index → (disease-id, disease-name)`), consistent with D2 `disease-master-record`. The inference engine imports `ml_config` directly and prefers a runtime `labels.json` when one is present.
   - The model is loaded **once** at startup into a module-level singleton (`ml_engine.py`), set to `eval()` with `torch.inference_mode()`, never per-request. If the TorchScript artifact is absent the engine runs in **Groundnut Fallback Mode** (heuristic class assignment) instead of failing, so the API stays available in a fresh checkout.

4. **Forward pass & classification (`Disease Classification with Confidence Score`)**
   - Logits → `torch.softmax(dim=1)` → top-1 `(class-id, probability)`.
   - Confidence below a tuned threshold `τ = 0.55` sets `is_healthy_or_uncertain = true` so borderline frames are not logged as diseases.

5. **Bounding box formation (`Bounding Box Formation`)**
   - **Dataset constraint:** the groundnut corpus is labeled at image level only, so no true object detector can be trained from it. Localization is therefore a two-layer, training-free overlay:
   - **Layer 1 — leaf region of interest:** frames are field photographs (green leaf against brown soil), so an HSV green-dominance mask (`H 25–85, S 40–255, V 40–255`) followed by morphological cleanup and largest-connected-contour extraction yields a reliable `leaf-roi` box with no extra model and no annotation effort.
   - **Layer 2 — lesion-attention saliency:** an HSV hue-distance attention map is computed over the leaf ROI and thresholded; connected components inside the ROI yield `formated-bounding-box = x-min + y-min + x-max + y-max`, normalized to [0,1] so the frontend can scale it to any preview size. The UI renders the attention map inside the leaf ROI as a **"suspected infection region"** overlay — deliberately *not* described as lesion detection, since image-level labels cannot support that claim.
   - **Implementation note:** the shipped heuristic is a **hue-distance saliency map over the leaf ROI**, not gradient-weighted class activation. It shares Grad-CAM's role (a class-agnostic attention overlay) and its MAP output, and it keeps the CPU latency budget, but it does not use gradients. `ml/gradcam.py` implements true gradient-weighted CAM for offline sample generation and report figures. The distinction is recorded here so the artifact is not over-claimed.
   - **Optional upgrade path:** if crisper boxes are later required, hand-annotate leaf boxes for ~500–1,000 images (Roboflow/CVAT) and fine-tune YOLOv8n as a leaf detector feeding crops to this classifier. Out of scope for v1.

6. **Latency engineering (NF.4, 1–2 s window)**
   - GPU inference for a 224×224 single image is ~30–80 ms; the dominant costs are network + decode + CAM. Measured end-to-end target: ≤ 1.5 s per frame.
   - Optional optimizations: half-precision (`model.half()` on CUDA), `torch.jit.script` artifact, and a `torch.cuda.synchronize`-free async response path.

### 4.3 Response Contract

`POST /inference/frame` (and `POST /inference/predict`, which additionally populates
`s3_storage_uri`) return:

```json
{
  "disease_id": 1,
  "disease_name": "Groundnut Early Leaf Spot",
  "confidence": 0.89,
  "confidence_score": 0.89,
  "plant_species": "Groundnut (Arachis hypogaea)",
  "scientific_name": "Cercospora arachidicola",
  "bounding_box": { "x_min": 0.2, "y_min": 0.2, "x_max": 0.8, "y_max": 0.8 },
  "cam_heatmap_b64": "<base64 JPEG of the attention overlay>",
  "frame_id": "…",
  "is_healthy_or_uncertain": false,
  "s3_storage_uri": null,
  "remedies": [ { "title": "…", "description": "…", "category": "Chemical / Fungicide" } ],
  "diagnosis_timestamp": "…"
}
```

- `disease_id` is the **numeric** D2 `disease_id` (1–6). `confidence_score` is retained as an
  alias of `confidence` for the dashboard; both carry the same value.
- `POST /history` accepts the numeric id, the string form of it, the class slug
  (`early_leaf_spot`), or the disease name, and always persists the canonical slug.

### 4.4 Fallback Mode and Accuracy Claims

The engine never hard-fails on a missing artifact: with no TorchScript weights it assigns the
class deterministically from the leaf's colour statistics and sets `is_fallback`. Accuracy
claims in the report refer to the trained artifact (95.6% test accuracy, macro-F1 0.955 over
999 images); the fallback path exists only so the API, tests, and CI run without a ~90 MB
binary in the repository.

---

## 5. Module 0.4 — Treatment Recommendation Lookup

**Designer:** YASH ROSHAN — **Requirements covered:** F.4 — **Data store:** D2 (Disease & Remedy DB)

### 5.1 Responsibility

Given a predicted `disease-id`, query the persistent database and return the full set of remedies — organic/biological, chemical/fungicide, and preventive cultural practices — serialized for UI rendering.

### 5.2 Implementation Details

1. **Input (`Disease ID as Input`)**
   - `GET /remedies/{disease_id}` (**Bearer JWT required**). The lookup accepts the numeric `disease_id`, the slug key, or the disease name. The frontend calls this once per *stable* diagnosis — repeated frames of the same disease within a session do not re-query (client-side cache keyed by `disease_id`, TTL 10 min).
   - The catalogue reads `GET /diseases` and `GET /diseases/{disease_id}` are also JWT-guarded: they expose the same treatment data, so leaving them open would make the guard on `/remedies/{disease_id}` decorative.

2. **Query (`Query Persistent Database`)**
   - SQLAlchemy query joining `diseases` ↔ `remedies` (one-to-many); `language-preference` (optional query param) is accepted for contract compatibility and selects localized remedy text when localized rows exist. Only canonical (`en`) rows are seeded today, so the parameter currently has no observable effect — it is not silently ignored, just unfilled.

3. **Treatment records (`Extract Treatments from Database`)**
   - Each `treatment-tabs = remedy-id + disease-id + remedy-type + title + description + application-instructions`, with `remedy-type ∈ { "Organic / Biological", "Chemical / Fungicide", "Preventive Cultural Practice" }` (Data Dictionary §3.1.4).
   - Seed data: the remedy catalogue is populated per disease class from curated agricultural-extension sources during dataset preparation and loaded via an Alembic seed migration into D2.

4. **Serialization (`Serialize Treatment Data to Output to UI`)**
   - Pydantic response model emits `formatted-remedy-payload = disease-name + confidence-score + formated-bounding-box + { treatment-record }*`, grouped by remedy-type so the UI can render three tabs directly.

### 5.3 Frontend Rendering

> **Removed pending rebuild.** Specification for the rebuild:

`RemedyTabs.jsx` renders three tabs (Organic / Chemical / Preventive); each record shows title, description, and application instructions; chemical records additionally display any safety notes stored in the description field.

---

## 6. Module 0.5 — Disease History & Media Storage Management

**Designer:** DONTHULA NITHIN TEJA — **Requirements covered:** F.5, NF.5 — **Data stores:** D3 (History Log), D4 (AWS S3)

### 6.1 Responsibility

Persist every confirmed diagnosis: upload the raw frame to AWS S3, extract its object URI, and append a history record to PostgreSQL; expose a per-user history dashboard.

### 6.2 Implementation Details

1. **Upload raw frame to AWS S3 (`Upload Raw Frame to AWS S3`)**
   - `services/storage.py` (boto3, credentials from env/IAM role) executes `put_object` with `s3-upload-payload = bucket-name + object-key + mime-type + raw-image-binary + server-side-encryption (AES256)`.
   - Object key layout: `frames/{user_id}/{yyyy}/{mm}/{dd}/{frame_id}.{jpg|png}` — user-scoped, time-partitioned, collision-free.
   - When S3 credentials are absent or the upload raises, the service falls back to local disk under the same hierarchy and returns `/uploads/...`, so development and CI work without AWS.

2. **Extract object URI (`Extract Object URI`)**
   - The service composes `s3-storage-uri = s3://{bucket}/{object-path-key}` and stores *the URI*, not the binary, in PostgreSQL (D3) — matching the Data Dictionary separation of D3 (metadata) and D4 (media).
   - History-dashboard thumbnails are served via **time-limited presigned GET URLs** (15-min expiry) rather than public buckets.

3. **Write history log record (`Write History Log Record`)**
   - Persistence is **explicit only**: `POST /inference/predict` uploads the frame and returns its URI, but creates no row. The record is written when the user confirms with `POST /history` — a "Save diagnosis" action — which is what keeps polled frames from spamming the dashboard.
   - The write stores `diagnosis-log-record = log-id + user-id + disease-id + disease-name + confidence-score + s3-storage-uri + (bounding-box-json) + diagnosis-timestamp` into D3, and returns `201` with `history-log-confirmation = log-id + status-flag + timestamp`.
   - The disease reference is normalized to the canonical slug and validated against D2; an unknown reference returns `422` rather than being stored as free text.
   - The write is transactional (SQLAlchemy session). If the commit raises, the already-uploaded media object is deleted (compensation) and the API returns `500`, so no orphaned object is left behind.

4. **History dashboard (`Create History Dashboard Table`)**
   - `GET /history` (paginated, newest-first, filterable by disease/date-range) joins D3 with D2 to enrich each row with the human-readable disease name; `GET /history/{log_id}` serves the detail view and `DELETE /history/{log_id}` removes an entry.
   - `HistoryTable.jsx` renders the table with thumbnail (presigned URL), disease, confidence, and timestamp; a detail view shows the stored bounding box overlaid on the archived image.

### 6.3 Retention & Reliability

- History rows are **never hard-deleted**: `DELETE /history/{log_id}` sets a `deleted_at` marker, hides the row from every read path (list, count, detail) and deletes the media object, satisfying NF.5 (persistent, reliable record keeping).
- Backend failures between S3 upload and DB write are handled with a compensation step: if the DB write fails, the orphaned media object is deleted as part of the failing request rather than left to a background task.

---

## 7. Persistent Data Store Schemas (as implemented)

Implemented in PostgreSQL via SQLAlchemy ORM + Alembic migrations (logical definitions from Design Document §3.2):

**D1 — User DB (`users` table)**
`user_id (PK, integer) | user_name | email_address (unique) | phone_number (unique, nullable) | password_hash (bcrypt) | is_2fa_enabled (bool) | active_2fa_otp (nullable) | active_session_id (nullable, uuid) | otp_expiry_time (nullable) | failed_otp_attempts (int, default 0) | account_status | created_at`

**D2 — Disease & Remedy DB (`diseases` + `remedies` tables)**
- `diseases`: `id (PK, slug e.g. 'early_leaf_spot') | numeric_id (unique 1–6) | plant_species | disease_name | scientific_name | severity_level`
- `remedies`: `id (PK) | disease_id (FK → diseases.id) | category | title | description | application_instructions`
- Seeded catalogue: 6 groundnut classes and 17 remedy rows (3 per disease class; `healthy_leaf` carries 2 — biological + cultural, no chemical).

**D3 — Disease History Log (`disease_history_logs` table)**
`id (PK, integer) | user_id (FK → users.id) | disease_id (FK → diseases.id, canonical slug) | disease_name | confidence_score (float) | s3_storage_uri (text) | bounding_box_json (jsonb, nullable) | diagnosis_timestamp (timestamptz) | deleted_at (nullable — soft-delete marker)`

**D4 — AWS S3 Object Storage** (no relational schema)
`{object-path-key} + raw-image-binary + content-type + upload-metadata` under the bucket named by `S3_BUCKET_NAME`, with server-side encryption (SSE-S3, `AES256`) on every upload.

---

## 8. API Surface Summary

The table lists every route the application actually serves. Rows marked *(alias)* are the
additional prefixes registered in `main.py` and are functionally identical to the canonical path.

| # | Endpoint | Module | Auth | Purpose |
| --- | --- | --- | --- | --- |
| 1 | `POST /auth/register` | 0.1 | none | Create account → `201` / `409` |
| 2 | `POST /auth/login` | 0.1 | none | Verify credentials → 2FA challenge (`200` / `401` / `429`) |
| 3 | `POST /auth/verify-2fa` | 0.1 | challenge session | Verify OTP → JWT (`200` / `401`) |
| 4 | `GET /auth/me` | 0.1 | JWT | Session validation |
| 5 | `POST /inference/frame` | 0.3 | JWT | Classify one Base64 frame (`200` / `400` / `401` / `429`) |
| 6 | `POST /inference/predict` | 0.3 | JWT | Classify an uploaded frame, store it, return its URI (writes no history) |
| 7 | `GET /remedies/{disease_id}` | 0.4 | JWT | Treatment recommendations for one disease (`language` param optional) |
| 8 | `GET /remedies` | 0.4 | JWT | List / search the remedy catalogue |
| 9 | `GET /diseases` | 0.4 | JWT | List the disease catalogue with remedies |
| 10 | `GET /diseases/{disease_id}` | 0.4 | JWT | One disease record with remedies |
| 11 | `POST /history` | 0.5 | JWT | Explicitly log a confirmed diagnosis → `201` / `422` |
| 12 | `GET /history` | 0.5 | JWT | Paginated history dashboard |
| 13 | `GET /history/{log_id}` | 0.5 | JWT | One history record with a presigned media URL |
| 14 | `DELETE /history/{log_id}` | 0.5 | JWT | Soft-delete an entry and its media → `204` |
| 15 | `GET /health` | — | none | Liveness probe |
| — | `/api/auth/*`, `/api/inference/*`, `/api/history*`, `/api/remedies*`, `/api/diseases*` | all | as above | *(alias)* identical handlers under the `/api` prefix |

---

## 9. Requirement Traceability Matrix

| Requirement | Implementing Module(s) | Key Artifacts |
| --- | --- | --- |
| F.1 Image capture/upload | 0.2 | *Removed (UI)* — `CameraStream`, `UploadPanel`, getUserMedia integration to be rebuilt |
| F.2 Near real-time stream analysis | 0.2 + 0.3 | *Client removed (UI)* — capture loop to be rebuilt; server side (`POST /inference/frame`) complete |
| F.3 Disease classification | 0.3 | `ml_engine.py`, ConvNeXt-Tiny (+ EfficientNetV2-S ablation); localization is Layer-1 HSV leaf ROI + Layer-2 hue-distance lesion attention (see §4.2 step 5) |
| F.4 Treatment recommendations | 0.4 | `GET /remedies/{disease_id}` (JWT), D2 seed data; `RemedyTabs` to be rebuilt |
| F.5 Disease history logging | 0.5 | `services/storage.py`, D3 writes, `GET /history`, soft delete |
| F.6 Two-factor authentication | 0.1 | OTP service (console/Twilio/SendGrid), session-scoped challenge, JWT issuance |
| NF.1 Platform (desktop + mobile web) | 0.2 | *Removed (UI)* — responsive layout and rear-camera `facingMode` to be rebuilt |
| NF.2 Browser support | 0.2 | *Removed (UI)* — MediaDevices/canvas APIs to be rebuilt |
| NF.3 Secure API access | 0.1 + all | JWT guard dependency on every data route, HTTPS everywhere |
| NF.4 Performance (1–2 s) | 0.3 | TorchScript artifact, CPU/GPU device fallback, per-user rate limiting |
| NF.5 Reliability of storage | 0.5 | Transactional D3 writes, soft-delete retention, SSE-S3, upload compensation |

**Requirements currently unmet:** F.1, F.2 (client half), NF.1, and NF.2 — all dependent on the
Module 0.2 rebuild. Every server-side requirement (F.3–F.6, NF.3–NF.5) is implemented and tested.

---

## 10. Deployment & Environments

- **Local development:** the backend runs directly under `uv` (`uv run uvicorn app.main:app --reload`, port 8000) against SQLite by default, with ML inference in CPU mode. **There is no frontend dev server on this branch**; until Module 0.2 is rebuilt, drive the API from Swagger UI (`/docs`) or `curl`. `infra/docker-compose.yml` (PostgreSQL + backend + frontend) is scoped to Phase 7 and is not in the repository.
- **Cloud (production):**
  - Frontend: *pending rebuild* — planned as a static build served via S3 + CloudFront (or Netlify/Vercel) with HTTPS enforced.
  - Backend: FastAPI on an AWS EC2 instance with a CUDA GPU behind an ALB; Uvicorn workers.
  - Database: Amazon RDS for PostgreSQL (automated backups, Multi-AZ option).
  - Storage: S3 bucket with SSE + versioning (D4).
  - Secrets: AWS Secrets Manager / environment variables — never in the repository.
- **Observability:** structured logging (`plant_aid.*` loggers), per-endpoint latency measurement (to verify the 1–2 s NF.4 budget), and rate-limit counters (C.5).

---

## Version

| Version | Last updated | Reason for change |
| --- | --- | --- |
| 1.0 | 29/08/26 | Initial implementation document, mapped to SRS & SA/SD design modules 0.1–0.5 |
| 1.1 | 28/09/26 | Realigned with the shipped code: actual module layout and libraries (`pyjwt`, `services/storage.py`), JWT requirement on all data routes, session-only 2FA challenge, explicit-only history persistence, soft-delete retention, SSE-S3 uploads, and an honest description of the two-layer localization (hue-distance attention rather than gradient-weighted CAM). |
| 1.2 | 28/09/26 | Frontend removed on branch `frontend-cleanup` pending a from-scratch rebuild. Module 0.2, the UI sub-sections of 0.1/0.4, and requirements F.1, F.2 (client half), NF.1, NF.2 are marked unimplemented; `frontend_prototype/` is retained as the design reference. |

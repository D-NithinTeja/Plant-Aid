# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite + Tailwind CSS frontend (Phase 8 rebuild) paired with an existing Python FastAPI backend (Python 3.12+, uv, PyTorch ConvNeXt-Tiny, OpenCV HSV saliency, SQLite/PostgreSQL with SQLAlchemy & Alembic, SlowAPI, AWS S3).

## Users

Primary users are farmers, agronomists, and agricultural extension workers inspecting crops in outdoor fields, orchards, and greenhouses who require rapid on-the-spot disease identification and actionable treatment advice. Secondary users include agricultural university students and plant pathology researchers evaluating disease symptoms, model accuracy, and calibration thresholds.

## Product Purpose

Plant-Aid delivers real-time, edge-ready crop diagnostic and treatment advisory intelligence to minimize crop damage, prevent agricultural yield loss, and foster sustainable farming practices. Success is measured by a field worker's ability to scan crop foliage with a mobile camera, receive an accurate, calibrated diagnosis with localized lesion attention within seconds, and immediately execute appropriate organic, chemical, or cultural interventions.

## Positioning

Unlike generic plant identification apps that require static cloud uploads and output uncalibrated label guesses, Plant-Aid couples near real-time camera streaming with a two-layer training-free leaf/lesion saliency overlay (OpenCV HSV green-dominance + hue-distance) and a calibrated ConvNeXt-Tiny classifier with an explicit confidence threshold (τ = 0.55). It actively flags ambiguous or healthy foliage rather than outputting false disease alarms, and backs every diagnosis with structured organic, chemical, and cultural management plans aligned with verified agronomic catalogs.

## Operating Context

Outdoor agricultural fields and greenhouses under direct sunlight, variable glare, heat, dust, and spotty mobile network connectivity. The primary device form factor is a handheld mobile smartphone with a rear camera (WebRTC environment-facing video stream or manual photo capture). Key workflows include walking crop rows, scanning affected foliage, logging confirmed diagnoses to history, reviewing previous outbreak records, and consulting remedy checklists during field spraying or cultural intervention.

## Capabilities and Constraints

- Capabilities:
  - Near real-time frame inference via WebRTC camera streaming (1.5s interval polling loop with in-flight overlap guard).
  - High-resolution single image upload (JPEG/PNG magic-byte validated).
  - Two-layer localization overlay: HSV green leaf mask ROI + hue-distance saliency infection map.
  - 6 calibrated groundnut disease classes: `early_leaf_spot`, `early_rust`, `healthy_leaf`, `late_leaf_spot`, `nutrition_deficiency`, `rust`.
  - Confidence threshold calibration (τ = 0.55) to mark low-confidence or healthy frames (`is_healthy_or_uncertain: true`).
  - Actionable remedies partitioned into 3 distinct categories: Organic / Biological, Chemical / Fungicide, and Cultural / Preventive.
  - History tracking with paginated logs, search/filters, soft deletion (`deleted_at`), and detail inspection.
  - Secure authentication with 2FA OTP challenge (SMS/SendGrid/console) and JWT bearer enforcement on all data endpoints.
- Constraints:
  - Mobile web browser WebRTC camera access (`navigator.mediaDevices.getUserMedia`) requiring HTTPS or localhost.
  - Server-side rate limits (60 req/min for inference, 10 req/min for auth).
  - Explicit persistence model: diagnoses are saved to history only via explicit user action (`POST /api/history`), never implicitly on frame capture.
  - Offline limitations: backend inference requires network connectivity (HTTP POST to FastAPI).

## Brand Commitments

- Brand Name: Plant-Aid (Plant-Aid Enterprise).
- Voice & Tone: Authoritative, clinical, dependable, agricultural, and clear. Grounded in agronomic rigor rather than decorative tech jargon.
- Core Identity Assets:
  - Brand logo at [frontend_prototype/plant_aid_logo/Logo.png](file:///c:/Users/saibh/Documents/Plant-Aid/frontend_prototype/plant_aid_logo/Logo.png).
  - UI design reference mockups, HTML prototypes, and tokens in [frontend_prototype/](file:///c:/Users/saibh/Documents/Plant-Aid/frontend_prototype/).

## Evidence on Hand

- 59 passing automated backend tests covering auth, 2FA lockout, rate limiting, S3 storage, ML inference, and remedies.
- Fully functional, independently runnable FastAPI backend (`uv run uvicorn app.main:app`).
- Complete database migrations and seeds with 6 verified groundnut disease classes.
- Offline Grad-CAM pipeline (`backend/ml/gradcam.py`) and labeled test fixtures.
- Prototype screens and design tokens in [frontend_prototype/](file:///c:/Users/saibh/Documents/Plant-Aid/frontend_prototype/).
- Real crop disease dataset references (Saon Multi-Crop Dataset / groundnut subsets).
- Absence note: Do not fabricate synthetic farmer testimonials, artificial customer counts, or fictitious certifications.

## Product Principles

1. Diagnostic Rigor Over Guesswork: Never present speculative predictions as certain; calibrate against τ = 0.55 and clearly distinguish healthy foliage and low-confidence ambiguity from confirmed pathology.
2. Field-First Ergonomics: High-contrast daylight readability, large touch targets, seamless single-hand camera operation, and resilient handling of intermittent network latency.
3. Actionable Agronomy: A diagnosis without a remedy is useless; every detected condition must provide distinct, accessible organic, chemical, and cultural guidance.
4. User-Governed Persistence: History is an intentional farm record; diagnoses are only permanently stored when the user explicitly chooses to log them.

## Accessibility & Inclusion

- High outdoor contrast ratios (WCAG AAA wherever possible for critical text and alert badges under direct sunlight).
- Color-blind accessible disease status indicators (relying on icons, shapes, and clear labels, never color alone to distinguish healthy vs diseased).
- Scalable, legible typography (minimum 16px body on mobile) with tactile tap targets (minimum 44×44px touch areas).

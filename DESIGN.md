# Design System

<!-- impeccable:design-schema 1 -->

## Direction

Plant-Aid Field Vision is a high-contrast, edge-ready agricultural design system crafted for outdoor fieldwork, direct sunlight readability, and rapid diagnostic confidence. It refuses generic dark-mode crypto aesthetics and washed-out pastel cards in favor of deep foliage greens, tactical monochrome framing, and unambiguous status indicators.

## Palette & Surface Strategy

- **Strategy:** Committed (Forest emeralds anchor navigation and brand identity; vibrant leaf greens indicate healthy baselines; high-visibility amber and crimson mark uncertain vs confirmed pathological conditions).
- **Core Tokens:**
  - `primary` / `agri-950`: `#052e16` (Deep botanical forest)
  - `primary-surface` / `agri-900`: `#14532d`
  - `primary-action` / `agri-700`: `#15803d`
  - `primary-accent` / `agri-500`: `#22c55e` (Active scanning radar, healthy badge)
  - `soil-amber`: `#d97706` / `#b45309` (Calibration threshold τ = 0.55 warnings)
  - `pathogen-red`: `#ef4444` / `#b91c1c` (Confirmed lesion bounding boxes and infection alerts)
  - `surface-bg`: `#f8fafc` (Slate 50 clean neutral backdrop)
  - `surface-card`: `#ffffff` (White container with crisp 1px `#e2e8f0` border)
  - `text-high-contrast`: `#0f172a` (Slate 900, 14:1+ contrast against white)
  - `text-secondary`: `#475569` (Slate 600)

## Typography

- **Body & Headings:** `Inter`, system-ui, sans-serif
  - `heading-xl`: 40px–48px / 1.1 / font-extrabold / tracking-tight
  - `heading-lg`: 28px–32px / 1.2 / font-extrabold / tracking-tight
  - `heading-md`: 20px–24px / 1.3 / font-bold
  - `heading-sm`: 16px–18px / 1.4 / font-bold
  - `body-base`: 14px–16px / 1.5 / font-normal (minimum 16px input fields to avoid mobile zoom)
  - `body-sm`: 12px–13px / 1.5 / font-normal
- **Telemetry & Confidence:** `JetBrains Mono`, ui-monospace, monospace
  - Used for model probabilities, bounding box coordinates, timers, and disease slug identifiers.

## Component Language

- **Touch Ergonomics:** All buttons, interactive toggles, and navigation elements enforce a minimum 44×44px physical touch target (`touch-target` class).
- **Two-Layer Overlay:** Normalized bounding boxes (`0.0`–`1.0`) scale fluidly over camera viewports with distinct border colors:
  - 🟢 Emerald (`border-emerald-500`): Healthy Foliage
  - 🔴 Crimson (`border-red-500`): Confirmed Disease Lesion
  - 🟡 Amber (`border-amber-500`): Ambiguous / Low Confidence (τ < 0.55)
- **Scanning Motion:** A subtle, continuous vertical radar sweep (`animate-radar`) communicates active WebRTC video sampling every 1.5s.
- **Explicit Persistence Ritual:** Diagnosis records are persisted exclusively through an active, high-visibility "Save Diagnosis to History" action with celebratory micro-feedback, preventing accidental log spamming.

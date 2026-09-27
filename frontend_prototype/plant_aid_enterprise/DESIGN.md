---
name: Plant-Aid Enterprise
colors:
  surface: '#f9f9f7'
  surface-dim: '#dadad8'
  surface-bright: '#f9f9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f2'
  surface-container: '#eeeeec'
  surface-container-high: '#e8e8e6'
  surface-container-highest: '#e2e3e1'
  on-surface: '#1a1c1b'
  on-surface-variant: '#414844'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#1b4332'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#2c694e'
  on-secondary: '#ffffff'
  secondary-container: '#aeeecb'
  on-secondary-container: '#316e52'
  tertiary: '#382102'
  on-tertiary: '#ffffff'
  tertiary-container: '#513614'
  on-tertiary-container: '#c69f74'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#b1f0ce'
  secondary-fixed-dim: '#95d4b3'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#0e5138'
  tertiary-fixed: '#ffddb9'
  tertiary-fixed-dim: '#e9bf92'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#5e411e'
  background: '#f9f9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e1'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system synthesizes high-performance developer tooling aesthetics—characterized by absolute precision, stark clarity, and uncompromising efficiency—with the grounded, living reality of modern agronomy. The visual language evokes reliability, technical sophistication, and immediate outdoor legibility. 

The aesthetic is tailored to evoke calm, clinical authority balanced with organic warmth. The UI avoids unnecessary ornamentation, favoring dense, information-rich interfaces where every pixel serves the critical path of agricultural diagnosis and enterprise management.

## Colors

The palette is anchored by a warm, paper-like off-white background that reduces glare under direct sunlight, paired with deep botanical greens for primary actions and structural hierarchy. 

Restrained earth tones provide context and secondary categorization, while semantic colors are strictly reserved for crop health status, disease severity metrics, and diagnostic confidence scores. High contrast ratios are maintained across all operational states to ensure field readability on mobile devices.

## Typography

Typography prioritizes absolute legibility under variable outdoor lighting conditions. A clean, neutral grotesque handles all editorial and structural reading scales, paired with a precise monospace font for telemetry, confidence intervals, timestamp data, and severity metrics. 

For viewports under 768px, scale down headlines proportionally (`headline-xl` collapses to 28px) to prevent awkward wrapping of critical enterprise data points.

## Layout & Spacing

The layout is built on a responsive 12-column fluid grid system designed for high-density agricultural dashboards, data tables, and field-capture interfaces. 

Spacing follows a strict 4px/8px baseline rhythm. On mobile viewports, margins collapse to 1rem and the grid reflows into a single-column stack, prioritizing immediate access to camera capture tools and high-severity diagnostic alerts.

## Elevation & Depth

Visual hierarchy relies on low-contrast outlines and tonal surface layering rather than heavy drop shadows. 

Surfaces use subtle ghost borders (`#E5E5DF`) to delineate structural boundaries, combined with micro-tints against the warm background to indicate elevation steps. This flat, high-precision approach prevents visual noise and maintains crisp rendering across high-PPI mobile and tablet screens used in the field.

## Shapes

A restrained, soft geometry (`0.25rem` base border radius) creates a modern enterprise feel. 

Containers, cards, and inputs feature tight, purposeful corners that balance industrial utility with approachable digital ergonomics. Interactive elements maintain clear, unambiguous hit targets without appearing overly playful or rounded.

## Components

### Buttons
Primary buttons utilize the deep botanical green (`#1B4332`) with crisp text, featuring a subtle color shift on hover. Secondary and ghost variants rely on tonal borders (`#E5E5DF`) and transparent backgrounds to minimize visual clutter in dense data views.

### Chips & Badges
Utilize monospace typography for severity scores and confidence intervals. Severity states (low, moderate, severe) are mapped directly to semantic earth-tone and warning accents with soft background fills.

### Lists & Tables
Data-dense tables feature hairline row dividers, tight vertical padding, and right-aligned numeric telemetry. Rows support subtle hover states for quick scanning across large field datasets.

### Checkboxes & Radios
Custom-styled with sharp geometry, using primary botanical green for checked states and neutral borders for unchecked outlines.

### Input Fields
Clean, bordered inputs featuring persistent top-aligned labels in monospace text. Focus states trigger a crisp botanical green outline with zero layout shift.

### Cards
Contained within subtle single-pixel borders and light surface tints. Used primarily to group diagnostic telemetry, historical field scans, and treatment recommendations.

### Additional Components
- **Confidence Meters:** Linear progress indicators paired with monospace percentage readouts for real-time AI disease identification.
- **Field Status Banners:** Full-width alert bars pinned to top views for urgent phytosanitary warnings.
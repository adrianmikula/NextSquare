# Dimension: Typography

## Purpose

Controls font pairing, modular scale, weight distribution, letter spacing, heading transformation, and the curated font library available for use.

## Spec Schema

| Field | Type | Description |
|-------|------|-------------|
| `headingFont` | string | Google Font name for headings |
| `bodyFont` | string | Google Font name for body text |
| `headingWeight` | number | Font weight for headings |
| `bodyWeight` | number | Font weight for body text |
| `headingCase` | enum | `normal`, `uppercase`, `small-caps` |
| `letterSpacing` | string | CSS letter-spacing value |
| `lineHeight` | number | CSS line-height multiplier |
| `scale` | number | Modular scale ratio for type hierarchy |

## Variant Differences

| Field | Variant A | Variant B |
|-------|-----------|-----------|
| `headingFont` | `Nunito` | `Playfair Display` |
| `bodyFont` | `Inter` | `Lora` |
| `headingWeight` | `700` | `600` |
| `bodyWeight` | `400` | `300` |
| `headingCase` | `uppercase` | `normal` |
| `letterSpacing` | `normal` | `0.02em` |
| `lineHeight` | `1.6` | `1.5` |
| `scale` | `1.25` | `1.2` |

## CSS Custom Properties Compiled

| Property | Source field(s) | Example value |
|----------|----------------|---------------|
| `--font-heading` | `headingFont` | `'Inter', sans-serif` |
| `--font-body` | `bodyFont` | `'Inter', sans-serif` |
| `--font-heading-weight` | `headingWeight` | `600` |
| `--font-body-weight` | `bodyWeight` | `400` |
| `--text-transform-heading` | `headingCase` | `none`, `uppercase`, `small-caps` |
| `--letter-spacing` | `letterSpacing` | `normal`, `0.02em` |
| `--line-height` | `lineHeight` | `1.5` |
| `--typography-scale` | `scale` | `1.25` |

## Allowed Values

- `headingFont`, `bodyFont`: any font family name (string). Preloaded via next/font and available as CSS variables:
  - **Inter** — modern sans-serif, variable `--font-inter`
  - **Nunito** — rounded friendly sans-serif, variable `--font-nunito`
  - **Playfair Display** — elegant serif, variable `--font-playfair`
  - **Lora** — readable serif for body text, variable `--font-lora`
  - **DM Sans** — clean geometric sans-serif, variable `--font-dm-sans`
  - **Fraunces** — soft old-style serif, variable `--font-fraunces`
  - **Space Grotesk** — modern monospace-adjacent sans, variable `--font-space-grotesk`
  - **Instrument Sans** — friendly humanist sans, variable `--font-instrument-sans`
- Fonts not in the preloaded set fall back to `'FontName', sans-serif` without a CSS variable.
- `headingWeight`: 300, 400, 500, 600, 700, 800
- `bodyWeight`: 300, 400, 500
- `headingCase`: `normal`, `uppercase`, `small-caps`
- `letterSpacing`: any valid CSS letter-spacing value (`normal`, `-0.02em`, `0.05em`, etc.)
- `lineHeight`: number 1.0–2.0
- `scale`: number 1.0–1.5 (modular scale ratio)

## Implementation

**File:** `lib/dimensions/compile.ts — compileTypography()`

Uses `FONT_VAR_MAP` to resolve known font names to CSS variables. Unknown fonts fall back to raw `'FontName', sans-serif`.

Supports both flat and nested field access patterns for backward compatibility:
- `headingFont` → `spec.headingFont ?? heading?.font`
- `headingWeight` → `lookupNumber(spec, ['headingWeight', 'heading.weight'], 600)`
- `bodyWeight` → `lookupNumber(spec, ['bodyWeight', 'body.weight'], 400)`
- `letterSpacing` → `spec.letterSpacing ?? heading?.tracking`
- `lineHeight` → `spec.lineHeight ?? body?.leading`
- `headingCase` uses a ternary to map to CSS `text-transform` values

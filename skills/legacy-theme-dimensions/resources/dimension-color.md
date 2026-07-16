# Dimension: Color

## Purpose

Controls the colour harmony model, palette hues, background type, and application strategy — the most visually impactful dimension.

## Spec Schema

| Field | Type | Description |
|-------|------|-------------|
| `harmony` | enum | `analogous`, `complementary`, `monochromatic`, `triadic`, `split-complementary` |
| `chroma` | enum | `muted`, `warm`, `cool`, `vibrant`, `pastel` |
| `backgroundType` | enum | `color`, `gradient`, `texture`, `image`, `video` |
| `backgroundValue` | string | CSS value for the chosen background type (hex, gradient function, texture class, image URL, video URL) |
| `palette.primary` | hex | Main brand colour — CTAs, icons, key headings |
| `palette.secondary` | hex | Background wash for tinted sections |
| `palette.background` | hex | Page-level background |
| `palette.surface` | hex | Card, modal, elevated surfaces |
| `palette.text` | hex | Primary text colour |
| `palette.accent` | hex | Highlight, callout, decorative colour |
| `palette.border` | hex | Default border colour |

## Variant Differences

| Field | Variant A | Variant B |
|-------|-----------|-----------|
| `harmony` | `analogous` | `monochromatic` |
| `chroma` | `warm` | `muted` |
| `backgroundType` | `gradient` | `color` |
| `backgroundValue` | `linear-gradient(180deg, #FFFAF5 0%, #F5E6D3 100%)` | `#FAFAFA` |
| `palette.primary` | `#D4845A` | `#5D4037` |
| `palette.secondary` | `#FFF0E0` | `#EFEBE9` |
| `palette.background` | `#FFFAF5` | `#FAFAFA` |
| `palette.surface` | `#FFFFFF` | `#FFFFFF` |
| `palette.text` | `#2C1810` | `#212121` |
| `palette.accent` | `#E8A87C` | `#A1887F` |
| `palette.border` | `#E8D5C4` | `#D7CCC8` |

## CSS Custom Properties Compiled

| Property | Source field(s) | Example value |
|----------|----------------|---------------|
| `--color-primary` | `palette.primary` | `#D4845A` |
| `--color-secondary` | `palette.secondary` | `#FFF0E0` |
| `--color-background` | `palette.background` | `#FFFAF5` |
| `--color-surface` | `palette.surface` | `#FFFFFF` |
| `--color-text` | `palette.text` | `#2C1810` |
| `--color-accent` | `palette.accent` | `#E8A87C` |
| `--color-border` | `palette.border` | `#E8D5C4` |
| `--color-amber-600/700/900` | primary | Mapped for Tailwind compatibility |
| `--color-amber-400` | accent | Mapped for Tailwind compatibility |
| `--color-amber-50/100` | secondary | Mapped for Tailwind compatibility |
| `--color-stone-50` | background | Mapped for Tailwind compatibility |
| `--color-stone-100` | surface | Mapped for Tailwind compatibility |
| `--color-stone-900/700/600/500/400/200` | text / border | Mapped for Tailwind compatibility |
| `--color-harmony` | `harmony` | `analogous` |
| `--color-chroma` | `chroma` | `warm` |
| `--color-background-type` | `backgroundType` | `color`, `gradient`, `texture`, `image`, `video` |
| `--color-background-value` | `backgroundValue` | CSS value for the background |

## Allowed Values

- `harmony`: `analogous`, `complementary`, `monochromatic`, `triadic`, `split-complementary`
- `chroma`: `muted`, `warm`, `cool`, `vibrant`, `pastel`
- `backgroundType`: `color`, `gradient`, `texture`, `image`, `video`
- `backgroundValue`: any valid CSS value appropriate for the type:
  - `color`: hex or named colour
  - `gradient`: CSS gradient function (e.g. `linear-gradient(...)`)
  - `texture`: class name or URL referencing a texture asset
  - `image`: URL to an image
  - `video`: URL to a video
- Palette fields: any valid hex colour (`#RRGGBB`)

## Implementation

**File:** `lib/dimensions/compile.ts — compileColor()`

Uses `resolveColor()` helper that accepts either a string (hex) or object (`{ value, hex, light }`). Each palette colour has a hardcoded fallback from config. Maps all 6 palette colours to both semantic `--color-*` variables and Tailwind-compatible `--color-amber-*` / `--color-stone-*` variables for backward compatibility with existing component classes.

Background type is extracted directly from `spec.backgroundType` (defaults to `"color"`) and `spec.backgroundValue` (defaults to the resolved background hex). Emitted as `--color-background-type` and `--color-background-value` CSS custom properties.

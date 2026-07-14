# Dimension: Page-Layout

## Purpose

Controls high-level page structure — hero layout style, navigation variant, section container treatment, card visual style, and footer layout. This dimension defines the architectural DNA of each page, independent of spatial sizing or color.

## Spec Schema

| Field | Type | Description |
|-------|------|-------------|
| `heroVariant` | enum | `fullscreen`, `split`, `overlay`, `minimal` |
| `navVariant` | enum | `floating`, `sidebar`, `hamburger`, `top-bar`, `bottom-bar` |
| `sectionContainer` | enum | `alternating`, `bordered`, `seamless`, `cards` |
| `cardVariant` | enum | `elevated`, `flat`, `outlined` |
| `footerVariant` | enum | `columns`, `minimal`, `social`, `simple`, `centered` |
| `componentOverrides` | object (optional) | Maps block type names to alternative component names. Overrides the default component-to-block-type mapping in the component registry. E.g. `{ "hero": "video-hero", "testimonials": "carousel-testimonials" }` references pre-registered components. See `lib/component-registry.ts`. |

## Variant Differences

| Field | Variant A | Variant B | Variant C |
|-------|-----------|-----------|-----------|
| `heroVariant` | `fullscreen` | `split` | `overlay` |
| `navVariant` | `floating` | `sidebar` | `hamburger` |
| `sectionContainer` | `alternating` | `bordered` | `seamless` |
| `cardVariant` | `elevated` | `flat` | `outlined` |
| `footerVariant` | `columns` | `minimal` | `social` |

All 5 fields are unique per variant, giving 100% delta across all pairs.

## CSS Custom Properties Compiled

| Property | Source field | Example value |
|----------|-------------|---------------|
| `--layout-hero-variant` | `heroVariant` | `overlay` |
| `--layout-nav-variant` | `navVariant` | `hamburger` |
| `--layout-section-container` | `sectionContainer` | `seamless` |
| `--layout-card-variant` | `cardVariant` | `outlined` |
| `--layout-footer-variant` | `footerVariant` | `social` |
| `--hero-min-height` | derived from `heroVariant` | `70vh` |
| `--hero-overlay-display` | derived from `heroVariant` | `block` or `none` |
| `--hero-content-align` | derived from `heroVariant` | `center` |
| `--hero-content-flow` | derived from `heroVariant` | `column` |
| `--nav-position` | derived from `navVariant` | `fixed` or `relative` |
| `--nav-layout` | derived from `navVariant` | `row` or `column` |
| `--nav-width` | derived from `navVariant` | `100%` or `16rem` |
| `--nav-align` | derived from `navVariant` | `center` or `flex-start` |
| `--section-columns` | derived from `sectionContainer` | `1` or `2` |
| `--section-list-style` | derived from `sectionContainer` | `solid` or `none` |
| `--card-shadow` | derived from `cardVariant` | CSS shadow value |
| `--card-border-toggle` | derived from `cardVariant` | `1px solid` or `0px solid` |
| `--card-bg-fill` | derived from `cardVariant` | `transparent` or CSS color |
| `--footer-grid` | derived from `footerVariant` | `1`, `2`, or `3` |
| `--footer-text-align` | derived from `footerVariant` | `center` or `left` |

## Allowed Values

- `heroVariant`: `fullscreen`, `split`, `overlay`, `minimal`
- `navVariant`: `floating`, `sidebar`, `hamburger`, `top-bar`, `bottom-bar`
- `sectionContainer`: `alternating`, `bordered`, `seamless`, `cards`
- `cardVariant`: `elevated`, `flat`, `outlined`
- `footerVariant`: `columns`, `minimal`, `social`, `simple`, `centered`

## Structural Override Logic

Each field emits both its raw value (for CSS class-based styling) and structural CSS overrides:

**Hero:**
- `fullscreen` → `--hero-min-height: 100vh`, overlay hidden, content centered vertically
- `split` → `--hero-min-height: 60vh`, overlay hidden, content left-aligned, flex row
- `overlay` → `--hero-min-height: 70vh`, overlay displayed as block, content centered
- `minimal` → `--hero-min-height: 50vh`, overlay hidden, content centered

**Nav:**
- `floating` / `top-bar` → `position: fixed`, width `100%`, row layout, centered
- `sidebar` → `position: relative` (or fixed), width `16rem`, column layout, flex-start
- `hamburger` → `position: fixed`, width `100%`, row layout, centered (mobile-first)
- `bottom-bar` → `position: fixed`, bottom `0`, width `100%`, row layout

**Section:**
- `alternating` → single column, no list style
- `bordered` → single column, `solid` list style
- `seamless` → single column, no list style, no section dividers
- `cards` → two-column grid, no list style

**Card:**
- `elevated` → shadow, solid background fill
- `flat` → no shadow, transparent background fill
- `outlined` → `1px solid` border, solid background fill

**Footer:**
- `columns` → 3-column grid, left-aligned text
- `minimal` → 1-column grid, centered text
- `social` → 2-column grid, left-aligned text
- `simple` → 1-column grid, centered text
- `centered` → 1-column grid, centered text

## Implementation

**File:** `lib/dimensions/compile.ts — compilePageLayout()`

Uses `lookupString()` helper to resolve each field with fallback:
- `heroVariant`: `heroVariant` → `layout.heroVariant` → `"fullscreen"`
- `navVariant`: `navVariant` → `layout.navVariant` → `"top-bar"`
- `sectionContainer`: `sectionContainer` → `layout.sectionContainer` → `"alternating"`
- `cardVariant`: `cardVariant` → `layout.cardVariant` → `"elevated"`
- `footerVariant`: `footerVariant` → `layout.footerVariant` → `"columns"`

Structural overrides are derived via inline ternaries keyed on the resolved variant string.

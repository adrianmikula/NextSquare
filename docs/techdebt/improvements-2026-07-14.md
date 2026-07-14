# Improvements: Visual Uniqueness Gap Fixes + Deeper Audit Tooling

**Date:** 2026-07-14
**Focus:** Close the gap between spec-level uniqueness (70-80%) and human-perceived visual uniqueness (~10-20%)
**See also:** `docs/techdebt/visual-uniqueness-gap.md` (root causes), `skills/theme-uniqueness/SKILL.md` (Step 7 v2)

## Summary

This session addressed the root causes of the visual uniqueness gap across 3 areas:

1. **Compiler color-mix derivations** — broke the semantic color collapse by deriving 9+ value levels per theme instead of 3-4 flat mappings
2. **Spec diversity improvements** — unique surface tints per theme, darker B background, changed C's font category
3. **Audit tooling upgrade** — Step 7 v2 now detects deep structural issues (aliases, dead dimensions, component identity, layout diversity)

---

## Improvement 1: color-mix Derivation in Compiler

**File:** `lib/dimensions/compile.ts:119-158`

### Problem
~20 semantic CSS variables all flat-mapped to just 4 palette colors (`text`, `background`, `primary`, `surface`). All themes collapsed to the same visual levels regardless of palette hex values.

### Fix
Changed 9 semantic slots from flat palette mappings to `color-mix(in srgb, ...)` derivations at different blend ratios:

| Semantic Slot | Before (flat) | After (derivation) | Visual Effect |
|---|---|---|---|
| `--color-muted` | `text` | `color-mix(text 55%, background)` | 55% text + 45% bg → visibly lighter |
| `--color-label` | `text` | `color-mix(text 75%, background)` | 75% text → stronger than muted |
| `--color-link` | `text` | `color-mix(text 85%, background)` | 85% text → near-text but distinct |
| `--color-hero-muted` | `text` | `color-mix(background 65%, text)` | Inverted: 65% bg on text bg |
| `--color-nav-bg` | `background` | `color-mix(background 96%, text)` | Slight tint from pure background |
| `--color-nav-link` | `text` | `color-mix(text 85%, background)` | Slightly softened from pure text |
| `--color-footer-bg` | `background` | `color-mix(background 90%, text)` | Slightly darker than page bg |
| `--color-footer-heading` | `text` | `color-mix(text 80%, background)` | Slightly softened heading |
| `--color-footer-muted` | `text` | `color-mix(text 55%, background)` | Lighter footer text |

### Impact
- Distinct values per theme: **3/18 → 14/25** (accounting for intentional collapses like heading=body=hero-bg which are correct by design)
- Cross-theme distinctness: **100%** (no compiled values are identical across themes)
- Within-theme visual hierarchy: muted < label < body < heading now have visibly different weights

### Verification
```bash
node --input-type=module -e "
// color-mix(#2C2A26 55%, #F8F6F0)
// = rgb(0.55*44 + 0.45*248, 0.55*42 + 0.45*246, 0.55*38 + 0.45*240)
// = #888681 (visible as distinct gray vs #2C2A26 near-black)
"
```

---

## Improvement 2: Unique Surface Values Per Theme

**Files:** `content/dimensions/specs/color-{a,b,c}.json`

### Problem
All 3 themes had `surface: "#FFFFFF"`. Cards looked identical regardless of theme.

### Fix

| Theme | Surface | Visual character |
|---|---|---|
| A | `#F2EFE8` | Warm cream, slightly lighter than warm background |
| B | `#DCE1E7` | Cool gray-tinted surface, distinct from cool bg |
| C | `#FAF0EB` | Warm blush tint, warmer than warm bg |

### Impact
`--color-card-bg` (surface) now differs across all 3 themes. Cards provide a visual anchor that changes per theme.

---

## Improvement 3: Darkened Theme B Background

**File:** `content/dimensions/specs/color-b.json`

### Problem
Theme B background (#F0F2F4) was visually indistinguishable from A (#F8F6F0) and C (#FDF8F5) — all off-white.

### Fix
Changed from `#F0F2F4` → `#E8ECF0` (luminance: 0.834 vs previous ~0.88).

### Impact
- Background luminance range across themes: **~11%** (was ~6%)
- Still below the 20% target, but improved. A dark-bg variant is still needed for full diversity.

---

## Improvement 4: Theme C Heading Font Category Change

**File:** `content/dimensions/specs/typography-c.json`

### Problem
Theme C used Playfair Display (serif) — same font category as Theme A's Fraunces (serif). Font category overlap reduces typographic uniqueness.

### Fix
Changed heading font from Playfair Display → Instrument Sans (sans-serif).

### Impact
- Theme A: serif (Fraunces)
- Theme B: sans-serif (Space Grotesk)
- Theme C: sans-serif (Instrument Sans)

**Remaining issue:** B and C are both sans-serif. Ideal would be C → display or monospace. Instrument Sans is visually distinct from Space Grotesk (rounder, wider counters) but same category.

---

## Improvement 5: hero-overlay Div Added to CmsHero

**File:** `components/cms/CmsRenderer.tsx:140`

### Problem
The page-layout compiler emits `--hero-overlay-display` and `--hero-overlay-opacity` CSS vars, but `CmsHero` did not render a `.hero-overlay` div to consume them. The standard `Hero` component (`components/hero.tsx`) did have it. Result: `heroVariant: "overlay"` vs `"fullscreen"` produced zero visible difference in CMS blocks.

### Fix
Added `<div className="hero-overlay" />` inside the CmsHero section wrapper.

### Verification
With overlay variant active, the CSS rule `.hero-overlay { display: var(--hero-overlay-display, none); }` now renders the overlay div. Without it, `--hero-overlay-display: none` hides it.

---

## Improvement 6: Step 7 v2 — Deep Root Cause Detection

**File:** `skills/theme-uniqueness/SKILL.md` (v0.3.0 → v0.4.0)

### What changed
Replaced the original Step 7 (which only checked raw palette hexes against 6 semantic slots) with a comprehensive v2 that:

| Sub-step | What it checks | Detection method |
|---|---|---|
| **7a** | Compiled CSS values with color-mix | Replicates compile.ts color-mix() in JS; shows actual rendered hex values |
| **7b** | Cross-theme compiled distinctness | Compares all 25 compiled slots across every theme pair |
| **7c** | Luminance diversity | Background, surface, and text luminance + spread + pattern warnings |
| **7d** | Font category overlap | Checks all 4 categories (serif/sans/display/mono); flags unused ones |
| **7e** | Component override map audit | Scans COMPONENT_MAP for aliases (same fn, different name); counts overridden vs default block types |
| **7f** | Dead dimension detection | Checks wording & rhythm dimensions for `{}` compiler output |
| **7g** | Layout variant diversity | Checks each page-layout property for singleton values across themes |
| **7h** | Page skeleton rigidity | Documents the fixed Header→blocks→Footer skeleton |

### New detection capabilities
- **Alias detection**: Flags when `overlay-hero` maps to same function as `hero` → shows "no visual difference"
- **Block-type identity**: Warns when >15/26 block types use default component across ALL themes
- **Dead dimensions**: Detects wording & rhythm producing zero CSS output
- **Layout diversity**: Flags any page-layout property with only 1 unique value across themes

---

## Unresolved Issues (Next Session)

| Issue | Severity | Area | What's needed |
|---|---|---|---|
| Wording dimension dead | High | `compile.ts:65` | Emit CSS or add "c" text fields to block data |
| Rhythm dimension dead | High | `compile.ts:329-331` | Emit spacing/rhythm CSS vars |
| 24/26 block types share same component | High | `CmsRenderer.tsx:COMPONENT_MAP` | Add override variants for text, cta, gallery, services |
| overlay-hero still alias for CmsHero | Medium | `CmsRenderer.tsx:26` | Create genuinely different CmsOverlayHero component |
| All light backgrounds | Medium | Color specs | Add dark-background variant (Theme B → dark mode) |
| Font category overlap (B+C = sans-serif) | Low | Typography specs | Change C to display (e.g., Caveat, Oswald) |
| Page skeleton fixed | Architectural | `app/layout.tsx` | Make layout consume --nav-position, --nav-layout CSS vars |

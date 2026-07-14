# Visual Uniqueness Gap: Spec-Level vs Rendered Distinctness

**Filed:** 2026-07-14
**Last updated:** 2026-07-14 (Post-fix analysis + deeper root causes)
**Severity:** High
**Area:** Compiler (`lib/dimensions/compile.ts`), Theme Design Rules, Uniqueness Audit, Component Architecture
**See also:** `docs/techdebt/theme-rigidity.md`, `skills/theme-uniqueness/SKILL.md` Step 7

## Overview

Our 12-layer theme-uniqueness audit consistently reports **70-80% uniqueness** across generated themes. However, when a human views the rendered output, themes feel **10-20% unique** — they all look like "near-black text on off-white background with slightly different accent colors."

The problem is not in the audit itself (which correctly checks for hardcoded Tailwind classes, CSS var consumption, etc.). The problem is that **the audit only checks whether values differ in spec files, not whether they produce visually distinct output**.

## Applied Fixes (2026-07-14 Session)

### Fix 1: color-mix Derivation in Compiler

`lib/dimensions/compile.ts` now derives muted/label/nav/footer/etc. colors via `color-mix(in srgb, ...)` instead of flat-mapping them all to the same palette slot:

| CSS Var | Before (mapped to) | After (derivation) |
|---|---|---|
| `--color-muted` | `text` palette | `color-mix(text 55%, background)` |
| `--color-label` | `text` palette | `color-mix(text 75%, background)` |
| `--color-link` | `text` palette | `color-mix(text 85%, background)` |
| `--color-hero-muted` | `text` palette | `color-mix(background 65%, text)` |
| `--color-nav-bg` | `background` palette | `color-mix(background 96%, text)` |
| `--color-nav-link` | `text` palette | `color-mix(text 85%, background)` |
| `--color-footer-bg` | `background` palette | `color-mix(background 90%, text)` |
| `--color-footer-heading` | `text` palette | `color-mix(text 80%, background)` |
| `--color-footer-muted` | `text` palette | `color-mix(text 55%, background)` |

This gives **9+ visually distinct value levels per theme** instead of 3-4 collapsed slots.

### Fix 2: Unique Surface Values Per Theme

All 3 themes had `surface: "#FFFFFF"`. Changed to unique tints:

| Theme | Surface |
|---|---|
| A (Garden Terrace) | `#F2EFE8` (warm cream) |
| B (Urban Edge) | `#DCE1E7` (cool gray) |
| C (Sunset Bloom) | `#FAF0EB` (warm blush) |

### Fix 3: Darkened Theme B Background

Changed from `#F0F2F4` → `#E8ECF0` for slightly wider luminance spread.

### Fix 4: Changed Theme C Heading Font

Changed from Playfair Display (serif) → Instrument Sans (sans-serif) to avoid font category overlap with Theme A (Fraunces, serif).

### Fix 5: Added .hero-overlay to CmsHero

Added `<div className="hero-overlay" />` to the `CmsHero` component so the page-layout CSS vars (`--hero-overlay-display`, `--hero-overlay-opacity`) actually render visible difference when `heroVariant` is `"overlay"` vs `"fullscreen"` or `"split"`.

### Post-Fix Step 7 Results

```
Lowest pair-wise visual distinctness: 100%
(12-layer audit typically reports:   70-80%)
✓ Visual uniqueness (100%) aligns with spec-level analysis.
```

However, many deeper structural issues remain (see below).

## Deeper Root Causes (Discovered 2026-07-14)

These are the fundamental architectural issues that palette-level fixes cannot address:

### 7. CmsHero Ignores page-layout CSS Vars (Previously Documented, Partially Fixed)

The page-layout compiler emits `--hero-overlay-display`, `--hero-min-height`, `--hero-content-flow` CSS variables. These are consumed by the standard `Hero` component (`components/hero.tsx`) but were NOT consumed by `CmsHero` (`components/cms/CmsRenderer.tsx`). The `.hero-overlay` div has now been added, but `CmsHero` still does not consume `--hero-min-height` or `--hero-content-flow`, so `heroVariant: "overlay"` vs `"fullscreen"` produces limited visible difference in CMS blocks.

### 8. Wording Dimension Is Dead for Variant C

The dimension system has a "wording" dimension with 3 spec files (`wording-a.json`, `wording-b.json`, `wording-c.json`). However:
- `compileWording()` in `compile.ts` returns `{}` (empty object — no CSS output)
- CMS block data only has `{a, b}` wording variants (no "c" text fields)
- Theme C's `wording-c.json` (`tone: "romantic"`) never changes any visible text

The wording dimension is functionally dead — it generates spec files that differ on paper but produce zero visual difference.

### 9. 18 of 20+ Block Types Are Identical Across Themes

`CmsRenderer.tsx:COMPONENT_MAP` maps block type strings to component functions. Only 2 block types have theme-specific overrides:
- `hero`: default → CmsHero, `overlay-hero` → CmsHero (alias!), `split-hero` → CmsSplitHero
- `testimonials`: default → CmsTestimonials, `compact-testimonials` → CmsCompactTestimonials, `carousel-testimonials` → CmsCarouselTestimonials

The remaining 18+ block types (text, products, gallery, cta, hours, services, form, faq, promo, slideshow, etc.) render the **exact same component** regardless of which theme is active.

### 10. daisyUI Fixed HTML Skeleton Limits Diversity

A `btn` is always a button, a `card` always a card, a `navbar` always a nav bar. CSS vars only change color/shadow/radius/morphology — not structure or layout morphology. daisyUI provides consistency but constrains the degree of visual diversity achievable through CSS vars alone.

### 11. Every Page Has the Same HTML Skeleton

All themes follow the fixed layout: `Header → blocks.map(render) → Footer`. No theme can:
- Reorder sections
- Add decorative elements between blocks
- Change the page architecture (e.g., sidebar nav for one theme, top bar for another — nav-variant CSS vars are emitted but the actual HTML skeleton in layout.tsx is fixed)
- Insert interstitial components (newsletter popup, live chat, etc.)

### 12. Content Is Identical Across Themes

All themes share:
- The same `pages.json` data
- The same block order
- The same text content
- The same images

The theme system only changes the "skin" — ~90% of what users see (the actual content) is invariant.

## Impact Assessment

| Dimension | Spec difference | Visual difference | Fix status |
|---|---|---|---|
| Color (palette) | 3 different palettes | ~50% of page now distinct (muted, label, nav, footer, surface are derived) | ✅ Fixed |
| Color (collapse) | Within-theme collapse | 7/18 distinct values per theme (up from 3/18) | ✅ Fixed |
| Typography | 3 different font pairings | Serif vs sans vs sans — C still overlaps with B | ⚠️ Partial |
| Spatial | Different container/section values | Subtle, only on generous screens | ❌ Unchanged |
| Components | Different radii, shadows, borders | Visible but minor | ❌ Unchanged |
| Page-layout | Different hero/nav/section variants | Weak — overlay-hero == hero partially fixed; nav, section, card, footer variants don't render differently | ⚠️ Partial |
| Motion | Different speeds, hover lift | Ambient — not noticed on static comparison | ❌ Unchanged |
| Imagery | Different aspect ratios | Invisible — content images don't change | ❌ Unchanged |
| Rhythm | relaxed / compact / balanced | **No CSS output** (returns `{}`) | ❌ Dead dimension |
| Wording | Different tone labels | **No CSS output** (returns `{}`) | ❌ Dead dimension |
| Component overrides | 2 of 20+ block types | 18 block types render identical components | ❌ Architectural |
| Page skeleton | Same Header→blocks→Footer | No structural variation possible | ❌ Architectural |
| Content | Same pages.json | ~90% of page content is invariant | ❌ Architectural |

## Remaining Issues by Severity

### Critical — Architectural Blocker

| # | Issue | Area | Impact |
|---|---|---|---|
| 1 | Wording dimension produces zero output | `compile.ts:65` | Dead spec dimension — C's wording never renders |
| 2 | Rhythm dimension produces zero output | `compile.ts:329-331` | Dead spec dimension — no CSS, no visual effect |
| 3 | 18/20+ block types have no overrides | `CmsRenderer.tsx:COMPONENT_MAP` | Themes cannot visually differentiate most page regions |
| 4 | Page skeleton is fixed | `app/layout.tsx` | No theme can have a different page architecture |
| 5 | Content is identical across themes | `content/pages.json` | Users see the same text/images regardless of theme |

### High — Compiler/Spec Gaps

| # | Issue | Area | Impact |
|---|---|---|---|
| 6 | CmsHero doesn't consume `--hero-min-height`, `--hero-content-flow` | `CmsRenderer.tsx:110-158` | Overlay vs fullscreen hero don't differ structurally |
| 7 | No dark-background variant exists | All 3 color specs | All themes are light-bg + dark-text |
| 8 | Background luminance spread only 11% | Color spec backgrounds | All backgrounds look like off-white |
| 9 | All heading fonts are body-weight (no display/monospace category used) | Typography specs | Font category set is undersized (2 of 4 categories used) |

### Medium — Detection Gaps

| # | Issue | Area | Impact |
|---|---|---|---|
| 10 | Step 7 doesn't check compiled color-mix values | `SKILL.md` Step 7 | Misses that derivations give distinct values |
| 11 | Step 7 doesn't detect dead wording/rhythm dimensions | `SKILL.md` Step 7 | Misses spec-level vs reality mismatch |
| 12 | Step 7 doesn't count block-type identity across themes | `SKILL.md` Step 7 | Misses that 90% of blocks use same component |
| 13 | `overlay-hero` still maps to CmsHero (alias) | `CmsRenderer.tsx:26` | Step 7e flags but doesn't auto-fix |

## Priority for Next Session

1. **Fix wording dimension** — Either make compileWording() emit CSS that affects text rendering, or add "c" text fields to block data so wording-c.json tone values actually change visible content. Without this, the wording dimension is dead code.
2. **Fix rhythm dimension** — Make compileRhythm() emit spacing/rhythm CSS vars, or remove the dimension. Currently generates 3 spec files that do nothing.
3. **Add block-type overrides** — At minimum add override variants for text, cta, gallery, and services blocks (the most common CMS block types). Without this, 90% of every theme's page is identical.
4. **Add at least one dark-background theme variant** — Consider making Theme B a dark-mode variant with `background: "#1A1D23"`, `text: "#E8ECF0"`, `surface: "#2A2D35"`. This would give the maximum visual diversity across the 3-theme set.
5. **Break page skeleton rigidity** — Allow themes to inject decorative interstitial elements, reorder block groups, or wrap sections in theme-specific containers.

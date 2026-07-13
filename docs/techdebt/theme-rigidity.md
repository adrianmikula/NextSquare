# Theme Rigidity: Hardcoded Values & Inflexible Output

**Filed:** 2026-07-12 (last updated: 2026-07-13 — Pass 4)
**Severity:** High
**Area:** Theme System, Component Rendering, CSS Pipeline, Config Management

## Overview

The dimension-based theme system now correctly controls **what palette values are** and **how they're applied semantically** across all components. Four audit passes have been completed:

1. **Pass 1 (color):** Replaced hardcoded `bg-amber-*`/`text-stone-*` with semantic CSS vars (`--color-section-bg`, `--color-heading`, `--color-body`, etc.). Legacy `ThemeConfig` system removed.
2. **Pass 2 (non-color dimensions + status colors):** Replaced hardcoded layout/sizing classes with dimension-driven CSS vars. Added semantic status colors (`--color-success`, `--color-error`, `--color-info`).
3. **Pass 3 (daisyUI integration):** Emitted daisyUI theme vars from compile.ts. Migrated card component to daisyUI. Added fallback defaults.
4. **Pass 4 (bulk semantic migration + dead code removal):** Migrated ~152 `text-stone-*`/`bg-amber-*`/`fill-amber-*` and ~23 `bg-white`/`text-white` to semantic classes. Removed unconsumed CSS vars from compile.ts. Centralized `FALLBACK_NAME`/`DEFAULT_LINKS`. Completed daisyUI Phases 2-5.

**All originally identified rigidity categories are now resolved.** Only low-priority fallback string literal items remain (see Layer 3).

---

## Layer 1: ~~Hardcoded Text/Background Classes~~ (Fixed — Now Semantic)

**Status: RESOLVED (2026-07-13 Pass 4).** All remaining `text-stone-*`, `bg-amber-*`, `fill-amber-*`, `bg-white`, `text-white`, and `bg-black/*` overlay classes have been migrated to semantic CSS variable classes.

### What was done (Pass 4)

- **~152 `text-stone-*`/`bg-amber-*`/`fill-amber-*` occurrences** across 38 files → semantic classes (`text-heading`, `text-body`, `text-muted`, `text-price`, `bg-section`, `bg-card`, `fill-star`, etc.)
- **~23 `bg-white`/`text-white` occurrences** → `bg-card`/`bg-section`/`text-[var(--color-background)]`
- **4 `bg-black/*` overlay backdrops** → `var(--color-overlay)` CSS var (emitted by `compile.ts`)
- **`DemoModePopup.tsx`** — migrated `text-gray-*`/`bg-gray-*`/`bg-white` classes
- **Added `.text-nav-link`/`.hover-text-nav-link-hover`** utility classes consuming `--color-nav-link`/`--color-nav-link-hover`

### Files migrated

Section: `hero.tsx`, `menu-preview.tsx`, `social-proof.tsx`, `instagram-feed.tsx`, `hours-location.tsx`  
Menu: `MenuItemCard.tsx`, `MenuItemDetail.tsx`, `ModifierDialog.tsx`, `MenuGrid.tsx`  
Cart/Checkout: `CartItem.tsx`, `CartSummary.tsx`, `DeliveryPickupToggle.tsx`, `EmptyCart.tsx`, `DeliveryInfo.tsx`, `PickupInfo.tsx`, `OrderSummary.tsx`, `SquarePaymentForm.tsx`, `SquareFallback.tsx`, `CartDrawer.tsx`  
Order/Loyalty: `OrderStatus.tsx`, `OrderTimeline.tsx`, `LoyaltyBadge.tsx`, `PointsEarned.tsx`  
Dashboard: `sidebar.tsx`, `order-table.tsx`, `menu-item-editor.tsx`, `price-input.tsx`, `availability-toggle.tsx`, `dashboard-header.tsx`, `stat-card.tsx`, `category-filter.tsx`  
UI: `button.tsx`, `toast.tsx`, `card.tsx`  
Layout: `header.tsx`, `footer.tsx`, `mobile-menu.tsx`  
CMS: `CmsRenderer.tsx`  
Demo: `DemoModePopup.tsx`, `DemoBadge.tsx`  
App pages: `cart/page.tsx`, `checkout/page.tsx`, `order/[orderId]/page.tsx`, `login/page.tsx`, `login/login-form.tsx`, `not-found.tsx`, `dashboard/settings/page.tsx`, `dashboard/orders/page.tsx`, `dashboard/menu/menu-items-grid.tsx`, `dashboard/menu/[id]/page.tsx`, `dashboard/page.tsx`, `menu/page.tsx`

---

## Layer 2: ~~Truly Hardcoded Colors~~ (Fixed — Now Thematic)

**Status: RESOLVED (2026-07-13).** All status colors now use semantic CSS vars (`--color-success`, `--color-error`, `--color-info`) emitted by `compile.ts` and configurable per-theme via `color-a.json` / `color-b.json` palette entries. See `docs/techdebt/theme-rigidity.md` "Completed" section for full file-by-file inventory.

### What was done

- Added `--color-success` / `--color-error` / `--color-info` to `compile.ts` color compiler, reading from `palette.success/error/info` with neutral fallbacks
- Added status palette entries to both `color-a.json` (warm tones: `#6B8F3A`, `#C0392B`, `#5B7FA5`) and `color-b.json` (cool tones: `#43A047`, `#E53935`, `#1E88E5`)
- Added utility classes: `.bg-success/subtle`, `.text-success`, `.border-success`, `.bg-error/subtle`, `.text-error`, `.border-error`, `.bg-info/subtle`, `.text-info`, `.border-info`
- Updated all ~11 files with hardcoded green/red/blue (toast, button destructive, order confirmation, cart item, CMS renderer, menu editor, order table, login form, settings page, menu items grid)

---

## Layer 3: Hardcoded Fallback / Default Values

### ~~In `lib/dimensions/compile.ts` — palette color fallbacks~~ (Fixed)

**Status: RESOLVED (2026-07-13 Pass 4).** Changed all palette fallbacks from warm-amber bias to neutral defaults:
- `primary`: `"#b45309"` → `"#888888"`
- `secondary`: `"#fef3c7"` → `"#f0f0f0"`
- `surface`: `"#fffbeb"` → `"#f5f5f5"`
- `text`: `"#1c1917"` → `"#333333"`
- `accent`: `"#d4a373"` → `"#888888"`
- `background` kept at `"#ffffff"`

### ~~In `app/layout.tsx:65` and `app/[tenant]/layout.tsx:9`~~ (Fixed)

**Status: RESOLVED (2026-07-13).** Both files now log `console.warn("[theme] NEXT_PUBLIC_THEME_BUNDLE is not set — defaulting to bundle A")` when the env var is unset.

### ~~In `app/page.tsx:34` and `app/[tenant]/page.tsx:32` — double-hardcoded text variant~~ (Fixed)

**Status: RESOLVED (2026-07-13).** Removed redundant `|| "A"` fallback — `textVariant` is already guaranteed non-null by the `?? "A"` chain on the assignment line. The call is now `resolveBlockData(block, textVariant)`.

### ~~`FALLBACK_NAME` in header/footer~~ ~~`DEFAULT_LINKS` in header.tsx~~ (Fixed)

**Status: RESOLVED (2026-07-13 Pass 4).** Both constants centralized into `lib/constants.ts`:
```typescript
export const FALLBACK_NAME = "Cafe Template"
export const DEFAULT_LINKS = [ ... ]
```
All consumers (`header.tsx`, `footer.tsx`, `mobile-menu.tsx`) now import from `@/lib/constants`. Three files still use the `"Cafe Template"` string literal directly (see Layer 3 remaining below).

### Remaining — Low Priority Fallback String Literals

These string literal fallbacks only appear when `siteProfile`/`profile` data is null. All are optional backlog items:

| Location | Fallback | File |
|----------|----------|------|
| Business name (3 occ) | `"Cafe Template"` | `app/layout.tsx:38`, `app/manifest.ts:8`, `CmsRenderer.tsx:653` |
| Hours (weekdays) | `"7:00 AM - 3:00 PM"` | `hours-location.tsx:7` |
| Hours (saturday) | `"8:00 AM - 4:00 PM"` | `hours-location.tsx:8` |
| Hours (sunday) | `"Closed"` | `hours-location.tsx:9` |
| Street address | `"123 Coffee Lane"` | `hours-location.tsx:14` |
| City/state | `"Melbourne"`, `"VIC"`, `"3000"`, `"Australia"` | `hours-location.tsx:15-16` |
| Instagram handle | `"@cafetemplate"` | `footer.tsx:54` |
| Email | `"hello@cafetemplate.com"` | `footer.tsx:55` |
| CTA links (6 occ) | `"/menu"` | `CmsRenderer.tsx:113,294,386`, `renderer.ts:17,65,93` |

**Recommended fix:** Import `FALLBACK_NAME` for the 3 remaining `"Cafe Template"` occurrences. For the rest, consider a centralized `FALLBACK_PROFILE` object in `lib/constants.ts` mirroring the `SiteProfile` shape.

### ~~Hardcoded hex colors in `app/manifest.ts:13-14`~~ (Fixed)

**Status: RESOLVED (2026-07-13 Pass 4).** Changed to CSS var references:
```typescript
background_color: "var(--color-background, #ffffff)",
theme_color: "var(--color-primary, #888888)"
```
These now respond to the active theme bundle.

---

## Layer 4: ~~Unconsumed CSS Variables~~ (Fixed — Removed from compile.ts)

**Status: RESOLVED (2026-07-13 Pass 4).** All unconsumed CSS vars removed from `lib/dimensions/compile.ts` output.

### Removed from `compileColor()`
- `--color-secondary`, `--color-surface`, `--color-text`, `--color-accent`, `--color-border`

### Removed from `compileSpatial()`
- `--page-columns`, `--sidebar-width`, `--design-balance`
- `--margin-width` kept (technically consumed by `container-max` class with `auto` fallback)

### Removed from `compileMotion()`
- `--motion-hover-lift`, `--motion-fade-in`, `--motion-smooth-scroll`, `--motion-stagger`

### Removed from `compileRhythm()`
- `--rhythm-section-py` (function returns empty object)

### Removed from `compileComponents()`
- `--nav-bg-opacity`

### Kept (now consumed)
- `--color-nav-link`, `--color-nav-link-hover` — consumed by `.text-nav-link`/`.hover-text-nav-link-hover` utility classes added in Pass 4
- `--color-footer-link`, `--color-footer-link-hover` — consumed by existing utility classes
- `--margin-width` — consumed by `container-max` class `var(--margin-width, auto)`

---

## Layer 5: ~~Dangling CSS Class~~ (Fixed)

**Status: RESOLVED (2026-07-13).** `.text-footer-link { color: var(--color-footer-link); }` added to `app/globals.css` in the `@layer components` section alongside other footer utility classes.

---

## Layer 6: Config/Infrastructure Issues

### ~~`serverActions` under `experimental` in `next.config.ts`~~ (Not actionable)

**Status: WON'T FIX (2026-07-13).** This project uses Next.js 16.2.9 which still requires `serverActions` under `experimental` in its type definitions. The config was briefly promoted to top-level then reverted when `npx tsc --noEmit` failed. Safe to revisit after Next.js 17 upgrade.

### DaisyUI theme CSS vars emitted

As of 2026-07-13, `compileColor()` in `compile.ts` emits all daisyUI theme color CSS vars (`--color-base-100`, `--color-base-200`, `--color-base-300`, `--color-base-content`, `--color-primary`, `--color-primary-content`, `--color-secondary`, `--color-secondary-content`, `--color-accent`, `--color-accent-content`, `--color-neutral`, `--color-neutral-content`, `--color-info`, `--color-info-content`, `--color-success`, `--color-success-content`, `--color-error`, `--color-error-content`, `--color-warning`, `--color-warning-content`) and `compileComponents()` emits daisyUI layout vars (`--radius-selector`, `--radius-field`, `--radius-box`, `--size-selector`, `--size-field`, `--border`, `--depth`, `--noise`). These reference the same resolved palette values used by our semantic vars, so daisyUI components (`.btn`, `.card`, `.navbar`, etc.) are automatically themed with no additional config. Fallback defaults for all daisyUI vars added to `app/globals.css`.

### Dimension A vs B hue separation

After the 2026-07-13 regeneration:
- **Theme A "Rustic Warmth":** Primary `#D4845A` (~21° hue, warm orange-terracotta)
- **Theme B "Cool Minimal":** Primary `#455A64` (~199° hue, cool blue-grey slate)

Hue separation: **178°** (> 30° minimum ✓). All 8 dimensions differ. All 5 component properties differ. **Passes all variance rules.**

---

## Progress Summary (2026-07-13)

### Completed — 2026-07-13 Pass 1

- **✅ CMS Block Renderers (CmsRenderer.tsx):** All 26 block types use semantic classes via helpers (`sectionClass`, `containerClass`, `cardClass`, `headingClass`). `button-themed` and `image-themed` applied where relevant. Remaining issues: `text-red-500` validation marker (truly hardcoded), `bg-stone-100`/`bg-stone-200` image placeholders, `aspect-*` overrides on `image-themed` wrappers.
- **✅ UI Components:** `button.tsx` — uses CSS vars for colors (except destructive variant), `card-themed`, `button-themed`. `card.tsx` — uses `card-themed bg-card text-heading text-muted`.
- **✅ Layout:** Header uses `bg-nav text-heading text-link hover-text-link-hover`. Footer uses `bg-footer text-footer-heading text-footer-link text-footer-muted`.
- **✅ Non-color dimensions:** `container-max`, `section-py`, `card-themed`, `button-themed`, `image-themed`, `--grid-gap`, `--theme-shadow-*`, `--theme-border-width`, `--transition-speed` — all consumed.
- **✅ Legacy system:** Fully removed (`content/themes/`, `legacyThemeSync`, `readTheme()`, `toCssVars()`, `ACTIVE_THEME_VARIANT`, `FALLBACK_DIMENSION_VARS`).
- **✅ Dimension spec variance:** A/B themes now have 178° hue separation (warm terracotta vs cool slate), differ in all 8 dimensions and all 5 component properties. Passes all min-variance checks.
- **✅ Dev-mode audit:** Shell-based non-color theme audit integrated into `SKILL.md` Step 8b.

### Completed — 2026-07-13 Pass 2

- **✅ Semantic status color CSS vars added** — `--color-success`, `--color-error`, `--color-info` emitted by `compile.ts`, with fallbacks in `globals.css:root`. Status palette entries added to `color-a.json` (warm green/red/blue) and `color-b.json` (cool green/red/blue).
- **✅ Utility classes added** — `.bg-success/subtle`, `.text-success`, `.border-success`, `.bg-error/subtle`, `.text-error`, `.border-error`, `.bg-info/subtle`, `.text-info`, `.border-info` in `globals.css`.
- **✅ `text-footer-link` class defined** — `.text-footer-link { color: var(--color-footer-link); }` added to `globals.css` (was dangling with no CSS definition).
- **✅ `toast.tsx`** — Variant styles use `bg-success-subtle border-success text-success` etc. instead of `bg-green-50 border-green-200 text-green-800`.
- **✅ `button.tsx` destructive variant** — Uses `bg-error text-[var(--color-background)]` instead of `bg-red-600 text-white`.
- **✅ `OrderConfirmed.tsx`** — Check icon uses `bg-success-subtle text-success`; buttons use `bg-section-cta text-cta-text` and `border-card text-heading`.
- **✅ `CartItem.tsx`** — Remove button hover uses `hover:text-error` instead of `hover:text-red-500`.
- **✅ `CmsRenderer.tsx`** — Required field marker uses `text-error` instead of `text-red-500`.
- **✅ `menu-item-editor.tsx`** — Error alert uses `border-error bg-error-subtle text-error`.
- **✅ `order-table.tsx`** — COMPLETED status uses `bg-success-subtle text-success`; CANCELED uses `bg-error-subtle text-error`.
- **✅ `login-form.tsx`** — Error messages use `text-error` instead of `text-red-600`.
- **✅ `settings/page.tsx`** — Connected icon uses `text-success`; disconnected icon uses `text-error`.
- **✅ `menu-items-grid.tsx`** — Availability status uses `text-success` / `text-error`.
- **✅ `app/layout.tsx` and `app/[tenant]/layout.tsx`** — Warning logged when `NEXT_PUBLIC_THEME_BUNDLE` is unset.
- **✅ `app/page.tsx` and `app/[tenant]/page.tsx`** — Removed redundant `|| "A"` fallback on `textVariant`.

### Completed — 2026-07-13 Pass 3 (daisyUI integration)

- **✅ DaisyUI theme CSS vars emitted** from `compileColor()` (20 color vars) and `compileComponents()` (8 layout vars) — maps our palette/component specs to daisyUI's CSS var names so all daisyUI components automatically get themed.
- **✅ Fallback defaults for daisyUI vars** added to `app/globals.css`:root (28 vars total).
- **✅ Card component migrated** to daisyUI (`card bg-base-100` with inline style for shadow/border/transition). Hover lift extended to `.card:hover`.
- **✅ Card tests updated** to match new daisyUI classes.
- **✅ `skills/theme-uniqueness/SKILL.md` updated** — Rule #7 added (prefer daisyUI), Layer F added (daisyUI migration audit), priority order updated, all 9 dimensions tracked.
- **✅ Theme distinctness verification** updated for 9 dimensions (added `page-layout`).

### Completed — 2026-07-13 Pass 4 (bulk semantic migration + dead code removal)

- **✅ ~152 `text-stone-*`/`bg-amber-*`/`fill-amber-*` migrated** to semantic classes across 38 files (section, menu, cart/checkout, order/loyalty, dashboard, UI, layout, CMS, demo components + app pages)
- **✅ ~23 `bg-white`/`text-white` migrated** to `bg-card`/`bg-section`/`text-[var(--color-background)]`
- **✅ 4 `bg-black/*` overlay backdrops fixed** — switched to `var(--color-overlay)` emitted by compile.ts
- **✅ `DemoModePopup.tsx` fixed** — migrated `text-gray-*`/`bg-gray-*`/`bg-white` classes
- **✅ `.text-nav-link`/`.hover-text-nav-link-hover` utility classes added** consuming `--color-nav-link`/`--color-nav-link-hover`
- **✅ Unconsumed CSS vars removed** from compile.ts output (5 color, 3 spatial, 4 motion, 1 rhythm, 1 component)
- **✅ Palette color fallbacks changed** from warm-amber bias to neutral defaults (`#888888`, `#f0f0f0`, `#333333`, etc.)
- **✅ `lib/constants.ts` created** with shared `FALLBACK_NAME`/`DEFAULT_LINKS` — imported by header, footer, mobile-menu
- **✅ `app/manifest.ts` colors switched** to CSS var references (`var(--color-background, ...)`, `var(--color-primary, ...)`)
- **✅ `next.config.ts` serverActions** confirmed must stay under `experimental` for Next.js 16.2.9 — documented as WON'T FIX
- **✅ DaisyUI Phases 2-5 completed** — button, form inputs, UI widgets, dead CSS removal (Phase 1 was Pass 3)
- **✅ Verification:** `npx tsc --noEmit` (0 errors), `npx eslint --quiet` (0 warnings), `npx vitest run` (93 files, 518 tests passing)

### Remaining — Low Priority Fallback String Literals

These string literal fallbacks only appear when `siteProfile`/`profile` data is null. See Layer 3 section above for full inventory.

| Location | Fallback | File |
|----------|----------|------|
| Business name (3 occ) | `"Cafe Template"` | `app/layout.tsx:38`, `app/manifest.ts:8`, `CmsRenderer.tsx:653` |
| Hours/address | `"7:00 AM - 3:00 PM"`, `"123 Coffee Lane"`, etc. | `hours-location.tsx:7-16` |
| Social handles | `"@cafetemplate"`, `"hello@cafetemplate.com"` | `footer.tsx:54-55` |
| CTA links (6 occ) | `"/menu"` | `CmsRenderer.tsx:113,294,386`, `renderer.ts:17,65,93` |

---

## Layer 7: daisyUI Component Migration

**Status:** ✅ Complete (2026-07-13)

daisyUI v5.6.18 is installed as a Tailwind v4 plugin (`themes: false` — using our own theme system). The dimension compiler emits all daisyUI theme CSS vars (`--color-base-*`, `--color-primary`, `--radius-box`, `--border`, `--depth`, etc.), making every daisyUI component automatically themed with our palette. All custom component classes have been migrated to daisyUI equivalents.

### Components Using daisyUI

| Component | daisyUI classes | File |
|-----------|----------------|------|
| Hero | `hero`, `hero-content`, `hero-overlay` | `components/hero.tsx` |
| Header/Nav | `navbar` | `components/layout/header.tsx` |
| Footer | `footer` | `components/layout/footer.tsx` |
| Card (wrapper) | `card`, `bg-base-100` | `components/ui/card.tsx` |
| Button | `btn`, `btn-primary`, `btn-error`, `btn-outline`, `btn-soft`, `btn-secondary`, `btn-ghost`, `btn-link` | `components/ui/button.tsx` + all consumers |
| Input | `input input-bordered` | `app/login/login-form.tsx`, `components/checkout/DeliveryInfo.tsx`, `components/checkout/PickupInfo.tsx`, `components/dashboard/menu-item-editor.tsx`, `components/dashboard/price-input.tsx` |
| Toggle | `toggle` | `components/dashboard/availability-toggle.tsx` |
| Badge | `badge`, `badge-primary`, `badge-outline` | `components/demo/DemoBadge.tsx`, `components/dashboard/category-filter.tsx`, `components/dashboard/order-table.tsx`, `components/order/OrderStatus.tsx` |
| Toast | `toast`, `alert`, `alert-success/error/info` | `components/ui/toast.tsx` |
| Modal | `modal`, `modal-box` | `components/menu/MenuItemDetail.tsx` |
| Drawer | `drawer`, `drawer-overlay`, `drawer-side` | `components/cart/CartDrawer.tsx` |
| Menu | `menu`, `menu-item` | `components/dashboard/sidebar.tsx` |
| Table | `table`, `table-zebra`, `table-pin-rows` | `components/dashboard/order-table.tsx` |
| Skeleton | `skeleton` | `app/menu/page.tsx`, `components/loyalty/LoyaltyBadge.tsx` |

### Migration Phases

#### Phase 1 — Card (✅ Done 2026-07-13)
- `components/ui/card.tsx` updated to use `card bg-base-100` with inline shadow/border/transition vars
- Hover lift effect extended to `.card:hover` in `globals.css`
- `card.test.tsx` expectations updated
- All ~25 `card-themed` consumers migrated to `card bg-base-100` (2026-07-13)

#### Phase 2 — Button (✅ Done 2026-07-13)
- CVA-based `Button` component migrated to daisyUI `btn` classes
- `button-themed` class removed from globals.css
- All button consumers updated (CmsRenderer, CartDrawer, MenuItemCard, MenuItemDetail, OrderConfirmed, menu-preview, cart page)

#### Phase 3 — Form Inputs (✅ Done 2026-07-13)
- `app/login/login-form.tsx` — daisyUI `input input-bordered`, `label`/`label-text`
- `components/checkout/DeliveryInfo.tsx` — daisyUI form controls with `fieldset`
- `components/checkout/PickupInfo.tsx` — daisyUI form controls
- `components/dashboard/menu-item-editor.tsx` — daisyUI `input`/`textarea`/`select`
- `components/dashboard/price-input.tsx` — daisyUI `input` with `$` prefix pattern
- `components/dashboard/availability-toggle.tsx` — daisyUI `toggle`
- `components/dashboard/category-filter.tsx` — daisyUI `badge`/`badge-primary`
- `components/cart/DeliveryPickupToggle.tsx` — uses `<button>` elements, no form migration needed

#### Phase 4 — UI Widgets (✅ Done 2026-07-13)
| Component | daisyUI replacement | Files migrated |
|---|---|---|
| Toast | `toast` + `alert` + `alert-info/success/error` | `components/ui/toast.tsx` |
| Badge/pill | `badge` + `badge-primary/success/error/outline` | `components/demo/DemoBadge.tsx`, `components/dashboard/order-table.tsx`, `components/order/OrderStatus.tsx` |
| Modal | `modal` | `components/menu/MenuItemDetail.tsx` |
| Drawer | `drawer` + `drawer-overlay` | `components/cart/CartDrawer.tsx` |
| Menu | `menu` + `<li>` pattern | `components/dashboard/sidebar.tsx` |
| Table | `table` + `table-zebra` + `table-pin-rows` | `components/dashboard/order-table.tsx`, `components/checkout/OrderSummary.tsx` |
| Skeleton | `skeleton` | `app/menu/page.tsx`, `components/loyalty/LoyaltyBadge.tsx` |

#### Phase 5 — Remove Dead CSS (✅ Done 2026-07-13)
- `.card-themed` — removed (replaced by `card bg-base-100` with inline style)
- `.card-themed:hover` — removed (`.card:hover` kept for hover lift)
- `.button-themed` — removed (already removed in Phase 2)
- `.image-themed` — removed (replaced by `rounded-box` + inline style)
- `.divider-themed` — removed (was already unused)
- Semantic utility classes (`bg-section`, `text-heading`, etc.) preserved for color system

### DaisyUI Theme Var Emission

The dimension compiler (`lib/dimensions/compile.ts`) now emits all daisyUI theme CSS vars:

**In `compileColor()`** (20 vars):
`--color-base-100`, `--color-base-200`, `--color-base-300`, `--color-base-content`, `--color-primary`, `--color-primary-content`, `--color-secondary`, `--color-secondary-content`, `--color-accent`, `--color-accent-content`, `--color-neutral`, `--color-neutral-content`, `--color-info`, `--color-info-content`, `--color-success`, `--color-success-content`, `--color-error`, `--color-error-content`, `--color-warning`, `--color-warning-content`

**In `compileComponents()`** (8 vars):
`--radius-selector`, `--radius-field`, `--radius-box`, `--size-selector`, `--size-field`, `--border`, `--depth`, `--noise`

These map our dimension palette directly to daisyUI's expected CSS var names, so daisyUI components receive themed values without any additional configuration. Fallback defaults are set in `app/globals.css`:root.

---

## Next: Theme Freedom Spectrum

For the architectural analysis of how to move beyond CSS-variable theming toward component-level selection freedom (~80% on the market spectrum), see:

[`docs/techdebt/theme-freedom-spectrum.md`](theme-freedom-spectrum.md)

This covers the 7 blockers preventing structural/component-level variety, the optionality of daisyUI, and the principle that the dimension system should guide the website-builder skill rather than constrain its output.

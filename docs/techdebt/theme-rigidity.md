# Theme Rigidity: Hardcoded Values & Inflexible Output

**Filed:** 2026-07-12
**Severity:** High
**Area:** Theme System, Component Rendering, CSS Pipeline

## Overview

The dimension-based theme system controls **what palette values are** but not **how they're applied**. Components reference Tailwind utility classes like `text-amber-700` and `bg-stone-50` rather than semantic CSS variables. The 7-color palette is flattened into 14 Tailwind color slots (`--color-amber-*`, `--color-stone-*`), meaning the theme system can change the numeric values but cannot change which semantic role goes where.

This document catalogs every layer of rigidity, from component-level hardcoding to architectural gaps, and proposes a new skill capability to detect these issues automatically.

---

## Layer 1: Hardcoded Color Application in CMS Block Renderers

**File:** `components/cms/CmsRenderer.tsx`

Every CMS block renderer uses hardcoded Tailwind color classes. The theme system only controls *what the palette values are* (via `--color-amber-*` / `--color-stone-*` CSS vars), not *which semantic role gets applied where*. Changing a palette value changes all elements that use that Tailwind slot simultaneously — you cannot independently control heading color vs. body color vs. muted text.

| Block | Lines | Hardcoded Classes | Frozen Semantic |
|-------|-------|-------------------|-----------------|
| `CmsHero` | 128-155 | `bg-stone-900`, `text-white`, `text-stone-300`, `from-stone-900/70 to-stone-900` | Hero always dark with gradient overlay |
| `CmsText` | 162-168 | `bg-white`, `text-stone-600` | Text section always white bg |
| `CmsProducts` | 175-193 | `bg-white`, `text-amber-700` price | Price always primary color |
| `CmsTestimonials` | 199-222 | `bg-stone-50`, `fill-amber-400 text-amber-400` stars | Stars always accent color |
| `CmsDelivery` | 230-243 | `bg-amber-50` | Delivery always secondary bg |
| `CmsHours` | 249-267 | `bg-stone-50`, `text-amber-700` clock | Hours always tinted bg |
| `CmsCta` | 296-307 | `bg-amber-700`, `text-white`, `text-amber-100` | CTA always primary bg |
| `CmsServices` | 314-331 | `bg-white`, `text-amber-700` price | Same as products |
| `CmsForm` | 338-360 | `bg-stone-50`, `text-stone-700`, `text-red-500` | Form always tinted bg |
| `CmsFaq` | 366-379 | `bg-white` | FAQ always white |
| `CmsPromo` | 390-409 | `bg-stone-900`, `from-amber-900/80 to-stone-900` | Promo always dark gradient |
| `CmsCallout` | 455-467 | `bg-amber-50`, `text-stone-900`, `text-stone-500` | Callout always secondary bg |
| `CmsComparison` | 515-555 | `bg-stone-50`, `text-amber-700` checkmark | Comparison always tinted bg |
| `CmsAnnouncement` | 639-645 | `bg-amber-700 text-white` | Announcement always primary bg |
| `CmsCopyright` | 655-658 | `text-stone-400` | Copyright always muted |
| `CmsPhone` | 667-671 | `text-stone-600 hover:text-amber-700` | Phone always muted/primary |

---

## Layer 2: CSS Variable → Tailwind Color Flattening

**File:** `lib/dimensions/compile.ts:80-125`

The `compileColor()` function maps 7 semantic palette colors to 14 Tailwind color slots:

```
primary   → --color-amber-600, --color-amber-700, --color-amber-900
accent    → --color-amber-400
secondary → --color-amber-50, --color-amber-100
background→ --color-stone-50
surface   → --color-stone-100
text      → --color-stone-900, --color-stone-700, --color-stone-600, --color-stone-500, --color-stone-400
border    → --color-stone-200, --color-stone-300
```

**Consequences:**
- All 5 text shades (`stone-900` through `stone-400`) resolve to the same `text` palette value — you cannot independently control heading color vs. body color vs. muted text
- All 3 primary shades (`amber-600`, `amber-700`, `amber-900`) resolve to the same `primary` palette value — you cannot have a lighter primary for hover states
- The mapping is hardcoded in `compile.ts:105-119` — there is no way to change which palette color maps to which Tailwind slot without editing the compilation function
- Components can't express "use a slightly different shade of primary" — every use of `text-amber-700` is identical to `text-amber-900`

---

## Layer 2: Component Library Hardcoding

### `components/ui/button.tsx`

The `cva` button variants use hardcoded Tailwind color classes. The `button-themed` class (from `globals.css`) only controls border-radius, font-family, and transition — not colors:

| Variant | Hardcoded Classes |
|---------|-------------------|
| `default` | `bg-amber-600 text-white shadow-sm hover:bg-amber-700` |
| `destructive` | `bg-red-600 text-white shadow-sm hover:bg-red-700` |
| `outline` | `border border-amber-200 bg-white text-amber-900 shadow-sm hover:bg-amber-50` |
| `secondary` | `bg-stone-100 text-stone-900 shadow-sm hover:bg-stone-200` |
| `ghost` | `text-stone-700 hover:bg-stone-100` |
| `link` | `text-amber-700 underline-offset-4 hover:underline` |

### `components/ui/card.tsx`

```tsx
<div className={cn("rounded-xl border border-stone-200 bg-white shadow-sm", className)} />
```

The `card-themed` class overrides border-radius and box-shadow via CSS vars, but the border color (`border-stone-200`), background (`bg-white`), and base shadow (`shadow-sm`) are hardcoded.

---

## Layer 2: Non-CMS Pages Are Theme-Blind

These pages and components use hardcoded Tailwind classes with zero theme influence:

| Page/Component | File | Hardcoded Classes |
|----------------|------|-------------------|
| Menu page | `app/menu/page.tsx` | `bg-stone-50`, `text-stone-900`, `text-stone-600`, `rounded-xl border border-stone-200 bg-white`, `bg-stone-100` |
| Dashboard | `app/dashboard/page.tsx` | Entirely hardcoded Tailwind |
| CartButton | `components/cart/CartButton.tsx` | Icon colors hardcoded |
| CartDrawer | `components/cart/CartDrawer.tsx` | Colors hardcoded |
| MobileMenuClient | `components/layout/mobile-menu.tsx` | Colors hardcoded |
| DemoBadge | `components/demo/DemoBadge.tsx` | `bg-amber-100`, `text-amber-800`, `shadow-lg` |
| DemoModePopup | `components/demo/DemoModePopup.tsx` | Colors hardcoded |
| Toast | `components/ui/toast.tsx` | Colors hardcoded |
| StatCard | `components/dashboard/stat-card.tsx` | Dashboard UI, no theme influence |

---

## Layer 3: CSS Variable Coverage Gaps

Many CSS vars are emitted by `compile.ts` but never consumed by any component. They exist as dead code — the dimension system compiles them, but nothing reads them.

| CSS Variable | Emitted By | Consumed By | Status |
|-------------|-----------|-------------|--------|
| `--motion-fade-in` | `compileMotion()` | None | Dead — never read |
| `--motion-smooth-scroll` | `compileMotion()` | None | Dead — never read |
| `--motion-stagger` | `compileMotion()` | None | Dead — never read |
| `--sidebar-width` | `compileSpatial()` | None | Dead — never read |
| `--page-columns` | `compileSpatial()` | None | Dead — never read |
| `--design-balance` | `compileSpatial()` | None | Dead — never read |
| `--margin-width` | `compileSpatial()` | None | Dead — never read |
| `--color-harmony` | `compileColor()` | None | Dead — metadata only |
| `--color-chroma` | `compileColor()` | None | Dead — metadata only |
| `--color-background-type` | `compileColor()` | None | Dead — metadata only |
| `--typography-scale` | `compileTypography()` | None | Dead — never read |
| `--rhythm-density` | `compileRhythm()` | None | Dead — never read |

---

## Layer 4: Header & Footer Hardcoding

### `components/layout/header.tsx`

| Aspect | Hardcoded |
|--------|-----------|
| Background | `rgba(255,255,255, var(--nav-bg-opacity, 0.95))` — white base hardcoded |
| Backdrop | `backdrop-blur supports-[backdrop-filter]:bg-white/60` |
| Fallback name | `const FALLBACK_NAME = "Cafe Template"` |
| Fallback nav links | `DEFAULT_LINKS` array with hardcoded href/label |
| Fallback link colors | `text-stone-900`, `text-amber-600`, `text-stone-600`, `hover:text-amber-700` |
| Border bottom | `var(--theme-border-width, 1px) solid var(--color-stone-200)` — stone-200 fallback hardcoded |

### `components/layout/footer.tsx`

| Aspect | Hardcoded |
|--------|-----------|
| Container | `border-t border-stone-200 bg-stone-50` |
| Layout | `grid gap-8 sm:grid-cols-3` |
| Heading style | `text-sm font-semibold uppercase tracking-wider text-stone-500` |
| Link colors | `text-stone-600 hover:text-amber-700` |
| Fallback tagline | `"Fresh coffee, great food, good vibes."` |
| Fallback social | `"@cafetemplate"`, `"hello@cafetemplate.com"` |
| Copyright | `text-xs text-stone-400` |

---

## Layer 5: Dual Theme System Coexistence

Two parallel theme systems exist in the codebase:

| Aspect | New Dimension System | Legacy ThemeConfig System |
|--------|---------------------|--------------------------|
| Config files | `content/dimensions/specs/*.json` (16 files) | `content/themes/demo/theme-*.json` (3 files) |
| Compiler | `lib/dimensions/compile.ts` | `lib/cms.ts` `toCssVars()` |
| URL param | `?bundle=A` or `?color=b` | `?theme=a` |
| Client sync | `DimensionThemeSync` | `LegacyThemeSync` |
| Used by root layout | Yes | No |
| Used by website-builder skill | No | Yes (Step 6) |

The root layout (`app/layout.tsx`) uses the new dimension system exclusively. The legacy system is only reachable via `?theme=` URL param through `ClientThemeSync.tsx`. The website-builder skill's Step 6 still generates legacy ThemeConfig files, which are never consumed by the runtime.

---

## Layer 6: Skill-to-Code Drift

The `skills/website-builder/SKILL.md` Step 6 instructs AI agents to write `content/themes/theme-*.json` (legacy ThemeConfig format), but the actual runtime now uses the dimension-based system at `content/dimensions/specs/*.json` + `content/dimensions/bundles/*.json`.

| Aspect | Skill Says | Code Does |
|--------|-----------|-----------|
| Theme file format | Legacy ThemeConfig (16 categories) | Dimension specs (8 dimensions × 2 variants) |
| File location | `content/themes/theme-*.json` | `content/dimensions/specs/*.json` |
| URL param | `?theme=` | `?bundle=` or per-dimension |
| Step 6 output | Legacy theme JSON | Should generate dimension spec files |

The `skills/theme-dimensions/SKILL.md` accurately describes the new dimension system, but `skills/website-builder/SKILL.md` still references the legacy ThemeConfig approach.

---

## Summary: What % is Actually Theme-Controlled?

| Aspect | Theme-Controlled | Hardcoded |
|--------|:-:|:-:|
| **Color palette values** (what the colors ARE) | 100% | 0% |
| **Which color goes where** (primary→CTA, accent→stars) | 0% | 100% |
| **Font families** | 100% | 0% |
| **Font weights/case/spacing** | 100% | 0% |
| **Border radii** | 100% | 0% |
| **Card shadows** | 100% | 0% |
| **Section padding** | 100% | 0% |
| **Container max-width** | 100% | 0% |
| **Grid gap** | 100% | 0% |
| **Nav height/opacity** | 100% | 0% |
| **Transition speed/easing** | 100% | 0% |
| **Section background colors** | 0% | 100% |
| **Text colors per element** | 0% | 100% |
| **Button variant colors** | 0% | 100% |
| **Card base styling** | 0% | 100% |
| **Layout grid columns** | 0% | 100% |
| **Hero overlay style** | 0% | 100% |
| **Icon colors** | 0% | 100% |
| **Non-CMS pages** | 0% | 100% |

---

## Improving the theme-dimensions Skill: Hardcoded Theme Audit

The existing `Verify Dimension Delta` capability checks that A/B spec variants differ enough. A complementary capability is needed to audit the codebase for hardcoded Tailwind classes that bypass the theme system.

### Proposed New Capability: `Audit Theme Surface Coverage`

**Purpose:** Scan component files for hardcoded Tailwind classes that bypass the theme system, and report CSS vars that are emitted but never consumed. Optional dev-mode verification step.

**Behavior modes:**
| Mode | When used |
|------|-----------|
| **Off (default)** | Normal development — no audit |
| **On (dev-mode)** | Before PR, before theme release, or when explicitly requested |

### Audit Check 1: Hardcoded Color Audit

Scan `components/` and `app/` for Tailwind color classes that don't reference CSS vars. Flag classes like `bg-amber-*`, `text-stone-*`, `fill-amber-*`, `border-stone-*`, `from-amber-*`, `to-stone-*` and report file/line/component.

**Fixed contract:**
| Property | Description |
|----------|-------------|
| Inputs | `scanPaths: string[]`, `excludePatterns: string[]` |
| Outputs | `Array<{ file: string; line: number; match: string; component: string }>` |
| Business rules | Scan for regex patterns matching Tailwind color classes. Exclude node_modules, .next, and content/ directories. Report each match with file path, line number, matched text, and inferred component name. |
| Error semantics | No files found → empty array. No matches → empty array. |

**Patterns to scan for:**
```
bg-amber-  text-amber-  fill-amber-  border-amber-  from-amber-  to-amber-
bg-stone-  text-stone-  fill-stone-  border-stone-  from-stone-  to-stone-
```

### Audit Check 2: CSS Variable Consumption Audit

Cross-reference all CSS vars emitted by `compile.ts` against `var(--*)` usage in components. Report vars that are emitted but never consumed.

**Fixed contract:**
| Property | Description |
|----------|-------------|
| Inputs | `emissionFile: string` (path to compile.ts), `scanPaths: string[]` |
| Outputs | `Array<{ cssVar: string; emittedBy: string; consumedBy: string \| null }>` |
| Business rules | Parse `compile.ts` for all `--*` CSS var names returned from compile functions. Scan component files for `var(--*)` usage. Report any emitted var with zero consumption. |
| Error semantics | Emission file not found → error. No component files found → empty consumption list. |

### Audit Check 3: Semantic Color Mapping Audit

Check that components use semantic CSS variables (`var(--color-primary)`) rather than Tailwind utility classes (`text-amber-700`). Flag any Tailwind color class that doesn't have a corresponding CSS var override.

**Fixed contract:**
| Property | Description |
|----------|-------------|
| Inputs | `scanPaths: string[]`, `tailwindPatterns: string[]`, `cssVarMap: Record<string, string>` |
| Outputs | `Array<{ file: string; line: number; tailwindClass: string; suggestedVar: string }>` |
| Business rules | For each Tailwind color class found, check if a corresponding CSS var exists. Report as warning, not error — some hardcoded classes may be intentional. |
| Error semantics | No matches → empty array. |

### Config Additions to `config.yaml`

```yaml
verification:
  hardcoded_theme_audit:
    enabled: false
    scan_paths:
      - "components/"
      - "app/"
    exclude_patterns:
      - "**/node_modules/**"
      - "**/.next/**"
    tailwind_color_patterns:
      - "bg-amber-"
      - "text-amber-"
      - "fill-amber-"
      - "border-amber-"
      - "from-amber-"
      - "to-amber-"
      - "bg-stone-"
      - "text-stone-"
      - "fill-stone-"
      - "border-stone-"
      - "from-stone-"
      - "to-stone-"
    css_var_emission_file: "lib/dimensions/compile.ts"
    component_scan_paths:
      - "components/"
      - "app/"
```

### Example Output

```
=== Hardcoded Theme Audit Results ===

[HARDCODED COLOR] components/cms/CmsRenderer.tsx:128
  bg-stone-900 → CmsHero section background
  Suggestion: use var(--color-hero-bg) instead

[HARDCODED COLOR] components/cms/CmsRenderer.tsx:186
  text-amber-700 → CmsProducts price
  Suggestion: use var(--color-price) instead

[UNCONSUMED CSS VAR] lib/dimensions/compile.ts:251
  --motion-fade-in emitted but never consumed by any component

[UNCONSUMED CSS VAR] lib/dimensions/compile.ts:188
  --sidebar-width emitted but never consumed by any component

[THEME-BLIND PAGE] app/menu/page.tsx
  Uses bg-stone-50, text-stone-900 — no CSS var references found

Found: 47 hardcoded color classes, 19 unconsumed CSS vars, 2 theme-blind pages
```

---

## What Would Need to Change for True Fluidity

1. **Components must reference semantic CSS variables** (`var(--color-section-bg)`, `var(--color-heading)`, `var(--color-body)`, `var(--color-muted)`, `var(--color-accent-element)`) instead of Tailwind utility classes like `bg-stone-50`, `text-stone-600`

2. **The CSS variable compilation must emit semantic color roles** — not just flatten to Tailwind color names. E.g., `--color-hero-bg`, `--color-section-bg-alt`, `--color-price`, `--color-star`, `--color-cta-bg`, `--color-cta-text`, `--color-announcement-bg`

3. **The dimension spec schema must carry semantic color assignments** — not just a 7-color palette, but a mapping of "which semantic role gets which palette color"

4. **Non-CMS pages need theme integration** — menu, dashboard, cart, etc. must consume CSS vars

5. **Layout dimensions must actually be consumed** — `pageColumns`, `sidebar`, `designBalance`, `marginWidth` emit CSS vars that nothing reads

6. **The wording dimension should produce CSS vars** or at least be more tightly integrated with the component rendering

7. **The legacy theme system should be removed** — it's a dead path that creates confusion

8. **The website-builder skill should be updated** to generate dimension spec files instead of legacy ThemeConfig files

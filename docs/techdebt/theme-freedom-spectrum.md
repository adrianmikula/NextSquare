# Theme Freedom Spectrum: Architectural Blockers to 80%

**Filed:** 2026-07-13
**Severity:** Medium (design constraint, not a bug)
**Area:** Dimension Architecture, CMS Rendering, Component Selection, CSS Pipeline
**See also:** `skills/theme-uniqueness/SKILL.md` Step 6 (Market Spectrum Positioning)

## Overview

The dimension architecture currently scores ~60-65% toward freedom/originality on the market spectrum (measured by `skills/theme-uniqueness` Step 6). The target is ~80% — close to the theme multiverse freedom of code-gen tools like Lovable, Bolt.new, and Base44, while preserving tech stack consistency and security.

The fundamental gap: **code-gen tools generate arbitrary JSX structure and component composition. TemplateCafe varies CSS tokens on fixed components.** The dimension system currently controls *how things look* but not *what things render* or *how they compose on the page*.

## Core Design Principles (from Product)

These shape what solutions are acceptable:

1. **daisyUI is optional.** It's the current implementation choice, not a permanent constraint. If a different CSS approach (headless UI, Tailwind-only, CSS modules, a Next.js-native theme library) gives more freedom, we can swap. The dimension system is CSS-framework-agnostic at the spec level.

2. **The dimension system guides, not constrains.** It exists to give the website-builder Claude skill a coherent design vocabulary — not to limit what the skill can generate in final code. If the skill wants a page with a completely different component set than the current CmsBlockRenderer switch supports, that should be possible.

3. **Choice of components is the primary freedom.** The biggest jump toward 80% comes from letting each generated theme select a unique set of components per page slot, not from more CSS var granularity or more A/B/C/D/E variants. 3 variants per dimension is enough.

4. **Architectural integrity is non-negotiable.** The Next.js stack, server-side rendering, security posture, and data flow (specs → compile → CSS vars) are fixed. Changes must preserve these.

## Current Position: What Makes Up the ~60-65%

| Rigid contributor | Points | What it means |
|---|---|---|
| Fixed 9 dimensions, 3 variants | 12 | Composable grid but finite — no way to vary what isn't a dimension |
| daisyUI baseline | 4 | All buttons are `btn`, all cards are `card`, etc. Component morphology is locked |
| Hardcoded compilation pipeline | 3 | `compile.ts` switch + fixed CSS var names + fixed data flow |
| Implicit spec schemas | 2 | Each dimension's JSON shape is implicitly fixed by what compile functions read |
| Fixed font library in code | 2 | `FONT_VAR_MAP` in compile.ts + preload in layout.tsx |

**Not explicitly scored but equally blocking:**

- Every CMS block is a full-width `<section>` — no compositional layout
- `CmsBlockRenderer` switch statement fixes which component handles each block type
- `layout.tsx` skeleton (`Header → main → Footer`) is the same for every theme
- No per-theme CSS injection point
- No mechanism for specs to influence which React component renders

## The 7 Blockers

### Blocker 1: CSS variable surface is fixed in compile.ts (lowest hanging fruit)

`compile.ts` emits exactly the CSS vars its switch statements know about (~80 vars across 9 dimensions). A spec cannot introduce a novel visual concept — it can only vary values within pre-defined buckets.

```typescript
// Current: every CSS var is hand-coded
function compileColor(spec): Record<string, string> {
  return {
    "--color-primary": resolveColor(c.primary, "#888888"),
    "--color-section-bg": background,
    // ... 50+ more hardcoded keys
  }
}
```

A spec like this is impossible today without code changes:

```json
{
  "palette": { "primary": "#7B9E6B" },
  "customCssVars": {
    "--custom-hero-clip-path": "polygon(0 0, 100% 0, 100% 85%, 0 100%)",
    "--custom-card-hover-rotate": "3deg",
    "--custom-border-gradient": "linear-gradient(135deg, var(--color-primary), var(--color-accent))"
  }
}
```

**Fix:** Add a `customCssVars` passthrough in every dimension spec that the compiler merges directly into output. Validate against an allowlist of CSS property prefixes — block `position`, `display`, `z-index`, `!important`, `url()` to preserve layout integrity.

**Spectrum gain:** +5-7 pts
**Effort:** Low (add merge to `compileDimension` in `compile.ts`)
**Risk:** Low (prefix whitelist prevents structural breakage)

### Blocker 2: Component selection is locked in CmsBlockRenderer

`CmsRenderer.tsx:24-82` is a giant `switch` statement that maps block `type` (string) to a hardcoded React component. A spec cannot say "render hero as a video hero" vs "render hero as a carousel" — all hero variety is CSS-driven from the single `CmsHero` component. You can resize/recolor it but not fundamentally restructure its behavior, layout, or content slots.

The dimension system is supposed to *guide* the website-builder skill, not *constrain* what components it can emit. Currently it constrains because the block type → component mapping is in source code, not in config.

**Fix:** Make the block type → component mapping data-driven via a registry that dimension specs or bundle configs can override:

```json
{
  "heroVariant": "video-hero",
  "componentOverrides": {
    "hero": "video-hero",
    "testimonials": "carousel-testimonials",
    "products": "masonry-products"
  }
}
```

Each value references a pre-approved component from a curated library. The website-builder skill can choose among them freely; the system just needs to know which one to render. No new code required per theme.

**Spectrum gain:** +5-8 pts
**Effort:** Medium (add component registry + override resolution in specs; refactor `CmsBlockRenderer` to use it)
**Risk:** Low (component library remains curated and security-reviewed)

### Blocker 3: Every CMS block is a full-width section

All 24 block types render identically at the wrapper level:

```tsx
<section className="bg-section section-py section-px">
  <div className="mx-auto container-max px-4 sm:px-6">
    {/* block content */}
  </div>
</section>
```

There is no `layout` property on blocks. You cannot express:
- A two-column text + image row
- A sidebar + content layout
- A grid of mixed-width cards
- A full-bleed CTA section without the container wrapper

**Fix:** Add a `layout` field to the CMS block data model:

```typescript
type BlockLayout =
  | "full-width"       // current default
  | "half-width"       // 50% container width
  | "two-thirds"       // 66% container width
  | "sidebar-content"  // 1/3 sidebar + 2/3 content
  | "card-grid"        // CSS grid with auto-fit
  | "full-bleed"       // edge-to-edge, no container
```

The `CmsBlockRenderer` wrapper renders the appropriate shell; the block type renderer is unchanged.

**Spectrum gain:** +3-5 pts
**Effort:** Medium (type change + wrapper refactor + CSS)
**Risk:** Low

### Blocker 4: Font library is compile-time locked

`compile.ts:198-207` hardcodes `FONT_VAR_MAP`, mapping font names to CSS variable references. `layout.tsx` preloads all 8 fonts via `next/font/google`. To add a font, you must:
1. Edit `FONT_VAR_MAP` in `compile.ts`
2. Add the `next/font/google` loader call in `layout.tsx`
3. Rebuild

**Fix:** Move font definitions to `config.yaml` or a fonts config file. Dynamically load fonts based on which ones are referenced by the active dimension resolution. The website-builder skill can add fonts by editing config, not source code.

```yaml
fonts:
  - name: "Inter"
    variable: "--font-inter"
    googleFont: true
    weights: [400, 500, 600, 700]
  - name: "Playfair Display"
    variable: "--font-playfair"
    googleFont: true
    weights: [400, 500, 600, 700, 800]
```

**Spectrum gain:** +2-3 pts
**Effort:** Low (extract to config, dynamic loader)
**Risk:** Low (Google Fonts are a well-defined surface)

### Blocker 5: Page skeleton is the same for every theme

`app/layout.tsx` hardcodes:

```tsx
<Header siteProfile={...} blocks={...} />
<main className="flex-1">{children}</main>
<Footer siteProfile={...} blocks={...} />
```

A theme cannot express "no header," "sticky footer as sidebar," "centered single-column minimal layout," or "mega-menu as left sidebar." These are all CSS hacks on the same shell.

**Fix:** Add a `skeletonVariant` to the page-layout dimension (or a dedicated bundle-level setting) that selects among pre-approved layout shell templates:

```typescript
type SkeletonVariant =
  | "standard"       // Header → main → Footer (current)
  | "minimal"        // No header, no footer, content only
  | "landing"        // No header, full-bleed sections, minimal footer
  | "sidebar-nav"    // Sidebar nav → main (no header/footer)
  | "centered"       // Centered single column, nav above
```

**Spectrum gain:** +3-4 pts
**Effort:** Medium (refactor `layout.tsx` into composable shell variants)
**Risk:** Medium (touches root layout; needs thorough testing across all themes)

### Blocker 6: No per-theme CSS injection

There is no mechanism for a theme to inject theme-specific CSS beyond what's in the pre-defined CSS var set. If a theme wants a unique background pattern, border treatment, hover effect, or responsive behavior that doesn't map to a dimension CSS var, it can't.

**Fix:** Add an optional `styles` field to bundle configs that injects scoped CSS. All selectors must be prefixed with a theme-scoped class to prevent leakage:

```json
{
  "name": "Urban Edge",
  "styles": ".theme-bundle-b .hero-section { clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%); } .theme-bundle-b .card { border-left: 4px solid var(--color-primary); }"
}
```

**Spectrum gain:** +2-3 pts
**Effort:** High (CSS sanitizer, scope injection in layout, test matrix)
**Risk:** High-CSS can break layout, override security-required styles (e.g., button focus rings), or introduce unwanted behavior. Requires a strict validation layer (no `position:fixed`, no `z-index`, no `@import`, no `url()`).

### Blocker 7: No mechanism for specs to select page composition

Currently, the block order for each page is fixed in `content/cms/site/pages.json`. A theme cannot rearrange, remove, or add sections beyond what the JSON defines. The website-builder skill can generate different block arrays for different variants (A/B/C pages.json entries), but the system provides no vocabulary for this in the dimension specs themselves — it's a separate data concern.

**Fix:** Add a `pageStructure` dimension or bundle-level config that can reference alternative block arrays or generate dynamic section order from spec fields. This bridges the gap between dimension specs and CMS content.

**Spectrum gain:** +3-4 pts
**Effort:** High (touches CMS content model, page resolution, demo state)
**Risk:** Medium (changes how pages are composed)

## Implementation Roadmap

| Step | Change | Gain | Effort | Risk | Depends on |
|---|---|---|---|---|---|
| **P0** | CSS var passthrough in spec files | +5-7 | Low | Low | — |
| **P0** | Font library to config | +2-3 | Low | Low | — |
| **P1** | Component slot registry with spec overrides | +5-8 | Medium | Low | — |
| **P1** | Block layout property | +3-5 | Medium | Low | — |
| **P2** | Skeleton variants in page-layout | +3-4 | Medium | Medium | Component registry |
| **P2** | Page structure from dimension specs | +3-4 | High | Medium | Component registry |
| **P3** | Scoped CSS injection in bundles | +2-3 | High | High | — |

## Regarding daisyUI

daisyUI is a current implementation choice, not an architectural requirement. It was selected because:
- Its CSS var API maps cleanly to the dimension compiler's output
- It provides a complete component library with accessibility built in
- It eliminates the need for custom CSS for 90%+ of common UI patterns

But it adds rigidity: every `btn`, `card`, `navbar`, `footer`, `badge`, `modal`, `drawer`, `table`, `skeleton`, `input`, `toggle`, `menu` follows daisyUI's markup conventions. A theme cannot substitute a different component library per-theme.

**Options for reducing daisyUI coupling:**

1. **Keep daisyUI as the default, but make it swappable per-theme** via a `componentLibrary` field in bundle configs. Each entry point swaps available component classes. This is high-effort (every component usage must be abstracted) but gives the widest freedom.

2. **Migrate to a headless component library** (e.g., Radix UI, React Aria) with daisyUI as the default styling layer. Components would implement daisyUI classes by default, but themes could substitute any CSS framework or custom CSS by swapping out the styling layer. This is even higher effort but eliminates the daisyUI lock-in entirely.

3. **Generate components in the website-builder skill output, not in source code.** Instead of having `CmsHero` as a permanent component, let the skill emit React components per-theme (similar to how Lovable generates per-request code). This gives maximum freedom but introduces build-time code generation, a significant architectural change. It also conflicts with the "architectural integrity" principle if not carefully scoped.

**Recommendation:** Do P0 and P1 first. By the time those are done, the system is at ~75-80% and the remaining daisyUI rigidity (~4 points) is less impactful. If daisyUI still feels like a bottleneck at that point, evaluate option 1 (swappable per-theme).

## Tradeoff Summary

At ~80%, TemplateCafe would produce sites that:
- **Are visibly different** at a structural level (different components, different page composition, different layout skeletons) — not just different colors and fonts
- **Share a tech stack** (Next.js, React, Tailwind) and security posture (server-side rendering, typed data flow, no arbitrary code execution)
- **Are coherent** because the dimension system still provides a design vocabulary — the skill just has more freedom to choose *which* components to use for each dimension's intent
- **Remain predictable** for debugging and maintenance because all components come from the curated library, even if the selection per-theme varies

The remaining ~20% determinism is the curated component library itself — the guarantee that every generated site uses security-reviewed, accessible, consistent-quality components. This is intentional: it's the "architectural integrity" requirement in practice.

# ADR-012: Dimension-Based Design System

**Date:** 2026-07-10
**Status:** Accepted

## Context

The current theme system generates websites with limited visual diversity. Themes vary primarily in colour palette and block ordering, while deeper design dimensions — typography system, spatial architecture, component morphology, content rhythm — are either fixed or offer only 2–3 enum choices. This produces predictably similar sites regardless of the business profile input.

Key limitations of the current approach:
- **Archetype system** selects from 11 preset home-page block sequences. No mechanism exists to invent novel compositions.
- **Theme dimensions** (`theme-dimensions.md`) define 16 categories but constrain each to 2–4 enum values (e.g. `heroStyle: "image" | "gradient" | "split" | "minimal"`).
- **A/B variant system** is coupled (theme/layout/text are the only axes, each hardcoded to a single A/B choice per axis).
- **Variance checks** ensure themes differ in 8+ categories, but still operate within the limited preset space.

The website-builder skill (Phase 6 — Generate Theme Variants) must produce genuinely distinct visual identities, not colour-swapped versions of the same layout.

## Decision

Replace the monolithic theme file + archetype system with a **dimension-based design system** composed of orthogonal, independently variant design dimensions. Each dimension is a spec file with its own A/B variants. Bundles group coherent default choices across dimensions, but any dimension can be individually overridden at runtime.

### Architecture

```
                         ┌─────────────────────────────┐
                         │  Bundle Config              │
                         │  (coherent A/B assignments)  │
                         │  per dimension, 3 defaults)  │
                         └──────────┬──────────────────┘
                                    │ resolved with URL overrides
                                    ▼
                ┌──────────────────────────────────────┐
                │   Dimension State (runtime)           │
                │   per-dimension: variant A or B       │
                │   resolved from bundle + URL params   │
                └──────────┬───────────────────────────┘
                           │ loads spec files
                           ▼
            ┌──────────────────────────────────────────┐
            │   Dimension Specs (JSON files)            │
            │   spatial-a/b, color-a/b, typography-a/b  │
            │   wording-a/b, imagery-a/b, components-a/b │
            │   rhythm-a/b, motion-a/b                  │
            └──────────────────┬───────────────────────┘
                               │ compiled to CSS
                               ▼
                    ┌──────────────────────┐
                    │  CSS Custom Properties│
                    │  applied to :root     │
                    └──────────────────────┘
```

### The 8 Design Dimensions

| Dimension | Controls | Example parameters |
|-----------|----------|-------------------|
| `spatial` | Page layout architecture, section composition, grid model | column count, content width strategy, section rhythm, block sequence |
| `color` | Colour harmony model, palette hues, application strategy | harmony type (complementary/analogous/triadic/etc.), chroma, accent placement |
| `typography` | Font pairing, scale system, treatment | heading font (any Google Font), body font, scale ratio, weight distribution, letter-spacing |
| `wording` | Text tone, per-block copy variants | tone axis (formal/playful), CTA strategy, per-block A/B copy |
| `imagery` | Image sizing, treatment, placeholder strategy | image aspect ratios, overlay style, treatment (cover/contain/blur/parallax) |
| `components` | Per-component dimensional spec | button style axes, card morphology, nav personality, form character |
| `rhythm` | Section pacing, density, alternation | section spacing, information density, alternation pattern, divider strategy |
| `motion` | Animation language, transitions, scroll effects | transition speed, hover treatment, scroll animation, page transitions |

### Bundle System

Two default bundles (A, B) provide coherent starting points. Each bundle assigns a variant (A or B) to every dimension. Additional bundles (C, D...) can be created on request:

```json
{
  "name": "Coastal Mornings",
  "dimensions": {
    "spatial": "A",
    "color": "A",
    "typography": "A",
    "wording": "A",
    "imagery": "A",
    "components": "A",
    "rhythm": "A",
    "motion": "A"
  }
}
```

### URL Override Scheme

```
# Default: load bundle A for all dimensions
/?bundle=a

# Override individual dimensions
/?bundle=a&color=b&components=b

# No bundle specified = bundle A with these overrides
/?color=b&typo=a

# Explicit per-dimension (no bundle dependency)
/?spatial=b&color=a&typo=b&wording=a&imagery=a&components=b&rhythm=a&motion=a
```

Resolution algorithm:
1. If `bundle` param is set, load that bundle's dimension assignments
2. If any dimension-specific param is set, override that dimension's variant
3. If no `bundle` and no dimension-specific params, default to bundle A
4. If no `bundle` but some dimension-specific params, use bundle A as base + overrides

### Runtime Composition

Each dimension spec is a standalone JSON file. At request time:
1. Resolve variant per dimension (from bundle + URL overrides)
2. Load each dimension's spec file
3. Compile all specs to a flat map of CSS custom properties
4. Apply to `:root` via `ThemeProvider`

This avoids combinatorial explosion (256 permutations pre-generated) because specs are composed at request time. Only 8 × 2 = 16 spec files are needed.

### Backward Compatibility

The existing `theme-a.json` / `theme-b.json` / `theme-c.json` format is preserved. In non-demo mode, the current `readTheme()` + `toCssVars()` path continues to work unchanged. Demo mode activates the new dimension system.

## Rationale

- **Continuous design space**: Dimensions are not limited to enum presets. Any valid value within a dimension's domain is acceptable (e.g. any Google Font pair, any CSS grid column count, any colour harmony).
- **Orthogonal axes**: Each dimension changes independently. Toggling `wording` from A to B does not affect component CSS.
- **Request-time composition**: No pre-generation of all theme permutations. 16 spec files compose to any combination at request time.
- **Three-bundle UX**: Users choose from 3 curated starting points, not 256 blind combinations. Power users can fine-tune individual dimensions.
- **Skill-aligned**: Each dimension maps to a separate generation skill in the proposed skill tree. The generation output is a dimension spec file, not a monolithic theme.
- **Generative, not selective**: The spatial-architecture skill invents novel section compositions instead of selecting from a fixed archetype list.

## Consequences

- Existing `theme-a.json` / `theme-b.json` / `theme-c.json` files remain compatible but are superseded in demo mode.
- The `DemoModePopup` component must be rewritten to support 8 dimension tabs and bundle selection.
- The `ClientThemeSync` component must resolve per-dimension CSS vars instead of toggling a single fallback.
- The `website-builder` skill's "Generate Theme Variants" phase must output dimension spec files instead of (or in addition to) monolithic theme files.
- Archetype system (`archetypes.md`, `generate-archetypes.ts`, `ARCHETYPE_BLOCKS` in renderer.ts) is deprecated for new sites. Existing sites continue to work.
- Generated sites can now genuinely differ across 8 independent axes. Two sites with the same business profile but different random seeds produce visually distinct identities.

## Implementation Plan

1. Create `lib/dimensions/` with types, state management, and spec loading
2. Update `lib/demo/demo-state.ts` to support dimension-aware state
3. Rewrite `components/demo/DemoModePopup.tsx` with bundle + per-dimension UI
4. Update `components/demo/ClientThemeSync.tsx` for dimension CSS compilation
5. Update `components/cms/ThemeProvider.tsx` to accept dimension specs
6. Update page layouts to pass dimension state
7. Create initial dimension spec JSON files from existing theme data
8. Add tests for state resolution, spec loading, and CSS compilation

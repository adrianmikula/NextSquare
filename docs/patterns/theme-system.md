# Theme System

## Principle

Dimension-based design system. The site uses **8 orthogonal design dimensions** (color, typography, spatial, components, rhythm, motion, imagery, wording) each with A/B variants, yielding 256 possible combinations without combinatorial explosion. The `NEXT_PUBLIC_THEME_BUNDLE` env var selects which bundle (combination of dimension variants) is active by default. URL params (`?bundle=X`, `?color=b`, etc.) override per-session.

## Environment Variables

```env
NEXT_PUBLIC_THEME_BUNDLE=A   # default bundle ID (a, b, c, ...)
```

## Dimension Spec Layout

```
content/dimensions/
├── specs/
│   ├── color-a.json, color-b.json
│   ├── typography-a.json, typography-b.json
│   ├── spatial-a.json, spatial-b.json
│   ├── components-a.json, components-b.json
│   ├── rhythm-a.json, rhythm-b.json
│   ├── motion-a.json, motion-b.json
│   ├── imagery-a.json, imagery-b.json
│   └── wording-a.json, wording-b.json
└── bundles/
    ├── a.json   # Purring Patisserie (all A variants)
    ├── b.json   # Whisker & Bean (all B variants)
    └── c.json   # Catnip Modern (mixed variants)
```

## How Themes Are Applied

### Server-side (default path)

`app/layout.tsx` reads the bundle config, resolves the active dimension specs, compiles them with `compileSpecsToCssVars()`, and injects a `<style>` tag on `:root` before first paint:

```tsx
const bundleId = (process.env.NEXT_PUBLIC_THEME_BUNDLE || "A").toUpperCase()
const bundles = getAllBundleConfigs()
const activeBundle = bundles.find((b) => b.id === bundleId)
const dimState = activeBundle?.dimensions ?? defaultDimensionState()
const dimSpecs = resolveDimensionSpecs(dimState)
const cssVars = compileSpecsToCssVars(dimSpecs)

return (
  <ThemeProvider cssVars={cssVars}>
    <style dangerouslySetInnerHTML={{ __html: `:root{${cssVarsStyle}}` }} />
    {children}
  </ThemeProvider>
)
```

### Client-side (URL-driven overrides)

`components/demo/DimensionThemeSync` watches URL params (`?bundle=` or per-dimension overrides like `?color=b`), parses the dimension state, resolves specs, compiles CSS vars, and applies them to `document.documentElement`. Uses `useSyncExternalStore` for popstate + pushState/replaceState interception.

## CSS Variable Mapping

`lib/dimensions/compile.ts` compiles each dimension to CSS custom properties:

### Color
- Palette colors → flat Tailwind slot overrides (`--color-amber-*`, `--color-stone-*`)
- Palette colors → semantic role variables (`--color-section-bg`, `--color-heading`, `--color-price`, etc.)

### Typography
- `headingFont` → `--font-heading`, `bodyFont` → `--font-body`
- `headingWeight` → `--font-heading-weight`, `bodyWeight` → `--font-body-weight`
- `headingCase` → `--text-transform-heading`, `letterSpacing`, `lineHeight`

### Components
- `borderRadius` → `--theme-border-radius`, `--theme-card-radius`, `--theme-button-radius`, `--theme-image-radius`
- `borderWidth` → `--theme-border-width`, `borderStyle` → `--theme-border-style`
- `cardShadow` / `cardHoverShadow` → `--theme-shadow-card` / `--theme-shadow-card-hover`
- `navHeight` → `--nav-height`, `navBgOpacity` → `--nav-bg-opacity`

### Spatial
- `containerMax` → `--container-max`, `sectionPy` → `--section-py`, `sectionPx` → `--section-px`
- `gridGap` → `--grid-gap`, `contentAlign` → `--content-align`
- `heroEnabled` → `--hero-enabled`, `headerStyle` → `--header-style`

### Rhythm
- Section density → `--rhythm-section-py`

### Motion
- `transitionSpeed` → `--transition-speed`, `transitionEasing` → `--motion-easing`
- `hoverLift` → `--motion-hover-lift` + `--motion-hover-lift-transform`

### Imagery
- `defaultAspect` → `--image-default-aspect`, `treatment` → `--image-treatment`

## Theme-Aware Semantic Utility Classes

`app/globals.css` defines reusable theme-aware utility classes in `@layer components`:

### Backgrounds
- `.bg-section`, `.bg-section-alt`, `.bg-section-inverse`, `.bg-section-cta`
- `.bg-card`, `.bg-nav`, `.bg-footer`

### Text Colors
- `.text-heading`, `.text-body`, `.text-muted`, `.text-label`
- `.text-link`, `.text-price`, `.text-star`, `.text-check`
- `.text-cta-text`, `.text-cta-muted`, `.text-hero-text`, `.text-hero-muted`
- `.text-announcement-text`, `.text-footer-muted`, `.text-footer-heading`

### Icons
- `.fill-star`, `.text-star`

### Borders
- `.border-card`

### Hover States
- `.hover-text-link-hover`, `.hover-text-footer-link-hover`

### Legacy Classes (still supported)
- `.section-py`, `.section-px` — section padding
- `.container-max` — centered max-width container
- `.card-themed` — shadow + border-radius + border + transition
- `.button-themed` — border-radius + font-family + transition
- `.image-themed` — border-radius for gallery/menu images

## Variance Requirements

When generating dimension spec variants (see `skills/website-builder/SKILL.md` Step 6):

1. Every variant pair derives colours from `vibe.palette` and `vibe.adjectives`.
2. A **mandatory distinctness check** must be performed before writing any spec. Two variants are too similar if:
   - Primary hue is within 30° AND luminance within 20%
   - Background luminance within 10%
   - Fewer than 3 of `borderRadius`, `cardRadius`, `buttonRadius`, `navHeight`, `cardShadow` differ
3. Each new variant must differ from every previously written variant in at least **4 of the 8 dimensions**.
4. Failure → regenerate the weaker variant with a contrasting direction keyword.

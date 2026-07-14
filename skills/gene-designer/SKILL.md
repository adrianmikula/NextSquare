# Gene Designer Skill — Creating Gene Variants

Create new block type variants registered as json-render components.

## Structure

Each gene lives in `src/genes/<category>/` as a standalone React component:

```
src/genes/
  hero/
    hero-centered.tsx
    hero-split.tsx
    hero-minimal.tsx
  features/
    features-grid.tsx
    features-alternating.tsx
  cta/
    cta-simple.tsx
    cta-split.tsx
```

## Contract

Each gene must:

1. Accept typed props matching its `GeneDefinition` in `src/renderer/registry.ts`
2. Register in `catalog` and `registry` in `src/renderer/registry.ts`
3. Consume taste-engine tuners via `useTuners()` context
4. Apply Soltana archetype tokens via CSS vars (`--arch-*`)
5. Use `@lisse/react` `<SmoothCorners>` for shape-aware corners
6. Be RSC-compatible (no client-side hooks unless necessary)

## Template

```tsx
import { useTuners } from "taste-engine/react"
import { SmoothCorners } from "@lisse/react"

interface Props {
  headline: string
  subheadline?: string
  ctaLabel?: string
  ctaLink?: string
}

export function HeroCentered({ headline, subheadline, ctaLabel, ctaLink }: Props) {
  const tuners = useTuners()
  const padding = tuners.density < 0.4 ? "py-24" : tuners.density < 0.7 ? "py-16" : "py-8"

  return (
    <section className={`${padding} px-4 text-center`}>
      <SmoothCorners corners={{ radius: 16, smoothing: 0.6 }}>
        <h1>{headline}</h1>
        {subheadline && <p>{subheadline}</p>}
        {ctaLabel && ctaLink && <a href={ctaLink}>{ctaLabel}</a>}
      </SmoothCorners>
    </section>
  )
}
```

## Verification

```bash
npm run typecheck
# Preview in gene viewer:
npm run dev -- --gene hero-centered
```

# Gene Designer Skill — Creating Gene Variants

> **Boundary:** Code layer — atomic visual block creation
> **Input:** `GeneDefinition` schema in `src/schema/site-config.ts`
> **Output:** React component registered in `src/renderer/registry.tsx`

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

## Related Skills

- `skills/website-generator/SKILL.md` — Top-level orchestrator
- `skills/tuner-system/SKILL.md` — Tuners consumed by genes via `useTuners()`
- `skills/sequencer/SKILL.md` — Sequencer selects which gene variants to use per industry

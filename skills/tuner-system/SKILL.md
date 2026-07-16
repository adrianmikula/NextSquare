# Tuner System Skill — Taste Engine + Archetypes

> **Boundary:** Code layer — design dimension configuration
> **Input:** `DesignLanguage` + `TunerValues` in `SiteConfig`
> **Output:** CSS custom properties applied to `:root` via `<TasteProvider>` + `<SoltanaProvider>`

## Architecture

```
SiteConfig.tuners → <TasteProvider> → useTuners() in genes → CSS custom properties
SiteConfig.designLanguage → <SoltanaProvider> → data-relief + data-finish attributes → CSS
```

The tuner system sits in the **Code** layer. It transforms continuous design dimensions into
rendered visual output. It is consumed by the sequencer (which sets defaults) and by
website-generator (which lets users tune values).

## Current Tuners (Phase 2)

| Tuner | 0.0 | 1.0 | Used by |
|-------|-----|-----|---------|
| warmth | Cool blue-gray | Warm amber | All genes |
| density | Sparse padding | Dense compact | All genes |
| motion | Static | Cinematic | Hero, Features, CTA |
| contrast | Soft | Sharp | Features, CTA |
| narrative | Minimal hero | Expansive hero | Hero |

## Soltana Reliefs

| Relief | Character | Best for |
|--------|-----------|----------|
| flat | Clean, standard | All industries |
| glassmorphic | Frosted glass, modern | Tech, creative |
| skeuomorphic | Realistic depth | Premium, agencies |
| neumorphic | Soft UI | Dashboards, tools |

## Core Files

| File | Responsibility |
|------|---------------|
| `src/renderer/compile-tuners.ts` | `tunerValuesToTasteEngine()` — maps `TunerValues` to CSS custom properties |
| `src/renderer/tuner-profiles.ts` | Named tuner presets: "Warm & Spacious", "Bold & Compact", etc. |
| `src/archetypes/tokens.ts` | `archetypeTokensToCssVars()` — shape/geometry tokens from `@lisse/react` |
| `src/archetypes/index.ts` | `getArchetypeTokens()` — maps Relief/Finish to Soltana CSS token overrides |
| `src/archetypes/constraints.ts` | `isValidArchetypeForIndustry()` — industry-to-archetype validity rules |

## Testing

```bash
# Verify tuners produce visible difference:
npm run dev -- --tuner warmth 0.0
npm run dev -- --tuner warmth 1.0

# Verify archetype switching:
npm run dev -- --relief glassmorphic --finish frosted
npm run dev -- --relief neumorphic --finish matte
```

## Related Skills

- `skills/website-generator/SKILL.md` — Top-level orchestrator
- `skills/sequencer/SKILL.md` — Sets default tuner values per industry
- `skills/gene-designer/SKILL.md` — Genes consume tuners via `useTuners()`

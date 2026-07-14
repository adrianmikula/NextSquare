# Tuner System Skill — Taste Engine + Archetypes

Configure continuous design dimensions using taste-engine tuners and Soltana archetypes.

## Architecture

```
SiteConfig.tuners → <TasteProvider> → useTuners() in genes
SiteConfig.designLanguage → <SoltanaProvider> → data-relief + data-finish attributes
```

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

## Testing

```bash
# Verify tuners produce visible difference:
npm run dev -- --tuner warmth 0.0
npm run dev -- --tuner warmth 1.0

# Verify archetype switching:
npm run dev -- --relief glassmorphic --finish frosted
npm run dev -- --relief neumorphic --finish matte
```

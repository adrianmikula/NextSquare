---
name: agent
description: >
  Guide for the Claude agent to orchestrate site generation using the generator
  architecture. Covers: interpreting a user brief → writing SiteConfig JSON → running
  the preview → iterating on output → verifying uniqueness with theme-uniqueness.
  This is the primary skill an AI agent loads when asked to generate or iterate on a site design.
---

# Agent Skill — Generator Workflow for Claude

> **Status:** Active — Phase 3+ (renderer MVP complete)

## Mission

When a user asks to generate a site or iterate on a design, the agent follows this loop:

```
user prompt → interpret intent → write SiteConfig JSON → run dev server → preview → verify uniqueness → iterate
```

The running Next.js app is a **static viewer** — all iteration happens by editing `SiteConfig` JSON files and hot-reloading. No runtime design controls exist yet (those come in Phase 5b).

## Prerequisites

- All Phase 0-3 code is implemented (`src/renderer/`, `src/genes/`, `src/archetypes/`, `src/schema/`)
- Dev server can run: `npm run dev`
- Test configs exist at `src/test-configs/`
- `theme-uniqueness` skill is available at `skills/theme-uniqueness/` for verification

## Step 1: Interpret the User's Intent

Map the user's description to SiteConfig fields:

| User says | Map to |
|-----------|--------|
| Industry / vertical | `meta.industry` — determines archetype constraints, tuner profile, gene selection |
| Tone / feel | `meta.tone` — influences tuner values (warmth, density, contrast) |
| Business name | `meta.name` |
| Design style keywords | `designLanguage.relief` + `designLanguage.finish` |

### Industry → Archetype Guidance

| Industry | Recommended relief | Recommended finish | Notes |
|----------|-------------------|-------------------|-------|
| cafe, restaurant, hospitality | flat or glassmorphic | matte or frosted | Warm tones, spacious density |
| saas, tech, startup | glassmorphic or flat | frosted or tinted | Cool tones, higher contrast |
| portfolio, agency | flat or neumorphic | matte | Neutral tones, low density |
| ecommerce | flat | matte or glossy | Balanced tuners, high contrast CTAs |
| finance, legal | flat | matte | Cool tones, low motion |
| entertainment, education | glassmorphic or skeuomorphic | glossy or tinted | High motion, warm accents |

## Step 2: Write the SiteConfig JSON

A `SiteConfig` lives in `src/test-configs/<name>.json`. Structure:

```json
{
  "meta": {
    "name": "Site or Business Name",
    "industry": "cafe | saas | portfolio | ecommerce | ...",
    "tone": "warm and inviting | modern and technical | ..."
  },
  "designLanguage": {
    "relief": "flat | glassmorphic | skeuomorphic | neumorphic",
    "finish": "matte | frosted | tinted | glossy",
    "shape": "arc | squircle | superellipse | clothoid"
  },
  "tuners": {
    "warmth": 0.0-1.0,
    "density": 0.0-1.0,
    "motion": 0.0-1.0,
    "contrast": 0.0-1.0,
    "narrative": 0.0-1.0
  },
  "spec": { "root": "page", "elements": { ... } },
  "content": {}
}
```

### Tuner Quick Reference

| Value | 0.0 | 0.5 | 1.0 |
|-------|-----|-----|-----|
| warmth | Cool blue-gray | Neutral | Warm amber |
| density | Sparse, airy | Balanced | Compact, dense |
| motion | Static | Subtle | Cinematic |
| contrast | Soft, muted | Balanced | Sharp, bold |
| narrative | Minimal hero | Standard hero | Full-height hero |

### Suggested Tuner Profiles by Industry

| Profile | warmth | density | motion | contrast | narrative |
|---------|--------|---------|--------|----------|-----------|
| Cafe / Hospitality | 0.8 | 0.2 | 0.3 | 0.4 | 0.6 |
| SaaS / Tech | 0.2 | 0.7 | 0.6 | 0.8 | 0.3 |
| Portfolio | 0.3 | 0.15 | 0.2 | 0.3 | 0.5 |
| Finance / Legal | 0.15 | 0.4 | 0.15 | 0.5 | 0.4 |
| Entertainment | 0.7 | 0.3 | 0.9 | 0.6 | 0.85 |
| Ecommerce | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 |

### Available Gene Variants

| Category | Variant | Props | Best for |
|----------|---------|-------|----------|
| Hero | `HeroCentered` | headline, subheadline, ctaLabel, ctaLink, image | General purpose, brand-forward |
| Hero | `HeroSplit` | headline, subheadline, ctaLabel, ctaLink, image | SaaS, products, visual storytelling |
| Hero | `HeroMinimal` | headline, subheadline | Portfolios, minimalist brands |
| Features | `FeaturesGrid` | headline, items[{title,description,icon}] | Feature comparison, cards |
| Features | `FeaturesAlternating` | headline, items[{title,description,image}] | Storytelling, product walkthrough |
| CTA | `CtaSimple` | headline, ctaLabel, ctaLink | End-of-page call to action |
| CTA | `CtaSplit` | headline, subheadline, ctaLabel, ctaLink, image | Split layout with visual |

### Spec Structure Pattern

```json
"spec": {
  "root": "page",
  "elements": {
    "page": {
      "type": "Container",
      "props": {},
      "children": ["hero-1", "features-1", "cta-1"]
    },
    "hero-1": {
      "type": "HeroCentered",
      "props": { "headline": "...", "subheadline": "..." },
      "children": []
    }
  }
}
```

## Step 3: Run the Preview

```bash
# Start the dev server
npm run dev

# Open in browser
open http://localhost:3000/preview?config=<filename>.json
```

The preview page shows:
- The rendered page with all tuners and archetypes applied
- A toolbar with config name, current relief/finish/shape, and quick-relief-switch buttons
- A "Download HTML" button for standalone export

### Quick Verification Checklist

1. Does the page match the intended industry feel?
2. Do the hero, features, and CTA sections flow well together?
3. Are the tuner values producing the expected visual effect?
4. Try switching relief (flat → glassmorphic → skeuomorphic → neumorphic) — does the surface treatment change appropriately?
5. Try loading a different config — does it look sufficiently different?

## Step 4: Verify Uniqueness

Run the `theme-uniqueness` skill to audit the generated output:

```bash
# Follow skills/theme-uniqueness/SKILL.md steps 1-4 to audit
# Check that the new SiteConfig produces output visually distinct from existing configs
```

Key checks from `theme-uniqueness`:
- No hardcoded colors or values bypassing the CSS var system
- Generated output differs from existing configs in multiple dimensions
- Tuner values produce visible visual difference (not just theoretical)

## Step 5: Iterate

Based on preview observation, adjust the SiteConfig:

| Problem | Fix |
|---------|-----|
| Too cold/clinical | Increase `warmth` (0.5 → 0.8), consider `glassmorphic` relief |
| Too cramped | Decrease `density` (0.7 → 0.3) |
| Too static | Increase `motion` (0.2 → 0.7) |
| Not enough contrast | Increase `contrast` (0.3 → 0.7) |
| Hero too short | Increase `narrative` (0.3 → 0.8) |
| Wrong surface feel | Change `relief` or `finish` |
| Corners too harsh | Change `shape` to `squircle` or `superellipse` |
| Wrong section variant | Change the `type` in the spec to another variant in the same category |

After each edit, the dev server hot-reloads automatically — refresh the preview to see changes.

## Configs for Reference

| File | Industry | Relief | Character |
|------|----------|--------|-----------|
| `src/test-configs/cafe.json` | cafe | flat | Warm, inviting, spacious |
| `src/test-configs/saas-glass.json` | saas | glassmorphic | Cool, modern, dense |
| `src/test-configs/portfolio-neumorphic.json` | portfolio | neumorphic | Minimal, elegant, airy |

## Related Skills

- `skills/gene-designer/SKILL.md` — For creating new gene variants
- `skills/tuner-system/SKILL.md` — For understanding tuner mechanics in depth
- `skills/sequencer/SKILL.md` — For configuring industry profiles and pacing (Phase 4+)
- `skills/ticonderoga/SKILL.md` — For running Ticonderoga agent competition (Phase 5+)
- `skills/theme-uniqueness/SKILL.md` — For verifying output distinctiveness
- `skills/generator/SKILL.md` — For the full pipeline orchestration (Phase 5+)

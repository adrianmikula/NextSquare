---
name: website-generator
description: >
  Top-level orchestrator for the modern generator architecture. Interprets a user brief,
  coordinates the pipeline skills (business-profile → layout-selector → content-generator → sequencer),
  runs the preview, and iterates on output. This is the primary skill loaded when asked to
  generate or iterate on a site design using the new generator architecture.
---

# Website Generator Skill — Pipeline Orchestrator

> **Status:** Active — Phase 3+ (renderer MVP complete)

## Mission

When a user asks to generate a site or iterate on a design, this skill orchestrates the full
pipeline across the four architectural boundaries:

```
Human Input → AI/Skills → Code → Rendered Output
    ↓              ↓         ↓
  content/    skills/    src/ + lib/
  + scratch/  + .kilo/   + app/ + components/
```

The pipeline produces a `SiteConfig` which is rendered by the Code layer. All iteration happens
by editing config artifacts and hot-reloading.

## Prerequisites

- All Phase 0-3 code is implemented (`src/renderer/`, `src/genes/`, `src/archetypes/`, `src/schema/`)
- Dev server can run: `npm run dev`
- Sub-skills are available: `business-profile`, `layout-selector`, `content-generator`, `sequencer`, `tuner-system`, `gene-designer`

## Pipeline Overview

| Step | Skill | Input | Output | Boundary |
|------|-------|-------|--------|----------|
| 1 | `business-profile` | Raw brief / fetched data | `BusinessProfile` | Human Input → Code |
| 2 | `layout-selector` | `BusinessProfile` | `LayoutOutput` (archetype + variants) | AI/Skills → Code |
| 3 | `content-generator` | `BusinessProfile` + `LayoutOutput` | `PageBundle` (block data) | AI/Skills → Code |
| 4 | `sequencer` | Industry + tone + layout | `SiteConfig` | Code |
| 5 | Render | `SiteConfig` | Rendered page | Code |

### Step 1: Interpret the User's Intent

Map the user's description to pipeline inputs:

| User says | Maps to |
|-----------|---------|
| Industry / vertical | `BusinessProfile.industry` → sequencer industry profile |
| Tone / feel | `BusinessProfile.tone` → tuner values (warmth, density, contrast) |
| Business name | `BusinessProfile.name` |
| Design style keywords | `LayoutOutput.archetype` (relief + finish) |
| Specific sections requested | `LayoutOutput.pageTypes` |

## Step 2: Execute the Pipeline

Load and execute sub-skills in order:

### 2a. Business Profile

Load `skills/business-profile/SKILL.md`.

Extract or construct a `BusinessProfile` from the user's brief. If raw data sources are available
(website, social media, catalogue), fetch them first and save scratch data to `content/scratch/`.

### 2b. Layout Selection

Load `skills/layout-selector/SKILL.md`.

Use the `BusinessProfile` to select archetypes and variants per page. Output a `LayoutOutput`
specifying:
- Archetype (relief, finish, shape)
- Page types and their gene variants
- Section ordering per page

### 2c. Content Generation

Load `skills/content-generator/SKILL.md`.

Generate block data for each section in the layout. Output a `PageBundle` with populated
`blockData` for each gene variant.

### 2d. Sequencing / Assembly

Load `skills/sequencer/SKILL.md`.

Combine the `BusinessProfile` industry + tone with the selected layout to produce a `SiteConfig`.
The sequencer applies pacing rules and produces the final json-render spec.

## Step 3: Write the SiteConfig JSON

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

### Industry → Archetype Guidance

| Industry | Recommended relief | Recommended finish | Notes |
|----------|-------------------|-------------------|-------|
| cafe, restaurant, hospitality | flat or glassmorphic | matte or frosted | Warm tones, spacious density |
| saas, tech, startup | glassmorphic or flat | frosted or tinted | Cool tones, higher contrast |
| portfolio, agency | flat or neumorphic | matte | Neutral tones, low density |
| ecommerce | flat | matte or glossy | Balanced tuners, high contrast CTAs |
| finance, legal | flat | matte | Cool tones, low motion |
| entertainment, education | glassmorphic or skeuomorphic | glossy or tinted | High motion, warm accents |

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

## Step 4: Run the Preview

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

- `skills/business-profile/SKILL.md` — Extract and validate business data into `BusinessProfile`
- `skills/layout-selector/SKILL.md` — Select archetypes and variants per page
- `skills/content-generator/SKILL.md` — Generate block data maps from layout + business profile
- `skills/sequencer/SKILL.md` — Rule-based assembly from industry + tone → `SiteConfig`
- `skills/tuner-system/SKILL.md` — Configure taste-engine tuners and Soltana archetype tokens
- `skills/gene-designer/SKILL.md` — Create new gene variants as json-render components

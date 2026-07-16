# Sequencer Skill — Rule-Based SiteConfig Assembly

> **Boundary:** Code layer — deterministic generation from structured input
> **Input:** `AssembleOptions` (industry, tone, name, designLanguage, templateId, tuners)
> **Output:** `SiteConfig` (json-render spec ready for rendering)

## Architecture

```
AssembleOptions → validate → industry profile lookup → template lookup → pacing enforcement → SiteConfig
```

The sequencer is a **rule-based pipeline** — no LLM involved. It produces a complete `SiteConfig`
from structured inputs. This is the Code-layer counterpart to the AI-driven `layout-selector` and
`content-generator` skills.

## Core Files

| File | Responsibility |
|------|---------------|
| `src/generator/sequencer/assemble.ts` | `assemble()` — main entry point; validates, looks up profile + template, applies pacing, builds `SiteConfig` |
| `src/generator/sequencer/industry-profiles.ts` | 20 industry profiles mapping industry → section template, tuner defaults, archetype preferences, tone guidance |
| `src/generator/sequencer/section-templates.ts` | 12 rhythm patterns (Storyteller, Showcase, Minimal, Data-heavy, etc.) defining 5-8 section slots |
| `src/generator/sequencer/pacing.ts` | `checkPacing()` and `enforcePacing()` — validates and auto-fixes pacing violations |

## AssembleOptions Contract

```typescript
interface AssembleOptions {
  industry: string          // e.g. "cafe", "saas", "portfolio"
  tone: string              // e.g. "warm and inviting", "modern and technical"
  name: string              // Business or site name
  designLanguage: DesignLanguage  // relief, finish, shape
  templateId: string        // e.g. "storyteller", "minimal"
  tuners: TunerValues       // warmth, density, motion, contrast, narrative (0.0-1.0)
}
```

## Industry Profiles

20 built-in profiles in `src/generator/sequencer/industry-profiles.ts`. Each profile defines:

| Field | Purpose |
|-------|---------|
| `industry` | Key used in `AssembleOptions` |
| `sectionTemplateId` | Default rhythm pattern for this industry |
| `tunerProfileName` | Named preset from `src/renderer/tuner-profiles.ts` |
| `preferredArchetype` | Default relief + finish |
| `preferredVariants` | Per gene category, preferred variant names |
| `toneGuidance` | Text description of the intended feel |
| `content` | Default hero headline, feature groups, CTA headline |

## Section Templates

12 rhythm patterns in `src/generator/sequencer/section-templates.ts`:

- Storyteller, Showcase, Minimal, Data-heavy, Product Launch, Landing Page, Long Form, App Showcase, Portfolio, Lead Gen, Event, Coming Soon

Each template defines section slots with `category` (hero, features, cta, etc.) and `variants`.

## Pacing Rules

1. No same-category sections adjacent
2. At least 3 different layout patterns on page
3. CTA above the fold
4. Break up text-heavy sections with visual sections

`enforcePacing()` auto-fixes violations (adds CTA if missing, swaps variant to break adjacent duplicates).

## Output

`assemble()` returns `AssembleResult`:

```typescript
interface AssembleResult {
  config: SiteConfig      // Ready for src/renderer/site-page.tsx
  profile: IndustryProfile
  template: SectionTemplate
  sectionAssignments: SectionInfo[]
  pacingFixes: PacingViolation[]
}
```

## Usage

```typescript
import { assemble, validateAssembleOptions } from "@/src/generator/sequencer/assemble"

const options = {
  industry: "cafe",
  tone: "warm and inviting",
  name: "Aydin's Cafe",
  designLanguage: { relief: "flat", finish: "matte", shape: "arc" },
  templateId: "storyteller",
  tuners: { warmth: 0.8, density: 0.2, motion: 0.3, contrast: 0.4, narrative: 0.6 },
}

validateAssembleOptions(options)
const result = assemble(options)
// result.config is a complete SiteConfig
```

## Testing

```bash
# Verify sequencer output:
npm run typecheck

# Preview assembled config:
npm run dev
# Use /preview?config=cafe.json or load programmatically
```

## Related Skills

- `skills/website-generator/SKILL.md` — Top-level orchestrator that calls this skill
- `skills/tuner-system/SKILL.md` — Tuner profiles and archetype tokens consumed by the sequencer
- `skills/layout-selector/SKILL.md` — AI-driven archetype selection (alternative to sequencer defaults)

---
name: tone-archetype
description: >
  Maps a user's industry + tone/description to explicit design language archetype,
  section template, and tuner values. The agent calls `assemble()` with these
  explicit selections — no code-level tone derivation exists. This skill is the
  sole place where tone influences visual direction.
---

# Tone → Archetype Skill

> **Status:** Active — Phase 4 (sequencer requires all options to be explicit)

## Mission

When a user describes a site ("a cafe in melbourne, warm feel", "american diner with bold reds and whites"), the agent interprets the tone and maps it to concrete selections, then calls `assemble()` with all fields explicitly set.

## API

```typescript
import { assemble } from "@/src/generator/sequencer/assemble"
import type { TunerValues } from "@/src/renderer/compile-tuners"

const result = assemble({
  industry: string,           // must be in VALID_INDUSTRIES
  tone: string,               // the user's tone/description text
  name: string,               // business or site name
  designLanguage: {
    relief: Relief,           // "flat" | "glassmorphic" | "skeuomorphic" | "neumorphic"
    finish: Finish,           // "matte" | "frosted" | "tinted" | "glossy"
    shape: ShapeCurve,        // "arc" | "squircle" | "superellipse" | "clothoid"
  },
  templateId: string,         // must be in VALID_TEMPLATE_IDS
  tuners: TunerValues,        // { warmth, density, motion, contrast, narrative } all 0-1
})
```

All fields are required and validated by `validateAssembleOptions()` before assembly.

## Tone → Relief Mapping

| Tone keywords | Recommended relief | Why |
|---|---|---|
| retro, vintage, nostalgic, classic diner, traditional, rustic, old-fashioned, heritage | `skeuomorphic` | Realistic textures, depth, and ornamentation evoke nostalgia and craft |
| modern, futuristic, tech, sleek, clean, minimal, contemporary, startup | `glassmorphic` | Frosted glass surfaces feel cutting-edge and digitally native |
| soft, gentle, playful, friendly, warm, cozy, inviting, approachable | `neumorphic` | Soft shadows and subtle depth feel tactile and friendly |
| bold, dramatic, edgy, dark, industrial, urban, gritty | `skeuomorphic` | Strong material presence and shadow depth match bold aesthetics |
| corporate, professional, trustworthy, serious, conservative | `flat` | Clean, no-nonsense — safe, reliable, universally legible |
| creative, artistic, expressive, unique, quirky | `neumorphic` or `skeuomorphic` | Tactile or textured surfaces signal creativity |

## Tone → Finish Mapping

| Tone keywords | Recommended finish | Why |
|---|---|---|
| glossy, shiny, chrome, polished, diner, retro 50s, glam, premium, luxury, celebratory | `glossy` | High-shine surfaces feel premium, celebratory, energetic |
| frosted, ethereal, airy, light, gentle, soft, dreamy, minimalist | `frosted` | Translucency feels light, modern, unobtrusive |
| tinted, warm, vibrant, sunny, rich, colorful, bold | `tinted` | Color-washed surfaces amplify warmth and personality |
| matte, flat, subtle, muted, earth, natural, organic, understated, serious | `matte` | No-shine surfaces feel grounded, serious, natural |

## Tone → Shape Mapping

| Tone keywords | Recommended shape | Why |
|---|---|---|
| playful, fun, creative, organic, retro, vintage, curvy, whimsical | `clothoid` | Most organic curve — feels natural, whimsical, nostalgic |
| modern, tech, sleek, sharp, professional, corporate, business, efficient | `superellipse` | Smooth but structured — modern, confident, precise |
| soft, gentle, friendly, warm, rounded, approachable, casual | `squircle` | Rounded but not extreme — approachable, familiar |
| sharp, edgy, bold, dramatic, angular, precise, cutting-edge | `arc` | Minimal curve — sharp, direct, no-nonsense |

## Tone → Tuner Adjustments

Start from the industry profile's default tuner profile, then adjust based on tone:

| Tone detects | Adjust | From → To |
|---|---|---|
| warm, cozy, inviting, rich, sunny | `warmth` | profile default → 0.7-1.0 |
| cool, calm, professional, corporate, clinical | `warmth` | profile default → 0.1-0.3 |
| bold, vibrant, dramatic, high contrast, striking | `contrast` | profile default → 0.7-1.0 |
| soft, subtle, gentle, low contrast, muted | `contrast` | profile default → 0.2-0.35 |
| spacious, airy, open, clean, minimal, generous | `density` | profile default → 0.1-0.3 |
| compact, dense, data, cramped, tight, information-rich | `density` | profile default → 0.7-1.0 |
| playful, dynamic, cinematic, lively, energetic, animated | `motion` | profile default → 0.7-1.0 |
| calm, serene, static, professional, corporate, quiet | `motion` | profile default → 0.1-0.25 |
| story, narrative, expansive, hero, epic, immersive | `narrative` | profile default → 0.7-1.0 |
| concise, minimal, short, compact, direct, to-the-point | `narrative` | profile default → 0.2-0.35 |

## Template Selection

Override the industry profile's default template when the tone suggests a different page rhythm:

| Template | When to use | Best for |
|---|---|---|
| `storyteller` | Narrative-heavy, brand storytelling, emotional connection | Cafe, restaurant, nonprofit, personal brand |
| `showcase` | Visual-first, product or imagery heavy | Agency, fashion, portfolio, hospitality |
| `minimal` | Clean, sparse, maximum whitespace | Finance, legal, consulting, portfolio |
| `data-heavy` | Information-rich, metrics, features | SaaS, tech, analytics, consulting |
| `product-launch` | High-impact, conversion focused | Ecommerce, tech, entertainment |
| `landing-page` | Conversion optimized, lead gen | SaaS, education, fitness, event |
| `long-form` | Extended narrative, educational | Education, nonprofit, storytelling |
| `app-showcase` | Mobile apps, software products | Tech, SaaS, entertainment |
| `portfolio` | Creative work, projects, personal brand | Portfolio, music, personal-brand |
| `lead-gen` | Conversion-first, marketing campaign | Agency, consulting, real-estate |
| `event` | Bold, urgent, registration focused | Event, entertainment, education |
| `coming-soon` | Minimal pre-launch | Any industry in pre-launch phase |

## Complete Example

```
User prompt: "Mama Mahoney's — classic american diner with bold reds and whites, retro 50s feel"
```

Agent reasoning:
1. **Industry**: restaurant (american diner is a restaurant subtype)
2. **Name**: "Mama Mahoney's"
3. **Tone**: "classic american diner, bold reds and whites, retro 50s feel"
4. **Relief**: "retro 50s" + "classic diner" → **skeuomorphic** (retro textures, chrome depth)
5. **Finish**: "diner" + retro 50s implies chrome → **glossy** (shiny diner surfaces)
6. **Shape**: "retro 50s" implies playful curves → **clothoid**
7. **Template**: storyteller — diners are about atmosphere and experience
8. **Tuners**: start from restaurant profile ("Warm & Spacious"), then:
   - "bold reds" → warmth 0.7, contrast 0.7
   - "classic american" → moderate density 0.25
   - Result: `{ warmth: 0.8, density: 0.25, motion: 0.3, contrast: 0.7, narrative: 0.7 }`

```typescript
const result = assemble({
  industry: "restaurant",
  name: "Mama Mahoney's",
  tone: "classic american diner, bold reds and whites, retro 50s feel",
  designLanguage: { relief: "skeuomorphic", finish: "glossy", shape: "clothoid" },
  templateId: "storyteller",
  tuners: { warmth: 0.8, density: 0.25, motion: 0.3, contrast: 0.7, narrative: 0.7 },
})
```

## Constraints to respect

- Relief+finish combos must be valid per `src/archetypes/constraints.ts`:
  - flat: matte, frosted, tinted, glossy
  - glassmorphic: frosted, tinted (never matte or glossy)
  - skeuomorphic: matte, glossy (never frosted or tinted)
  - neumorphic: matte, tinted (never frosted or glossy)
- Tuner values must be 0.0-1.0
- All template IDs are in `src/generator/sequencer/section-templates.ts`
- All industry keys are in `src/generator/sequencer/industry-profiles.ts`
- When in doubt, prefer `flat` relief, `matte` finish, `squircle` shape — these are the safest defaults

---
name: business-profile
description: >
  Extract and validate a BusinessProfile from raw user input or external data sources.
  This is the first step in the modern generator pipeline. Produces the structured
  BusinessProfile artifact consumed by layout-selector and content-generator.
---

# Business Profile Skill

> **Boundary:** Human Input → Code
> **Input:** Raw brief, fetched data, scratch files
> **Output:** `BusinessProfile` (validated TypeScript type)

## Mission

Transform raw business data into a structured `BusinessProfile` that the rest of the
generator pipeline can consume. This skill handles extraction, normalization, and validation
of business data from any source.

## BusinessProfile Contract

Defined in `lib/ai/multi-source-pipeline.ts`:

```typescript
type BusinessProfile = {
  name: string
  type: string
  tagline: string
  description: string
  location: { address: string; suburb: string; city: string }
  hours: Array<{ day: string; open: string; close: string }>
  phone: string
  vibe: { palette: string[]; adjectives: string[] }
  audience: string
  tone: "casual" | "refined" | "rustic" | "modern" | "playful"
  features: string[]
  testimonials: Array<{ author: string; text: string; source: string }>
  catalogue: {
    categories: string[]
    items: Array<{
      name: string
      description: string
      category: string
      priceHint?: number
      modifiers?: Array<{ name: string; options: string[] }>
    }>
  }
  services?: Array<{
    name: string
    description: string
    priceHint?: number
    duration?: string
  }>
  media: { hero?: string; logo?: string; gallery: string[] }
  deliveryUrls?: { uberEats?: string; doorDash?: string }
  social?: { instagram?: string }
  story?: string
  tripAdvisorSummary?: { rating?: number; reviewCount?: number; topKeywords: string[] }
}
```

## Extraction Workflow

### From Raw Brief

When the user provides a text brief:

1. Parse the brief for structured fields:
   - Business name, type, tagline, description
   - Location, phone, hours
   - Tone keywords → map to one of the 5 `tone` enums
   - Features, services, catalogue items
   - Media URLs (hero image, logo, gallery)
   - Social handles, delivery URLs

2. Normalize fields:
   - `tone`: infer from adjectives (warm/rustic → "rustic", modern/clean → "modern", fun/playful → "playful", upscale/elegant → "refined", relaxed/friendly → "casual")
   - `vibe.palette`: derive color keywords from tone
   - `vibe.adjectives`: extract descriptive adjectives from the brief
   - `audience`: summarize target customer from context

3. Validate all required fields are present and non-empty:
   - `name`, `type`, `tagline`, `description`, `location`, `phone`, `tone`, `features`

### From External Sources

When fetching from external sources (see `legacy-website-builder` for source list):

1. Fetch raw data from each source
2. Save raw data to `content/scratch/<business-name>/`
3. Cross-reference data between sources to fill gaps
4. Resolve conflicts (prefer most recent/reliable source)
5. Normalize into `BusinessProfile` shape

### From Existing Files

When loading from existing project data:

- `content/site-profile/demo/site-profile.json` → map to `BusinessProfile`
- `content/catalogue/demo/catalogue.json` → map to `catalogue` field
- `content/scratch/demo/analysis.md` → extract additional context

## Validation Rules

| Field | Rule |
|-------|------|
| `name` | Required, non-empty string |
| `type` | Required, non-empty string (e.g. "cafe", "salon", "saas") |
| `tagline` | Required, non-empty string |
| `description` | Required, at least 50 chars recommended |
| `location` | Required: address, suburb, city all non-empty |
| `hours` | Required: array of day/open/close objects |
| `phone` | Required, non-empty string |
| `tone` | Required: one of `casual`, `refined`, `rustic`, `modern`, `playful` |
| `features` | Required: non-empty array of strings |
| `media.gallery` | Optional but recommended: array of image URLs |
| `media.hero` | Optional: single hero image URL |
| `media.logo` | Optional: logo image URL |

## Usage

```typescript
import type { BusinessProfile } from "@/lib/ai/multi-source-pipeline"

const profile: BusinessProfile = {
  name: "Aydin's Cafe",
  type: "cafe",
  tagline: "Fresh coffee, great food, good vibes",
  description: "...",
  location: { address: "123 Main St", suburb: "Melbourne", city: "Melbourne" },
  hours: [{ day: "Mon-Fri", open: "7:00", close: "17:00" }],
  phone: "(03) 1234 5678",
  vibe: { palette: ["#8B4513", "#D2691E", "#F5DEB3"], adjectives: ["warm", "rustic", "community"] },
  audience: "Local professionals and students",
  tone: "rustic",
  features: ["fresh coffee", "homemade food", "community space"],
  testimonials: [],
  catalogue: { categories: ["coffee", "food"], items: [] },
  media: { gallery: [] },
}
```

## Related Skills

- `skills/website-generator/SKILL.md` — Top-level orchestrator that calls this skill
- `skills/layout-selector/SKILL.md` — Consumes `BusinessProfile` to select layouts
- `skills/content-generator/SKILL.md` — Consumes `BusinessProfile` to generate block data

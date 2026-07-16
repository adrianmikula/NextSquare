---
name: content-generator
description: >
  Generate block data maps from BusinessProfile + LayoutOutput. Produces a PageBundle
  artifact consumed by the renderer. Each archetype block symbol maps to a typed data
  builder function.
---

# Content Generator Skill

> **Boundary:** AI/Skills → Code
> **Input:** `BusinessProfile` + `LayoutOutput`
> **Output:** `PageBundle` (block data for all pages and variants)

## Mission

Populate every block in the selected layout with real data derived from the business profile.
This skill transforms abstract layout structure into concrete, renderable content.

## PageBundle Contract

Defined in `lib/schemas.ts`:

```typescript
type PageBundle = {
  pages: Array<{
    slug: string
    label: string
    archetype: string
    blocks: Array<{ type: string; data: Record<string, unknown> }>
    variants: Array<{
      id: string
      reasoning: string
      order: string[]
      blocks: Array<{ type: string; data: Record<string, unknown> }>
    }>
    seo?: { title: string; description: string }
  }>
}
```

Each page has:
- `blocks`: default variant (A) block data
- `variants`: A/B variants with different block orderings and A/B wording variants

## Core Files

| File | Responsibility |
|------|---------------|
| `lib/ai/multi-source-pipeline.ts` | `BLOCK_DATA_BUILDERS`, `buildDataMap()`, `runPipeline()` |
| `lib/schemas.ts` | `PageBundleSchema`, block data schemas (Hero, Text, Gallery, Products, etc.) |
| `content/archetypes/catalog.json` | Archetype block sets that determine which builders run |
| `lib/ai/archetype-selector.ts` | Provides `LayoutOutput` with block ordering |

## Block Data Builders

`BLOCK_DATA_BUILDERS` in `lib/ai/multi-source-pipeline.ts` maps block symbols to builder functions:

| Block Symbol | Builder Output | Source Fields |
|--------------|---------------|---------------|
| `hero` | `headline`, `subheadline`, `ctaLabel`, `ctaLink`, `image`, `variant` | `name`, `tagline`, `media.hero` |
| `text` | `heading`, `body` | `description`, `name` |
| `gallery` | `images`, `caption` (A/B variants) | `media.gallery`, `vibe.adjectives` |
| `products` | `title` (A/B), `items[{name,description,price}]` | `catalogue.items` |
| `services` | `title` (A/B), `items[{name,description,priceHint,duration}]` | `services` |
| `testimonials` | `items[{author,text (A/B),source}]` | `testimonials` |
| `cta` | `heading`, `subtext`, `buttonLabel` (A/B), `buttonLink` | `name`, `tagline` |
| `hours` | `schedule[{day,open,close}]` | `hours` |
| `form` | `title`, `fields` | — (static contact form) |
| `promo` | `heading`, `body`, `ctaLabel` (A/B), `ctaLink`, `image` | `description`, `name` |
| `delivery` | `heading`, `body`, `platforms` | `deliveryUrls` |
| `slideshow` | `images`, `caption` (A/B) | `media.gallery`, `vibe.adjectives` |
| `social-icons` | `platforms[{name,url,icon}]` | `social`, `deliveryUrls` |
| `callout` | `quote` (A/B), `author`, `role` (A/B) | `testimonials`, `description` |
| `hr` | `style`, `color` | — (static) |
| `image-text` | `items[{image,heading,body,align}]` | `media.hero`, `description`, `story` |
| `comparison` | `title` (A/B), `columns`, `ctaLabel` (A/B), `ctaLink` | `name`, `features` |
| `map` | `address`, `suburb`, `city`, `directionsUrl` | `location` |
| `team` | `title` (A/B), `items[{name,role,bio,photo}]` | `services` |
| `reservation` | `title`, `fields`, `prefillName`, `prefillPhone` | `name`, `phone` |
| `logo` | `image`, `text`, `link` | `media.logo`, `name` |
| `business-name` | `text`, `link` | `name` |
| `slogan` | `text` (A/B) | `tagline` |
| `nav` | `links`, `sticky`, `variant` | — (static navigation) |
| `sitemap` | `columns` | — (static sitemap) |
| `announcement` | `text`, `link`, `linkLabel` | — (static) |
| `copyright` | `text`, `name`, `year` | `name` |
| `phone` | `number`, `display`, `label` | `phone` |
| `page-layout` | `maxWidth`, `contentAlign`, `sectionSpacing`, `sidebarPosition` | — (static) |

## Generation Workflow

### 1. Build Data Map

```typescript
import { buildDataMap } from "@/lib/ai/multi-source-pipeline"

const dataMap = buildDataMap(archetypeBlocks, businessProfile)
// Returns: Record<blockSymbol, blockData>
```

### 2. Assemble PageBundle

For each page in the layout:
1. Get the archetype's block set
2. Build `dataMap` using `buildDataMap()`
3. For each variant (A, B), create `blocks` array with block type + data
4. Add SEO metadata if available

### 3. A/B Wording Variants

Many builders produce A/B wording variants using `makeVariantField()`:

```typescript
function makeVariantField(valueA: string, valueB: string): { a: string; b: string }
```

The renderer resolves A/B variants at runtime based on URL params or defaults.

### 4. Validate

```typescript
import { PageBundleSchema } from "@/lib/schemas"

const validated = PageBundleSchema.parse(pageBundle)
```

## Usage

```typescript
import { buildDataMap, runPipeline } from "@/lib/ai/multi-source-pipeline"

// Option A: Full pipeline
const result = await runPipeline({ businessProfile, llmCall })
console.log(result.bundle)

// Option B: Manual data generation
const catalog = loadArchetypeCatalog()
const blocks = catalog.archetypes["DEFAULT_HOME"].blocks
const dataMap = buildDataMap(blocks, businessProfile)
```

## Related Skills

- `skills/website-generator/SKILL.md` — Top-level orchestrator that calls this skill
- `skills/business-profile/SKILL.md` — Provides the `BusinessProfile` input
- `skills/layout-selector/SKILL.md` — Provides the `LayoutOutput` with block ordering

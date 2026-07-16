---
name: layout-selector
description: >
  Select archetypes and variants per page using the archetype catalog and selection rules.
  Produces a LayoutOutput artifact consumed by content-generator and sequencer.
  Uses LLM (preferred) or rule-based fallback.
---

# Layout Selector Skill

> **Boundary:** AI/Skills → Code
> **Input:** `BusinessProfile` + archetype catalog
> **Output:** `LayoutOutput` (archetype + 2 variants per page)

## Mission

Select the best page layout (archetype) and two distinct block orderings (variants A and B)
for each page in the site. This skill bridges business understanding and design structure.

## LayoutOutput Contract

Defined in `lib/schemas.ts`:

```typescript
type LayoutOutput = {
  selected: Record<string, {
    archetype: string
    variants: Array<{
      id: string
      order: string[]
      reasoning: string
    }>
  }>
  reasoning?: string
}
```

Each page slug gets:
- `archetype`: chosen archetype name from `content/archetypes/catalog.json`
- `variants[0]` (A): feature-forward ordering
- `variants[1]` (B): conservative ordering (closer to archetype's `typicalOrder`)

## Core Files

| File | Responsibility |
|------|---------------|
| `lib/ai/archetype-selector.ts` | `resolveLayout()` — orchestrates LLM or fallback selection |
| `lib/ai/multi-source-pipeline.ts` | `buildSelectorInput()` — constructs input for archetype selector |
| `content/archetypes/catalog.json` | Archetype definitions with `blocks`, `minData`, `excludes`, `bestFor`, `typicalOrder` |
| `lib/schemas.ts` | `LayoutOutputSchema`, `LayoutVariant` — Zod validation schemas |

## Selection Workflow

### 1. Load Inputs

```typescript
import { buildSelectorInput, loadArchetypeCatalog } from "@/lib/ai/multi-source-pipeline"
import { resolveLayout } from "@/lib/ai/archetype-selector"

const catalog = loadArchetypeCatalog()
const selectorInput = buildSelectorInput(businessProfile, catalog)
```

### 2. Resolve Layout

```typescript
const { output: layout, source } = await resolveLayout(selectorInput, llmCall)
// source is "llm" or "fallback"
```

### 3. Validate Output

The `LayoutOutputSchema` in `lib/schemas.ts` validates:
- Every page slug has an archetype
- Each archetype exists in the catalog
- Each variant has exactly 2 entries (A and B)
- `hero` is first if present in the archetype's blocks
- `cta` is no earlier than position 2

## LLM Selection Rules (when LLM is available)

1. Only select from the provided archetype names in the catalog
2. For each page, select the best archetype and produce TWO distinct block orderings
3. Both orderings must use only blocks from the selected archetype's set
4. Variant A should be feature-forward (lift gallery/testimonials/services based on business strengths)
5. Variant B should be conservative (closer to the archetype's typicalOrder hint)
6. `hero` must always be first if present in the archetype block set
7. `cta` must be placed no earlier than position 2
8. Respect `minData` gates: if the profile lacks required data, do not select that archetype
9. Do not invent archetype names not in the catalog
10. For header/footer pages, prefer `STANDARD_HEADER` and `STANDARD_FOOTER`
11. For page-layout, prefer `STANDARD_CONTAINER` for general SMBs; `NARROW_PROSE` for text-heavy; `ASYMMETRIC` for brand-forward

## Fallback Selection (rule-based, no LLM required)

The fallback in `selectArchetypesFallback()`:
1. Iterates through `selectionRules` from the archetype catalog
2. Evaluates each rule's `condition` against the `BusinessProfile`
3. Checks `minData` gates and `excludes` filters
4. Assigns the first matching archetype to each page
5. Builds two variants: A (feature-forward) and B (conservative)

## Archetype Catalog Structure

`content/archetypes/catalog.json` contains:

```json
{
  "version": "1.0",
  "blockVocabulary": { "hero": { "description": "..." } },
  "archetypes": {
    "DEFAULT_HOME": {
      "blocks": ["hero", "text", "gallery", "products", "cta"],
      "minData": { "hero": "media.hero" },
      "excludes": [],
      "bestFor": ["cafe", "restaurant", "retail"],
      "typicalOrder": ["hero", "text", "gallery", "products", "cta"],
      "selectionRules": []
    }
  }
}
```

## Usage

```typescript
import { buildSelectorInput, loadArchetypeCatalog } from "@/lib/ai/multi-source-pipeline"
import { resolveLayout } from "@/lib/ai/archetype-selector"

const catalog = loadArchetypeCatalog()
const input = buildSelectorInput(businessProfile, catalog)
const result = await resolveLayout(input, llmCall)

if (result.success) {
  console.log("Layout:", result.output)
  console.log("Source:", result.source)
}
```

## Related Skills

- `skills/website-generator/SKILL.md` — Top-level orchestrator that calls this skill
- `skills/business-profile/SKILL.md` — Provides the `BusinessProfile` input
- `skills/content-generator/SKILL.md` — Consumes `LayoutOutput` to generate block data
- `skills/sequencer/SKILL.md` — Alternative rule-based path (does not use layout-selector)

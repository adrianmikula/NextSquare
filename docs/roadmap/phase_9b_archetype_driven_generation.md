# Phase 9b: Archetype-Driven Generation with LLM Selection

Phase 9b completes the archetype infrastructure and activates the LLM-backed archetype selection path. All changes from Phase 9a (archetype catalog, layered pipeline, deterministic renderer, Zod validation) remain. Layer 2 (copy) is handled by the Claude skill (coding agent) rather than by coded inference calls in the library. This phase removes the no-API constraint for archetype selection and wires the pipeline end-to-end.

Single-tenant architecture: all generated websites are standalone. No multi-tenant routing, no tenant IDs in filenames, no per-tenant resolution layer. Paths are flat and deterministic.

### 1. Archetype File Format: Markdown + JSON

The canonical archetype definitions live in `skills/website-builder/resources/archetypes.md` (human-editable by Claude during generation). A runtime-consumable JSON artifact is generated from it:

**Source of truth**: `skills/website-builder/resources/archetypes.md`
- Edited by Claude during site generation
- Contains block vocabulary, field contracts, archetype definitions, selection rules, metadata

**Runtime artifact**: `content/archetypes/catalog.json`
- Emitted by a build script (`skills/website-builder/resources/generate-archetypes.ts`) after generation completes
- Consumed by `lib/renderer.ts`, `lib/validate.ts`, and the CMS layer
- No markdown parsing required at runtime
- Single file for the whole site (no tenant suffix)

Example `content/archetypes/catalog.json`:
```json
{
  "version": "1.0",
  "blockVocabulary": { ... },
  "archetypes": {
    "DEFAULT_HOME": {
      "blocks": ["hero", "text", "products", "cta"],
      "minData": { "catalogue": "nonEmpty" },
      "excludes": ["gallery", "delivery", "instagram-feed"],
      "bestFor": ["cafe", "restaurant", "bakery", "retail"],
      "typicalOrder": 4
    },
    ...
  },
  "selectionRules": [ ... ]
}
```

### 2. LLM Archetype Selection (Layer 1)

Rule-based selection remains the default. An LLM-assisted selection path is added as the preferred mode when APIs are available.

**Rule-based path** (fallback, no API required):
- Heuristics match `BusinessProfile` signals to archetype catalog
- Deterministic, inspectable, no cost

**LLM-based path** (preferred when API available):
- Single LLM call receives `BusinessProfile` + archetype catalog
- Returns `{ selected: { page: { archetype, variants: [{ order, reasoning }] } } }`
- The `variants` array contains two orderings (Variant A: feature-forward, Variant B: conservative) of the same archetype block set, each tailored to the business's feature signals
- Validated against Zod schema `LayoutOutput`
- Falls back to rule-based selection on API failure

**Prompt for LLM archetype selection:**
```
You are a web designer selecting page layouts for a small business website.

Business profile:
  type: {type}
  audience: {audience}
  features: {features}
  media: {hero: {hero}, galleryLength: {galleryLength}}
  testimonials: {testimonialCount}
  catalogue: {categoryCount} categories, {itemCount} items

Available page archetypes (each is a named set of block symbols — order is up to you to decide based on the business):
{archetypeCatalogSummarized}

For each page (home, menu, about, contact, faq, gallery), select the best archetype and produce TWO distinct block orderings for that same archetype. Both orderings must use only blocks from the selected archetype's set, but they should differ in placement to suit different user journeys. For example:
  - Variant A: feature-forward (lift gallery / testimonials / services based on business strength)
  - Variant B: conservative default (closer to typicalOrder, lower risk)

Return ONLY valid JSON:
{ "selected": { "home": { "archetype": "ARCHETYPE", "variants": [ { "order": ["hero","gallery","text","products","cta"], "reasoning": "Feature-forward for visually-rich business" }, { "order": ["hero","text","products","cta"], "reasoning": "Conservative default" } ] }, "menu": { ... }, ... } }
```

### 3. Expanded Fixed Archetype Catalog

Archetypes define **which blocks are eligible** for a page, not their order. A fixed `typicalOrder` hint provides a soft reference sequence, but the agent arranges blocks freely based on the business's feature signals.

Example `content/archetypes/catalog.json`:
```json
{
  "version": "1.0",
  "blockVocabulary": { ... },
  "archetypes": {
    "DEFAULT_HOME": {
      "blocks": ["hero", "text", "products", "cta"],
      "minData": { "catalogue": "nonEmpty" },
      "excludes": ["gallery", "delivery", "instagram-feed"],
      "bestFor": ["cafe", "restaurant", "bakery", "retail"],
      "typicalOrder": 4
    },
    ...
  },
  "selectionRules": [ ... ]
}
```

`blocks` is a **set** (membership only). `typicalOrder` is a non-binding hint (approximate ideal block count), not a sequence.

**Home page blocks (eligible sets, not ordered sequences):**

```
GALLERY_FULL_HOME   blocks: {hero, gallery, text, products, cta}
EVENTS_HOME         blocks: {hero, text, promo, services, cta, hours}
LOYALTY_HOME        blocks: {hero, text, products, cta, testimonials}
```

**Inner page blocks:**

```
FAQ_FULL            blocks: {faq, text, cta}
EVENTS_PAGE         blocks: {hero, promo, text, form, cta}
LOYALTY_PAGE        blocks: {hero, text, testimonials, cta}
MEMBERSHIP_PAGE     blocks: {hero, text, form, cta}
PRICING_PAGE        blocks: {hero, services, text, cta}
```

Total after expansion: 9 home archetypes, 9 inner archetypes — each specifying an eligible block set.

Selection rules remain signal-driven; archetype choice determines **which blocks are on the table**, arrangement is agent-dispatched.

Selection rules extended:

| Condition | Archetype |
|---|---|
| `features` contains "events" | `EVENTS_HOME` or `EVENTS_PAGE` |
| `features` contains "loyalty" or "subscriptions" | `LOYALTY_HOME` or `LOYALTY_PAGE` |
| `audience` = "tourists" AND `media.gallery.length >= 3` | `GALLERY_FULL_HOME` |
| `services` defined AND `type` ∈ `{ salon, spa, consultant }` | `PRICING_PAGE` |

### 4. Layout & Theme Pairs

The generation pipeline produces **two independent axes of variation**:

- **Layout variants** — 2 orderings of the chosen archetype's block set per page (Variant A: feature-forward, Variant B: conservative)
- **Theme variants** — 2 distinct `ThemeConfig` objects (inherited from Phase 9: e.g. "Warm Heritage" / "Clean Contemporary")

All four combinations are valid. The owner is not choosing "theme A with layout A" — the owner chooses a theme and a layout independently. Runtime composition is a simple Cartesian product:

```
theme.id × layout.variant.id → active page bundle
```

This keeps generation cheap (only 2 render passes, not 4), and avoids combinatorial explosion in later phases. Content copy is shared across layout variants since the same `dataMap` feeds both orderings.

**`PageBundle` shape:**

```typescript
interface PageBundle {
  page: string;                    // "home", "menu", etc.
  archetype: string;
  variants: Array<{
    id: string;                    // "A" | "B"
    reasoning: string;             // why this arrangement suits the business
    order: string[];               // ordered block symbols
    blocks: CmsBlock[];            // rendered once during generation, reused for both variants
  }>;
}
```

`dataMap` is identical across variants — only `order` differs. The renderer output (`CmsBlock[]`) is cached per variant and reused.

### 5. Demo Mode: Theme × Layout Matrix

Demo mode is a **view-layer feature only**. It introduces no backend schema changes, no API routes, and no database writes.

When the owner clicks the **Demo Mode** button, a small fixed popup appears in the bottom-right corner:

```
┌───────────────────────────────────────────┐
│ Demo Mode                                  │
│                                            │
│ Theme    ○ Heritage (A)                    │
│          ○ Contemporary (B)                │
│                                            │
│ Layout   ○ Feature-forward                 │
│          ○ Conservative                    │
│                                            │
│ Text     ○ Wording A                       │
│          ○ Wording B                       │
│                                            │
│ [ Apply ]                                  │
└───────────────────────────────────────────┘
```

**State shape** (stored in URL query string, no persistence required):

```typescript
interface DemoState {
  theme: 'A' | 'B' | null;
  layout: 'A' | 'B' | null;
  text: 'A' | 'B' | null;
}
```

**Toggling rules:**
- Clicking a radio button updates `DemoState` in the URL
- The page re-renders by selecting the matching `PageBundle.variant` block order, and swapping the text variant within each block's `dataMap`
- `[ Apply ]` commits the chosen pair (layout + text) to the live site (owner-only action)
- `Reset` returns all three axes to `null` (published defaults)
- Demo mode is visually indicated in the admin bar to prevent owner confusion

**Separation of concerns:**

```
┌───────────────────────────────────────────┐
│ CMS Layer                                  │
│  - Authoritative: archetype, blockSymbols, │
│    dataMap (with both wording variants)     │
│  - Does not care about demo state           │
├───────────────────────────────────────────┤
│ Layout Layer                               │
│  - Active variant = DemoState.layout ||    │
│    default                                  │
│  - Re-orders PageBundle.blocks at render   │
│  - No CMS mutation                          │
├───────────────────────────────────────────┤
│ Text Layer                                 │
│  - Active wording = DemoState.text || A    │
│  - Selects dataMap.symbol.wordingVariants  │
│    .a or .b per active choice              │
│  - Swapped at render time only              │
└───────────────────────────────────────────┘
```

Demo mode is purely a **render-time composition** of two independent axes over the same generated content. No data duplication, no API overhead, no backend complexity.

### 6. Text Copy: Wording Variants

For each block in a page bundle, the Claude skill generates **two wordings** for each text-bearing field (heading, body, subheading, CTA label, etc.):

```typescript
interface BlockDataWithVariants {
  heading?: { a: string; b: string };
  subheading?: { a: string; b: string };
  body?: { a: string; b: string };
  cta?: { a: string; labelA: string; labelB: string };
  // ... other block-specific fields
}
```

**Variant A** — feature-forward copy that leads with the business's strongest value proposition.
**Variant B** — softer / more descriptive copy that favours context and tone-matching over conversion.

Both variants share the same structure, same `BlockData` shape, same schema. The difference is purely lexical — the owner sees two ways to say the same thing. The Demo Mode popup adds a **Text** axis to let the owner toggle between them live, alongside the Layout axes.

```typescript
interface DemoState {
  layout: 'A' | 'B' | null;
  text: 'A' | 'B' | null;
}
```

The render-time resolver for text looks up the active wording:

```typescript
function resolveText(
  field: { a: string; b: string } | undefined,
  active: 'A' | 'B'
): string | undefined {
  if (!field) return undefined
  return active === 'A' ? field.a : field.b
}
```

This keeps the CMS storage unambiguous: one `dataMap` per block, with both wordings side by side. No extra pages, no extra blocks, no additional API calls. Copy variants are a first-class dimension of variation alongside layout.

### 7. Deterministic Renderer (Phase 9b Implementation)

`lib/renderer.ts` maps each block symbol to CMS block JSON using the shapes defined in `schemas.md`. No LLM involved in rendering. The agent supplies an explicitly ordered `blockSymbol[]`; the renderer applies it verbatim.

```typescript
// lib/renderer.ts
import type { CmsBlock } from "@/lib/cms"

export function renderBlock(symbol: string, data: BlockData = {}): CmsBlock {
  const renderer = RENDERERS[symbol]
  if (!renderer) throw new Error(`Unknown block symbol: ${symbol}. Known symbols: ${Object.keys(RENDERERS).join(", ")}`)
  return { type: symbol, data: renderer(data) }
}

export function renderPage(orderedBlocks: string[], dataMap: Record<string, BlockData> = {}): CmsBlock[] {
  return orderedBlocks.map((symbol) => {
    const data = dataMap[symbol] ?? {}
    return renderBlock(symbol, data)
  })
}
```

**This is the file the Claude skill calls in Step 5.** The skill arranges blocks into an order tailored to the business, populates `data` for each block symbol from the BusinessProfile (including wording variants A and B), then calls `renderPage()` to get CMS-ready block JSON. The archetype catalog determines *which* blocks are eligible; the agent decides *where* each goes and *what copy* goes in each variant.

`lib/schemas.ts` defines runtime schemas for every Layer 1 and Layer 2 output.

```typescript
// lib/schemas.ts
import { z } from 'zod';

export const LayoutVariantSchema = z.object({
  archetype: z.string(),
  order: z.array(z.string()),
  reasoning: z.string().optional(),
});

export const TextVariantSchema = z.object({
  symbol: z.string(),
  a: z.record(z.any()),
  b: z.record(z.any()),
});

export const LayoutOutputSchema = z.object({
  selected: z.record(z.object({
    archetype: z.string(),
    variants: z.array(LayoutVariantSchema),
  })),
  reasoning: z.string().optional(),
});

export const CopyBlockSchema = z.object({
  symbol: z.string(),
  wordingVariants: z.object({
    a: z.record(z.any()),
    b: z.record(z.any()),
  }),
});

export const CopyOutputSchema = z.object({
  blocks: z.array(CopyBlockSchema),
});

export const ArchetypeCatalogSchema = z.object({
  version: z.string(),
  blockVocabulary: z.record(z.object({
    description: z.string(),
    fields: z.array(z.string()),
  })),
  archetypes: z.record(z.object({
    blocks: z.array(z.string()),
    minData: z.record(z.string()).optional(),
    excludes: z.array(z.string()).optional(),
    bestFor: z.array(z.string()).optional(),
    typicalOrder: z.number().optional(),
  })),
});
```

Every LLM response passes through its Zod schema before proceeding. Failed validations trigger a retry with the validation errors appended to the prompt (AiWordpressGenerator's validateAndRepair pattern, but with Zod as the source of truth).

### 8. Zod Schema Validation

When the agent (Claude skill) receives an archetype's block set, it composes the final order using these priorities:

1. **Hero first** — the `hero` block (if in the set) always leads the page; it establishes visual identity.
2. **Feature-driven lift** — blocks that match the business's strongest signals are pulled forward:
   - `gallery` → lifted when `media.gallery.length >= 3` or the business is visually-driven
   - `testimonials` → lifted when `testimonials.length >= 3` and `type` ∈ `{ salon, restaurant, cafe, hotel }`
   - `services` → lifted when `services` is non-empty
3. **Conversion drives the close** — `cta` is placed no earlier than block index 2 (maximum 3); it anchors the bottom of the page.
4. **Content density dictates middle** — sparse profiles minimize middle blocks; rich profiles fill up to the archetype's `typicalOrder` count.
5. **Excluded blocks are not in the set** — `excludes` from the archetype are stripped before arrangement begins; the agent cannot place a block that isn't in the set.

The result is a `PageBundle` with an explicitly ordered `blocks: string[]` field — no ambiguity at render time.

### 9. Agent-Driven Block Arrangement

The current Step 4 in `SKILL.md` uses flat heuristics ("add menu if categories exist"). This is replaced by the archetype selection protocol.

**New Step 4 protocol:**
1. Load `skills/website-builder/resources/archetypes.md`
2. Apply rule-based selection for each needed page using BusinessProfile signals → yields an archetype name
3. The archetype provides a **block set** (eligible blocks). The agent arranges these blocks into two distinct orderings:
   - **Variant A (feature-forward):** Lifts the block type most relevant to the business (gallery if visually-rich, testimonials if review-heavy, services if services-defined)
   - **Variant B (conservative fallback):** Sticks closer to the archetype's `typicalOrder` hint; safer for sparse content
4. Validate both ordered block lists: every symbol must exist in `blockVocabulary`, and all blocks must satisfy their `minData` gate (drop any that don't)
5. Document the arrangement reasoning per page per variant in `content/scratch/page-selection.md`
6. If LLM APIs available (Phase 9b), optionally delegate arrangement to the LLM via the archetype selection prompt; fall back to `typicalOrder` + rule-based ordering

The agent owns block placement. Archetypes define eligibility; the agent composes two sequences for owner choice.

### 10. Constraint Removed for Phase 9b

The constraint "Do not call OpenAI, Anthropic, or any LLM API" is removed in Phase 9b. The pipeline now supports both paths:
- Rule-based: runs without any API (preserves offline/dev capability)
- LLM-based: runs when API keys are configured, falls back to rule-based on failure

### 11. Iteration Loop and Finalise Stage

After generation, the owner goes through a closed feedback loop with the Claude skill before the site goes live:

**Iteration protocol:**

1. **Initial demo** — Claude presents both axes (layout × text) via the Demo Mode popup
2. **Owner feedback loop** — The owner gives structured feedback:
   - "I like layout A, but the hero heading in text variant A feels off — rewrite it more casually"
   - "Bump the services block higher on layout B"
3. **Claude applies adjustments** — The skill patches only the named variant(s); unchanged variants are preserved
4. **Re-demo** — The Demo Mode popup refreshes with the updated variants; owner toggles to confirm
5. **Repeat** until the owner signs off on every axis

**Finalise stage:**

When the owner confirms all axes, the Claude skill runs the finalise sequence:

```
Step 6 — Finalise Website
  1. Discard unwanted variants: delete everything not selected as default for each axis
     - Remove layout variant B on every page if owner chose layout variant A
     - Remove text wording variant B on every block if owner chose wording variant A
  2. Promote selected variants to defaults:
     - Set layout.default = "A" in the runtime config (first variant list entry is treated as default)
     - Inline the chosen wording into each block's text-bearing field (flatten { a, b } → string)
  3. Strip remaining variant labels from copy:
     - Remove `wordingVariants` / `{ a, b }` wrappers from block data
     - Keep only the chosen wording as a plain string
  4. Update `content/archetypes/catalog.json`:
     - Remove unused variants from each page entry
     - Collapse `dataMap` to single wording per field
     - If output format changes, strip variant metadata
  5. Write finalised CMS pages to `pages.json` (overwriting draft)
     Each page has one `blocks` array (the chosen variant's rendered blocks)
  6. Confirm to owner: "Website finalised with layout A, text A. All unused variants have been removed."

Production bundle then contains:
  - One ordered block list per page (the chosen layout variant)
  - One wording per field (the chosen copy variant)
  - No discarded variants or dead A/B state in the shipped code
```

**Core architecture invariant:** The finalise step is a **pruning and promotion** operation, not a rebuild. It removes the non-defaults and flattens the chosen variant into the runtime structure. No new schemas, no extra fields, no reintroduction of variant state in production.

### 12. Metadata Review Decision

Kept all metadata fields (`minData`, `excludes`, `bestFor`, `typicalOrder`) in Phase 9b. Review scheduled for Phase 10 (publishing pipeline) based on operator feedback. If `bestFor` proves redundant with selection rules, it can be dropped; if `typicalOrder` is never consumed, it can be dropped. Both are non-breaking to remove.

### 13. Adoption Path (Phase 9b Actions)

| Step | Action | File |
|---|---|---|
| **9b.1** | Expand `archetypes.md` — archetypes define block **sets** (not ordered sequences); `typicalOrder` is a non-binding hint | `skills/website-builder/resources/archetypes.md` |
| **9b.2** | Create `lib/renderer.ts` — accepts an ordered `string[]` from the agent, renders each symbol to CMS block JSON | `lib/renderer.ts` |
| **9b.3** | Create `lib/schemas.ts` — `LayoutOutput.selected` is `{ archetype, variants: LayoutVariantSchema[] }`, `CopyBlockSchema.wordingVariants: { a, b }`; agent supplies 2 arrangements and 2 wordings | `lib/schemas.ts` |
| **9b.4** | Add `LayoutVariantSchema` and `TextVariantSchema` with fields `{ archetype, order, reasoning }` and `{ symbol, a, b }` | `lib/schemas.ts` |
| **9b.5** | Create `skills/website-builder/resources/generate-archetypes.ts` — MD → JSON emitter; emits `blocks` as a set | `skills/website-builder/resources/generate-archetypes.ts` |
| **9b.6** | Rewrite `SKILL.md` Step 4: agent produces Variant A + Variant B layout orderings per page from the archetype block set | `skills/website-builder/SKILL.md` |
| **9b.7** | Add LLM archetype selection prompt that returns `{ archetype, variants: [{ order, reasoning }, ...] }` | `lib/ai/archetype-selector.ts` |
| **9b.8** | Remove "Do not call OpenAI/Anthropic" constraint from SKILL.md Constraints section | `skills/website-builder/SKILL.md` |
| **9b.9** | Wire skill Step 5: agent arranges 2 layout variants → populates `dataMap` per symbol with `wordingVariants { a, b }` → calls `renderPage(orderedBlocks, dataMap)` for each variant | `skills/website-builder/SKILL.md` |
| **9b.10** | Frontend: add Demo Mode popup toggling `layout × text` axes via URL query string; no backend changes | Frontend component |
| **9b.11** | Add `Step 6 — Finalise Website` to `SKILL.md`: prune non-default variants, promote chosen layout/text to defaults, strip variant wrappers from CMS data, write finalised pages | `skills/website-builder/SKILL.md` |
| **9b.12** | Remove multi-tenant routing from page components (`app/[tenant]/` → flat `app/` routes) | Page routes |
| **9b.13** | Simplify `lib/cms.ts` — remove `tenant` parameter; all paths are single-site root | `lib/cms.ts` |

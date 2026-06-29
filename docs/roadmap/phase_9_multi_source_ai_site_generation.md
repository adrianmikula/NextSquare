# Phase 9: Multi-Source AI Site Generation

## Goal

Auto-generate a complete, production-ready website by ingesting multiple real-world data sources from the target business — social profiles, review platforms, product photos, and legacy websites — to produce structured CMS content and two distinct theme variants for the owner to choose between.

---

## Input Sources

| Source | Data Extracted |
|--------|---------------|
| **Facebook Page** | Business name, category, location, hours, phone, description, cover/avatar imagery, post captions, featured products |
| **Instagram Feed** | Visual identity (colour palette, styling), product photos, lifestyle imagery, tone of captions, hashtags, follower demographics |
| **Google Business / Maps** | Reviews (sentiment, common phrases, keywords), profile photos, service categories, opening hours, address, Q&A |
| **Uploaded Photos** | Menu/product shots, interior/decor photos, signage, staff, equipment — used for visual matching and hero imagery |
| **Legacy WordPress / Old Website** | Existing content, structure, brand assets, menu text, about copy, testimonials |

---

## Architecture

```
Input Sources (Facebook, Instagram, Google, Photos, WordPress)
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Source Ingestion Layer                      │
│                                                         │
│  • Facebook Graph API / Page scrape                     │
│  • Instagram Graph API / feed fetch                     │
│  • Google Places / Business Profile APIs                │
│  • Direct image upload (admin drag-drop)                │
│  • WordPress REST API or HTML scraper                   │
│  • All outputs normalised to CanonicalBusinessProfile   │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              AI Generation Pipeline                      │
│                                                         │
│  1. Business Profiler                                   │
│     → BusinessType (cafe, restaurant, bakery, etc.)     │
│     → PrimaryAudience (families, professionals, tourists)│
│     → ToneOfVoice (casual, refined, rustic, modern)     │
│     → UniqueSellingPoints extracted from reviews/posts  │
│                                                         │
│  2. Catalogue Builder                                   │
│     → Extracts Menu / Products / Services               │
│     → Infers categories, prices, descriptions           │
│     → Identifies modifiers (sizes, dietary options)     │
│     → Output: SquareCatalogStructure                    │
│                                                         │
│  3. Content Copywriter                                  │
│     → Generates: Hero, About, Services, Contact, CTA   │
│     → Tone-adapts for PrimaryAudience                   │
│     → Integrates testimonials from review data          │
│     → SEO-optimised meta per page                       │
│     → Output: CMSPageContent[]                          │
│                                                         │
│  4. Theme Matcher                                       │
│     → Analysed visual identity from photos/logos        │
│     → Generates 2 × ThemeConfig variants                │
│       (e.g. "Warm Rustic" vs "Modern Minimal")           │
│     → Colours, fonts, spacing, hero style per variant   │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Generated Website                           │
│                                                         │
│  • CMS content ready for review (single draft)          │
│  • Two theme variants selectable in dashboard           │
│  • Owner compares side-by-side → picks / customises     │
│  • Square Catalog populated from generated catalogue    │
│  • Images optimised and assigned to content/Square      │
│  • SEO metadata pre-configured                          │
└─────────────────────────────────────────────────────────┘
```

---

## Pipeline Architecture: Layered Structural Composition

The single-prompt approach ("generate a 4-page website for a cafe") produces generic, repetitive output because the LLM has no structured vocabulary to compose with. This phase introduces a **layered composition model** that separates three concerns:

1. **Structural layout** — which sections appear and in what order
2. **Copy** — the content that fills each section
3. **Markup** — how each section renders in the CMS

This separation is the single highest-leverage improvement available for content generation quality, governability, and output variety.

### 1. Page Archetypes (Structural Vocabulary)

Define a catalog of named page archetypes — each specifies a **set of eligible block types** that encode proven layout patterns. The agent arranges these blocks into an order tailored to the specific business. Each archetype maps to a set of the block types already rendered by the platform.

**`skills/website-builder/resources/archetypes.md`** — the authoritative block vocabulary:

```
BLOCK VOCABULARY:
  hero                → Full-width cover with heading, subheading, CTA buttons
  text                → Heading + body paragraph, generic content section
  products            → Grid of catalogue items with images and prices
  gallery             → Photo grid / masonry from business media
  services            → Service list or feature grid
  testimonials        → Customer quotes with attribution
  cta                 → Call-to-action banner with button
  hours               → Hours table + address; rendered by CmsHours
  faq                 → Accordion of Q+A pairs
  form                → Enquiry / booking / contact form
  promo               → Seasonal offer or special banner
  delivery            → Delivery partner logos and links

> **Note**: `social-proof`, `instagram-feed`, and `menu-preview` are not yet wired to CMS block components. They remain in the vocabulary as future extensions. Do not use them in archetype definitions until `CmsRenderer` cases exist.

Archetype definitions specify which blocks are eligible; arrangement is agent-dispatched (home page examples):

```
DEFAULT_HOME        blocks: {hero, text, products, cta}
GALLERY_FIRST       blocks: {hero, gallery, text, cta, hours}
GALLERY_FULL_HOME   blocks: {hero, gallery, text, products, cta}
SERVICES_HOME       blocks: {hero, services, text, testimonials, cta, hours}
SOCIAL_PROOF_HOME   blocks: {hero, testimonials, text, products, cta, testimonials}
MINIMAL_HOME        blocks: {hero, text, cta}
MENU_FOCUSED        blocks: {hero, products, text, cta}
EVENTS_HOME         blocks: {hero, text, promo, services, cta, hours}
LOYALTY_HOME        blocks: {hero, text, products, cta, testimonials}
```

Inner page archetypes:

```
MENU_DEFAULT        blocks: {hero, products, cta}
ABOUT_STORY         blocks: {hours, text, testimonials, faq, cta}
CONTACT_DIRECT      blocks: {hours, text, form, cta}
FAQ_FULL            blocks: {faq, text, cta}
GALLERY_FULL        blocks: {gallery, text, cta}
EVENTS_PAGE         blocks: {hero, promo, text, form, cta}
LOYALTY_PAGE        blocks: {hero, text, testimonials, cta}
MEMBERSHIP_PAGE     blocks: {hero, text, form, cta}
PRICING_PAGE        blocks: {hero, services, text, cta}
```

**Archetype selection (rule-based, applied to BusinessProfile)** chooses which archetype fits; the agent then arranges its block set. Archetypes define eligibility and structural vocabulary; the agent composes the sequence.

**Agent arrangement priorities:**
1. `hero` leads if in the set
2. Feature-driven lift: `gallery` lifted for visually-rich businesses; `testimonials` lifted for review-heavy businesses; `services` lifted when services are non-empty
3. `cta` anchors the bottom (index ≥ 2, max index 3)
4. Content density: sparse profiles short-circuit; rich profiles use the archetype's full set
5. Excluded blocks are never in the set — the agent cannot place them

### 2. Three-Layer Generation Pipeline

Inspired by the AiWordpressGenerator pipeline (layout → copy → content). Each layer has a single responsibility and produces a well-defined output:

```
Layer 1: Layout
  Input:  BusinessProfile
  Output: { page: { archetype: string, variants: [{ order: [BLOCK_SYMBOL, ...], reasoning }] }, ... }
  Agent:  Selects archetype from BusinessProfile signals, then produces two orderings
          (Variant A: feature-forward, Variant B: conservative). Archetype defines
          eligibility; agent composes sequence for owner choice.

Layer 2: Copy (per block, parallel)
  Input:  page, shared dataMap (identical for both variants), BusinessProfile
  Output: { blocks: [ { symbol, ...fields }, ... ] }
  LLM call: "Write copy for block X of page Y, given this context"

Layer 3: Markup (per variant, concurrent, deterministic)
  Input:  page, ordered block symbols, copy blocks
  Output: Gutenberg HTML / CMS block JSON
  Renderer: renderPage(orderedBlocks, dataMap) — no LLM needed
```

**Why layering works:**

- **Smaller LLM contexts**: Each call focuses on one task. A layout call doesn't waste tokens on copywriting; a copy call doesn't waste tokens on tag balancing.
- **Independent retry**: A failed markup layer retries without regenerating copy. Failed copy for one block doesn't corrupt the other blocks on the same page.
- **Parallelism**: Copy layer fans out across all blocks simultaneously. Markup layer fans out across all pages simultaneously. This is the parallel fan-out pattern from the AiWordpressGenerator pipeline.
- **Interceptability**: Each layer's output is inspectable. If the owner wants a different arrangement, only Layer 1 reruns; Layers 2 and 3 adapt to the new structure.

**The key invariant: layers reference blocks by symbol, in explicit order.** The agent determines placement based on business signals. An archetype defines eligibility; the agent determines sequence. Downstream layers consume the ordered block list directly.

### 3. The Archetype Catalog as a Governable Module

Archetypes are not hardcoded into prompts. They are a **data file** (`archetypes.md`) that:

- Operators can edit without touching LLM prompts
- Can be versioned in git independently
- Can be A/B tested ("DEFAULT_HOME vs MINIMAL_HOME conversion rate")
- Can be extended per vertical ("RESTAURANT_DEFAULT", "BAKERY_DEFAULT")
- Can carry metadata for downstream tooling:

```
DEFAULT_HOME:
  blocks: [hero, text, products, cta]
  minData: { catalogue: "nonEmpty" }
  bestFor: [cafe, restaurant, bakery]
  excludes: [gallery, delivery]
  typicalOrder: 4
```

`blocks` is a **set** (membership). `typicalOrder` is a non-binding hint (approximate ideal block count), not a sequence. The agent arranges blocks during generation.

This metadata drives progressive enhancement: `minData` gates prevent selecting an archetype with empty data; `excludes` prevents blocks that have no backing data. Eligible blocks are then arranged by the agent based on business-specific feature signals.

### 4. 2026 Tools That Make Layered Generation Production-Ready

The layered approach only becomes superior to single-prompt generation when each layer is reliable. The following 2026 tooling makes that achievable without a dedicated engineering team.

#### 4a. Structured Outputs (Schema Enforcement)

**What**: Guarantee that LLM responses match a predefined JSON schema at the token level — not post-validated, but constrained during generation.

**Tools**:
- **OpenAI JSON Schema strict mode** — `response_format: { type: "json_schema", json_schema: { ... } }` — zero invalid responses, available on GPT-4o and later.
- **Anthropic tool_use forcing** — define a single tool whose `input_schema` is your target schema; `tool_choice: { type: "tool", name: "..." }` forces the model to emit only that tool call's input.
- **Pydantic / Zod** — define schemas in code; generate JSON Schema automatically; validate responses; retry on failure.
- **Instructor** (Python) / `zodTextFormat` (TS, Vercel AI SDK) — one-call wrapper that sends schema + prompts + validates + retries.
- **Outlines** — finite-state-machine constrained decoding for local models (Ollama, vLLM). Compiles schemas into token masks. Zero invalid outputs, no retries.

**Where it applies in the pipeline**:
- Layer 1 (Layout): schema = `{ page: string[] }` — enforce the layout must be an array of known block symbols.
- Layer 2 (Copy): schema = `{ blocks: { symbol: string, ...fields }[] }` — enforce one entry per symbol with correct field shapes.
- Layer 3 (Markup): schema = `string` (HTML) with format guidance, or skip structured output and use a renderer function (deterministic, no LLM needed — see below).

**Why this matters**: The current Phase 9 architecture applies `response_format: { type: 'json_object' }` — valid JSON, but no schema enforcement. At scale, this means ~5-10% of responses have subtle shape errors (missing fields, wrong types, renamed keys) that propagate silently. Structured outputs eliminate this class of failure.

#### 4b. Prompt Optimization (DSPy / GEPA)

**What**: Instead of hand-tuning prompts, define the desired input/output behavior declaratively and let an optimizer find the best prompt structure and few-shot examples.

**Tool**: **DSPy** (Stanford, v3+). The GEPA optimizer uses reflection to improve instructions against a metric.

**Where it applies**:
- The archetype selection prompt (Layer 1) can be optimized for "best layout quality" against a set of test businesses.
- The copy prompt (Layer 2) can be optimized for "tone match + conversion score".
- The markup prompt (Layer 3) can potentially be eliminated entirely (see 4c below).

**Why this matters**: The current architecture has hand-written prompts in `lib/ai/content-copywriter.ts`. When the LLM provider changes or new block types are added, prompts require manual tuning. DSPy's compiler re-optimizes automatically against a held-out eval set.

#### 4c. Deterministic Rendering (Replace Layer 3 LLM Call)

**What**: AiWordpressGenerator already demonstrates this. Once Layer 2 produces typed copy blocks, **no LLM is needed for markup**. A deterministic renderer function maps each block symbol + fields to valid CMS markup / Gutenberg HTML.

**Implementation**: The `skills/website-builder/resources/schemas.md` block data shapes become the input to a renderer like AiWordpressGenerator's `renderer.js`:

```typescript
// lib/renderer.ts (deterministic, no LLM)
const RENDERERS = {
  hero:          (d) => wpCover(wpHeading(d.heading,1) + wpParagraph(d.subheading) + ctaButtons(d)),
  text:          (d) => wpHeading(d.heading,2) + wpParagraph(d.body),
  products:      (d) => productGrid(d.items),
  gallery:       (d) => imageGrid(d.items),
  // ...
};
```

**Why this matters**: Eliminates the most failure-prone layer (generating valid HTML from free text), removes a 10-30s LLM call per page, and guarantees block structure consistency across regenerations.

#### 4d. Graph-Based Orchestration (LangGraph 2.0)

**What**: Model the entire generation pipeline as a directed graph with typed state, conditional routing, and retry loops.

**Where it applies**:
- The pipeline is naturally a **pipeline** (sequential: Layout → Copy → Markup) with a **branching** step (archetype selection per page) and **parallel** sub-steps (copy per block, markup per page).
- LangGraph 2.0 (MIT-licensed, production-proven as of Feb 2026) handles retry branching, parallel fan-out, and human checkpoint pauses.
- For the current skill (no LLM APIs), this is future infrastructure. For Phase 14+ (LLM-enabled), this is the recommended scaffolding.

**Alternative for simpler setups**: **Heym** provides no-code visual prompt chain editing — useful for non-technical operators adjusting the pipeline without code changes.

#### 4e. JSON Repair & Validation Libraries (Bridge, Not Destination)

**What**: Tools that salvage broken JSON from model output — closing unclosed braces, stripping code fences, recovering partial responses.

**Tools**: `json-repair` (jsontech.net), custom salvage parsers. AiWordpressGenerator's `validateAndRepair` implements this inline.

**Status in 2026**: This is a **bridging technique** only. When structured outputs (4a) are available, repair logic should be minimal (strip markdown fences, parse). Heavy repair indicates the upstream layer is failing and should be fixed at the prompt or schema level, not papered over.

### 5. Canonical Block Data Shapes

The archetype vocabulary and copy layer must agree on field definitions per block. This replaces the current ad-hoc block fields in `skills/website-builder/resources/schemas.md` with a **vocabulary contract**:

```
BLOCK FIELD REGISTRY (skills/website-builder/resources/archetypes.md):

hero:
  required: [heading, subheading, cta_primary]
  optional: [cta_secondary, image, alignment]
  renderer: CmsHero

text:
  required: [heading, body]
  optional: [image, image_position]
  renderer: CmsText

products:
  required: [title, items]
  items: [{ name, description, price, image_url }]
  renderer: CmsProducts

testimonials:
  required: [items]
  items: [{ quote, author, role, source }]
  renderer: CmsTestimonials

cta:
  required: [heading, cta]
  optional: [subheading, alignment]
  renderer: CmsCta

gallery:
  required: [items]
  items: [{ url, alt, caption }]
  renderer: CmsGallery
  placeholder: true (if sources empty)

// ... one entry per block type rendered by the platform
```

This registry serves three purposes:
1. **Prompt engineering**: Layer 2 copy prompt references the registry to know what fields to fill.
2. **Schema generation**: The registry compiles directly into a Zod/Pydantic schema for Layer 2 structured output validation.
3. **Renderer dispatch**: The CMS `CmsRenderer` uses the `renderer` field to select the correct component.

### 6. Adoption Path for Phase 9

| Step | Action | Deliverable |
|---|---|---|
| **9.1** | Create `skills/website-builder/resources/archetypes.md` with block vocabulary + archetype definitions as **block sets** (unordered) + `typicalOrder` hint + selection rules | Data file, no code |
| **9.2** | Create `lib/renderer.ts` (deterministic block renderer) — accepts an explicitly ordered `string[]` from the agent; same `dataMap` reused across 2 layout variants | TypeScript module |
| **9.3** | Layer 1: agent selects archetype + produces **two orderings** (Variant A feature-forward, Variant B conservative); layout output is `{ archetype, variants: [{ order, reasoning }] }` | Pipeline + agent protocol |
| **9.4** | Add Layer 2 (Copy) — one LLM call per block symbol, parallel fan-out; shared across both layout variants for the same page | Pipeline module |
| **9.5** | Remove Layer 3 LLM call; replace with deterministic `renderer.ts` (called once per variant) | Code removal + renderer |
| **9.6** | Add Zod schema validation on Layer 1 output (`{ archetype, variants }`) + Layer 2 outputs | Validation layer |
| **9.7** | Add DSPy GEPA optimization for archetype selection + arrangement prompts | Optimization module (future) |
| **9.8** | When LLM APIs are enabled, scaffold LangGraph state machine for the pipeline | Orchestration layer (Phase 14+) |

**Quick win**: Steps 9.1 + 9.2 deliver the highest value with the least risk. Archetypes as block sets give the agent structural vocabulary without constraining placement; the deterministic renderer removes the most failure-prone LLM call. Both are pure skill/code changes. Two layout variants and two wordings per block give the owner a meaningful choice without backend complexity.

---


## What's Built

### 1. Source Ingestion Layer

```typescript
// lib/ai/source-ingestion.ts

interface CanonicalBusinessProfile {
  name: string;
  type: string;
  tagline: string;
  description: string;
  location: { address: string; suburb: string; city: string };
  hours: DayHours[];
  phone: string;
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  vibeIndicators: {
    palette: string[];
    fonts: string[];
    imagery: string[];
  };
  testimonials: { author: string; text: string; source: string }[];
  menuIndicators: { item: string; category: string; priceHint?: number }[];
  features: string[];
  toneOfVoice: 'casual' | 'refined' | 'rustic' | 'modern' | 'playful';
  primaryAudience: string;
}

interface SourceFetchResult {
  facebook?: Partial<CanonicalBusinessProfile>;
  instagram?: Partial<CanonicalBusinessProfile>;
  google?: Partial<CanonicalBusinessProfile>;
  wordpress?: Partial<CanonicalBusinessProfile>;
  photos: { url: string; tag: string }[];
}

export async function ingestSources(
  inputs: {
    facebookUrl?: string;
    instagramUrl?: string;
    googlePlaceId?: string;
    photos?: File[];
    wordpressUrl?: string;
  }
): Promise<SourceFetchResult> {
  const results: SourceFetchResult = { photos: [] };

  if (inputs.facebookUrl) results.facebook = await fetchFacebookPage(inputs.facebookUrl);
  if (inputs.instagramUrl) results.instagram = await fetchInstagramFeed(inputs.instagramUrl);
  if (inputs.googlePlaceId) results.google = await fetchGoogleBusiness(inputs.googlePlaceId);
  if (inputs.wordpressUrl) results.wordpress = await fetchWordPressSite(inputs.wordpressUrl);
  if (inputs.photos) results.photos = await processUploadedPhotos(inputs.photos);

  return results;
}
```

Each source fetcher returns a normalised partial profile. The Facebook/Instagram/Google fetchers use official APIs where available; the WordPress scraper falls back to parsing the public HTML or using the REST API if credentials are provided.

### 2. Business Profiler (LLM)

Combines all source data into a single unified profile:

```typescript
// lib/ai/business-profiler.ts
export async function buildBusinessProfile(
  sources: SourceFetchResult
): Promise<CanonicalBusinessProfile> {
  const merged = mergeSources(sources); // deduplicate, reconcile conflicts

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a brand analyst for cafés, restaurants, and small food businesses.
          Given raw source data, produce a complete CanonicalBusinessProfile.
          - Infer toneOfVoice from captions, reviews, and imagery descriptions.
          - Infer primaryAudience from review language, location, and business type.
          - Extract 3–5 unique selling points from reviews/posts.
          - Normalise hours, phone, address from all available sources.
          - Resolve conflicts: prefer Facebook/Google for hours, Instagram for vibe.`,
      },
      { role: 'user', content: JSON.stringify(merged) },
    ],
  });

  return JSON.parse(completion.choices[0].message.content!);
}
```

### 3. Catalogue Builder

Produces the Square-compatible menu/product structure:

```typescript
// lib/ai/catalogue-builder.ts

interface GeneratedCatalogue {
  categories: { name: string; description: string }[];
  items: {
    name: string;
    description: string;
    category: string;
    price: number;
    currency: string;
    modifiers: { name: string; options: { name: string; priceDelta: number }[] }[];
    imageUrl?: string;
  }[];
}

export async function buildCatalogue(
  profile: CanonicalBusinessProfile
): Promise<GeneratedCatalogue> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Extract a complete menu/product catalogue from the business profile.
          - Create logical categories (e.g., "Coffee", "Breakfast", "Pastries").
          - Include 5–20 items per category based on available evidence.
          - Infer prices from context clues, location, and category.
          - Suggest modifier groups relevant to the item type.
          - Use the business's toneOfVoice in all descriptions.`,
      },
      { role: 'user', content: JSON.stringify(profile) },
    ],
  });

  return JSON.parse(completion.choices[0].message.content!);
}
```

### 4. Content Copywriter (Skill-Backed Layer 2)

The runtime pipeline does **not** contain a coded LLM copywriter module — `content-copywriter.ts` is **absent** from the codebase. Layer 2 (copy) is handled by the **Claude skill** (`skills/website-builder/SKILL.md`) when invoked by a coding agent or IDE. The agent uses the deterministic `buildDataMap()` and `BLOCK_DATA_BUILDERS` in `lib/ai/multi-source-pipeline.ts` to populate each block's `data` fields from the `BusinessProfile`, then calls `renderPage(orderedBlocks)` / `renderBundle()` to produce final CMS block JSON.

This means the "LLM engine" for copy is the agent executing the skill instructions, not an API call in the library. No API key is required at runtime for content generation. The skill provides tone-matching, audience-aware, conversion-optimized copy instructions for the agent to follow when populating fields.

**CMS structure (single draft, owner-editable):**

```typescript
CMS draft (tenant: <businessId>):
  pages/
    home.json       ← generated blocks, editable in /dashboard/cms
    about.json
    menu.json       ← mirrors Square catalogue; syncs on toggle
    contact.json
  media/
    hero-1.jpg      ← optimised from source photos or generated
    logo.png        ← extracted from Facebook/Instagram/WordPress
```

### 5. Theme Matcher — Two Variants

Analyses visual identity and produces two distinct `ThemeConfig` objects:

```typescript
// lib/ai/theme-matcher.ts
export async function generateTwoThemes(
  profile: CanonicalBusinessProfile
): Promise<[ThemeConfig, ThemeConfig]> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a web designer. Given a business visual profile, generate 2 distinct
          theme configurations (ThemeConfig). They should differ meaningfully in overall direction
          while both staying true to the brand. For example:
            - "Warm Heritage" (earthy, textured, serif fonts)
            - "Clean Contemporary" (light, crisp, sans-serif)
          Return JSON: { themeA: ThemeConfig, themeB: ThemeConfig }`,
      },
      { role: 'user', content: JSON.stringify(profile.vibeIndicators) },
    ],
  });

  const parsed = JSON.parse(completion.choices[0].message.content!);
  return [parsed.themeA, parsed.themeB];
}
```

**`ThemeConfig` shape:**

```typescript
interface ThemeConfig {
  name: string;                  // e.g. "Warm Heritage"
  description: string;           // 1-sentence rationale
  colors: {
    primary: string;             // hex
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  typography: {
    heading: string;             // Google Font family
    body: string;
    weights: { heading: number; body: number };
  };
  spacing: {
    sectionPadding: string;      // e.g. "4rem"
    containerMax: string;        // e.g. "1200px"
    borderRadius: string;       // e.g. "0.5rem"
  };
  components: {
    heroStyle: 'image' | 'split' | 'minimal';
    cardStyle: 'elevated' | 'flat' | 'bordered';
    buttonStyle: 'filled' | 'outlined' | 'ghost';
    navStyle: 'solid' | 'transparent' | 'sticky';
  };
  images: {
    hero: string;                // chosen source photo URL or generated
    logo: string;                // extracted / generated logo
    atlas: string[];             // additional source photo URLs for gallery
  };
}
```

### 6. Square Catalogue Sync

Maps the generated catalogue into Square Catalog API (mirrors Phase 10):

- Upserts categories → Square `CATEGORY`
- Upserts items → Square `ITEM` with `ITEM_VARIATION` and `MODIFIER_LIST`
- Links best-match source photo to each item via `imageIds`
- Idempotency keys prevent duplicate creation on re-run

### 7. Owner Review Dashboard

The owner previews both themes side-by-side before committing:

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Connect Sources       Step 2: Generated Content   │
│  ┌─────────────────────┐        ┌─────────────────────────┐│
│  │ Facebook  ✓ Connected│        │ Review content draft:   ││
│  │ Instagram ✓ Connected│        │ Name, tagline, About    ││
│  │ Google   ✓ Connected│        │ Menu items (12)         ││
│  │ Photos   3 uploaded  │        │ Hours, testimonials     ││
│  │ [Upload more]        │        │ [Edit any field inline] ││
│  └─────────────────────┘        └─────────────────────────┘│
│                                                             │
│  Step 3: Choose Your Theme                                  │
│  ┌──────────────────────┐   ┌──────────────────────┐       │
│  │  Theme A: Warm       │   │  Theme B: Clean      │       │
│  │  Heritage             │   │  Contemporary         │       │
│  │  [Preview]            │   │  [Preview]            │       │
│  │                      │   │                       │       │
│  │  Colour: #8B6914     │   │  Colour: #FFFFFF      │       │
│  │  Font: Playfair       │   │  Font: Inter          │       │
│  │                      │   │                       │       │
│  │  [Select A]          │   │  [Select B]           │       │
│  └──────────────────────┘   └──────────────────────┘       │
│                                                             │
│  Step 4: Publish                                            │
│  [Launch Site]  [Make Further Edits]                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Source Fetcher Details

### Facebook Page
- Graph API `/page-id?fields=name,about,category,location,hours,phone,cover,emails,website`
- Requires `facebookPageId` + user access token via OAuth or app token for public pages

### Instagram Feed
- Graph API `/page-id/feed?fields=media_type,media_url,caption,timestamp,like_count`
- Extracts: dominant colours from images, caption sentiment, posted products

### Google Business Profile
- Places API ` Place Search` + Place Details
- Fetches: reviews (text + rating + time), photos, opening hours, address, phone, type

### Uploaded Photos
- Accept multi-file upload (drag-drop or camera)
- EXIF orientation correction, compression, thumbnail generation
- Vision LLM pass on each image: generates tags, detects colour palette, identifies objects (menu board, dish, interior)

### Legacy WordPress
- Option A: WP REST API (`/wp-json/wp/v2/pages`, `/wp-json/wp/v2/posts`, `/wp-json/wp/v2/media`) if XML-RPC enabled and creds supplied
- Option B: HTML scraper (Puppeteer / Playwright) — fetch pages, extract text, meta tags, image URLs
- Preserves existing SEO where sensible; replaces broken/unmaintained content

---

## Environment Variables (Additional)

```env
# AI
OPENAI_API_KEY=
# Optional: image generation for missing assets
REPLICATE_API_KEY=

# Source Ingestion (optional — owners provide URLs directly)
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
GOOGLE_PLACES_API_KEY=
WORDPRESS_APPLICATION_PASSWORD=
```

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **LLM** | GPT-4o | Structured JSON output, strong extraction and tone analysis |
| **Theme count** | 2 variants | Owner choice without overwhelm; both tied to real brand inputs |
| **Layout count** | 2 orderings per page | Agent arranges archetype block set two ways (feature-forward / conservative); same dataMap, different sequence |
| **Text count** | 2 wordings per block | A/B lexical variants per text field; owner toggles live in Demo Mode |
| **CMS storage** | Single draft in platform CMS | Owner edits primary copy; themes are JSON configs |
| **Catalogue** | Square Catalog API first | Items appear in POS immediately; CMS references them |
| **Image strategy** | Extract + fill-gap generation | Use real photos first; DALL-E/Replicate for missing assets only |
| **Review integration** | Google + Facebook reviews → testimonials | Social proof directly lifts conversion |
| **Tone analysis** | Cross-source sentiment + caption style | Consistent voice across generated copy |
| **Demo mode** | Theme × Layout × Text matrix | View-layer toggles; owner iterates with Claude until happy, then finalises |
| **Finalise step** | Prune + promote | Keeps core schema clean; discards non-default variants before production |
| **Structure** | Archetype catalog + layered pipeline | Separates layout, copy, and markup; enables independent retry, parallelism, and governable output variety |
| **Markup rendering** | Deterministic renderer (no LLM) | Eliminates the most failure-prone generation step; guaranteed block structure; zero additional inference cost |
| **Validation** | Zod / Pydantic schema on Layer 1 + Layer 2 | Structured output enforcement eliminates shape errors; repair logic only needed as fallback |

---

## Deliverable

- Cafe owner provides URLs and/or photo uploads → complete website generated in minutes
- Comprehensive business profile extracted from Facebook, Instagram, Google, and photos
- Menu/product catalogue extracted and upserted to Square
- Full CMS content (single draft) generated with tone matched to primary audience
- Two distinct theme variants, both visually grounded in the business's actual aesthetic
- Owner reviews side-by-side, selects a theme, edits content, and publishes
- Legacy WordPress content migrated where useful; broken/missing content auto-generated

---

---

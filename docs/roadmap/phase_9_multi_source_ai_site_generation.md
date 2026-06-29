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

Define a catalog of named page archetypes — pre-composed sequences of block types that encode proven layout patterns. Each archetype maps directly to a sequence of the block types already rendered by the platform.

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

Archetype definitions (home page examples):

```
DEFAULT_HOME        → hero, text, products, cta
GALLERY_FIRST       → hero, gallery, text, cta, hours
GALLERY_FULL_HOME   → hero, gallery, text, products, cta
SERVICES_HOME       → hero, services, text, testimonials, cta, hours
SOCIAL_PROOF_HOME   → hero, testimonials, text, products, cta, testimonials
MINIMAL_HOME        → hero, text, cta
MENU_FOCUSED        → hero, products, text, cta
EVENTS_HOME         → hero, text, promo, services, cta, hours
LOYALTY_HOME        → hero, text, products, cta, testimonials
```

Inner page archetypes:

```
MENU_DEFAULT        → hero, products, cta
ABOUT_STORY         → hours, text, testimonials, faq, cta
CONTACT_DIRECT      → hours, text, form, cta
FAQ_FULL            → faq, text, cta
GALLERY_FULL        → gallery, text, cta
EVENTS_PAGE         → hero, promo, text, form, cta
LOYALTY_PAGE        → hero, text, testimonials, cta
MEMBERSHIP_PAGE     → hero, text, form, cta
PRICING_PAGE        → hero, services, text, cta
```

**Selection logic (rule-based, applied to BusinessProfile):**

| Signal | Archetype preference |
|---|---|
| `media.gallery.length >= 3` | GALLERY_FIRST over DEFAULT |
| `services` is non-empty AND `type` ∈ `{ bakery, caterer, cleaner, handyman, salon, consultant }` | `SERVICES_HOME` |
| `testimonials.length >= 3` AND `type` ∈ `{ salon, restaurant, cafe, hotel }` | `SOCIAL_PROOF_HOME` |
| `features` contains "events" OR `audience` = "tourists" | `MENU_FOCUSED` |
| `media.gallery` empty AND `features` length < 2 | `MINIMAL_HOME` |
| Default fallback | `DEFAULT_HOME` |

Archetype selection is a **branching** step in the generation pipeline — different inputs produce different structural compositions without rewriting copy or markup logic.

### 2. Three-Layer Generation Pipeline

Inspired by the AiWordpressGenerator pipeline (layout → copy → content). Each layer has a single responsibility and produces a well-defined output:

```
Layer 1: Layout
  Input:  BusinessProfile, selected archetypes
  Output: { page: [BLOCK_SYMBOL, ...], ... }
  LLM call: "Design a layout for this business using these block symbols"

Layer 2: Copy (per block, parallel)
  Input:  page, block symbol list, BusinessProfile
  Output: { blocks: [ { symbol, ...fields }, ... ] }
  LLM call: "Write copy for block X of page Y, given this context"

Layer 3: Markup (per page, concurrent)
  Input:  page, block symbols, copy blocks
  Output: Gutenberg HTML / CMS block JSON
  LLM call: "Render these blocks as CMS markup using this schema"
```

**Why layering works:**

- **Smaller LLM contexts**: Each call focuses on one task. A layout call doesn't waste tokens on copywriting; a copy call doesn't waste tokens on tag balancing.
- **Independent retry**: A failed markup layer retries without regenerating copy. Failed copy for one block doesn't corrupt the other blocks on the same page.
- **Parallelism**: Copy layer fans out across all blocks simultaneously. Markup layer fans out across all pages simultaneously. This is the parallel fan-out pattern from the AiWordpressGenerator pipeline.
- **Interceptability**: Each layer's output is inspectable. If the owner wants a different layout, only Layer 1 reruns; Layers 2 and 3 adapt to the new structure.

**The key invariant: layers reference blocks by symbol, not by position.** This means a layout change (swap FEATURE_GRID_3 for FEATURE_LIST) automatically propagates through all downstream layers without manual re-prompting.

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

This metadata drives progressive enhancement: `minData` gates prevent selecting an archetype with empty data (archetypal media gate); `excludes` prevents blocks that have no backing data.

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
| **9.1** | Create `skills/website-builder/resources/archetypes.md` with block vocabulary + archetype definitions + selection rules | Data file, no code |
| **9.2** | Create `lib/renderer.ts` (deterministic block renderer) mirroring AiWordpressGenerator's pattern | TypeScript module |
| **9.3** | Add Layer 1 (Layout) to `lib/ai/multi-source-pipeline.ts` — LLM or heuristic archetype selection | Pipeline module |
| **9.4** | Add Layer 2 (Copy) — one LLM call per block symbol, parallel fan-out | Pipeline module |
| **9.5** | Remove Layer 3 LLM call; replace with deterministic `renderer.ts` | Code removal + renderer |
| **9.6** | Add Zod schema validation on Layer 1 + Layer 2 outputs | Validation layer |
| **9.7** | Add DSPy GEPA optimization for archetype selection + copy prompts | Optimization module (future) |
| **9.8** | When LLM APIs are enabled, scaffold LangGraph state machine for the pipeline | Orchestration layer (Phase 14+) |

**Quick win**: Steps 9.1 + 9.2 deliver the highest value with the least risk. The archetype catalog makes output immediately more varied and governable; the deterministic renderer removes the most failure-prone LLM call. Both are pure skill/code changes that don't require new infrastructure.

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

### 4. Content Copywriter

Generates the CMS page content, tone-matched to the audience:

```typescript
// lib/ai/content-copywriter.ts

interface CMSPageContent {
  slug: string;
  title: string;
  blocks: {
    type: 'hero' | 'text' | 'gallery' | 'cta' | 'hours' | 'testimonials';
    data: Record<string, unknown>;
  }[];
  seo: { title: string; description: string; keywords: string };
}

export async function generateContent(
  profile: CanonicalBusinessProfile,
  catalogue: GeneratedCatalogue
): Promise<CMSPageContent[]> {
  const pages = ['home', 'about', 'menu', 'contact'];

  return Promise.all(
    pages.map((slug) =>
      openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Generate structured CMS page content for a ${profile.type}.
              Audience: ${profile.primaryAudience}.
              Tone: ${profile.toneOfVoice}.
              Use the business name "${profile.name}" and location "${profile.location}".
              Weave in testimonials naturally.
              Prioritise conversion: clear CTAs, phone/address prominent.`,
          },
          { role: 'user', content: `Generate the "${slug}" page.` },
        ],
      }).then((r) => r.choices[0].message.content!)
    )
  ).then((results) => results.map((r) => JSON.parse(r)));
}
```

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
| **CMS storage** | Single draft in platform CMS | Owner edits primary copy; themes are JSON configs |
| **Catalogue** | Square Catalog API first | Items appear in POS immediately; CMS references them |
| **Image strategy** | Extract + fill-gap generation | Use real photos first; DALL-E/Replicate for missing assets only |
| **Review integration** | Google + Facebook reviews → testimonials | Social proof directly lifts conversion |
| **Tone analysis** | Cross-source sentiment + caption style | Consistent voice across generated copy |
| **Preview step** | Mandatory | Owner must approve before site goes live |
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

## Phase 9b: Archetype-Driven Generation with LLM Selection

Phase 9b completes the archetype infrastructure and activates the LLM pipeline. All changes from Phase 9a (archetype catalog, layered pipeline, deterministic renderer, Zod validation) remain; this phase adds LLM-backed archetype selection, removes the no-API constraint, and wires everything together end-to-end.

### 1. Archetype File Format: Markdown + JSON

The canonical archetype definitions live in `skills/website-builder/resources/archetypes.md` (human-editable by Claude during generation). A runtime-consumable JSON artifact is generated from it:

**Source of truth**: `skills/website-builder/resources/archetypes.md`
- Edited by Claude during site generation
- Contains block vocabulary, field contracts, archetype definitions, selection rules, metadata

**Runtime artifact**: `content/archetypes/<tenant>.json`
- Emitted by a build script (`skills/website-builder/resources/generate-archetypes.ts`) after generation completes
- Consumed by `lib/renderer.ts`, `lib/validate.ts`, and the CMS layer
- No markdown parsing required at runtime

Example `content/archetypes/<tenant>.json`:
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
- Returns `{ selected: { page: archetypeName }, reasoning?: string }`
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

Available page archetypes (block compositions):
{archetypeCatalogSummarized}

Select the best archetype for each page needed (home, menu, about, contact, faq, gallery).
Consider: gallery-first if many photos; testimonials-heavy if many reviews; minimal if sparse content.
Return ONLY valid JSON:
{ "selected": { "home": "ARCHETYPE", "menu": "ARCHETYPE", ... }, "reasoning": "..." }
```

### 3. Expanded Fixed Archetype Catalog

Additional archetypes added to `skills/website-builder/resources/archetypes.md`:

**Home page:**
```
GALLERY_FULL_HOME   → hero, gallery, text, products, cta
EVENTS_HOME         → hero, text, promo, services, cta, hours
LOYALTY_HOME        → hero, text, products, cta, testimonials
```

**Inner pages:**
```
FAQ_FULL            → faq, text, cta
EVENTS_PAGE         → hero, promo, text, form, cta
LOYALTY_PAGE        → hero, text, testimonials, cta
MEMBERSHIP_PAGE     → hero, text, form, cta
PRICING_PAGE        → hero, services, text, cta
```

Total after expansion: 9 home archetypes, 9 inner archetypes. Covers all current platform page types plus `events`, `membership`, `pricing` as future-ready additions.

Selection rules extended:

| Condition | Archetype |
|---|---|
| `features` contains "events" | `EVENTS_HOME` or `EVENTS_PAGE` |
| `features` contains "loyalty" or "subscriptions" | `LOYALTY_HOME` or `LOYALTY_PAGE` |
| `audience` = "tourists" AND `media.gallery.length >= 3` | `GALLERY_FULL_HOME` |
| `services` defined AND `type` ∈ `{ salon, spa, consultant }` | `PRICING_PAGE` |

### 4. Deterministic Renderer (Phase 9b Implementation)

`lib/renderer.ts` maps each block symbol to CMS block JSON using the shapes defined in `schemas.md`. No LLM involved in rendering.

```typescript
// lib/renderer.ts
import type { CmsBlock } from "@/lib/cms"

export function renderBlock(symbol: string, data: BlockData = {}): CmsBlock {
  const renderer = RENDERERS[symbol]
  if (!renderer) throw new Error(`Unknown block symbol: ${symbol}. Known symbols: ${Object.keys(RENDERERS).join(", ")}`)
  return { type: symbol, data: renderer(data) }
}

export function renderPage(archetypeBlocks: string[], dataMap: Record<string, BlockData> = {}): CmsBlock[] {
  return archetypeBlocks.map((symbol) => {
    const data = dataMap[symbol] ?? {}
    return renderBlock(symbol, data)
  })
}
```

**This is the file the Claude skill calls in Step 5 instead of writing raw markup.** The skill populates `data` for each block symbol from the BusinessProfile, then calls `renderPage()` to get CMS-ready block JSON.

### 5. Zod Schema Validation

`lib/schemas.ts` defines runtime schemas for every Layer 1 and Layer 2 output.

```typescript
// lib/schemas.ts
import { z } from 'zod';

export const LayoutOutputSchema = z.object({
  selected: z.record(z.string()),   // page -> archetypeName
  reasoning: z.string().optional(),
});

export const CopyBlockSchema = z.object({
  symbol: z.string(),
  // ... union of all block data shapes
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

### 6. Skill Step 4 Rewrite: Archetype-Only Selection

The current Step 4 in `SKILL.md` uses flat heuristics ("add menu if categories exist"). This is replaced by the archetype selection protocol.

**New Step 4 protocol:**
1. Load `skills/website-builder/resources/archetypes.md`
2. Apply rule-based selection for each needed page using BusinessProfile signals
3. If LLM APIs available (Phase 9b), optionally override with LLM selection
4. Validate selected archetypes exist in the catalog (Zod)
5. Produce `PageBundle` by expanding each selected archetype into blocks
6. Gate each block: if the block's `minData` requirement is unmet, drop it
7. Document reasoning per page in `content/scratch/<tenant>/page-selection.md`

No hardcoded "always home, add menu if..." rules. All page-type decisions flow from the archetype catalog.

### 7. Constraint Removed for Phase 9b

The constraint "Do not call OpenAI, Anthropic, or any LLM API" is removed in Phase 9b. The pipeline now supports both paths:
- Rule-based: runs without any API (preserves offline/dev capability)
- LLM-based: runs when API keys are configured, falls back to rule-based on failure

### 8. Adoption Path (Phase 9b Actions)

| Step | Action | File |
|---|---|---|
| **9b.1** | Expand `archetypes.md` with 9 new archetypes + extended selection rules | `skills/website-builder/resources/archetypes.md` |
| **9b.2** | Create `lib/renderer.ts` — deterministic block-to-CMS renderer | `lib/renderer.ts` |
| **9b.3** | Create `lib/schemas.ts` — Zod schemas for LayoutOutput, CopyOutput, ArchetypeCatalog | `lib/schemas.ts` |
| **9b.4** | Create `skills/website-builder/resources/generate-archetypes.ts` — MD → JSON emitter | `skills/website-builder/resources/generate-archetypes.ts` |
| **9b.5** | Rewrite `SKILL.md` Step 4 to use archetype-only selection | `skills/website-builder/SKILL.md` |
| **9b.6** | Add LLM archetype selection prompt + fallback to rule-based | `lib/ai/archetype-selector.ts` |
| **9b.7** | Remove "Do not call OpenAI/Anthropic" constraint from SKILL.md Constraints section | `skills/website-builder/SKILL.md` |
| **9b.8** | Wire renderer into Step 5 (Generate CMS Content) — LLM writes `data`, renderer writes `type` | `skills/website-builder/SKILL.md` |

### 9. Metadata Review Decision

Kept all metadata fields (`minData`, `excludes`, `bestFor`, `typicalOrder`) in Phase 9b. Review scheduled for Phase 10 (publishing pipeline) based on operator feedback. If `bestFor` proves redundant with selection rules, it can be dropped; if `typicalOrder` is never consumed, it can be dropped. Both are non-breaking to remove.

---

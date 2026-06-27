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

---

## Deliverable

- Cafe owner provides URLs and/or photo uploads → complete website generated in minutes
- Comprehensive business profile extracted from Facebook, Instagram, Google, and photos
- Menu/product catalogue extracted and upserted to Square
- Full CMS content (single draft) generated with tone matched to primary audience
- Two distinct theme variants, both visually grounded in the business's actual aesthetic
- Owner reviews side-by-side, selects a theme, edits content, and publishes
- Legacy WordPress content migrated where useful; broken/missing content auto-generated

# Phase 10: AI Site Generation from Text Descriptions

## Goal

Let cafe owners describe their business in plain English and have a fully functional website generated automatically — menu structure, theme, content pages, and Square integration. No design skills, no technical setup, no manual configuration.

---

## Integration Note

This phase (text-description input) builds on the layered structural composition pipeline defined in **Phase 9**. Phase 9 establishes the page archetype catalog, the three-layer architecture (Layout → Copy → Markup), and the deterministic renderer. This phase reuses those components: the archetype selection step (Layer 1) receives text-derived `BusinessProfile` signals, Layer 2 generates copy per block, and Layer 3 renders via the same deterministic renderer. The only Phase 14-specific addition is the text-extraction profiler that converts plain-English descriptions into the structured inputs both phases share.

## How It Works

```
User input:
  "We're a specialty coffee shop in Surry Hills, Sydney.
   We serve single-origin pour-overs, flat whites, and
   homemade banana bread. Laid-back vibe, exposed brick,
   open 7am-3pm weekdays, 8am-2pm weekends."

                          ▼
┌──────────────────────────────────────────────────────────────┐
│                     AI Generation Pipeline                    │
│                                                               │
│  1. Site Generator (LLM)                                      │
│     → Analyze description                                   │
│     → Extract: business name, location, vibe, hours, items   │
│     → Generate: theme palette, page content, menu structure   │
│                                                               │
│  2. Menu Creator                                              │
│     → Create CatalogItem + CatalogCategory in Square          │
│     → Generate item descriptions, prices (from text hints)    │
│     → Set up modifier groups (milk options, sizes, etc.)      │
│                                                               │
│  3. Content Generator (Platform CMS)                          │
│     → Generate structured content blocks (hero, text,        │
│       gallery, hours, cta, testimonials)                     │
│     → Generate placeholder images via DALL-E / Replicate     │
│     → SEO metadata (title, description, keywords)            │
│     → Store as tenant content in Postgres-backed CMS         │
│                                                               │
│  4. Theme Applier                                             │
│     → Select color palette based on vibe                      │
│     → Configure fonts, spacing, layout                        │
│     → Set up component variants (hero style, card style)      │
└──────────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                   Generated Website                           │
│                                                               │
│  · Live at subdomain or custom domain                         │
│  · Content pages stored in platform CMS (Postgres, blocks)    │
│  · Menu items populated in Square Catalog                     │
│  · Theme applied and configurable                             │
│  · Owner can edit/adjust before going live                    │
│  · "Regenerate section" for any part they don't like          │
└──────────────────────────────────────────────────────────────┘
```

---

## What's Built

### 1. LLM-Powered Site Generator

Accepts a free-form text description and extracts structured data:

```typescript
// lib/ai/site-generator.ts
import { openai } from '@ai-sdk/openai';

interface ExtractedSite {
  businessName: string;
  tagline: string;
  description: string;
  vibe: 'cozy' | 'modern' | 'rustic' | 'minimalist' | 'industrial' | 'eclectic';
  location: {
    suburb: string;
    city: string;
    state: string;
  };
  hours: DayHours[];
  menuItems: ExtractedMenuItem[];
  modifiers: ExtractedModifier[];
  features: string[]; // "live music", "dog-friendly", "vegan options"
  socialLinks?: { instagram?: string; facebook?: string };
}

export async function generateSiteFromDescription(text: string): Promise<ExtractedSite> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You extract structured cafe/restaurant data from text descriptions.
          Return a JSON object matching the ExtractedSite interface.
          Infer prices from context (e.g., "affordable" → $4-6 coffee, $8-12 food).
          Infer vibe from descriptive words.
          Generate SEO-friendly item descriptions if not provided.`,
      },
      { role: 'user', content: text },
    ],
  });

  return JSON.parse(completion.choices[0].message.content!);
}
```

### 2. Square Menu Creator

Takes extracted menu items and creates them in Square Catalog API:

```typescript
// lib/ai/square-menu-creator.ts
export async function createMenuFromExtraction(
  data: ExtractedSite,
  squareClient: Client
) {
  const { catalogApi } = squareClient;

  // Create categories first
  const categories = await Promise.all(
    inferCategories(data.menuItems).map((name) =>
      catalogApi.upsertCatalogObject({
        idempotencyKey: crypto.randomUUID(),
        object: {
          type: 'CATEGORY',
          id: `#${crypto.randomUUID()}`,
          categoryData: { name },
        },
      })
    )
  );

  // Create items with variations
  for (const item of data.menuItems) {
    await catalogApi.upsertCatalogObject({
      idempotencyKey: crypto.randomUUID(),
      object: {
        type: 'ITEM',
        id: `#${crypto.randomUUID()}`,
        itemData: {
          name: item.name,
          description: item.description,
          categoryId: categories.find((c) =>
            c.result.catalogObject?.categoryData?.name === item.category
          )?.result.catalogObject?.id,
          variations: [{
            type: 'ITEM_VARIATION',
            id: `#${crypto.randomUUID()}`,
            itemVariationData: {
              name: 'Regular',
              pricingType: 'FIXED_PRICING',
              priceMoney: {
                amount: BigInt(Math.round(item.price * 100)),
                currency: 'AUD',
              },
              availableForOnline: true,
            },
          }],
        },
      },
    });
  }
}
```

### 3. Content & Theme Generator

> **Integration note**: Page structure selection is handled by the Phase 9 archetype layer. The text-extraction profiler (Layer 1 of this phase) produces a `BusinessProfile` that feeds into Phase 9's archetype selection + copy + renderer pipeline. This section covers the theme selection aspect specific to text-derived input.

Generates page content and selects a theme based on the cafe's vibe:

| Vibe | Palette | Font Pairing | Hero Style |
|---|---|---|---|
| Cozy | Warm browns, cream (#8B6914, #FFF8F0) | Playfair Display + Inter | Image background, centered text |
| Modern | Slate, white, accent (#1E293B, #FFFFFF, #3B82F6) | Inter + Inter | Full-screen, split layout |
| Rustic | Olive, terracotta (#5C4033, #E07A5F) | Merriweather + Open Sans | Textured background, card overlay |
| Minimalist | White, gray, single accent (#FAFAFA, #525252, #000000) | Inter + Inter | Clean, lots of whitespace |
| Industrial | Charcoal, warm gray, amber (#1A1A1A, #6B7280, #F59E0B) | Montserrat + Roboto | Dark background, bold typography |
| Eclectic | Vibrant, mixed (#2D2D2D + custom accent) | Any + Any | Dynamic, multi-section |

**Archetype selection** (Phase 9 integration): The vibe and extracted `features` map to archetype choices via `skills/website-builder/resources/archetypes.md`:

| Vibe / Signal | Recommended archetypes |
|---|---|
| Cozy | `DEFAULT_HOME`, `ABOUT_STORY` |
| Modern / Minimalist | `MINIMAL_HOME`, `CONTACT_DIRECT` |
| Rustic / Industrial | `SERVICES_HOME`, `GALLERY_FIRST` |
| Eclectic / High engagement | `MENU_FOCUSED`, `SOCIAL_PROOF_HOME` |
| `media.gallery.length >= 3` (any vibe) | `GALLERY_FIRST` overrides above |
| `testimonials.length >= 3` | `SOCIAL_PROOF_HOME` eligible |

```typescript
// lib/ai/theme-generator.ts
export function generateTheme(vibe: string): ThemeConfig {
  const themes = {
    cozy: { colors: { primary: '#8B6914', background: '#FFF8F0' }, ... },
    modern: { colors: { primary: '#3B82F6', background: '#FFFFFF' }, ... },
    // ...
  };
  return themes[vibe as keyof typeof themes] ?? themes.modern;
}
```

### 4. Image Generation (Optional)

For cafes without photos, generate hero/menu images using DALL-E or Replicate:

- Hero image: "Specialty coffee shop interior, Surry Hills, exposed brick, warm lighting, photorealistic"
- Menu item images: "Flat white coffee in ceramic cup on wooden table, top-down view, professional food photography"
- Generated images are uploaded to Square Catalog API (same flow as Phase 9)

### 5. Stepped Setup Wizard

The AI generation is integrated into the SaaS onboarding flow:

```
Step 1: "Tell us about your cafe"
        ┌─────────────────────────────────────────┐
        │ We're a specialty coffee shop in Surry  │
        │ Hills, Sydney. We serve single-origin   │
        │ pour-overs and flat whites...           │
        │                                         │
        │ [ Generate Site ✨ ]                      │
        └─────────────────────────────────────────┘

Step 2: Preview & Edit
        ┌─────────────────────────────────────────┐
        │ Name: Surry Hills Coffee Co.            │
        │ Tagline: Single-origin, served simply   │
        │ Vibe: Cozy  [▼]  (preview shown)        │
        │                                         │
        │ Menu Items (6) ✎  │ Hours ✎ │ Pages ✎   │
        │                                         │
        │ [ Accept & Publish ]  [ Regenerate ]    │
        └─────────────────────────────────────────┘

Step 3: Live!
        Your site is live at surryhillscoffee.templatecafe.com.au
        Menu items are in Square POS.
        [ Open Dashboard ]  [ View Site ]
```

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **LLM** | GPT-4o (OpenAI) | Best structured output. JSON mode. Reliable extraction. |
| **Response format** | JSON mode (Phase 9: Zod/Pydantic validation) | Guarantees parseable output. Schema validated before use. |
| **Structure** | Archetype catalog (Phase 9) + layered pipeline | Governable, varied, inspectable output; supports per-section regeneration. |
| **Image generation** | DALL-E 3 / Replicate | Optional — only if cafe has no photos. |
| **Menu creation** | Square Catalog API | Items appear in Square POS immediately. |
| **Content storage** | Platform CMS (Postgres, structured blocks) | Generated content lives in the SaaS platform DB. Editable via the CMS dashboard. |
| **Theme application** | JSON config | Stored per-tenant. Easy to override manually. |
| **Preview step** | Required | Owner must review before going live. |
| **Regeneration** | Per-section | If hero text is wrong, regen just that section. |

---

## Environment Variables (Additional to Phase 8)

```env
# AI
OPENAI_API_KEY=
# Optional: image generation for missing assets
REPLICATE_API_KEY=
# or
DALLE_API_KEY=
```

> See Phase 9 for full structured-output validation stack (Zod / Pydantic schemas) and deterministic renderer dependencies.

---

## Deliverable

- Cafe owner describes their business in plain English → fully functional website generated
- Square menu items, categories, and modifiers created automatically
- Theme (colors, fonts, layout) selected based on described vibe
- Content pages (hero, about, hours) generated as structured blocks in the platform CMS
- Optional AI-generated images for hero and menu items
- Stepped wizard: describe → preview → publish
- Any section can be regenerated individually
- Owner can manually edit any generated content before going live

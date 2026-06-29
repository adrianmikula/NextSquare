# Page Archetypes

Named compositions of block types that define the high-level structure of a generated page. Archetypes replace ad-hoc block selection with explicit, reviewable compositions that can be A/B tested, versioned, and governed.

Archetypes are the **structural vocabulary** of the website-builder pipeline. Each archetype maps to a sequence of block types defined in `schemas.md` (`BlockType` union and concrete `data` shapes).

---

## Block Vocabulary

The complete set of block symbols available for composition:

| Symbol | Description |
|---|---|
| `hero` | Full-width cover with heading, subheading, CTA buttons, and optional image. |
| `text` | Heading + body paragraph; the generic content section. |
| `gallery` | Photo grid or masonry from business media assets. |
| `slideshow` | Photo carousel / grid of images with optional caption. |
| `products` | Grid of catalogue items with images and prices. |
| `services` | Service list or feature grid (title + items). |
| `testimonials` | Customer quotes with author attribution and source. |
| `cta` | Call-to-action banner with prominent button. |
| `hours` | Hours table + address; rendered by CmsHours. |
| `faq` | Accordion of Q+A pairs. |
| `form` | Enquiry / booking / contact form with typed fields. |
| `promo` | Seasonal offer or special banner with CTA. |
| `delivery` | Delivery partner logos, links, and ordering information. |
| `social-icons` | Social media / delivery platform icon links. |
| `callout` | Highlighted quote or testimonial strip. |
| `hr` | Horizontal rule / section separator. |
| `image-text` | Alternating image + text sections (left/right layout). |
| `comparison` | Feature comparison table or pricing tiers. |
| `map` | Embedded map with address details and directions link. |
| `team` | Staff grid with name, role, photo, and short bio. |
| `reservation` | Booking form with date, time, party size, name, and phone fields. |

> **Note**: `social-proof`, `instagram-feed`, and `menu-preview` are not yet wired to CMS block components. They remain in the vocabulary as future extensions. Do not use them in archetype definitions until `CmsRenderer` cases exist.

### Block Data Field Contracts

Full shapes are in `schemas.md` (`Block Data Shapes`). The key fields per symbol:

**hero** — `headline`, `subheadline`, `image?`, `ctaLabel`, `ctaLink`

**text** — `heading`, `body`

**gallery** — `images: string[]` (URLs or asset paths), `caption?`. If sources are empty, render with `placeholder: true` and label "Gallery – awaiting upload".

**products** — `title`, `items: [{ name, description, price?, image? }]`. Requires `catalogue` data with items.

**services** — `title`, `items: [{ name, description, priceHint?, duration? }]`.

**testimonials** — `items: [{ author, text, source? }]`.

**cta** — `heading`, `subtext`, `buttonLabel`, `buttonLink`.

**hours** — `schedule: [{ day, open, close }]`. (Address/phone come from SiteProfile, not this block.)

**faq** — `items: [{ question, answer }]`.

**form** — `title`, `fields: [{ name, type, label, required }]`.

**promo** — `heading`, `body`, `ctaLabel`, `ctaLink`, `image?`.

**delivery** — `heading`, `body`, `platforms: [{ name, url, label }]`.

**slideshow** — `images: string[]`, `caption?`, `interval?` (ms).

**social-icons** — `platforms: [{ name, url, icon? }]`.

**callout** — `quote`, `author?`, `role?`.

**hr** — `style?` (solid, dashed, dotted), `color?`.

**image-text** — `items: [{ image?, heading, body, align? (left/right) }]`.

**comparison** — `title?`, `columns: [{ header, features: [{ name, included }] }]`, `ctaLabel?`, `ctaLink?`.

**map** — `address`, `suburb`, `city`, `embedUrl?` (Google Maps embed), `directionsUrl?`.

**team** — `title?` (e.g. "Our Team"), `items: [{ name, role, bio?, photo? }]`.

**reservation** — `title?`, `fields: [{ name, type, label, required }]` where type is typically `date`, `time`, `select`, `tel`. Also `prefillName?`, `prefillPhone?`.

---

## Archetype Definitions

Each archetype is an ordered list of block symbols. The pipeline expands the archetype into actual blocks by attaching the appropriate `data` shape (populated from `BusinessProfile`).

### Home Page Archetypes

```
DEFAULT_HOME      → hero, text, products, cta
GALLERY_FIRST     → hero, gallery, text, cta, hours
GALLERY_FULL_HOME → hero, gallery, text, products, cta
SERVICES_HOME     → hero, services, text, testimonials, cta, hours
SOCIAL_PROOF_HOME → hero, testimonials, text, products, cta, testimonials
MINIMAL_HOME      → hero, text, cta
MENU_FOCUSED      → hero, products, text, cta
EVENTS_HOME       → hero, text, promo, services, cta, hours
LOYALTY_HOME      → hero, text, products, cta, testimonials
GALLERY_FULL_HOME_ALT → hero, slideshow, text, products, cta
TEAM_HOME         → hero, team, text, products, cta
```

### Inner Page Archetypes

```
MENU_DEFAULT      → hero, products, cta
ABOUT_STORY       → hours, text, testimonials, callout, cta
CONTACT_DIRECT    → hours, text, form, social-icons, cta
FAQ_FULL          → faq, text, cta
GALLERY_FULL      → gallery, text, cta
EVENTS_PAGE       → hero, promo, text, form, cta
LOYALTY_PAGE      → hero, text, testimonials, cta
MEMBERSHIP_PAGE   → hero, text, form, cta
PRICING_PAGE      → hero, services, comparison, cta
STORY_IMAGE       → hero, image-text, cta
TEAM_PAGE         → hero, team, text, cta
RESERVATIONS_PAGE → hero, text, reservation, hours, map, cta
LOCATIONS_PAGE    → hours, map, text, cta
```

---

## Selection Rules

Apply these heuristics to the `BusinessProfile` to pick the best archetype for each page. Selection is a **branching step** in the generation pipeline.

**Home page selection:**

| Condition | Archetype |
|---|---|
| `media.gallery.length >= 5` | `GALLERY_FULL_HOME` |
| `media.gallery.length >= 3` | `GALLERY_FIRST` |
| `services` is non-empty AND `type` ∈ `{ bakery, caterer, cleaner, handyman, salon, consultant }` | `SERVICES_HOME` |
| `testimonials.length >= 3` AND `type` ∈ `{ salon, restaurant, cafe, hotel }` | `SOCIAL_PROOF_HOME` |
| `features` contains "events" | `EVENTS_HOME` |
| `features` contains "loyalty" or "subscriptions" or "membership" | `LOYALTY_HOME` |
| `features` contains "events" OR `audience` = "tourists" | `MENU_FOCUSED` |
| `features` contains "team" or "staff" | `TEAM_HOME` |
| `media.gallery` empty AND `features` length < 2 | `MINIMAL_HOME` |
| Default fallback | `DEFAULT_HOME` |

**Inner page selection:**

| Page | Archetype | Gate |
|---|---|---|
| `menu` | `MENU_DEFAULT` | `catalogue.categories.length > 0` |
| `about` | `ABOUT_STORY` | `description.length >= 50` OR `testimonials.length >= 2` |
| `contact` | `CONTACT_DIRECT` | `phone` OR `location.address` present |
| `faq` | `FAQ_FULL` | `features` contains a `faq` field (from source analysis) |
| `gallery` | `GALLERY_FULL` | `media.gallery.length >= 3` |
| `events` | `EVENTS_PAGE` | `features` contains "events" |
| `loyalty` | `LOYALTY_PAGE` | `features` contains "loyalty" or "subscriptions" |
| `membership` | `MEMBERSHIP_PAGE` | `features` contains "membership" |
| `pricing` | `PRICING_PAGE` | `services` is non-empty AND `type` ∈ `{ salon, spa, consultant }` |
| `team` | `TEAM_PAGE` | `features` contains "team" or "staff" |
| `reservations` | `RESERVATIONS_PAGE` | `features` contains "reservations" OR `type` ∈ `{ restaurant, cafe, hotel }` |
| `locations` | `LOCATIONS_PAGE` | `features` contains "multi-location" OR `locations.length > 1` |

**Gate enforcement:** If a gate condition is not met, omit the page entirely rather than rendering an empty page. Document the omission in `content/scratch/<tenant>/page-selection.md`.

---

## Metadata (Optional)

Archetypes can carry metadata for downstream tooling:

```
DEFAULT_HOME:
  blocks: [hero, text, products, cta]
  minData:
    catalogue: "nonEmpty"
  bestFor: [cafe, restaurant, bakery, retail]
  excludes: [gallery, delivery, faq]
  typicalOrder: 4

ABOUT_STORY:
  blocks: [hours, text, testimonials, callout, cta]
  bestFor: [cafe, restaurant, bakery, retail]
  excludes: [faq]

SOCIAL_PROOF_HOME:
  blocks: [hero, testimonials, text, products, cta, testimonials]
  minData:
    testimonials: ">=2"
    catalogue: "nonEmpty"
  bestFor: [salon, restaurant, cafe, hotel]
  excludes: [gallery, delivery, faq]
  typicalOrder: 5

MENU_DEFAULT:
  blocks: [hero, products, cta]
  bestFor: [cafe, restaurant, bakery, retail]

CONTACT_DIRECT:
  blocks: [hours, text, form, social-icons, cta]
  bestFor: [cafe, restaurant, bakery, retail]

PRICING_PAGE:
  blocks: [hero, services, comparison, cta]
  bestFor: [salon, spa, consultant]
```

`minData` gates prevent selecting an archetype whose required data is absent. `excludes` lists blocks that should not be added even if data is available (compositional intent). `bestFor` enables LLM-assisted archetype selection: given a `BusinessProfile`, match to the closest archetype.

---

## File Formats

### Markdown (Skill Source of Truth)

`skills/website-builder/resources/archetypes.md` — this file. Edited by Claude during generation.

### JSON (Runtime Artifact)

`content/archetypes/<tenant>.json` — emitted by `skills/website-builder/resources/generate-archetypes.ts` after generation completes. Consumed by `lib/renderer.ts`, `lib/validate.ts`, and CMS layer.

```json
{
  "version": "1.0",
  "tenant": "<tenant-id>",
  "blockVocabulary": {
    "hero": { "description": "...", "fields": ["headline", "subheadline", "ctaLabel", "ctaLink"] }
  },
  "archetypes": {
    "DEFAULT_HOME": {
      "blocks": ["hero", "text", "products", "cta"],
      "minData": { "catalogue": "nonEmpty" },
      "excludes": ["gallery", "delivery", "instagram-feed"],
      "bestFor": ["cafe", "restaurant", "bakery", "retail"],
      "typicalOrder": 4
    }
  },
  "selectionRules": [ ... ],
  "generatedAt": "2026-06-29T14:32:00+08:00"
}
```

`generate-archetypes.ts` parses this markdown file and emits the JSON. No markdown parsing at runtime.

---

## Relationship to Other Resources

- **`schemas.md`** — defines the `BlockType` union and `data` shapes. Archetypes reference block symbols by name; schemas define the data each symbol accepts.
- **`theme-dimensions.md`** — defines 16 dimension categories. Archetype metadata can tag which dimensions each block type touches (e.g. `hero` → hero style, alignment, background; `products` → card style, spacing).
- **`SKILL.md` Step 4** — uses archetypes to replace flat heuristic block selection with two-phase composition: (4a) select archetypes per page, (4b) expand to `PageBundle` with gated blocks.

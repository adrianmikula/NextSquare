# Schemas

All TypeScript interfaces and JSON shapes used by the website-builder skill. Implement generators and validators against these shapes.

---

## SiteProfile

**Single source of truth** for a tenant's branding, contact, and identity. Stored at `content/site-profile/<tenant>/site-profile.json`. Every generated output (CMS pages, themes, catalogue, layout slots) must derive from this file.

```typescript
interface SiteProfile {
  siteName: string;
  tagline?: string;
  description?: string;
  address?: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    country?: string;
    full: string;
  };
  contact?: {
    phone?: string;
    phoneDisplay?: string;
    email?: string;
    hours?: {
      weekdays?: string;
      saturday?: string;
      sunday?: string;
    };
  };
  social?: {
    instagram?: string;
  };
  foundedYear?: string;
  story?: string;
  values?: Array<{ title: string; description: string }>;
  seo?: {
    title?: string;
    description?: string;
  };
  [key: string]: unknown;
}
```

---

## BusinessProfile

The single source of truth extracted from all inputs.

```typescript
interface BusinessProfile {
  name: string;
  type: string;   // "cafe", "restaurant", "bakery", "bar", "caterer", "retail", etc.
  tagline: string;
  description: string;
  location: { address: string; suburb: string; city: string };
  hours: Array<{ day: string; open: string; close: string }>;
  phone: string;
  vibe: {
    palette: string[];     // dominant hex values extracted from photos / brand colours
    adjectives: string[];  // e.g. "cozy", "industrial", "playful"
  };
  audience: string;   // "families", "commuters", "tourists", "professionals"
  tone: 'casual' | 'refined' | 'rustic' | 'modern' | 'playful';
  features: string[];  // e.g. "dog-friendly", "vegan", "live-music", "delivery"
  testimonials: Array<{ author: string; text: string; source: string }>;
  catalogue: {
    categories: string[];
    items: Array<{
      name: string;
      description: string;
      category: string;
      priceHint?: number;
      modifiers?: Array<{ name: string; options: string[] }>;
    }>;
  };
  services?: Array<{
    name: string;
    description: string;
    priceHint?: number;
    duration?: string;   // e.g. "2 hours", "half day"
  }>;
  media: {
    hero?: string;     // chosen source photo URL or path
    logo?: string;
    gallery: string[];
  };
  deliveryUrls?: {
    uberEats?: string;
    doorDash?: string;
  };
  tripAdvisorSummary?: {
    rating?: number;
    reviewCount?: number;
    topKeywords: string[];
  };
}
```

---

## PageBundle

Defines the complete page structure before content is written.

```typescript
interface CmsBlock {
  type: 'hero' | 'text' | 'gallery' | 'products' | 'services'
    | 'testimonials' | 'cta' | 'hours' | 'faq' | 'form' | 'promo' | 'delivery';
  data: Record<string, unknown>;
  layout?: 'full-width' | 'half-width' | 'two-thirds'
    | 'sidebar-content' | 'card-grid' | 'full-bleed';
}

interface PageBundle {
  pages: Array<{
    slug: string;          // unique URL path segment (kebab-case)
    label: string;         // human-readable nav label
    blocks: CmsBlock[];
    seo?: { title: string; description: string };
  }>;
}
```

---

## LayoutOutput

Returned by archetype selection (Layer 1 of the multi-source pipeline).

```typescript
interface LayoutOutput {
  selected: Record<string, string>; // pageSlug -> archetypeName
  reasoning?: string;
}
```

---

## ArchetypeCatalog

Runtime artifact emitted by `skills/website-builder/resources/generate-archetypes.ts` and stored at `content/archetypes/<tenant>.json`.

```typescript
interface BlockVocabularyEntry {
  description: string;
  fields: string[];
}

interface ArchetypeMetadata {
  blocks: string[];
  minData?: Record<string, string>;
  excludes?: string[];
  bestFor?: string[];
  typicalOrder?: number;
}

interface ArchetypeCatalog {
  version: string;
  tenant?: string;
  blockVocabulary: Record<string, BlockVocabularyEntry>;
  archetypes: Record<string, ArchetypeMetadata>;
  selectionRules?: unknown[];
  generatedAt?: string;
}
```

---

## PipelineResult

Returned by `lib/ai/multi-source-pipeline.ts` `runPipeline()`.

```typescript
interface PipelineResult {
  bundle: PageBundle;                  // Zod-validated output
  layout: LayoutOutput;               // archetype selection + reasoning
  layoutSource: 'llm' | 'fallback';   // how archetypes were selected
  skippedPages: string[];             // pages omitted by gating
}
```

---

## Block Data Shapes

Concrete `data` shapes for each `BlockType`.

### hero
```typescript
{
  headline: string;
  subheadline: string;
  image?: string;      // relative path or asset reference
  ctaLabel: string;
  ctaLink: string;     // URL or path segment
}
```

### text
```typescript
{
  heading: string;
  body: string;        // plain text or HTML-safe string
}
```

### gallery
```typescript
{
  images: string[];    // relative paths or asset references
  caption?: string;
}
```

### hours
```typescript
{
  schedule: Array<{ day: string; open: string; close: string }>;
}
```

### testimonials
```typescript
{
  items: Array<{ author: string; text: string; source?: string }>;
}
```

### cta
```typescript
{
  heading: string;
  subtext: string;
  buttonLabel: string;
  buttonLink: string;
}
```

### products
```typescript
{
  title: string;
  items: Array<{ name: string; description: string; price?: number; image?: string }>;
}
```

### services
```typescript
{
  title: string;
  items: Array<{ name: string; description: string; priceHint?: number; duration?: string }>;
}
```

### form
```typescript
{
  title: string;
  fields: Array<{ name: string; type: 'text' | 'email' | 'tel' | 'textarea'; label: string; required: boolean }>;
}
```

### faq
```typescript
{
  items: Array<{ question: string; answer: string }>;
}
```

### promo
```typescript
{
  heading: string;
  body: string;
  ctaLabel: string;
  ctaLink: string;
  image?: string;
}
```

### delivery
```typescript
{
  heading: string;
  body: string;
  platforms: Array<{ name: string; url: string; label: string }>;
}
```

---

## Dimension Specs (replaces legacy ThemeConfig)

Each design dimension has its own spec file under `content/dimensions/specs/` with A/B variants.

For the full catalogue of available dimensions and variance rules, see `skills/theme-dimensions/SKILL.md`.

### Color Spec (`content/dimensions/specs/color-a.json`, `color-b.json`)

```json
{
  "harmony": "analogous",
  "chroma": "warm",
  "backgroundType": "gradient",
  "backgroundValue": "linear-gradient(180deg, #FFFAF5 0%, #F5E6D3 100%)",
  "palette": {
    "primary": "#D4845A",
    "secondary": "#FFF0E0",
    "background": "#FFFAF5",
    "surface": "#FFFFFF",
    "text": "#2C1810",
    "accent": "#E8A87C",
    "border": "#E8D5C4"
  }
}
```

### Typography Spec (`content/dimensions/specs/typography-a.json`, `typography-b.json`)

```json
{
  "headingFont": "Playfair Display",
  "bodyFont": "Nunito",
  "headingWeight": 600,
  "bodyWeight": 400,
  "headingCase": "normal",
  "letterSpacing": "normal",
  "lineHeight": "1.5"
}
```

### Components Spec (`content/dimensions/specs/components-a.json`, `components-b.json`)

```json
{
  "borderRadius": "1rem",
  "cardRadius": "1rem",
  "buttonRadius": "9999px",
  "imageRadius": "1rem",
  "borderWidth": "1px",
  "borderStyle": "solid",
  "cardBorder": false,
  "cardShadow": "lg",
  "cardHoverShadow": "xl",
  "heroStyle": "gradient",
  "cardStyle": "flat",
  "buttonStyle": "filled",
  "navHeight": "4rem",
  "navBgOpacity": 0.9
}
```

### Spatial Spec (`content/dimensions/specs/spatial-a.json`, `spatial-b.json`)

```json
{
  "containerMax": "72rem",
  "sectionPaddingY": "4rem",
  "sectionPaddingX": "1rem",
  "gridGap": "1.5rem",
  "contentAlign": "center"
}
```

### Other Dimensions

- **Rhythm** — `density` ("compact" | "balanced" | "relaxed" | "spacious")
- **Motion** — `transitionSpeed` ("fast" | "normal" | "slow"), `hoverLift`, `fadeIn`, `smoothScroll`, `transitionEasing`
- **Imagery** — `defaultAspect` (e.g. "4:3"), `treatment` ("cover" | "contain" | "fill")
- **Wording** — tone-of-voice settings (content only, no CSS vars)

### Bundle Config (`content/dimensions/bundles/{id}.json`)

```json
{
  "id": "a",
  "name": "Purring Patisserie",
  "description": "Warm orange tones, Nunito body, cozy layout",
  "dimensions": {
    "color": "A",
    "typography": "A",
    "spatial": "A",
    "components": "A",
    "rhythm": "A",
    "motion": "A",
    "imagery": "A",
    "wording": "A"
  }
}
```

---

## CatalogueDoc

Stored under `content/catalogue/<tenant>/catalogue.json`. Mirrors Square Catalog API shape.

```typescript
interface CatalogueDoc {
  categories?: Array<{ name: string; description?: string }>;
  items: Array<{
    name: string;
    description: string;
    category: string;
    price: number;
    currency: string;
    modifiers?: Array<{ name: string; options: Array<{ name: string; priceDelta: number }> }>;
    imageUrl?: string;
  }>;
}
```

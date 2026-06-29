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

## ThemeConfig

Stored per-tenant under `content/themes/<tenant>/theme-{a,b,c,...}.json`.

For the full catalogue of available styling dimensions and variance rules, see `resources/theme-dimensions.md`.

```typescript
interface ThemeConfig {
  name: string;
  description?: string;
  colors: {
    primary: string;       // hex
    secondary: string;     // hex
    background: string;    // hex
    surface: string;       // hex
    text: string;          // hex
    accent: string;        // hex
    border?: string;       // hex
  };
  typography: {
    headingFont: string;       // font family name or CSS font stack
    bodyFont: string;          // font family name or CSS font stack
    weights: { heading: number; body: number };
    headingCase?: 'normal' | 'uppercase' | 'small-caps';
    letterSpacing?: string;    // CSS value e.g. '-0.02em'
    lineHeight?: string;       // CSS value e.g. '1.5'
  };
  spacing: {
    sectionPaddingY: string;  // CSS value e.g. '4rem'
    sectionPaddingX?: string; // CSS value e.g. '1rem'
    containerMax: string;     // CSS value e.g. '72rem'
    gridGap?: string;         // CSS value e.g. '1.5rem'
    contentAlign?: 'left' | 'center' | 'right';
  };
  shape: {
    borderRadius?: string;    // CSS value e.g. '0.5rem', '0', '9999px'
    cardRadius?: string;
    buttonRadius?: string;
    imageRadius?: string;
  };
  borders: {
    width?: string;           // '0', '1px', '2px'
    style?: 'solid' | 'dashed' | 'none';
    cardBorder?: boolean;
    divider?: boolean;
  };
  shadows: {
    card?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    cardHover?: 'none' | 'sm' | 'md' | 'lg';
    tint?: boolean;           // true = tinted with primary, false = neutral
  };
  components: {
    heroStyle: 'image' | 'split' | 'minimal' | 'gradient';
    cardStyle: 'elevated' | 'flat' | 'bordered' | 'glass';
    buttonStyle: 'filled' | 'outlined' | 'ghost' | 'underline';
    navStyle: 'solid' | 'transparent' | 'sticky' | 'floating';
  };
  hero?: {
    overlayOpacity?: number;    // 0–1
    overlayColor?: string;      // hex
    textAlign?: 'left' | 'center' | 'right';
    paddingY?: string;
    gradientDirection?: string; // 'to bottom', '135deg'
    imageTreatment?: 'cover' | 'contain' | 'blur' | 'parallax';
  };
  cards?: {
    hover?: 'lift' | 'glow' | 'border-accent' | 'none';
    imageAspect?: 'square' | 'landscape' | 'portrait' | 'auto';
    imageRadius?: string;
    innerPadding?: string;
  };
  buttons?: {
    radius?: string;
    paddingX?: string;
    fontWeight?: number;       // 500, 600, 700
    hover?: 'darken' | 'lift' | 'glow' | 'none';
    fullWidthMobile?: boolean;
  };
  nav?: {
    backgroundOpacity?: number; // 0–1
    logoSize?: 'sm' | 'md' | 'lg';
    linkStyle?: 'underline' | 'pill' | 'minimal' | 'bold';
    height?: string;
    shadow?: boolean;
  };
  menu?: {
    layout?: 'list' | 'grid' | 'cards';
    priceAlign?: 'left' | 'right' | 'center';
    priceStyle?: 'inline' | 'badge' | 'large';
    divider?: boolean;
    hover?: 'highlight' | 'slide' | 'none';
  };
  testimonials?: {
    layout?: 'grid' | 'carousel' | 'stacked';
    quoteStyle?: 'border-left' | 'italics' | 'large';
    avatar?: boolean;
  };
  forms?: {
    inputRadius?: string;
    inputBorder?: 'full' | 'bottom-only' | 'none';
    focusRing?: 'primary' | 'ring' | 'none';
    labelWeight?: number;
  };
  footer?: {
    background?: 'light' | 'dark' | 'primary' | 'transparent';
    layout?: 'centered' | 'multi-column' | 'minimal';
    borderTop?: boolean;
    socialStyle?: 'icons' | 'text' | 'none';
  };
  dividers?: {
    style?: 'none' | 'line' | 'wave' | 'angled' | 'dots';
    color?: string;
    height?: string;
  };
  motion?: {
    transitionSpeed?: 'fast' | 'normal' | 'slow';
    hoverLift?: boolean;
    fadeIn?: boolean;
    smoothScroll?: boolean;
  };
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

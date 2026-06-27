# Schemas

All TypeScript interfaces and JSON shapes used by the website-builder skill. Implement generators and validators against these shapes.

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
interface PageBundle {
  pages: Array<{
    slug: string;          // unique URL path segment (kebab-case)
    label: string;         // human-readable nav label
    blocks: Array<{
      type: 'hero' | 'text' | 'gallery' | 'hours' | 'testimonials'
        | 'cta' | 'products' | 'services' | 'form' | 'faq' | 'promo' | 'delivery';
      data: Record<string, unknown>;
    }>;
    seo?: { title: string; description: string };
  }>;
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

Stored per-tenant under `content/themes/<tenant>/theme-{a,b}.json`.

```typescript
interface ThemeConfig {
  name: string;
  description: string;
  colors: {
    primary: string;       // hex
    secondary: string;     // hex
    background: string;    // hex
    surface: string;       // hex
    text: string;          // hex
    accent: string;        // hex
  };
  typography: {
    heading: string;       // font family name or CSS font stack
    body: string;          // font family name or CSS font stack
    weights: { heading: number; body: number };
  };
  spacing: {
    sectionPadding: string;  // CSS value
    containerMax: string;    // CSS value
    borderRadius: string;   // CSS value
  };
  components: {
    heroStyle: 'image' | 'split' | 'minimal';
    cardStyle: 'elevated' | 'flat' | 'bordered';
    buttonStyle: 'filled' | 'outlined' | 'ghost';
    navStyle: 'solid' | 'transparent' | 'sticky';
  };
  images: {
    hero: string;      // relative path or asset reference
    logo: string;      // relative path or asset reference
    atlas: string[];   // additional image paths
  };
}
```

---

## CatalogueDoc

Stored under `content/catalogue/<tenant>/catalogue.json`. Mirrors Square Catalog API shape.

```typescript
interface CatalogueDoc {
  categories: Array<{ name: string; description: string }>;
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

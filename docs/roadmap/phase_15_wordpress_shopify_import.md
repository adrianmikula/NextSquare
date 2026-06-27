# Phase 11: WordPress & Shopify Site Import

## Goal

Let cafes and restaurants migrate their existing websites from WordPress or Shopify into the TemplateCafe SaaS platform with a single click. Import pages, menu items, images, SEO metadata, and theme settings — then keep running on TemplateCafe with Square as the backend.

---

## Architecture

```
┌──────────────────────┐     ┌──────────────────────┐
│   WordPress Site      │     │   Shopify Site        │
│                       │     │                       │
│  · Pages (WP REST)    │     │  · Products (GraphQL) │
│  · Media (WP REST)    │     │  · Collections        │
│  · Categories (WP)    │     │  · Theme settings     │
│  · SEO (Yoast)        │     │  · SEO (Shopify)      │
│  · Menu structure     │     │  · Images             │
└──────────┬──────────-┘     └──────────┬─────────────-┘
           │                            │
           ▼                            ▼
┌────────────────────────────────────────────────────────────────┐
│                    Import Pipeline                              │
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐   │
│  │ Scraper     │→ │ Analyzer    │→ │ Mapper               │   │
│  │             │   │             │   │                      │   │
│  │ Fetch all   │   │ Categorize  │   │ Map to TemplateCafe  │   │
│  │ pages,      │   │ content     │   │ schema: pages →     │   │
│  │ images,     │   │ types,      │   | Platform CMS pages, │   │
│  │ products,   │   │ detect      │   │ → Square Catalog,   │   │
│  │ SEO data    │   │ structure   │   │ images → Square API │   │
│  └─────────────┘   └─────────────┘   └──────────────────────┘   │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Preview & Confirm                                        │  │
│  │                                                          │  │
│  │  · Show what will be imported (pages, items, images)     │  │
│  │  · Detect conflicts (existing items with same name)      │  │
│  │  · Allow skip/re-map specific items                      │  │
│  │  · "Import" → runs migration                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                   Post-Import State                             │
│                                                                │
│  · Content pages → Platform CMS (Postgres, structured blocks)   │
│  · Menu items → Square Catalog (via API)                       │
│  · Images → Square Catalog (via CreateCatalogImage)            │
│  · Theme → TemplateCafe theme config (best-effort mapping)     │
│  · SEO metadata → Next.js metadata + sitemap                   │
│  · Redirects → next.config.js redirects (old URLs → new)       │
└────────────────────────────────────────────────────────────────┘
```

---

## What's Built

### 1. WordPress Importer

Connects via WordPress REST API (no plugin required — just the site URL).

```typescript
// lib/import/wordpress.ts
interface WordPressImport {
  pages: WordPressPage[];
  media: WordPressMedia[];
  categories: WordPressCategory[];
  menuItems: WordPressMenuItem[];
  yoastSeo: Record<string, YoastMeta>;
}

export async function importFromWordPress(siteUrl: string): Promise<WordPressImport> {
  const baseUrl = siteUrl.replace(/\/$/, '');

  const [pages, media, categories, menuItems] = await Promise.all([
    fetchAllPages(`${baseUrl}/wp-json/wp/v2/pages`),
    fetchAllMedia(`${baseUrl}/wp-json/wp/v2/media`),
    fetchAllCategories(`${baseUrl}/wp-json/wp/v2/categories`),
    fetchAllMenuItems(`${baseUrl}/wp-json/wp/v2/menu-items`),
  ]);

  return { pages, media, categories, menuItems, yoastSeo };
}
```

**What's imported:**

| WordPress Entity | Maps To |
|---|---|
| Pages (with content) | Platform CMS pages (structured blocks) |
| Media library | Square Catalog Images |
| Categories | Square Catalog Categories |
| Navigation menus | TemplateCafe header nav config |
| Yoast SEO metadata | Next.js metadata export |
| Custom post types | Generic content pages (manual mapping) |
| Comments | Not imported (e-commerce, not blog) |

### 2. Shopify Importer

Connects via Shopify Storefront API (public) or Admin API (private app).

```typescript
// lib/import/shopify.ts
interface ShopifyImport {
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
  pages: ShopifyPage[];
  themeSettings: ShopifyThemeConfig;
}

export async function importFromShopify(shopDomain: string, accessToken: string) {
  const client = new ShopifyGraphQLClient(shopDomain, accessToken);

  const [products, collections, pages, theme] = await Promise.all([
    fetchAllProducts(client),
    fetchAllCollections(client),
    fetchAllPages(client),
    fetchThemeSettings(client),
  ]);

  return { products, collections, pages, theme };
}
```

**What's imported:**

| Shopify Entity | Maps To |
|---|---|
| Products (with variants) | Square Catalog Items + Variations |
| Collections | Square Catalog Categories |
| Product images | Square Catalog Images |
| Pages | Platform CMS pages (structured blocks) |
| Theme settings (colors, fonts) | TemplateCafe theme config |
| SEO metadata | Next.js metadata |
| Navigation | TemplateCafe nav config |
| Customers | Square Customer Directory |
| Orders (history) | Not imported (Square POS has its own) |

### 3. Smart Content Mapping

The mapper handles common structural differences:

```
WordPress "About Us" page         → Platform CMS page with text blocks + hero
WordPress "Menu" page             → TemplateCafe menu (from Square Catalog, not content)
WordPress custom fields           → Extracted as structured data if recognized

Shopify "Product with variants"   → Square Item + multiple ItemVariations
Shopify "Size: Small/Med/Large"   → Square modifier list (if no price diff)
                                  → Separate ItemVariations (if price differs)
Shopify "Description (HTML)"      → Stripped to Markdown, kept as item description
```

### 4. Conflict Detection & Preview

Before any data is written, the import pipeline:

1. **Scans the target** — fetches current Square catalog, platform CMS content, theme config
2. **Detects conflicts** — items/pages with the same slug or name
3. **Shows diff** — what's new, what will be updated, what will be skipped
4. **Lets user choose** — skip conflict, overwrite, or rename

```
┌────────────────────────────────────────────────────┐
│  WordPress Import Preview                          │
│                                                    │
│  Pages (12):  [✓] 10 new  [⚠] 2 conflicts         │
│    → "About Us" exists — [Skip] [Overwrite] [Rename]│
│    → "Contact" exists — [Skip] [Overwrite] [Rename]│
│                                                    │
│  Menu Items (24): [✓] 24 new                       │
│                                                    │
│  Images (48):     [✓] 48 new                       │
│                                                    │
│  SEO: Import Yoast metadata? [✓ Yes / No]          │
│                                                    │
│  [Cancel]                    [Import 82 items]     │
└────────────────────────────────────────────────────┘
```

### 5. URL Redirect Management

After import, old URLs are mapped to new URLs via Next.js redirects:

```typescript
// next.config.js
// Generated from import
const oldToNew = {
  '/about-us': '/about',
  '/our-menu': '/menu',
  '/shop/coffee-beans': '/menu/coffee-beans',
  '/contact-us': '/contact',
};

module.exports = {
  async redirects() {
    return Object.entries(oldToNew).map(([source, destination]) => ({
      source,
      destination,
      permanent: true, // 301
    }));
  },
};
```

### 6. Post-Import Cleanup

After the import completes:

- **Broken link report** — scans generated content for internal links that didn't map
- **Missing image report** — any images that failed to upload to Square
- **Manual review flag** — items with complex modifiers flagged for manual check
- **Undo option** — rollback within 24 hours (reverses Square API changes, restores previous CMS content versions)

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **WordPress connector** | REST API (no plugin) | Works on any WordPress site. No installation required. |
| **Shopify connector** | GraphQL Admin API | Full access to products, collections, pages, images. |
| **Content storage** | Platform CMS (Postgres, structured blocks) | Imported pages map to CMS content blocks. Replaces Outstatic for SaaS tenants. |
| **Menu storage** | Square Catalog API | Items go into Square POS directly. Source of truth. |
| **Image storage** | Square Catalog API | Same as Phase 9. Images live in Square. |
| **Conflict handling** | Preview → Choose | User decides on each conflict. No silent overwrites. |
| **Redirects** | next.config.js | 301 redirects preserve SEO. Old URLs still work. |

## Alternative Headless CMS Approach (Not Adopted)

For operators who prefer to keep WordPress running long-term as a live CMS rather than one-shot importing content, the project also supports WordPress as an ongoing headless backend via WPGraphQL (see Phase 8). That path is intentionally kept separate from Phase 15's import flow. The following options were evaluated and rejected for the Phase 15 / Phase 8 use case:

| Option | Why it was not adopted |
|--------|------------------------|
| **nextpress** | Requires a WordPress plugin on the source site and couples Next.js rendering to WordPress theme assets (scripts, stylesheets). Our import flow is plugin-free and content-only. |
| **wp-next** | A full CMS replacement platform with a visual editor, admin dashboard, and Lexical-JSON storage. Overkill for importing cafe marketing content; violates minimal-dependency rule. |
| **wp-node** | Operates at the database layer (MySQL direct access) rather than the CMS layer. Would require reimplementing WordPress query logic (post statuses, Gutenberg blocks, ACF, media sizes) that WPGraphQL already provides. |

---

## Environment Variables (Additional to Phase 8)

```env
# Shopify (per-tenant, stored encrypted)
SHOPIFY_ADMIN_API_TOKEN=
SHOPIFY_STORE_DOMAIN=

# WordPress (per-import, not stored)
# No env vars needed — just the site URL
```

---

## Deliverable

- One-click WordPress site import — pages, media, categories, menus, SEO metadata
- One-click Shopify site import — products, collections, images, pages, theme, SEO
- Smart content mapping — WordPress/Shopify entities map to Square Catalog + Platform CMS pages
- Conflict detection — preview UI showing new vs. existing items
- URL redirect management — old URLs redirect (301) to new locations
- Post-import reports — broken links, missing images, items needing review
- 24-hour undo — rollback reverses all changes
- No plugins required — WordPress import works on any site via REST API

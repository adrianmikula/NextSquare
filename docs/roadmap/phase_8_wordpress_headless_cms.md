# Phase 8: WordPress (Headless) as an Alternative Backend CMS

## Goal

Offer WordPress as a headless CMS backend option alongside the default Outstatic/GitHub-backed content layer. Cafe operators who already manage their content in WordPress can connect their existing site without migrating to Outstatic. The Next.js frontend remains unchanged; only the content source swaps.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Next.js Frontend (unchanged)                                   │
│                                                                 │
│  Marketing pages, menu, about, contact — same components,       │
│  same ISR build pipeline, same design tokens                    │
│                                                                 │
│  ┌──────────────┐      OR      ┌─────────────────────────────┐  │
│  │ Outstatic CMS │            │  WordPress Headless CMS       │  │
│  │ (GitHub)      │            │  (self-hosted or WP Engine)   │  │
│  └──────┬───────┘            └──────────────┬────────────────┘  │
│         │                                  │                   │
│         │  Markdown / JSON                │  GraphQL (WP)      │
│         └──────────────┬───────────────────┘                   │
│                        ▼                                       │
│               ┌──────────────────┐                             │
│               │ lib/cms/         │                             │
│               │  cms-client.ts   │                             │
│               │  adapter.ts      │  // normalizes schema        │
│               └──────────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

### Adapter pattern

All CMS interaction goes through `lib/cms/adapter.ts` exposing a unified interface:

```ts
export interface CmsAdapter {
  listPages(): Promise<CmsPage[]>;
  getPage(slug: string): Promise<CmsPage | null>;
  listMenuItems(): Promise<CmsMenuItem[]>;
  listBlogPosts(limit?: number): Promise<CmsPost[]>;
}

export type CmsProvider = "outstatic" | "wordpress";
```

The active provider is selected at startup via `CMS_PROVIDER` env var (defaults to `outstatic`). All page and marketing content components consume the adapter, so no rendering code needs to know which backend drives it.

---

## What's Built

### 1. WordPress Adapter

Connects to a WordPress site with WPGraphQL plugin installed (v0.8.0+).

```ts
// lib/cms/adapters/wordpress.ts
interface WordPressConfig {
  url: string;
  previewSecret?: string;
}

export class WordPressCmsAdapter implements CmsAdapter {
  constructor(private config: WordPressConfig) {}

  async listPages(): Promise<CmsPage[]> {
    const query = `{
      pages { nodes { id title uri content slug } }
    }`;
    // ...
  }

  async getPage(slug: string): Promise<CmsPage | null> {
    // single page by URI with `slash` separator normalization
    // ...
  }
}
```

**Requirements on the WordPress site:**

| Plugin | Minimum version | Purpose |
|--------|----------------|---------|
| WPGraphQL | 0.8.0 | GraphQL endpoint at `/graphql` |
| WPGraphQL for Posts | optional | Enhanced post queries |
| Yoast SEO | optional | SEO metadata fields in GraphQL |

No additional plugins are required for read-only content consumption.

### 2. Schema Mapping

The adapter normalizes WordPress GraphQL types to the shared CMS model:

| WordPress field | Maps to |
|-----------------|---------|
| `page.title` | `CmsPage.title` |
| `page.content` (raw HTML) | `CmsPage.htmlContent` |
| `page.uri` | `CmsPage.slug` |
| `page.featuredImage` | `CmsPage.image` |
| `page.seo.title` (Yoast) | `CmsPage.seoTitle` |
| `page.seo.metaDesc` | `CmsPage.seoDescription` |
| Attachment `mediaDetails.sizes` | `CmsImage.srcset` |

The `htmlContent` is preserved as rendered HTML. Next.js Server Components can pass it through `dangerouslySetInnerHTML` only after DOMPurify sanitization, matching the Phase 7 DOMPurify requirement.

### 3. ISR Integration

WordPress content is revalidated via two mechanisms:

- **Time-based ISR**: pages use `revalidate = 300` (same as Square catalog).
- **Webhook-driven invalidation**: a lightweight WordPress plugin (`wp-headless-revalidate`) posts to `/api/cms/revalidate` when content is published or updated. This keeps the Next.js cache fresh without rebuilding.

### 4. Draft / Preview Support

When `CMS_PREVIEW_SECRET` is set and the request carries `?preview=true&token=<secret>`, the adapter bypasses WPGraphQL's public context and uses authenticated queries (via `Authorization: Basic` header with application passwords) to fetch draft or pending content.

### 5. Migration Path

Existing Outstatic-backed sites gain WordPress support without any frontend code changes:

```ts
// next.config.ts — new WPGraphQL fetch telemetry
export const revalidate = 300;
```

```env
# Select provider
CMS_PROVIDER=wordpress
CMS_WORDPRESS_URL=https://cafe-blog.example.com/graphql
CMS_PREVIEW_SECRET=optional-preview-token
```

Reverting to `wordpress` → `outstatic` requires no data migration; each provider reads its own backend independently.

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Protocol** | GraphQL via WPGraphQL plugin | WordPress REST API has inconsistent pagination and post-type filtering. WPGraphQL is the maintained, predictable data layer. |
| **Read-only** | No write capability in Phase 8 | Content continues to be authored in WordPress. Write-back (creating Square catalog items from WP) is left to a future phase if there is demand. |
| **Draft support** | Application passwords + preview secret | Avoids building a full OAuth2 server. WordPress 5.6+ application passwords are sufficient and low-risk when scoped to preview-only. |
| **HTML handling** | Raw HTML through DOMPurify | WordPress produces rich HTML from Gutenberg. Translating Gutenberg blocks to React components is future work; for Phase 8, we render sanitized HTML. |
| **Caching** | ISR + webhook invalidation | Matches the Square catalog pattern already in the build, avoiding new infra. |

---

## Environment Variables

```env
# ─── CMS Provider Selection ─────────────────────────────────────────
CMS_PROVIDER=outstatic            # or "wordpress"
CMS_WORDPRESS_URL=                # e.g. https://mysite.com/graphql
CMS_PREVIEW_SECRET=               # optional — enables draft preview

# ─── (Existing) Outstatic CMS ───────────────────────────────────────
OUTSTATIC_API_KEY=

# ─── App ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=
```

---

## Deliverable

- A `CmsAdapter` abstraction with two implementations — `OutstaticCmsAdapter` (existing) and `WordPressCmsAdapter` (new).
- Marketing site pages (`/`, `/menu`, `/about`, `/contact`, blog listing) work unchanged against WordPress content.
- ISR revalidation via time + webhook endpoint for freshness.
- Draft/preview mode gated by secret without exposing server-side credentials to the client.
- No WordPress plugin required on the WordPress side beyond WPGraphQL (plus optional Yoast for SEO fields).
- README and roadmap updated with the new hosting path.

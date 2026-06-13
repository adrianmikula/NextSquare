# Phase 8: SaaS Portal for Australian Cafes

## Goal

Turn the `@templatecafe/square-core` library into a multi-tenant SaaS platform that lets any Australian cafe or restaurant build a website with built-in support for the most common Australian POS and backend systems. Square remains the default and primary backend, but the platform abstracts POS connectivity so it can support alternatives.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     TemplateCafe SaaS Portal                      │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Cafe A      │  │ Cafe B      │  │ Cafe C      │  ...         │
│  │ (Square)    │  │ (Square)    │  │ (Lightspeed)│              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                       │
│         ▼                ▼                ▼                       │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                Multi-Tenant Platform Layer                │    │
│  │                                                          │    │
│  │  · Tenant provisioning  · Custom domain  · Billing       │    │
│  │  · Analytics dashboard  · Theme engine   · SSO           │    │
│  │  · Platform CMS (Postgres-backed)                        │    │
│  └──────────────────────────────────────────────────────────┘    │
│         │                │                │                       │
│         ▼                ▼                ▼                       │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │           POS Adapter Layer (pluggable)                   │    │
│  │                                                          │    │
│  │  Square │ Lightspeed │ Kounta │ UniCenta │ Custom API    │    │
│  │  (core) │ (via API)  │ (via   │ (on-prem)│ (adapter      │    │
│  │         │            │  API)  │          │  pattern)     │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  · Auth: Clerk / NextAuth (multi-tenant SSO)                      │
│  · Billing: Stripe (usage-based or per-seat)                      │
│  · Infrastructure: Vercel Teams + Neon (optional DB per tenant)   │
└──────────────────────────────────────────────────────────────────┘
```

---

## What's Built

### 1. Multi-Tenant Architecture

Each cafe gets an isolated tenant with its own:
- Environment variables (Square API keys, Twilio creds, etc.)
- Custom subdomain (`cafename.templatecafe.com.au`) or custom domain
- Theme/design configuration stored in the platform DB
- Analytics and order history

```typescript
// lib/saas/tenant.ts
interface TenantConfig {
  id: string;
  slug: string;                    // "cafename"
  domain: string;                  // "cafename.templatecafe.com.au"
  customDomain?: string;           // "order.cafename.com.au"
  posProvider: 'square' | 'lightspeed' | 'kounta' | 'unicenta';
  posCredentials: EncryptedCredentials;
  theme: ThemeConfig;
  features: FeatureFlags;          // which phases are enabled
  plan: 'starter' | 'growth' | 'enterprise';
  billingId: string;               // Stripe customer ID
}
```

### 2. POS Adapter Layer

Abstracts the common POS operations so the platform isn't locked to Square:

```typescript
// lib/saas/adapters/types.ts
interface PosAdapter {
  // Menu
  getMenu(): Promise<MenuItem[]>;
  updateItem(id: string, data: Partial<MenuItem>): Promise<MenuItem>;
  createItem(data: CreateMenuItem): Promise<MenuItem>;
  uploadImage(itemId: string, file: Buffer): Promise<string>;

  // Orders
  createOrder(order: CreateOrder): Promise<Order>;
  getOrder(id: string): Promise<Order>;
  getOrders(filters: OrderFilters): Promise<Order[]>;

  // Availability
  setAvailability(id: string, available: boolean): Promise<void>;

  // Loyalty (optional)
  getLoyaltyBalance(phone: string): Promise<number>;
  earnPoints(phone: string, points: number): Promise<void>;
}
```

| POS | Adapter Status | Notes |
|---|---|---|
| **Square** | Built-in (Phase 6 library) | Primary target, most complete integration |
| **Lightspeed Restaurant** | Future | API-first, popular in AU hospitality |
| **Kounta** | Future | Australian-born POS, strong cafe presence |
| **UniCenta** | Future | On-premise, open-source POS, API adapter needed |
| **Custom** | Future | Generic REST API adapter for bespoke systems |

### 3. Tenant Provisioning Flow

```
1. Cafe owner signs up at app.templatecafe.com.au
2. Selects POS: "Square" (default) or others (future)
3. Square OAuth flow → grants access to catalog, orders, payments
4. Platform provisions tenant:
   a. Creates tenant record in platform DB
   b. Stores encrypted Square access/refresh tokens
   c. Assigns subdomain (cafename.templatecafe.com.au)
   d. Deploys or activates site configuration
5. Cafe owner picks a theme (built-in templates)
6. Site goes live at subdomain or custom domain within minutes
7. Billing starts (free trial, then subscription)
```

### 4. Billing & Plans

| Plan | Price | Features |
|---|---|---|
| **Starter** | $29/mo | 1 location, Square only, basic theme, 500 orders/mo |
| **Growth** | $79/mo | 3 locations, multi-POS, custom domain, analytics, priority support |
| **Enterprise** | Custom | Unlimited locations, dedicated infra, SLA, white-label |

Billing is handled via Stripe. Plans are usage-aware — cafes on higher plans get more features, not just higher limits.

### 5. Admin Dashboard (SaaS Provider)

A super-admin dashboard lets the platform operator:
- View all tenants and their health status
- Monitor API usage and rate limits per tenant
- Force-resync a tenant's catalog
- View billing status and invoice history
- Manage platform-wide feature flags

### 6. DB-Backed CMS (Platform Content Engine)

Phase 2 uses Outstatic (GitHub-backed Markdown CMS), which works well for a single-site template. For multi-tenant SaaS, Outstatic doesn't scale — each tenant would need separate repo access, branching, and deployment config.

**The upgrade:** A built-in, Postgres-backed content management system that lives in the platform DB alongside tenant config, themes, and analytics.

```typescript
// lib/saas/cms/types.ts
interface TenantContent {
  id: string;
  tenantId: string;
  slug: string;                       // "about", "contact", "catering"
  title: string;
  content: string;                    // Markdown or MDX stored in postgres
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
  status: 'draft' | 'published';
  publishedAt?: Date;
  updatedAt: Date;
  version: number;                    // Optimistic locking for concurrent edits
}

interface TenantContentAsset {
  id: string;
  tenantId: string;
  fileName: string;
  mimeType: string;
  storageKey: string;                 // S3 / R2 object key
  width: number;
  height: number;
  altText: string;
}
```

**Key differences from Outstatic:**

| Aspect | Outstatic (Phase 2) | Platform CMS (Phase 8) |
|---|---|---|
| **Storage** | Markdown files in GitHub repo | Postgres rows (content) + S3/R2 (assets) |
| **Multi-tenant** | Separate repo per tenant (untenable) | Row-level tenant isolation via `tenantId` |
| **Versioning** | Git history | Version column + snapshots table |
| **Admin UI** | Outstatic `/outstatic` route | Built-in dashboard at `/dashboard/cms` |
| **Content types** | Pages only | Pages, custom sections, structured blocks |
| **Live preview** | No | Yes — draft/published states with preview mode |
| **Webhooks** | GitHub commit → Vercel rebuild | Real-time — content updates invalidate ISR cache |
| **Images** | GitHub LFS | S3-compatible storage (Cloudflare R2 / AWS S3) |

**Content blocks architecture:**

Instead of a flat Markdown editor, the platform CMS supports structured content blocks (like Notion or WordPress Gutenberg):

```
Page: "About Us"
  ├── Block: HeroSection
  │   ├── headline: "Our Story"
  │   ├── backgroundImage: (asset ref)
  │   └── overlay: dark
  ├── Block: TextSection
  │   └── content: "Founded in 2015..."
  ├── Block: ImageGallery
  │   ├── images: [(asset ref), (asset ref)]
  │   └── layout: grid-3
  └── Block: CTASection
      ├── text: "Visit us today"
      └── buttonUrl: /contact
```

This allows the AI site generator (Phase 10) to generate structured content instead of raw Markdown, and the WordPress/Shopify importer (Phase 11) to map source content into appropriate blocks.

```typescript
// Block types available in the CMS
type ContentBlock =
  | { type: 'hero'; headline: string; subtitle?: string; cta?: CTA; image?: AssetRef }
  | { type: 'text'; content: string; format: 'markdown' | 'html' }
  | { type: 'image_gallery'; images: AssetRef[]; layout: 'grid-2' | 'grid-3' | 'carousel' }
  | { type: 'menu_preview'; title: string; items: number }  // auto-populated from Square
  | { type: 'hours'; title: string; showOpenNow: boolean }
  | { type: 'cta'; text: string; buttonLabel: string; buttonUrl: string }
  | { type: 'map'; address: string; zoom: number }
  | { type: 'testimonials'; items: Testimonial[] }
  | { type: 'instagram_feed'; limit: number }
  | { type: 'custom_html'; html: string };
```

### 7. Australian-Specific Features

Built for the AU market from day one:
- **AUD default currency** across all pricing and displays
- **GST handling** (10% included/excluded toggle)
- **AU address formats** (suburb, state, postcode)
- **AU phone numbers** with validation (+614XXXXXXXX)
- **Afterpay** via Square's Clearpay integration
- **ABN display** on receipts and invoices (optional)
- **Trading hours** with AUCKLAND/SYDNEY timezone support
- **Public holidays** integration (AU calendar API)

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Auth** | Clerk or NextAuth | Multi-tenant SSO out of the box. Social login (Google). |
| **Billing** | Stripe | Usage-based + per-seat. AU support (GST invoices). |
| **Platform DB** | Neon (Postgres) | Tenant config, themes, analytics. Optional — tenants themselves use Square as DB. |
| **Deployment** | Vercel Teams | Each tenant on same infra. Edge functions for custom domains. |
| **POS adapters** | Plugin pattern | New POS = new adapter file. No core changes needed. |
| **Custom domains** | Vercel Domains API | Automatic SSL, edge network, instant provisioning. |
| **Themes** | Tailwind v4 + config | Cafe picks colors, fonts, layout — stored as JSON config. |
| **CMS** | Postgres-backed (platform DB) | Row-level tenant isolation. Structured content blocks. Real-time cache invalidation. |

---

## Environment Variables (Additional to Phase 6)

```env
# SaaS Platform
PLATFORM_DATABASE_URL=               # Neon Postgres
PLATFORM_ENCRYPTION_KEY=             # For encrypting POS credentials
NEXT_PUBLIC_PLATFORM_URL=            # https://app.templatecafe.com.au

# Billing
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_PRICE_ID=
STRIPE_GROWTH_PRICE_ID=

# Auth (Clerk / NextAuth)
AUTH_SECRET=
AUTH_CLIENT_ID=
AUTH_ISSUER=

# Vercel
VERCEL_TOKEN=                        # For Domains API (custom domains)
VERCEL_TEAM_ID=

# Assets (S3-compatible storage for CMS images)
ASSETS_ENDPOINT=                      # https://tenant-assets.templatecafe.com
ASSETS_ACCESS_KEY_ID=
ASSETS_SECRET_ACCESS_KEY=
ASSETS_BUCKET=                       # templatecafe-cms-assets
```

---

## Deliverable

- Multi-tenant SaaS platform at `app.templatecafe.com.au`
- Self-serve cafe onboarding with Square OAuth
- Pluggable POS adapter layer (Square built-in, others as future adapters)
- Subdomain and custom domain support
- Stripe billing with AU GST-compliant invoices
- Postgres-backed CMS with structured content blocks and per-tenant isolation (replaces Outstatic for SaaS tenants)
- S3-compatible asset storage (Cloudflare R2 / AWS S3) for CMS images
- Draft/published content workflow with preview mode
- Super-admin dashboard for platform management
- Australian-specific defaults (AUD, GST, AU addresses/phones, Afterpay)
- Free trial → paid subscription model

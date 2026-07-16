# Cafe Template

A Next.js 16 marketing & ordering site for Square POS cafes. Zero database — launch in hours.

## Currently Supported Features

| Feature | Details |
|---|---|
| **Marketing Site** | Hero, menu preview, reviews, hours, map, Instagram, about, contact |
| **Custom Checkout** | Fully branded checkout with Square Web Payments SDK |
| **Cart** | Zustand store with localStorage persistence, modifier support, pickup/delivery toggle |
| **Menu / Catalog** | Managed in Square Dashboard, served via ISR (`revalidate: 300`) |
| **Orders** | Create, retrieve, search via Square Orders API; status tracking |
| **Payments** | Square Payments API (SDK) with verification token support; sandbox card `4111 1111 1111 1111` |
| **SMS Notifications** | Twilio via Square order webhooks (`order.updated` → confirmed → preparing → ready) |
| **Content / CMS** | Outstatic — Markdown stored in GitHub, no database |
| **Admin Dashboard** | JWT session auth protected; retrieve/modify/upsert Square catalog items |
| **Demo Mode** | Runs full app with mock Square responses — no credentials required |
| **Customer Loyalty** | Square Loyalty API integration (Phase 6) |
| **ISR / SSG** | Incremental static regeneration for marketing pages |
| **Webhook Verification** | HMAC-SHA256 verification of Square webhooks |
| **Mobile Support** | Responsive layout; mobile photo upload (Phase 13) |
| **AI / Code Agents** | MCP support for Square, Twilio, and Next.js devtools (see below) |

---

## Architecture

```
Next.js 16 + Tailwind v4
┌────────────────────────────────────────────────────┐
│  Marketing Site                                    │
│  Hero, Menu, About, Contact, Social                │
│                                                    │
│  ┌─ Custom Checkout ───────────────────────────┐   │
│  │  Cart (Zustand) → Checkout Form → Square    │   │
│  │  Payment via Square Web Payments SDK        │   │
│  │  Order tracking via Square Orders API       │   │
│  └─────────────────────────────────────────────┘   │
└───────────────────────┬────────────────────────────┘
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
┌──────────────────────┐  ┌──────────────────────┐
│  Square APIs          │  │  Twilio SMS           │
│  ─ Catalog (REST+ISR) │  │  Order notifications  │
│  ─ Orders (SDK)       │  │  via Square webhooks  │
│  ─ Payments (SDK)     │  └──────────────────────┘
│  ─ Webhooks           │
│  ─ Loyalty (SDK)      │        [Phase 6]
└──────────────────────┘
```

## Site Generator (New Architecture)

> **Status:** Phase 3 — Renderer MVP complete. Generates visually distinct pages from hand-authored `SiteConfig` JSON.

The project includes a generator architecture that produces unique, industry-specific websites using a stack of design tools: json-render (rendering), taste-engine (continuous tuners), soltana-ui (design language archetypes), and @lisse (shape geometry).

### How it works

```
SiteConfig JSON → Soltana archetype + Taste Engine tuners → json-render spec → rendered page
```

A `SiteConfig` defines the industry, tone, design language (relief/finish/shape), tuner values (warmth, density, motion, contrast, narrative), and a json-render spec with gene components (hero, features, CTA variants).

### Preview

```bash
npm run dev
# Open http://localhost:3000/preview?config=cafe.json
# Or http://localhost:3000/preview?config=saas-glass.json
```

The `/preview` route renders any SiteConfig from `src/test-configs/`. The toolbar shows current config info and quick-relief-switch buttons for visual comparison. A "Download HTML" button exports a self-contained standalone HTML file.

### Generation workflow (AI agent)

The generation loop is agent-guided — an AI agent (Claude) edits SiteConfig JSON between previews:

1. **Interpret** the user's brief (industry, tone, style)
2. **Write** a `SiteConfig` JSON in `src/test-configs/`
3. **Run** the dev server and open the preview
4. **Iterate** by editing the JSON and hot-reloading
5. **Verify** uniqueness using `skills/theme-uniqueness/`

See [`skills/agent/SKILL.md`](skills/agent/SKILL.md) for the full agent workflow, tuner reference tables, industry→archetype guidance, and iteration troubleshooting.

### Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| 0-3 | ✅ Complete | Foundation, gene library, tuners, renderer MVP |
| 4 | 🔲 Planned | Sequencing engine — automated page assembly from industry profiles |
| 5 | 🔲 Planned | Ticonderoga integration + snapshot history |
| 5b | 🔲 Planned | Interactive dev panel (tuner sliders, section swapping) |
| 6-9 | 🔲 Planned | Content generation, validation, gene expansion, migration |

Full details: [`docs/roadmap/generator-architecture/README.md`](docs/roadmap/generator-architecture/README.md)

### Config reference

```bash
src/test-configs/
├── cafe.json                  # Warm, inviting — flat relief
├── saas-glass.json            # Cool, modern — glassmorphic relief
└── portfolio-neumorphic.json  # Minimal, elegant — neumorphic relief
```

### Gene library

| Category | Variants | Location |
|----------|----------|----------|
| Hero | Centered, Split, Minimal | `src/genes/hero/` |
| Features | Grid, Alternating | `src/genes/features/` |
| CTA | Simple, Split | `src/genes/cta/` |

Each gene is a React component registered in `@json-render/react`'s catalog, consuming soltana-ui archetype tokens and taste-engine tuners via context hooks.

### Architectural Boundaries

The generator system has four distinct layers with clear ownership and handoff points:

| Layer | Owns | Handoff To |
|-------|------|------------|
| **Human Input** | Business profiles, catalogues, CMS content, dimension specs, archetype catalog, reference configs | AI pipeline reads these as source material |
| **AI / Skills** | Pipeline orchestration, archetype selection, content generation, workflow instructions | Writes to `content/cms/site/pages.json`; invokes Code |
| **Code** | Sequencer, renderer, genes, schemas, AI pipeline logic, API routes | Reads from Human Input; produces `SiteConfig` / `PageBundle` |
| **Config** | Env vars, dimension specs, bundle isolation, MCP servers, build settings | Enforced by Code at startup and build time |

#### Generation flow

```
Human Input → AI/Skills → Code → Rendered Output
    ↓              ↓         ↓
  content/    skills/    src/ + lib/
  + scratch/  + .kilo/   + app/ + components/
```

1. **Human Input** provides the source material:
   - `content/site-profile/` — business data
   - `content/catalogue/` — product data
   - `content/cms/site/pages.json` — editable CMS content (human ↔ AI handoff)
   - `content/dimensions/specs/` — theme design configs
   - `content/archetypes/catalog.json` — archetype knowledge base
   - `src/test-configs/` — reference `SiteConfig` JSONs

2. **AI / Skills** decides what to generate:
   - `skills/` — workflow instructions for the agent
   - `.kilo/` — Kilo IDE/runtime config
   - `mcp.json` — MCP server definitions
   - `AGENTS.md` — project-wide AI rules
   - Invokes Code via `npm run` commands and edits source files

3. **Code** performs deterministic generation and rendering:
   - `src/generator/sequencer/` — rule-based assembly from industry + tone
   - `lib/ai/multi-source-pipeline.ts` — LLM-or-fallback pipeline
   - `src/renderer/` — `SiteConfig` → React DOM
   - `src/genes/` — atomic visual blocks
   - `app/` + `components/` + `lib/` — legacy production app

4. **Config** controls the environment and build:
   - `next.config.ts` — theme bundle isolation (`.next-a/b/c`)
   - `.env.local` — secrets and feature flags
   - `content/dimensions/specs/` + `content/dimensions/bundles/` — theme dimension configs
   - `lib/env.ts` — enforces required vars at startup (`requireEnv`)

---

### Prerequisites

- Node.js 20+
- npm 9+
- A Square Developer account ([developer.squareup.com](https://developer.squareup.com/))

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind v4 |
| UI | Custom components (Button, Card, Dialog) |
| Icons | lucide-react |
| State (cart) | Zustand with localStorage persist |
| Data fetching | SWR (client-side), fetch + ISR (server) |
| CMS | Outstatic |
| SMS | Twilio |
| Payments | Square Web Payments SDK + Orders API |
| Testing | Vitest + React Testing Library + jsdom |
| Auth | JWT session tokens (crypto-agile, no server DB) |
| Site generation (new) | json-render, taste-engine, soltana-ui, @lisse, useinkjet, @design-guard |

---

## Website Security

This project applies AI-era security measures in three categories: what is **implemented today**, what is **architecturally ready**, and what is **planned**.

### Implemented

#### Crypto-Agile JWT Auth

Dashboard sessions are signed with HMAC (`HS256`/`HS384`/`HS512`) selected at runtime via the `JWT_ALGORITHM` env var. Verification accepts all supported algorithms simultaneously, enabling **rolling key rotation** without invalidating active sessions. The signing path is isolated with the `server-only` directive so key material never reaches the client bundle.

- Code: [`lib/auth/session.ts`](lib/auth/session.ts)
- Decision record: [`docs/adr/011-crypto-agile-jwt-signing.md`](docs/adr/011-crypto-agile-jwt-signing.md)

#### Webhook Signature Verification

Square webhooks are verified with constant-time HMAC-SHA256 using the `SQUARE_WEBHOOK_SIGNATURE_KEY`. Replay attacks are prevented by timestamp validation inside [`lib/webhooks/square.ts`](lib/webhooks/square.ts).

#### Supply-Chain Hardening

| Control | Implementation |
|---|---|
| **npm script suppression** | `.npmrc` sets `ignore-scripts=true` and `min-release-age=7`; CI uses `npm ci --ignore-scripts` |
| **Vulnerability gate** | `npm audit --audit-level=high` fails CI on high/critical findings |
| **Pinned CI actions** | All GitHub Actions pinned to commit SHAs; least-privilege `permissions: contents: read` |
| **Dependency pinning** | `overrides` in `package.json` for high-risk transitive deps (`dompurify`, `cookie`, `markdown-it`) |
| **Dependabot** | Weekly npm + GitHub Actions updates grouped by production/development |
| **Direct-dependency rule** | Any package imported in source must be listed in `dependencies`, preventing silent transitive drift |
| **SAST** | GitHub CodeQL (javascript-typescript) runs on every push/PR to `main` |

Policy details: [`docs/patterns/supply-chain-hardening.md`](docs/patterns/supply-chain-hardening.md)

#### No Silent Fallbacks

Misconfiguration throws a meaningful error at startup (`requireEnv` in `lib/env.ts`) rather than silently degrading to an insecure default.

### PQC-Ready (Post-Quantum Cryptography)

The JWT signing abstraction in [`lib/auth/session.ts`](lib/auth/session.ts) is structured to support **ML-DSA** (FIPS 204, the NIST post-quantum signature standard) once the `jose` library exposes it. The `getAlgorithm()` gate already lists `SUPPORTED_ALGORITHMS` as a single source of truth — adding ML-DSA there is the only step required for the verification and signing paths.

- **Why not yet activated:** `jose` v5.x does not yet expose ML-DSA; `.tsp` specs in `specs/square.tsp` model future hybrid schemes (ML-KEM + ECDH) for transport-layer key exchange.
- Decision record: [`docs/adr/011-crypto-agile-jwt-signing.md`](docs/adr/011-crypto-agile-jwt-signing.md)

### Roadmap: Anti-Fingerprinting & Security Headers

The following are tracked in the project roadmap but **not yet enforced** in `next.config.ts` or `proxy.ts`:

- **Content-Security-Policy** — restrict script/style/image sources; nonce-based inline script allowance
- **Referrer-Policy** — `strict-origin-when-cross-origin` or `no-referrer`
- **Permissions-Policy** — disable camera, microphone, geolocation on pages that don't need them
- **Strict-Transport-Security** — HSTS with `max-age=31536000; includeSubDomains`
- **X-Frame-Options** — `DENY` to prevent clickjacking
- **Fingerprint mitigation** — block third-party analytics/tracker scripts; avoid `navigator` property leaks

Roadmap reference: [`docs/roadmap/phase_7_security_hardening.md`](docs/roadmap/phase_7_security_hardening.md)

---

## AI Agent / MCP Support

The project ships with [`mcp.json`](mcp.json) for AI coding agents and MCP-aware tools:

```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    },
    "square": {
      "command": "npx",
      "args": ["-y", "@square/square-mcp-server"],
      "env": {
        "SQUARE_ACCESS_TOKEN": "${SQUARE_ACCESS_TOKEN}"
      }
    },
    "twilio": {
      "command": "npx",
      "args": ["-y", "@twilio-alpha/mcp", "${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}"],
      "env": {
        "TWILIO_ACCOUNT_SID": "${TWILIO_ACCOUNT_SID}",
        "TWILIO_AUTH_TOKEN": "${TWILIO_AUTH_TOKEN}"
      }
    }
  }
}
```

| Server | Purpose |
|--------|---------|
| **next-devtools** | Next.js debugging, route inspection, server logs |
| **square** | Direct Square API access (catalog, orders, payments, webhooks) via MCP |
| **twilio** | Send SMS / manage Twilio resources via MCP |

### Generator skills for AI agents

Skills are organized by the four architectural boundaries documented above. Each major AI-generated config artifact has a dedicated skill.

#### Modern Generator Architecture (New)

| Skill | Boundary | Purpose |
|-------|----------|---------|
| [`skills/website-generator/SKILL.md`](skills/website-generator/SKILL.md) | AI/Skills (orchestrator) | Top-level generation loop: interpret brief → run pipeline → preview → iterate |
| [`skills/business-profile/SKILL.md`](skills/business-profile/SKILL.md) | Human Input → Code | Extract and validate `BusinessProfile` from raw business data |
| [`skills/layout-selector/SKILL.md`](skills/layout-selector/SKILL.md) | AI/Skills → Code | Select archetypes and variants per page, produces `LayoutOutput` |
| [`skills/content-generator/SKILL.md`](skills/content-generator/SKILL.md) | AI/Skills → Code | Generate block data maps from layout + business profile, produces `PageBundle` |
| [`skills/sequencer/SKILL.md`](skills/sequencer/SKILL.md) | Code | Industry profiles, section templates, pacing rules, produces `SiteConfig` |
| [`skills/tuner-system/SKILL.md`](skills/tuner-system/SKILL.md) | Code | Configure 5 Taste Engine tuners and Soltana archetype tokens |
| [`skills/gene-designer/SKILL.md`](skills/gene-designer/SKILL.md) | Code | Create new gene variants as json-render components |

#### Legacy CMS + Dimension System (Old)

| Skill | Boundary | Purpose |
|-------|----------|---------|
| [`skills/legacy-theme-dimensions/SKILL.md`](skills/legacy-theme-dimensions/SKILL.md) | Config → Code | 9-dimension design system for old CMS theme injection |
| [`skills/legacy-theme-uniqueness/SKILL.md`](skills/legacy-theme-uniqueness/SKILL.md) | Code (audit) | Hardcoded value audit for legacy dimension system |
| [`skills/legacy-website-builder/SKILL.md`](skills/legacy-website-builder/SKILL.md) | Human Input → Code | End-to-end CMS site builder using old `content/cms/` pipeline |

#### External Tool Wrappers

| Skill | Boundary | Purpose |
|-------|----------|---------|
| [`skills/ticonderoga/SKILL.md`](skills/ticonderoga/SKILL.md) | AI/Skills | Wraps standalone Ticonderoga Design Genome Lab CLI (Phase 5+) |

---

## Quick Start

```bash
git clone <repo>
cd cafe-template
cp .env.local.example .env.local    # then fill in your keys (see below)
npm install
npm run dev                          # → http://localhost:3000
```

The app runs in **demo mode** by default (`NEXT_PUBLIC_DEMO_MODE=true`) — see [Demo Mode](#demo-mode).

---

## Dev Setup

```bash
npm run dev      # Start dev server with Turbopack → http://localhost:3000
npm run build    # Production build → .next/
npm run start    # Serve production build
npm run lint     # ESLint across all .ts/.tsx files
```

Linting uses [`eslint.config.mjs`](eslint.config.mjs). Pre-commit hooks run `lint-staged` on staged `.ts`/`.tsx` files via `simple-git-hooks`.

---

## Square Configuration

Create a Square Developer application. You need both **sandbox** credentials (for development) and **production** credentials (for live deployments).

| Variable | Where to find it |
|---|---|
| `SQUARE_ACCESS_TOKEN` | Dev Dashboard → your app → **Credentials** → copy the Access Token |
| `SQUARE_LOCATION_ID` | Dev Dashboard → your app → **Locations** → your location ID |
| `SQUARE_ENVIRONMENT` | `sandbox` (dev) or `production` (live) |
| `NEXT_PUBLIC_SQUARE_APP_ID` | Dev Dashboard → **Credentials** → **Application ID** |
| `NEXT_PUBLIC_SQUARE_LOCATION_ID` | Same as `SQUARE_LOCATION_ID` (used client-side by Web Payments SDK) |
| `NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL` | (Optional) Square-hosted ordering page as fallback |

### Webhook Setup

In Square Developer Dashboard → your app → **Webhooks**, add a subscription to `order.updated` pointing to:

```
https://yourdomain.com/api/square/webhook
```

Copy the **Signature Key** into `SQUARE_WEBHOOK_SIGNATURE_KEY` for HMAC verification.

### Square CORS

Add `https://yourdomain.com` to your Square app's **Allowed CORS origins** in the Developer Dashboard.

### Loyalty (Phase 6)

| Variable | Description |
|---|---|
| `SQUARE_LOYALTY_PROGRAM_ID` | From Square Dev Dashboard → **Loyalty** → Program ID |

Full env reference: [`docs/roadmap/phase_4_full_square_integration.md`](docs/roadmap/phase_4_full_square_integration.md)

---

## Tests

Tests use **Vitest** + **React Testing Library** + **jsdom**. Located in `__tests__/` mirroring the source tree.

```bash
npm run test        # Run all tests once (CI mode)
npx vitest          # Watch mode for development
```

### Test structure

```
__tests__/
├── lib/
│   ├── utils.test.ts
│   ├── utils-format.test.ts
│   ├── webhooks/square.test.ts
│   ├── square/
│   │   ├── client.test.ts
│   │   ├── catalog.test.ts
│   │   ├── orders.test.ts
│   │   └── payments.test.ts
│   ├── store/
│   │   └── cart.test.ts
│   └── twilio/client.test.ts
├── hooks/
│   ├── useCart.test.tsx
│   ├── useMenu.test.tsx
│   └── useOrderStatus.test.tsx
├── components/
│   ├── order-button.test.tsx
│   ├── cart/
│   ├── checkout/
│   ├── menu/
│   └── order/
├── app/
│   └── api/square/webhook/
│       └── route.test.ts
└── proxy.test.ts
```

Config: [`vitest.config.mts`](vitest.config.mts) — environment `jsdom`, `@/` path aliases via `vite-tsconfig-paths`.

---

## Demo Mode

Set `NEXT_PUBLIC_DEMO_MODE=true` to run without any real API credentials. All Square calls return mock data:

- **Menu** — 8 demo items with Unsplash images and modifiers
- **Orders** — 3 demo orders in `COMPLETED`, `IN_PROGRESS`, `PROPOSED` states; new orders generate randomly
- **Payments** — always returns `COMPLETED`
- **Location** — hardcoded Melbourne cafe address

A **Demo Mode** badge appears in the UI when active. Check programmatically via `lib/demo/config.ts` (`isDemoMode()`).

---

## Deploy to Netlify

### Prerequisites

1. Push your repo to GitHub/GitLab/Bitbucket
2. Create a [Netlify](https://netlify.com) account
3. Have a Square **production** access token and application ready (or use demo mode)

### Deploy via Git (recommended)

Netlify auto-detects Next.js — [`netlify.toml`](netlify.toml) is included for explicit config.

1. **Netlify Dashboard** → **Add new site** → **Import an existing project**
2. Connect your Git provider and select the repo
3. Configure:

| Setting | Value |
|---|---|
| **Build command** | `npm run build` |
| **Publish directory** | `.next` (auto-detected) |
| **Node version** | 20 |

4. **Add environment variables** — all from `.env.local`, with live credentials:

| Variable | Production value |
|---|---|
| `SQUARE_ENVIRONMENT` | `production` |
| `SQUARE_ACCESS_TOKEN` | Square **production** token |
| `NEXT_PUBLIC_SQUARE_APP_ID` | Square **production** Application ID |
| `NEXT_PUBLIC_DEMO_MODE` | `false` (or omit) |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |

5. **Deploy**

### Post-deploy checklist

- **Custom domain** — Netlify Dashboard → **Domain settings** → add your domain
- **Square webhooks** — Update webhook URL to `https://yourdomain.com/api/square/webhook`
- **Square CORS** — Add `https://yourdomain.com` to CORS allowlist
- **Outstatic** — Visit `https://yourdomain.com/outstatic` to generate API key

---

## Deploy to Railway

Railway runs Node.js apps with zero-config and built-in env management.

### Prerequisites

1. Push your repo to GitHub
2. Create a [Railway](https://railway.app) account
3. Have Square **production** credentials

### Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Add environment variables
railway variables set SQUARE_ACCESS_TOKEN="your-prod-token"
railway variables set SQUARE_ENVIRONMENT=production
railway variables set SQUARE_LOCATION_ID="your-location-id"
railway variables set NEXT_PUBLIC_SQUARE_APP_ID="your-app-id"
railway variables set NEXT_PUBLIC_SQUARE_LOCATION_ID="your-location-id"
railway variables set NEXT_PUBLIC_SITE_URL="https://your-app.up.railway.app"
railway variables set NEXT_PUBLIC_DEMO_MODE=false

# Deploy
railway up
```

### Deploy via Dashboard

1. **Railway Dashboard** → **New Project** → **Deploy from GitHub repo**
2. Select your repo — Railway detects Next.js automatically
3. The build runs `npm run build`; the start command is `npm start`
4. Add all environment variables from `.env.local` in the **Variables** tab
5. Railway exposes a public URL (e.g. `https://your-app.up.railway.app`)

### Railway-specific notes

| Concern | Recommendation |
|---|---|
| **Port** | Next.js respects `PORT` env var automatically in production |
| **Node version** | Ensure Node 20+ (set via `NODE_VERSION` or `.node-version`) |
| **Static files** | Next.js output dir `.next` is served correctly by Railway's Node runtime |
| **ISR** | Works normally — pages regenerate on demand |
| **Cron / Webhooks** | Railway can expose the `/api/square/webhook` route publicly |

### Railway Nixpacks config (optional)

Create [`nixpacks.toml`](nixpacks.toml) at repo root if you need explicit build control:

```toml
[phases.setup]
nixPkgs = ["nodejs-20_x", "npm-9_x"]

[phases.install]
cmds = ["npm ci --ignore-scripts"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

---

## CI/CD

GitHub Actions pipeline runs on push/PR to `main`:

- `audit` — `npm audit --audit-level=high`
- `lint` — ESLint
- `build` — Production build
- `test` — Vitest
- `codeql` — GitHub CodeQL security analysis

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, menu preview, reviews, hours, map, Instagram |
| `/menu` | Full dynamic menu (items, modifiers, categories from Square) |
| `/preview` | SiteConfig preview — render any config from `src/test-configs/` via query param |
| `/cart` | Full cart page with item management |
| `/checkout` | Custom checkout with Square Web Payments form |
| `/checkout/confirmation` | Post-payment confirmation with order details |
| `/order/[orderId]` | Order status tracking with timeline |
| `/about` | Story and values |
| `/contact` | Contact details and map |
| `/outstatic` | Outstatic CMS admin (when configured) |
| `/dashboard` | Admin dashboard — catalog management (JWT auth required) |

---

## API Routes

| Route | Description |
|-------|-------------|
| `GET /api/square/catalog` | Menu items, categories, images from Square |
| `POST /api/square/order` | Create order (pickup or delivery) |
| `GET /api/square/order/[orderId]` | Retrieve order by ID |
| `POST /api/square/payment` | Process payment via Square Payments API |
| `POST /api/square/webhook` | Square order webhook → Twilio SMS |
| `POST /api/twilio/sms` | Send SMS via Twilio |
| `GET|POST /api/outstatic/[...]` | Outstatic CMS API |
| `GET /api/preview` | List / serve SiteConfig test configs |
| `POST /api/preview` | Validate and echo a SiteConfig |

---

## Full Environment Reference

```bash
# ─── Square ──────────────────────────────────────────────────────────
SQUARE_ACCESS_TOKEN=
SQUARE_ENVIRONMENT=sandbox
SQUARE_LOCATION_ID=
NEXT_PUBLIC_SQUARE_APP_ID=
NEXT_PUBLIC_SQUARE_LOCATION_ID=
# Optional: Square hosted ordering profile (fallback URL)
NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL=

# ─── Twilio ──────────────────────────────────────────────────────────
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# ─── Square Webhooks �
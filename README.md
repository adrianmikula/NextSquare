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

## Releasing to Production with Devin

[Devin](https://devin.ai/) is an AI software engineer that can automate the release workflow from a clean main branch all the way through to a live Netlify deployment. This section documents the expected setup and the exact steps Devin should follow.

### Prerequisites

1. **Netlify account** linked to your GitHub org
2. **Netlify Personal Access Token** with `publish:update` and `sites:read` scopes
3. **Netlify Site ID** for the production site (found in Site settings → General → Site ID)
4. **GitHub repo** pushed and Netlify site connected via Git (auto-deploy enabled on `main`)
5. **Production env vars** configured in Netlify Dashboard → Site settings → Environment variables

### Environment setup

Create a `.env.netlify` file (gitignored) or store these in your secret manager so Devin can access them:

```bash
NETLIFY_AUTH_TOKEN=your-netlify-personal-access-token
NETLIFY_SITE_ID=your-site-id
```

Also ensure production variables are set in the Netlify Dashboard:

| Variable | Value |
|---|---|
| `SQUARE_ENVIRONMENT` | `production` |
| `SQUARE_ACCESS_TOKEN` | Square production token |
| `NEXT_PUBLIC_SQUARE_APP_ID` | Square production Application ID |
| `NEXT_PUBLIC_SQUARE_LOCATION_ID` | Production location ID |
| `NEXT_PUBLIC_DEMO_MODE` | `false` |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | Production webhook signature key |
| `SQUARE_LOYALTY_PROGRAM_ID` | Production loyalty program ID |

### Devin release workflow

When asked to "release to production" or "publish to Netlify", Devin should run the following sequence:

1. **Confirm branch state**
   ```bash
   git status
   git log --oneline -5
   ```
   Ensure working tree is clean and HEAD is up to date with `origin/main`. If there are uncommitted changes, ask the user before proceeding.

2. **Run the full CI signal locally**
   ```bash
   npm run lint:quiet
   npm run typecheck
   npm run test:fast
   ```
   All three must pass before a release proceeds. If any fail, stop and report the failure.

3. **Install Netlify CLI (if not already installed)**
   ```bash
   npm install -g netlify-cli
   ```

4. **Build the production bundle locally**
   ```bash
   npm run build
   ```
   Verify the build completes without errors. If the build fails, stop and report.

5. **Deploy to Netlify (production)**
   ```bash
   netlify deploy --prod \
     --dir=.next \
     --site="$NETLIFY_SITE_ID" \
     --auth="$NETLIFY_AUTH_TOKEN"
   ```
   The `netlify.toml` at the repo root configures the Next.js plugin automatically.

6. **Verify the deploy**
   - Open the deploy URL returned by the CLI
   - Confirm the site loads without console errors
   - Spot-check the menu, cart, and checkout pages
   - Verify the site is running against production Square credentials (not sandbox)

7. **Run post-deploy sanity checks**
   ```bash
   # Smoke-test the catalog API
   curl -s https://yourdomain.com/api/square/catalog | head -c 200

   # Smoke-test the order API (requires a valid order ID from the live site)
   # curl -s https://yourdomain.com/api/square/order/ORDER_ID
   ```
   If either endpoint returns a 5xx, stop and alert the user.

8. **Report the release**
   Output the Netlify deploy URL, commit SHA, and a summary of what changed. If any step fails, report the exact error and the step that failed without retrying.

### Troubleshooting

| Issue | Fix |
|---|---|
| `netlify deploy` returns 401 | Regenerate Netlify Personal Access Token and update `NETLIFY_AUTH_TOKEN` |
| Deploy succeeds but site shows old content | Check Netlify Deploy Preview vs Production; ensure `--prod` flag was used |
| Build fails with `SQUARE_ENVIRONMENT` missing | Set the variable in Netlify Dashboard → Environment variables, then trigger a new deploy |
| Webhook SMS not sending after deploy | Confirm `SQUARE_WEBHOOK_SIGNATURE_KEY` matches Square Dashboard; verify webhook URL points to production domain |

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

# ─── Square Webhooks ──────────────────────────────────────────────────
SQUARE_WEBHOOK_SIGNATURE_KEY=

# ─── Outstatic CMS ───────────────────────────────────────────────────
OUTSTATIC_API_KEY=

# ─── Dashboard Auth ──────────────────────────────────────────────────
DASHBOARD_PASSWORD=

# ─── RBAC via Square Team API ─────────────────────────────────────────
# Email used to look up Square team membership for role assignment.
# Optional - defaults to owner role if unset.
DASHBOARD_ADMIN_EMAIL=
# Comma-separated emails granted the developer role (bypasses Square lookup)
DASHBOARD_DEVELOPER_EMAILS=

# ─── MFA via Twilio SMS ───────────────────────────────────────────────
# Admin phone for MFA OTP delivery (Twilio-compatible E.164 format)
DASHBOARD_ADMIN_PHONE=
# OTP validity window in seconds (default: 300 = 5 minutes)
MFA_CODE_TTL=300

# ─── App ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=
# Logging verbosity: debug, info, warn, error (default: debug in dev, warn in production)
LOG_LEVEL=debug

# ─── Square Loyalty ──────────────────────────────────────────────────
# From Square Developer Dashboard > Loyalty > Program ID
SQUARE_LOYALTY_PROGRAM_ID=

# ─── Demo Mode ───────────────────────────────────────────────────────
# Set to "true" to use mock data (no real Square API calls)
NEXT_PUBLIC_DEMO_MODE=false
```

---

## Testing with Square Sandbox

To test the full ordering flow locally against Square's sandbox:

### 1. Get sandbox credentials

1. Go to the [Square Developer Dashboard](https://developer.squareup.com/)
2. Create a new application (or use an existing one)
3. In **Credentials**, copy:
   - **Sandbox Access Token** → `SQUARE_ACCESS_TOKEN`
   - **Application ID** → `NEXT_PUBLIC_SQUARE_APP_ID`
4. In **Locations**, copy your location ID → `SQUARE_LOCATION_ID` and `NEXT_PUBLIC_SQUARE_LOCATION_ID`

### 2. Configure your local environment

```bash
cp .env.local.example .env.local
```

Set these values in `.env.local`:

```bash
# Square sandbox credentials
SQUARE_ACCESS_TOKEN=your-sandbox-access-token
SQUARE_ENVIRONMENT=sandbox
SQUARE_LOCATION_ID=your-location-id
NEXT_PUBLIC_SQUARE_APP_ID=your-app-id
NEXT_PUBLIC_SQUARE_LOCATION_ID=your-location-id

# Optional: override defaults
SQUARE_DEFAULT_CURRENCY=AUD
SQUARE_PLATFORM_FEE_RATE=0.05
```

> **Note:** When `NODE_ENV=development` and `SQUARE_ENVIRONMENT` is not set, the app automatically uses sandbox mode.

### 3. Add sandbox items to your Square catalog

1. In the Developer Dashboard, open your sandbox location
2. Go to **Items** and add at least one item with a price
3. Optionally create categories and upload images

### 4. Start the dev server

```bash
npm run dev
# → http://localhost:3000
```

The menu page (`/menu`) will pull live catalog data from the Square sandbox. You can add items to cart and complete a full checkout using Square's test card:

```
4111 1111 1111 1111
Expiry: any future date
CVC: any 3 digits
ZIP: any 5 digits
```

### 5. Verify orders in the sandbox

1. After placing an order, go to the Square Developer Dashboard → **Sandbox** → **Orders**
2. You should see the order in `PROPOSED` state
3. You can manually transition it through `IN_PROGRESS` → `COMPLETED` to test webhook SMS notifications

### 6. Testing webhooks locally

Square webhooks require a public HTTPS endpoint. To test webhooks locally:

1. Use a tunnel like [ngrok](https://ngrok.com/):
   ```bash
   ngrok http 3000
   ```
2. In the Developer Dashboard → **Webhooks**, add the ngrok URL:
   ```
   https://your-ngrok-id.ngrok.io/api/square/webhook
   ```
3. Copy the **Signature Key** into `.env.local`:
   ```bash
   SQUARE_WEBHOOK_SIGNATURE_KEY=your-signature-key
   ```
4. Restart the dev server after changing `.env.local`

### 7. Developer role sandbox override

If you log into the admin dashboard with an email listed in `DASHBOARD_DEVELOPER_EMAILS`, all Square API calls automatically use sandbox credentials regardless of `SQUARE_ENVIRONMENT`. This lets you test admin catalog operations safely.
# Cafe Template

A Next.js 16 marketing & ordering site for Square POS cafes. Zero database — launch in hours.

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
└──────────────────────┘
```

- **Checkout** — Fully custom branded checkout flow with Square Web Payments SDK
- **Cart** — Zustand store with localStorage persistence, modifier support, pickup/delivery toggle
- **Menu** — Managed in Square Dashboard, fetched via ISR (`revalidate: 300`)
- **Payments** — Square Payments API (SDK) with verification token support
- **Orders** — Square Orders API for create, retrieve, search
- **Content** — Outstatic CMS (Markdown in GitHub, no database)
- **SMS** — Twilio via Square webhooks (confirmed → preparing → ready)

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

---

## Quick Start

```bash
git clone <repo>
cd cafe-template
cp .env.local.example .env.local    # then fill in your keys (see below)
npm install
npm run dev                          # → http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000). The app runs in **demo mode** by default after setup — see [Demo Mode](#demo-mode) below.

---

## Setup & Configuration

### 1. Square (Required for live payments & menu)

Create a [Square Developer account](https://developer.squareup.com/) and a new application. From the Square Developer Dashboard:

| Variable | Where to find it |
|---|---|
| `SQUARE_ACCESS_TOKEN` | Square Dev Dashboard → your app → **Credentials** → copy the **Access Token** (use sandbox token for dev) |
| `SQUARE_LOCATION_ID` | Square Dev Dashboard → your app → **Locations** → copy the ID of your default location |
| `SQUARE_ENVIRONMENT` | `sandbox` while developing, `production` for live |
| `NEXT_PUBLIC_SQUARE_APP_ID` | Square Dev Dashboard → your app → **Credentials** → **Application ID** |
| `NEXT_PUBLIC_SQUARE_LOCATION_ID` | Same as `SQUARE_LOCATION_ID` (needed client-side for Web Payments SDK) |
| `NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL` | (Optional) Square-hosted ordering page URL as fallback |

**Sandbox test card:** `4111 1111 1111 1111` — any future expiry, any CVV.

### 2. Twilio (Optional — order SMS notifications)

| Variable | Where to find it |
|---|---|
| `TWILIO_ACCOUNT_SID` | [Twilio Console](https://console.twilio.com) → **Account** → **API Keys & Credentials** |
| `TWILIO_AUTH_TOKEN` | Same page (reveal or generate) |
| `TWILIO_PHONE_NUMBER` | Twilio Console → **Phone Numbers** → your purchased number (e.g. `+61400000000`) |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | Square Dev Dashboard → your app → **Webhooks** → **Signature Key** |

**Webhook setup:** In Square Developer Dashboard → your app → **Webhooks**, add a subscription to `order.updated` pointing to `https://yourdomain.com/api/square/webhook`. The signature key verifies that requests come from Square.

### 3. Outstatic CMS (Optional — content management)

| Variable | Where to find it |
|---|---|
| `OUTSTATIC_API_KEY` | Generate via the Outstatic admin UI at `/outstatic` after first deploy |

Outstatic stores content as Markdown files in your GitHub repo — no external database. The CMS is accessible at `/outstatic` when configured.

### 4. Dashboard Auth (Optional — admin dashboard)

| Variable | Where to find it |
|---|---|
| `DASHBOARD_PASSWORD` | Choose any password. Used for basic auth on `/dashboard` routes. |

### 5. General

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (e.g. `https://mycafe.com`). Used for OG images, sitemap, and robots. |

### Full `.env.local` reference

```bash
# ─── Square ──────────────────────────────────────────────────────────
SQUARE_ACCESS_TOKEN=
SQUARE_ENVIRONMENT=sandbox
SQUARE_LOCATION_ID=
NEXT_PUBLIC_SQUARE_APP_ID=
NEXT_PUBLIC_SQUARE_LOCATION_ID=
NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL=

# ─── Twilio ──────────────────────────────────────────────────────────
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# ─── Square Webhooks ─────────────────────────────────────────────────
SQUARE_WEBHOOK_SIGNATURE_KEY=

# ─── Outstatic CMS ───────────────────────────────────────────────────
OUTSTATIC_API_KEY=

# ─── Dashboard Auth ──────────────────────────────────────────────────
DASHBOARD_PASSWORD=

# ─── App ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=

# ─── Demo Mode ───────────────────────────────────────────────────────
NEXT_PUBLIC_DEMO_MODE=false
```

---

## Demo Mode

Run the full app without any real API credentials. All Square calls return mock data.

```bash
# In .env.local:
NEXT_PUBLIC_DEMO_MODE=true
```

What's mocked:
- **Menu** — 8 demo items (Latte, Flat White, Avocado Toast, etc.) with Unsplash images and modifiers
- **Orders** — 3 demo orders in different states (`COMPLETED`, `IN_PROGRESS`, `PROPOSED`), plus new orders generate randomly
- **Payments** — always returns `COMPLETED`
- **Location** — returns a hardcoded Melbourne cafe address
- **Square API base** — forced to sandbox

A fixed amber **Demo Mode** badge appears in the bottom-left corner of the UI when active.

To check demo mode in code: `lib/demo/config.ts` exports `isDemoMode()` — used as a guard in all Square service files.

---

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Start dev server with Turbopack → `http://localhost:3000` |
| `npm run build` | Production build (outputs `.next/`) |
| `npm run start` | Start production server (after `build`) |
| `npm run lint` | Run ESLint across all `.ts`/`.tsx` files |
| `npm run test` | Run Vitest once (CI mode) |
| `npx vitest` | Run Vitest in watch mode (dev) |
| `npm audit` | Check for dependency vulnerabilities |

---

## Testing

Tests use **Vitest** + **React Testing Library** + **jsdom**. Located in `__tests__/` mirroring the source tree.

```bash
npm run test        # Run all tests once
npx vitest          # Watch mode
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

### Adding a new test

1. Create `__tests__/<path>/<name>.test.ts` (or `.test.tsx` for components)
2. Use `@/` path aliases (already configured in tsconfig + vitest)
3. Mock external dependencies with `vi.mock()` at top level
4. Use `vi.stubEnv()` / `vi.unstubAllEnvs()` for environment variables
5. Use `vi.stubGlobal()` to mock `fetch` or other globals

```typescript
import { describe, expect, it, vi } from "vitest"
import { myFunction } from "@/lib/my-module"

vi.mock("@/external/dep", () => ({
  someDep: vi.fn(() => "mocked"),
}))

describe("myFunction", () => {
  it("does the thing", () => {
    expect(myFunction()).toBe("expected")
  })
})
```

### Mocking patterns

| Scenario | Approach |
|---|---|
| External npm package | `vi.mock("package-name", () => ({ ... }))` |
| External npm (complex) | `vi.mock("package-name")` + `__mocks__/package-name.ts` manual mock |
| Internal module | `vi.mock("@/lib/module", () => ({ ... }))` |
| Environment variable | `vi.stubEnv("KEY", "value")` / `vi.unstubAllEnvs()` |
| `fetch` / global | `vi.stubGlobal("fetch", vi.fn())` |
| Module-level side effects | Dynamic `import()` after setting env + `vi.resetModules()` |

---

## Deploy to Netlify

### Prerequisites

1. Push your repo to GitHub/GitLab/Bitbucket
2. Create a [Netlify](https://netlify.com) account
3. Have a Square **production** access token and application ready (or use demo mode for testing)

### Deploy via Git (recommended)

Netlify auto-detects Next.js — no config file needed.

1. **Netlify Dashboard** → **Add new site** → **Import an existing project**
2. Connect your Git provider and select the repo
3. Configure:

| Setting | Value |
|---|---|
| **Build command** | `npm run build` |
| **Publish directory** | `.next` (auto-detected) |
| **Node version** | 20 (set via `.node-version` or Netlify UI) |

4. **Add environment variables** (all from `.env.local` — see table above). For production:
   - `SQUARE_ENVIRONMENT=production`
   - `NEXT_PUBLIC_DEMO_MODE=false` (or omit)
5. **Deploy**

### Deploy via CLI (for CI/CD)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Log in
ntl login

# Deploy
ntl deploy --prod --build
```

### Post-deploy

- **Custom domain** — Netlify Dashboard → **Domain settings** → add your domain
- **Square webhooks** — Update your Square app's webhook URL to `https://yourdomain.com/api/square/webhook`
- **Square CORS** — Add `https://yourdomain.com` to your Square app's CORS allowlist in the Developer Dashboard
- **Outstatic** — Visit `https://yourdomain.com/outstatic` to generate an API key and start editing content
- **ISR** — Next.js Incremental Static Regeneration works on Netlify. Menu pages revalidate every 300 seconds by default

### Environment checklist for production

| Variable | Production value |
|---|---|
| `SQUARE_ENVIRONMENT` | `production` |
| `SQUARE_ACCESS_TOKEN` | Square **production** access token |
| `NEXT_PUBLIC_SQUARE_APP_ID` | Square **production** application ID |
| `NEXT_PUBLIC_DEMO_MODE` | `false` (or unset) |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |

### Netlify `netlify.toml` (optional)

The project deploys without this file (auto-detection works), but you can add one for explicit configuration:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## CI/CD

The repo includes a GitHub Actions CI pipeline (`.github/workflows/ci.yml`) that runs on push/PR to `main`:

- `audit` — `npm audit --audit-level=high`
- `lint` — ESLint
- `build` — Production build
- `test` — Vitest
- `codeql` — GitHub CodeQL security analysis

---

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, menu preview, reviews, hours, map, Instagram |
| `/menu` | Full dynamic menu (items, modifiers, categories from Square) |
| `/cart` | Full cart page with item management |
| `/checkout` | Custom checkout with Square Web Payments form |
| `/checkout/confirmation` | Post-payment confirmation with order details |
| `/order/[orderId]` | Order status tracking with timeline |
| `/about` | Story and values |
| `/contact` | Contact details and map |
| `/outstatic` | Outstatic CMS admin (when configured) |

---

## API Routes

| Route | Description |
|---|---|
| `GET /api/square/catalog` | Menu items, categories, images from Square |
| `POST /api/square/order` | Create order (pickup or delivery) |
| `GET /api/square/order/[orderId]` | Retrieve order by ID |
| `POST /api/square/payment` | Process payment via Square Payments API |
| `POST /api/square/webhook` | Square order webhook → Twilio SMS |
| `POST /api/twilio/sms` | Send SMS via Twilio |
| `GET|POST /api/outstatic/[...]` | Outstatic CMS API |

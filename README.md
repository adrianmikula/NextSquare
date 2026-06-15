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
- **Deploy** — Vercel (Next.js-native, edge caching, ISR)

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

## Setup

```bash
git clone <repo>
cd cafe-template
npm install
cp .env.local.example .env.local
```

## Environment Variables

Fill in `.env.local`:

| Variable | Required | Description |
|---|---|---|
| `SQUARE_ACCESS_TOKEN` | Yes | Square API access token |
| `SQUARE_ENVIRONMENT` | No | `sandbox` or `production` (default: sandbox) |
| `SQUARE_LOCATION_ID` | Yes | Square location ID |
| `NEXT_PUBLIC_SQUARE_APP_ID` | Yes | Square application ID (Web Payments SDK) |
| `NEXT_PUBLIC_SQUARE_LOCATION_ID` | Yes | Square location ID (client-side) |
| `NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL` | No | Fallback hosted ordering URL |
| `TWILIO_ACCOUNT_SID` | For SMS | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | For SMS | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | For SMS | Twilio SMS sender number |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | For SMS | Square webhook signature key |
| `OUTSTATIC_API_KEY` | For CMS | Outstatic API key |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical site URL |

## Development

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
npm run test      # Run Vitest
```

## Pages

| Route | Description |
|---|---|---|
| `/` | Home — hero, menu preview, reviews, hours, map, Instagram |
| `/menu` | Full dynamic menu (items, modifiers, categories from Square) |
| `/cart` | Full cart page with item management |
| `/checkout` | Custom checkout with Square Web Payments form |
| `/checkout/confirmation` | Post-payment confirmation with order details |
| `/order/[orderId]` | Order status tracking with timeline |
| `/about` | Story and values |
| `/contact` | Contact details and map |
| `/outstatic` | Outstatic CMS admin (when configured) |

## API Routes

| Route | Description |
|---|---|---|
| `GET /api/square/catalog` | Menu items, categories, images from Square |
| `POST /api/square/order` | Create order (pickup or delivery) |
| `GET /api/square/order/[orderId]` | Retrieve order by ID |
| `POST /api/square/payment` | Process payment via Square Payments API |
| `POST /api/square/webhook` | Square order webhook → Twilio SMS |
| `POST /api/twilio/sms` | Send SMS via Twilio |
| `GET|POST /api/outstatic/[...]` | Outstatic CMS API |

## Tests

Tests use **Vitest** with **React Testing Library**. Located in `__tests__/` mirroring the source tree.

### Running Tests

```bash
npm run test        # Run once (CI)
npx vitest          # Watch mode (dev)
```

### Test Structure

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
│   │   ├── CartButton.test.tsx
│   │   ├── CartDrawer.test.tsx
│   │   ├── CartItem.test.tsx
│   │   ├── CartProvider.test.tsx
│   │   ├── CartSummary.test.tsx
│   │   └── DeliveryPickupToggle.test.tsx
│   ├── checkout/
│   │   ├── DeliveryInfo.test.tsx
│   │   ├── OrderConfirmed.test.tsx
│   │   ├── OrderSummary.test.tsx
│   │   ├── PickupInfo.test.tsx
│   │   └── SquareFallback.test.tsx
│   ├── menu/
│   │   ├── CategoryNav.test.tsx
│   │   ├── MenuGrid.test.tsx
│   │   ├── MenuItemCard.test.tsx
│   │   ├── MenuItemDetail.test.tsx
│   │   └── ModifierDialog.test.tsx
│   └── order/
│       ├── OrderStatus.test.tsx
│       └── OrderTimeline.test.tsx
├── app/
│   └── api/square/webhook/
│       └── route.test.ts
└── proxy.test.ts
```

### Adding a New Test

1. Create a file at `__tests__/<path>/<name>.test.ts` (or `.test.tsx` for components)
2. Import from `@/` path aliases (already configured)
3. Mock external dependencies with `vi.mock()` at the top level (it hoists)
4. Use `vi.stubEnv()` / `vi.unstubAllEnvs()` for environment variables
5. Use `vi.stubGlobal()` to mock `fetch` or other globals

```typescript
// Example: testing a lib function
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

### Mocking Patterns

| Scenario | Approach |
|---|---|---|
| External npm package | `vi.mock("package-name", () => ({ ... }))` |
| External npm (complex) | `vi.mock("package-name")` + `__mocks__/package-name.ts` manual mock |
| Internal module | `vi.mock("@/lib/module", () => ({ ... }))` |
| Environment variable | `vi.stubEnv("KEY", "value")` / `vi.unstubAllEnvs()` |
| `fetch` / global | `vi.stubGlobal("fetch", vi.fn())` |
| Module-level side effects | Dynamic `import()` after setting env + `vi.resetModules()` |

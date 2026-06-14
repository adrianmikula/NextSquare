# Cafe Template

A Next.js 16 marketing site for Square POS cafes. Zero custom checkout code, zero database — launch in hours.

## Architecture

```
Next.js 16 + Tailwind v4                 Square Hosted Ordering Profile
┌──────────────────────┐                  ┌──────────────────────────┐
│  Marketing Site      │   "Order Now"    │  Menu synced from POS    │
│  Hero, Menu, About,  │ ──────────────>  │  Payments via Square     │
│  Contact, Social      │                  │  Orders → Square POS     │
└──────────┬───────────┘                  └────────────┬─────────────┘
           │                                           │
           ▼                                           ▼
┌──────────────────────┐                  ┌──────────────────────────┐
│  Outstatic CMS        │                  │  Twilio SMS             │
│  GitHub-backed admin  │                  │  Order notifications    │
│  at /outstatic        │                  │  via Square webhooks    │
└──────────────────────┘                  └──────────────────────────┘
```

- **Checkout** — Square's free hosted ordering profile (no custom checkout code)
- **Menu** — Managed in Square Dashboard, fetched via ISR (`revalidate: 300`)
- **Content** — Outstatic CMS (Markdown in GitHub, no database)
- **SMS** — Twilio via Square webhooks (confirmed → preparing → ready)
- **Deploy** — Vercel (Next.js-native, edge caching, ISR)

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind v4 |
| UI | Custom components (Button, Card) |
| Icons | lucide-react |
| CMS | Outstatic |
| SMS | Twilio |
| Payments | Square (hosted ordering profile) |

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
| `SQUARE_ENVIRONMENT` | No | `sandbox` or `production` |
| `SQUARE_LOCATION_ID` | Yes | Square location ID |
| `NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL` | Yes | Square hosted ordering URL |
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
|---|---|
| `/` | Home — hero, menu preview, reviews, hours, map, Instagram |
| `/menu` | Full menu (Coffee, Food, Pastries) |
| `/about` | Story and values |
| `/contact` | Contact details and map |
| `/outstatic` | Outstatic CMS admin (when configured) |

## API Routes

| Route | Description |
|---|---|
| `POST /api/square/webhook` | Square order webhook → Twilio SMS |
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
│   ├── webhooks/square.test.ts
│   ├── square/client.test.ts
│   └── twilio/client.test.ts
├── components/
│   └── order-button.test.tsx
└── app/api/square/webhook/
    └── route.test.ts
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
|---|---|
| External npm package | `vi.mock("package-name", () => ({ ... }))` |
| Internal module | `vi.mock("@/lib/module", () => ({ ... }))` |
| Environment variable | `vi.stubEnv("KEY", "value")` / `vi.unstubAllEnvs()` |
| `fetch` / global | `vi.stubGlobal("fetch", vi.fn())` |
| Module-level side effects | Dynamic `import()` after setting env + `vi.resetModules()` |

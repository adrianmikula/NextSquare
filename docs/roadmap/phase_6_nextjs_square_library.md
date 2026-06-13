# Phase 6: Standalone Next.js + Square Library

## Goal

Extract the core functionality — Square API clients, Zustand cart store, Twilio SMS, component library — into a standalone, versioned npm package. This lets any Next.js project (not just the template) use Square as a backend with minimal setup.

The library is consumed by the template (and any other Next.js app). The template becomes a reference implementation + marketing site.

---

## What to Extract

### Core Library (`@templatecafe/square-core`)

```
@templatecafe/square-core/
├── lib/
│   ├── square/
│   │   ├── client.ts          # Square Client singleton, reads env vars
│   │   ├── catalog.ts         # fetchMenu(), fetchItemBySlug(), searchItems()
│   │   ├── orders.ts          # createOrder(), getOrder(), searchOrders()
│   │   ├── payments.ts        # processPayment(), getPayment()
│   │   ├── loyalty.ts         # getOrCreateLoyaltyAccount(), calculatePoints()
│   │   └── webhook.ts         # verifySignature(), parseEvent()
│   ├── store/
│   │   └── cart.ts            # Zustand store + localStorage persist (framework-agnostic)
│   ├── twilio/
│   │   └── client.ts          # Twilio Client singleton, sendSMS()
│   └── utils.ts               # formatCurrency(), cn(), formatPhone()
├── types/
│   ├── square.ts              # Square CatalogItem, Order, LoyaltyAccount
│   ├── cart.ts                # CartItem, CartState, ModifierSelection
│   └── order.ts               # PickupOrder, DeliveryOrder, OrderState
├── components/
│   ├── menu/
│   │   ├── MenuGrid.tsx
│   │   ├── MenuItemCard.tsx
│   │   ├── CategoryNav.tsx
│   │   ├── ModifierDialog.tsx
│   │   └── MenuItemDetail.tsx
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── DeliveryPickupToggle.tsx
│   ├── checkout/
│   │   ├── SquarePaymentForm.tsx
│   │   ├── OrderSummary.tsx
│   │   ├── PickupInfo.tsx
│   │   ├── DeliveryInfo.tsx
│   │   └── OrderConfirmed.tsx
│   ├── order/
│   │   ├── OrderStatus.tsx
│   │   └── OrderTimeline.tsx
│   └── loyalty/
│       └── LoyaltyBadge.tsx
├── package.json
├── tsconfig.json
└── README.md
```

### What Stays in the Template

The template remains a full Next.js app that imports from `@templatecafe/square-core`:

```
template-cafe/
├── app/                          # Next.js App Router pages
│   ├── (storefront)/             # Pages, layouts
│   ├── api/                      # API routes (thin wrappers calling library)
│   └── dashboard/                # Admin dashboard pages
├── components/
│   ├── dashboard/                # Dashboard-specific components
│   └── ui/                       # shadcn/ui components
├── lib/                          # Template-specific logic only
├── docs/                         # Documentation
└── content/                      # Outstatic CMS content
```

---

## Package Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Next.js App (template)              │
│                                                      │
│  app/(storefront)/page.tsx                           │
│  import { MenuGrid, CartDrawer }                     │
│  from '@templatecafe/square-core'                    │
│                                                      │
│  app/api/square/order/route.ts                       │
│  import { createOrder }                              │
│  from '@templatecafe/square-core'                    │
└──────────────────────────┬───────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────┐
│         @templatecafe/square-core (npm package)       │
│                                                      │
│  Server-side: Square API clients, webhook handling    │
│  Client-side: Zustand store, cart components          │
│  Shared: Types, utilities                             │
│                                                      │
│  Zero external dependencies beyond Square SDK +       │
│  Zustand + react-square-web-payments-sdk + Twilio     │
└──────────────────────────────────────────────────────┘
```

---

## Build & Publishing

```json
// @templatecafe/square-core/package.json
{
  "name": "@templatecafe/square-core",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "peerDependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "square": "^44.0.0",
    "zustand": "^5.0.0",
    "twilio": "^5.0.0"
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "lint": "biome check src/",
    "typecheck": "tsc --noEmit"
  }
}
```

### Versioning Strategy

| Version | Status |
|---|---|
| 0.x | Active development. Breaking changes expected. Template tracks `latest`. |
| 1.0 | Stable API. Coincides with Phase 7 completion and production-ready template. |

### Usage in the Template

```json
// template-cafe/package.json
{
  "dependencies": {
    "@templatecafe/square-core": "workspace:*",
    // ... other deps
  }
}
```

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Package scope** | `@templatecafe/` | Private during development, public on npm at v1.0. |
| **Build tool** | tsup | Fast bundler for libraries. ESM + CJS + DTS output. |
| **Dev workflow** | npm workspace | Template + library in same monorepo. Hot reload across both. |
| **Peer dependencies** | Next.js, React, Square SDK, Zustand, Twilio | App controls versions. Library stays lean. |
| **CSS** | Not bundled | App provides Tailwind/shadcn/ui. Library uses `className` props. |
| **Environment variables** | Not read by library | App reads env vars, passes to library functions as params. |

---

## Deliverable

- `@templatecafe/square-core` npm package published (initially private)
- Template imports from `@templatecafe/square-core` instead of local files
- Monorepo workspace for development (template + library)
- All Square API clients, cart store, and UI components in the package
- Environment variables passed by the app, not read by the library
- TypeScript types exported for all Square objects, cart state, and order models

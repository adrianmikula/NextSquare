# Next.js + Square Cafe Ordering Platform

## Overview

An open-source, production-ready Next.js platform that uses **Square as the database** — no PostgreSQL, no Redis, no external database. Built for Australian cafes using Square POS.

**Core idea:** A progressive cafe website that starts with Square's free branded ordering profile (Phase 2), adds a custom admin dashboard (Phase 3), a full custom ordering experience with Zustand + Square APIs (Phase 4), customer loyalty + Square Marketing (Phase 5), extracts core functionality into a standalone npm library (Phase 6), adds Uber/DoorDash delivery fulfillment (Phase 7), then evolves into a SaaS platform for Australian cafes (Phase 8) with mobile photo-to-menu (Phase 9), AI site generation (Phase 10), and WordPress/Shopify import (Phase 11). Everything lives in Square — no external database.

---

## Architecture

```
                               ┌──────────────────────────────┐
                               │     Next.js 16 Frontend      │
                               │  (Phases 2-7, progressively  │
                               │   layered on same app)        │
                               └──────┬───────────┬───────────┘
                                      │           │
                                      ▼           ▼
                      ┌──────────────────┐  ┌──────────────────┐
                      │ Square's Free    │  │ Custom Ordering  │
                      │ Ordering Profile │  │ (Phases 4-7)     │
                      │ (Phase 2)        │  │                  │
                      │                  │  │ Web Payments     │
                      │ Zero dev work    │  │ SDK + Orders API │
                      │ Built-in deliv.  │  │ + Catalog        │
                      └────────┬─────────┘  └────────┬─────────┘
                               │                     │
                               ▼                     ▼
                      ┌──────────────────────────────────────────────┐
                      │            Square (single source of truth)    │
                      │                                                │
                      │  · Catalog API   — menu items, modifiers      │
                      │  · Orders API    — order lifecycle            │
                      │  · Payments API  — process card nonces        │
                      │  · Inventory API — auto-decrement stock       │
                      │  · Customers API — optional profiles          │
                      │  · Loyalty API   — rewards program            │
                      │  · Webhooks      — order.updated, etc.        │
                      └──────┬──────────────────┬─────────────────────┘
                             │                  │
                             ▼                  ▼
                      ┌──────────┐    ┌──────────────────────┐
                      │Square POS│    │  Twilio SMS          │
                      │(in cafe) │    │  (via webhooks)      │
                      │          │    │                      │
                      │ All      │    │  Order Confirmed     │
                      │ orders   │    │  → "We're making it!"│
                      │ appear   │    │  Ready for Pickup    │
                      │ here     │    │  → "Come get it!"    │
                      └──────────┘    └──────────────────────┘
```

**Zero external databases.** Only external services:
- **Square** — all data (menu, orders, customers, inventory)
- **Twilio** — SMS notifications
- **Vercel** — deploy the Next.js app

---

## Phases

| Phase | What | Document |
|---|---|---|
| **1** | Choose features & architecture | [`phase_1_choose_features_and_architecture.md`](./phase_1_choose_features_and_architecture.md) |
| **2** | Basic Square integration — marketing site + Square's free ordering profile + Twilio SMS + Outstatic CMS | [`phase_2_nextjs_square_integration.md`](./phase_2_nextjs_square_integration.md) |
| **3** | Custom admin dashboard — edit menu items, prices, availability via Square Catalog API (Retrieve → Modify → Upsert pattern) | [`phase_3_admin_dashboard.md`](./phase_3_admin_dashboard.md) |
| **4** | Full custom ordering — Zustand cart, Web Payments SDK, Orders API, menu with ISR, modifiers, guest checkout | [`phase_4_full_square_integration.md`](./phase_4_full_square_integration.md) |
| **5** | Customer loyalty + email marketing — Square Loyalty API, points display, phone enrollment, Square Marketing campaigns | [`phase_5_customer_loyalty.md`](./phase_5_customer_loyalty.md) |
| **6** | Standalone npm library — extract core Square API clients, Zustand store, components into `@templatecafe/square-core` | [`phase_6_nextjs_square_library.md`](./phase_6_nextjs_square_library.md) |
| **7** | Delivery fulfillment — Uber Direct + DoorDash Drive, cross-provider fallback, live driver tracking | [`phase_7_uber_deliveries.md`](./phase_7_uber_deliveries.md) |
| **8** | SaaS portal — multi-tenant platform letting Australian cafes easily build websites with built-in support for common POS and backend systems | [`phase_8_saas_portal.md`](./phase_8_saas_portal.md) |
| **9** | Mobile photo upload — take photos of items from mobile device, upload directly into Square menu items | [`phase_9_mobile_photo_upload.md`](./phase_9_mobile_photo_upload.md) |
| **10** | AI site generation — auto-generate cafe/restaurant sites from text descriptions | [`phase_10_ai_site_generation.md`](./phase_10_ai_site_generation.md) |
| **11** | Site import — auto-import WordPress and Shopify sites into the SaaS system | [`phase_11_wordpress_shopify_import.md`](./phase_11_wordpress_shopify_import.md) |

---

## Data Flow (Phase 4+ Custom Ordering)

### Loading the Menu

```
1. Page request → Next.js Server Component
2. → Square Catalog API: catalog.searchCatalogItems() with REGULAR type
3. → Returns: menu categories + items + modifiers + images + prices
4. → Rendered server-side (ISR, revalidate every 5 min)
5. → Client gets HTML — zero JS for the static menu content
```

### Adding to Cart (entirely client-side)

```
1. User clicks "Add Latte + Oat Milk"
2. → Zustand store: { catalogObjectId, modifiers: [{ oatMilkId }], qty: 1 }
3. → localStorage: cart persisted across page refreshes
4. → Cart drawer updates optimistically
```

### Checkout — Pickup Order

```
1. User fills: name, phone, pickup time
2. Client creates order preview from Zustand cart (items + modifiers + totals)
3. Square Web Payments SDK:
   a. Render card form + Apple Pay / Google Pay buttons (react-square-web-payments-sdk)
   b. Card tokenizes → nonce returned to browser
4. Server Action (parallel):
   a. Order: Square Orders API → CreateOrder with fulfillment.type=PICKUP
   b. Payment: Square Payments API → CreatePayment with nonce + orderId
5. Square sets order to COMPLETED → appears in Square POS
6. Server Action: → Twilio SMS "Order #42 confirmed! We'll text you when it's ready."
7. Order status page: /order/[orderId] (poll Square API or use webhook)
```

### Post-Order Lifecycle

```
1. Square webhook order.updated fires → Next.js /api/webhooks/square
2. Event types handled:

   state=COMPLETED → payment confirmed
     → Twilio: "Order #42 confirmed!"

   fulfillment.state=IN_PROGRESS → staff started preparing
     → Twilio: "We're making your order!"

   fulfillment.state=DELIVERED (pickup) → staff marked ready
     → Twilio: "Your order is ready for pickup!"
     → (Phase 7) Uber Direct / DoorDash Drive: dispatch delivery driver

   fulfillment.state=COMPLETED (delivery) → driver delivered
     → Twilio: "Your order has been delivered!"

3. Inventory auto-decremented in Square when fulfillment completes
4. 86'd items automatically hidden from website menu on next fetch
```

---

## Twilio SMS Notification System

| Event | Sent To | Template |
|---|---|---|
| Order Placed | Customer | "Cafe Name: Order #42 confirmed! We'll text you when it's ready. Track: [link]" |
| Preparing | Customer | "Cafe Name: We're making your order #42 now! ETA ~10 min" |
| Ready (Pickup) | Customer | "Cafe Name: Your order #42 is ready for pickup!" |
| Driver Dispatched (Delivery) | Customer | "Cafe Name: Your driver is on the way! Track: [link]" |
| Delivered | Customer | "Cafe Name: Your order #42 has been delivered! Enjoy!" |
| 86'd Item (Order Changed) | Customer | "Cafe Name: Sorry, [item] is out of stock. We'll call you to confirm a swap." |
| Delayed | Customer | "Cafe Name: Your order is running a bit behind. ETA updated to X min." |

---

## Australian Cafe Tech Ecosystem (2026)

Beyond ordering, Australian cafes rely on a standard stack of connected systems. Square is the hub — most of these integrate directly with it.

```
┌──────────────────────────────────────────────────────────────┐
│                    Square (central hub)                       │
│                                                              │
│  POS │ Payments │ Online Ordering │ KDS │ Loyalty │ CRM       │
└──────┬──────────────────────┬──────────────────────┬─────────┘
       │                      │                      │
       ▼                      ▼                      ▼
┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Xero        │   │  MarketMan       │   │  Fresh KDS       │
│  (accounting)│   │  (inventory)     │   │  (KDS alternative)│
│              │   │                  │   │                  │
│  Native      │   │  SSO + unified   │   │  iOS/Android     │
│  Square sync │   │  billing (Apr26) │   │  Square pref'd   │
│  Daily sales │   │  AI ingredient   │   │  partner          │
│  GST, BAS    │   │  POs + waste     │   │  10K+ restaurants │
│  Bank rec    │   │  Cost-of-goods   │   │                  │
│  Award payroll│  │  Multi-location  │   │                  │
└──────────────┘   └──────────────────┘   └──────────────────┘
```

### Accounting: Xero

The default for Australian hospitality. ~60% market share. Native Square integration — daily sales summaries, payment type breakdowns, refunds, and GST flow automatically. ATO-compliant (BAS lodgement, STP Phase 2, Payday Super ready).

- **Cost:** $35-70 AUD/mo
- **Square integration:** Native, free, reliable

### Inventory: MarketMan (Square Restaurant Inventory)

Launched April 2026 as "Square Restaurant Inventory by MarketMan." AI-driven ingredient and recipe management. SSO with Square credentials. Unified Square billing. Available in Australia.

- Auto-syncs sales data from Square for accurate inventory deduction
- The website ordering flow (Phase 4+) decrements inventory in Square via Orders API automatically

### Kitchen Display System: Square KDS ($25/mo) or Fresh KDS

- **Square KDS:** $25/mo per device. Android only (iOS retired January 2026). Orders from all sources appear on one screen.
- **Fresh KDS:** Square's preferred partner. Works on iOS and Android. 10,000+ restaurants.

### The Complete AU Cafe Stack

```
┌────────────────────────────────────────────────────────────┐
│                  Cafe Website (this platform)               │
│  Next.js 16 · Tailwind v4 · shadcn/ui · Vercel             │
└────────────────────────┬───────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│                    Square (central hub)                     │
├──────────┬──────────┬──────────┬──────────┬────────────────┤
│  POS     │ Payments │ Online   │ KDS      │ Loyalty + CRM  │
│  (in-    │  (1.6%   │ Ordering │ ($25/mo) │ ($45/mo)       │
│   cafe)  │   in-person)        │          │                │
└──────────┴──────────┴──────────┴──────────┴────────────────┘
     │                             │              │
     ▼                             ▼              ▼
┌──────────┐              ┌──────────────┐ ┌──────────────┐
│  Xero    │              │  MarketMan   │ │  Square      │
│ ($35/mo) │              │  (inventory) │ │  Marketing   │
└──────────┘              └──────────────┘ └──────────────┘
```

**Key insight:** Square is the hub. Most systems integrate with Square natively — the platform doesn't need to integrate with each one individually. It just needs to submit orders to Square correctly, and Square propagates the data to Xero, MarketMan, KDS, and Loyalty.

---

## Content Management

### CMS: Outstatic

For content pages (hero text, about page, specials, blog posts). No database required.

- Markdown/MDX in GitHub repo via built-in admin dashboard at `/outstatic`
- Cafe owner edits content, Outstatic commits to GitHub, site rebuilds
- Free, well-maintained (3.1K stars, May 2026)
- Alternative: Velite (dev tool, no admin UI — for developer-managed content only)

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Database** | Square (no PostgreSQL, no Redis) | All data lives in Square POS. No sync, no export, no maintenance. |
| **Cart state** | Zustand + localStorage | No server needed. Cart survives page refresh. Sub-1KB. |
| **Menu rendering** | ISR (revalidate: 300) | Menu rarely changes. Server-rendered for SEO. Zero client JS. |
| **Payment UX** | Web Payments SDK (embedded) | Branded experience. Apple Pay + Google Pay included. PCI-compliant. |
| **Payment fallback** | Square hosted profile | If Web Payments fails, fall back to Square-hosted checkout. |
| **Customer accounts** | None (guest checkout) | Name + phone collected for pickup/delivery. No login wall. |
| **SMS provider** | Twilio | AU phone numbers. Simple REST API. $0.0079/SMS AUD. |
| **Delivery fulfillment** | Uber Direct + DoorDash Drive | Per-drop fee (~$8-12 AUD). No marketplace commission. |
| **Delivery fallback** | Cross-provider | If Uber Direct fails, try DoorDash Drive, and vice versa. |
| **Order status page** | Order ID in URL | No auth. Customer bookmarks or receives link via SMS. |
| **Deployment** | Vercel | Next.js-native. Edge caching for menu pages. ISR. |
| **Square SDK** | Official `square` npm package | Mature, actively maintained, type-safe. |

---

## FAQ

**Q: What if Square goes down?**  
A: Orders can't be processed (same as any POS system). Menu page still serves from ISR cache. Square's uptime SLA is 99.95%.

**Q: Can I run this without Square?**  
A: No — Square is the database. The platform is for businesses already on Square POS.

**Q: What about EFTPOS minimums?**  
A: Square AU pricing: 1.6% in-person, 2.2% online. No monthly fee. Supports Least Cost Routing.

**Q: How do 86'd items work?**  
A: Staff taps "Out of Stock" on Square POS → Square Inventory API updates → next Catalog fetch excludes it. With webhooks, this propagates in near-real-time.

**Q: Is it Australian-ready?**  
A: Yes. Square AU pricing, AU phone numbers (Twilio), AUD default, Afterpay via Square's "Afterpay + Clearpay" integration.

**Q: What about Menulog?**  
A: Menulog exited Australia in November 2025. Only Uber Eats and DoorDash remain as marketplace players in the AU market.

**Q: Does this platform integrate with Xero?**  
A: Not directly — and it doesn't need to. Square has a native Xero integration that syncs daily sales summaries, payment breakdowns, refunds, and GST automatically.

**Q: Square KDS requires Android — can I still use iPads?**  
A: Square retired KDS on iOS in January 2026. If your cafe has iPads, Fresh KDS is Square's preferred partner and works on iOS. Orders from this platform appear in Fresh KDS the same way they appear in Square KDS.

---

## Open Source License

MIT — free for personal and commercial use. Contributions welcome.

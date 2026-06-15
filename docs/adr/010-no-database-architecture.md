# ADR-010: Stateless Architecture — No Database

**Date:** 2026-06-15  
**Status:** Accepted

## Context

The original project constraint was "zero databases — launch in hours". Phase 4 adds a full custom checkout flow with order creation, payment processing, and order tracking. These features typically require a database to persist orders, customers, and sessions.

## Decision

Maintain the zero-database constraint. All state is managed by external services:

| Data | Storage |
|---|---|
| Menu items, categories, images | Square Catalog API |
| Orders, fulfillment state | Square Orders API |
| Payments, transactions | Square Payments API |
| Cart (ephemeral) | Zustand + localStorage (client only) |
| Content pages (About, etc.) | Outstatic CMS (GitHub-backed Markdown) |
| Session (dashboard auth) | Next.js cookies (encrypted) |
| SMS notifications | Twilio (stateless — trigger and forget) |

### How This Works in Practice

**Order creation flow (no database):**
1. Cart assembled client-side → sent to `POST /api/square/order`
2. Order created in Square → Square returns `orderId`
3. Payment processed against that order via `POST /api/square/payment`
4. Customer redirected to `/checkout/confirmation?orderId=xxx`
5. Order tracked via `GET /api/square/order/[orderId]` polling
6. Square webhooks push state updates → Twilio SMS sent

**No server-side session or order cache needed** — every request reads from Square directly.

## Consequences

- **Pros:** Zero infrastructure, no migrations, no backup strategy, no connection pooling
- **Cons:** Square API rate limits apply (~25 QPS for Orders API); polling for order status costs API calls
- **Mitigation for rate limits:** ISR caching for catalog reads; client-side polling slowed to 10s intervals
- **Vendor lock-in:** Orders and payments data cannot outlive the Square account — no export is generated automatically
- **Offline resilience:** If Square API is down, new orders cannot be placed (but existing order status can be shown from cached page)

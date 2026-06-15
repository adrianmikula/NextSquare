# ADR-007: Square SDK for Orders/Payments, REST API for Catalog

**Date:** 2026-06-15  
**Status:** Accepted

## Context

Square offers two client interfaces:
1. The `square/legacy` SDK (npm package) — typed, handles auth, request signing, retries
2. The Square REST API — raw HTTP requests to `connect.squareup.com`

Different Square APIs have different requirements for server-side rendering, caching, and request complexity.

## Decision

Use **both** — the Square SDK for Orders and Payments APIs, and raw `fetch` for the Catalog API.

### Catalog → REST API (`lib/square/catalog.ts`)

- Uses `squareFetch()` — a thin wrapper around `fetch` with Square auth headers
- Enables Next.js ISR via `next: { revalidate: 300 }` on fetch options
- Catalog data is read-only and cacheable — no need for SDK retry/error logic
- REST API lets us control caching at the HTTP level

### Orders & Payments → Square SDK (`lib/square/{orders,payments}.ts`)

- `createOrder` requires complex nested objects (line items, fulfillments, modifiers) — SDK provides typed builders
- `processPayment` needs idempotency keys and verification tokens — SDK handles these correctly
- Orders and payments are write-heavy and not cacheable — SDK's built-in retry is valuable
- SDK auto-sets the `Square-Version` header

## Consequences

- Two different import patterns: `import { Client } from "square/legacy"` vs raw fetch
- SDK client is instantiated at module level — requires `vi.mock("square/legacy")` with manual mock in `__mocks__/` for tests
- Catalog API calls go through Next.js data cache (ISR); SDK calls do not
- `server-only` guard on both modules prevents accidental client-side imports

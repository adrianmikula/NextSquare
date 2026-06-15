# ADR-002: ISR for Menu Rendering + Square Dashboard for Menu Editing

**Date:** 2026-04-15  
**Status:** Accepted (extended in Phase 3 with admin dashboard)

## Context

The cafe menu is managed in Square POS (prices, items, modifiers, availability). The site needs to display this menu to customers and keep it in sync with Square.

Two concerns: how to render the menu (server-side vs client-side) and how to edit it (Square Dashboard vs custom admin).

## Decision

### Menu Rendering — ISR with `revalidate: 300`

Fetch catalog data from Square via REST API with Next.js ISR:

```
GET /v2/catalog/list?types=ITEM,IMAGE&cursor=
```

```typescript
const response = await fetch(url, {
  headers: {
    "Square-Version": "2025-01-23",
    Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
  },
  next: { revalidate: 300 },  // ISR: revalidate every 5 minutes
})
```

### Menu Editing — Square Dashboard

Cafe owners edit menu items, prices, and availability directly in Square's existing Dashboard (no custom admin UI needed in Phase 2).

## Rationale

- **ISR over SSR/CSR:** Menu data changes infrequently (daily/weekly). ISR serves a static page on first request, revalidates in the background every 300s. Faster TTFB than SSR, no client JS needed.
- **ISR over SSG:** SSG would require a webhook-triggered rebuild on every Square change. ISR auto-revalidates on a timer, which is simpler and sufficient for a cafe menu.
- **Square Dashboard over custom admin:** Free, built-in, already familiar to cafe owners. No development cost.

## Consequences

- Menu changes take up to 5 minutes to appear on the site (ISR window)
- The REST API approach (`squareFetch` wrapper) is incompatible with the Square SDK's client — Phase 4 maintains both
- `Square-Version` header is pinned to `2025-01-23` for API stability
- Phase 3 adds a custom admin dashboard (`/dashboard`) for in-site menu editing using the Square SDK's `UpsertCatalogObject` with the retrieve-modify-upsert pattern

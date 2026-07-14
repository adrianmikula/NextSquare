# Phase 3: Custom Admin Dashboard

## Goal

Build a branded admin dashboard within the Next.js site that lets the cafe owner edit menu items, prices, and availability via Square's Catalog API — without leaving the website.

---

## The Critical Gotcha: Full Override, Not Patch

Square's `UpsertCatalogObject` is a **full object replacement**. If you omit a field, it's silently deleted.

```typescript
// ❌ THIS DELETES ALL VARIATIONS, MODIFIERS, IMAGES
{
  id: "ITEM_ID", type: "ITEM",
  item_data: { name: "New Name" }
}
// Result: item renamed but all variations removed → broken in Square POS
```

**The correct pattern is always: Retrieve → Modify → Upsert**

```typescript
// 1. GET current state (always before editing)
// Square increments version on every write. Stale version → VERSION_MISMATCH.
const retrieveResponse = await catalogApi.retrieveCatalogObject(id, true);
const catalogObject = retrieveResponse.result.catalogObject;

// 2. Modify fields in-place
catalogObject.itemData.name = "New Name";
// DO NOT restructure or omit nested fields (variations, modifiers, etc.)

// 3. Upsert the entire modified object
// Version is embedded in catalogObject — Square rejects stale versions
await catalogApi.upsertCatalogObject({
  idempotencyKey: crypto.randomUUID(),
  object: catalogObject,
});
```

---

## API Route Design

### GET /api/admin/catalog

Fetch catalog items for the dashboard UI.

```typescript
// app/api/admin/catalog/route.ts
import { Client } from 'square';

const { catalogApi } = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT as 'sandbox' | 'production',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    // Retrieve single item with full details
    const { result } = await catalogApi.retrieveCatalogObject(id, true);
    return Response.json(result.catalogObject);
  }

  // List all items
  const { result } = await catalogApi.searchCatalogItems({
    productTypes: ['REGULAR'],
    sortOrder: 'ASC',
  });

  return Response.json({
    items: result.items,
    count: result.items?.length ?? 0,
  });
}
```

### PATCH /api/admin/catalog

Update a catalog object (item or variation).

```typescript
// app/api/admin/catalog/[id]/route.ts
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const updates = await request.json();
  // updates = { name?, priceMoney?, description?, availableOnline? }

  // Step 1: Retrieve current full state + version
  const { result: current } = await catalogApi.retrieveCatalogObject(
    params.id, true
  );
  const catalogObject = current.catalogObject;

  // Step 2: Apply changes on top of existing data
  if (catalogObject.type === 'ITEM' && catalogObject.itemData) {
    if (updates.name) catalogObject.itemData.name = updates.name;
    if (updates.description)
      catalogObject.itemData.description = updates.description;
    // Do NOT touch catalogObject.itemData.variations —
    // variations are nested and must be preserved as-is
  }

  if (catalogObject.type === 'ITEM_VARIATION'
      && catalogObject.itemVariationData) {
    if (updates.priceMoney) {
      catalogObject.itemVariationData.pricingType = 'FIXED_PRICING';
      catalogObject.itemVariationData.priceMoney = {
        amount: BigInt(Math.round(updates.priceMoney * 100)),
        currency: 'AUD',
      };
    }
    if (updates.availableOnline !== undefined) {
      catalogObject.itemVariationData.availableForOnline
        = updates.availableOnline;
    }
  }

  // Step 3: Upsert the complete modified object
  const { result } = await catalogApi.upsertCatalogObject({
    idempotencyKey: crypto.randomUUID(),
    object: catalogObject,
  });

  return Response.json(result.catalogObject);
}
```

---

## Dashboard Component Tree

```
app/
├── dashboard/
│   ├── page.tsx                    # Dashboard home (recent orders, revenue summary)
│   ├── menu/
│   │   ├── page.tsx                # Menu grid with search + category filter
│   │   ├── [id]/page.tsx           # Edit item: name, price, description, availability
│   │   └── new/page.tsx            # Create new item (advanced)
│   ├── orders/
│   │   └── page.tsx                # Recent orders from Square SearchOrders API
│   └── settings/
│       └── page.tsx                # Dashboard settings, Square connection status
├── login/
│   └── page.tsx                    # Dashboard login

components/
├── dashboard/
│   ├── DashboardLayout.tsx         # Sidebar + header + main content area
│   ├── MenuItemEditor.tsx          # Inline form for name, description, price
│   ├── PriceInput.tsx              # AUD price input (dollars → cents conversion)
│   ├── AvailabilityToggle.tsx      # Toggle for available_online
│   ├── CategoryFilter.tsx          # Filter items by category
│   ├── OrderTable.tsx              # Recent orders table
│   └── StatCard.tsx                # Revenue, order count, popular items
```

---

## Key Rules

| Rule | Why |
|---|---|
| **Always Retrieve before Upsert** | You need the full object state AND current version. Omitting fields = silent data loss. |
| **Edit ITEM_VARIATION directly, not nested in ITEM** | Prevents accidentally deleting sibling variations in the parent ITEM. |
| **Version locking** | Square rejects stale versions (409 VERSION_MISMATCH). Rare for single-cafe — only if Square Dashboard is edited concurrently. |
| **Only one update at a time** | Square processes one upsert per seller account concurrently. Others get 429. Never an issue for single-cafe. |
| **Re-retrieve after failure** | Square confirmed (Apr 2026) that failed upserts can partially update the parent ITEM version. Always re-fetch after errors. |

---

## Authorization

**For development / single-cafe owner:**
Square Personal Access Token from Square Developer Dashboard (simplest).

**For production / multi-user:**
Square OAuth flow with `ITEMS_WRITE` permission scope.

```typescript
// lib/square/auth.ts
// For single-cafe: use access token from env var
// For OAuth: implement Square OAuth PKCE flow
```

---

## Recommended Scope for This Phase

| Feature | Approach | Complexity |
|---|---|---|
| **Price editing** | Update ITEM_VARIATION directly (name + price_money) | Low |
| **Availability toggle** | Update ITEM_VARIATION `available_for_online` boolean | Low |
| **Description editing** | Update ITEM directly (keep variations nested as-is) | Low |
| **Name editing** | Update ITEM or ITEM_VARIATION name field | Low |
| **New item creation** | Create new ITEM + ITEM_VARIATION objects | Moderate |
| **Image management** | Square `CreateCatalogImage` + link to item | Moderate |
| **Category management** | Create/assign CatalogCategory objects | Moderate |
| **Modifier management** | Create/assign CatalogModifierList objects | Complex |

---

## Environment Variables (Additional to Phase 2)

```env
# Dashboard auth
DASHBOARD_PASSWORD=          # Simple password-based auth for single-cafe
# OR Square OAuth
SQUARE_OAUTH_CLIENT_ID=
SQUARE_OAUTH_CLIENT_SECRET=
```

---

## Deliverable

A branded admin dashboard at `/dashboard` where the cafe owner can:
- View and search all menu items
- Edit item names, descriptions, and prices
- Toggle item availability online
- View recent orders
- All changes persist to Square via the Catalog API

No external database. No separate admin server. Runs in the same Next.js app.

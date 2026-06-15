# ADR-005: Retrieve → Modify → Upsert Pattern for Square Catalog API

**Date:** 2026-05-15  
**Status:** Accepted

## Context

Phase 3's admin dashboard allows the cafe owner to edit menu items (name, description, price, availability) via Square's Catalog API. Square's `UpsertCatalogObject` API has a critical constraint: it performs a **full object replacement**, not a patch.

## The Problem

```typescript
// ❌ THIS DELETES ALL VARIATIONS, MODIFIERS, IMAGES
await catalogApi.upsertCatalogObject({
  object: {
    id: "ITEM_ID",
    type: "ITEM",
    itemData: { name: "New Name" }
    // variations, modifiers, images, version — ALL DELETED
  }
})
```

If a field or nested object is omitted from the upsert payload, Square silently removes it from the catalog object. This can break menu items in Square POS by deleting their variations, pricing, or images.

## Decision

Always use the **Retrieve → Modify → Upsert** pattern:

```
Step 1: Retrieve the full catalog object (with all nested fields)
  catalogApi.retrieveCatalogObject(id, true)
  // Returns the complete object including version, variations, modifiers, images

Step 2: Modify only the target fields in-place
  catalogObject.itemData.name = "New Name"
  // Do NOT restructure or recreate nested objects (variations, itemData, etc.)
  // Do NOT touch catalogObject.version — Square uses it for optimistic concurrency

Step 3: Upsert the entire modified object
  catalogApi.upsertCatalogObject({
    idempotencyKey: crypto.randomUUID(),
    object: catalogObject,  // Same object returned from retrieve, with fields modified
  })
```

### Additional Rules

| Rule | Why |
|---|---|
| **Edit ITEM_VARIATION directly** | Editing a variation nested inside an ITEM object risks deleting sibling variations |
| **Never omit `version`** | Square rejects stale versions (409 VERSION_MISMATCH) |
| **Re-retrieve on failure** | Failed upserts can partially update the parent ITEM version |
| **One update at a time** | Square processes one upsert per seller account concurrently; others get 429 |

## Rationale

- Square's Catalog API uses full object semantics (like PUT, not PATCH) despite the name "upsert"
- The version field provides optimistic concurrency — critical for data integrity when Square Dashboard and the admin dashboard are used concurrently
- Retrieving the full object adds one API call per edit, but catalog object size is small (KB-scale) so latency is negligible (~100ms)
- The `idempotencyKey` prevents duplicate writes if the request is retried

## Consequences

- Every edit costs 2 Square API calls (retrieve + upsert) instead of 1
- The retrieve response must be stored in memory and modified, never serialized/deserialized (loses type information)
- Square's `retrieveCatalogObject` with `includeRelatedObjects: true` returns all nested data in one call
- Concurrent edits from Square Dashboard and the admin dashboard can cause 409 conflicts — the UI should handle this by showing a "please refresh and retry" message

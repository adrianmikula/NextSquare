# ADR-006: Zustand for Client-Side Cart State

**Date:** 2026-06-15  
**Status:** Accepted

## Context

The Phase 4 custom checkout flow needs a client-side shopping cart that persists across page navigations and browser sessions. Requirements:

- Add/remove/update items with Square modifier selections
- Merge duplicate items (same catalog item + same modifiers)
- Toggle between pickup and delivery fulfillment
- Persist across page navigation and browser refresh
- Expose item count and subtotal for UI badges
- Support slide-out drawer overlay on any page

## Decision

Use **Zustand** with the `persist` middleware (localStorage) for cart state management.

## Rationale

- **Zustand vs React Context:** Context re-renders all consumers on any change. Zustand's selector-based subscriptions (`useCartStore(s => s.items)`) prevent unnecessary re-renders — only components using changed slices update.
- **Zustand vs Redux:** Redux adds boilerplate (actions, reducers, dispatch) unnecessary for a single-purpose cart store. Zustand provides the same atomic updates with ~1/10 the code.
- **Persistence:** Zustand's `persist` middleware automatically serializes to localStorage, surviving page refreshes without manual `useEffect` + `JSON.parse` wiring.
- **No dependency on React:** The store can be read outside components (`useCartStore.getState()`) — critical for tests.
- **Devtools support:** Zustand's `devtools` middleware integrates with Redux DevTools for debugging.

## Consequences

- Cart state is client-only — server components use `<CartProvider>` boundary
- localStorage persistence means the cart survives refresh but is per-browser (not cross-device)
- Zustand stores are singletons — the `persist` middleware handles hydration on first access

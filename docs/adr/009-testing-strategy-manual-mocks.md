# ADR-009: Testing Strategy — Vitest Manual Mocks for Square SDK

**Date:** 2026-06-15  
**Status:** Accepted

## Context

The Square SDK (`square/legacy`) is a complex npm package with a class-based `Client` constructor. The orders and payments modules instantiate `new Client({...})` at module scope. Vitest's `vi.mock()` hoists mock factories above all code, creating a problem: variables defined with `const` below the `vi.mock()` call are in the temporal dead zone when the factory executes.

### The Problem

```typescript
// ❌ This fails in vitest 4 — mockOrdersApi is in TDZ when factory runs
const mockOrdersApi = { createOrder: vi.fn() }
vi.mock("square/legacy", () => ({
  Client: vi.fn(() => ({ ordersApi: mockOrdersApi })),
}))
```

`vi.hoisted()` did not resolve the issue in vitest 4.1.8 with the `square/legacy` module.

## Decision

Use **manual mock files** in `__mocks__/` directory. When `vi.mock("square/legacy")` is called without a factory, vitest automatically resolves `__mocks__/square/legacy.ts`.

### Mock File: `__mocks__/square/legacy.ts`

```typescript
export const mockOrdersApi = { createOrder: vi.fn(), ... }
export const mockPaymentsApi = { createPayment: vi.fn(), ... }

export const Client = vi.fn(function () {
  return { ordersApi: mockOrdersApi, paymentsApi: mockPaymentsApi }
})

export const Environment = { Production: "production", Sandbox: "sandbox" }
```

Tests import the mock API objects via relative path and `vi.mock("square/legacy")`:

```typescript
import { mockOrdersApi } from "../../../__mocks__/square/legacy"
vi.mock("square/legacy")
```

## Consequences

- Square SDK is always mocked project-wide in tests (cannot selectively unmock)
- Mock objects (`mockOrdersApi`, `mockPaymentsApi`) are shared module singletons — use `beforeEach` to reset call counts
- Both `orders.test.ts` and `payments.test.ts` share the same mock file — the `Client` constructor returns both APIs
- The test pattern for module-level side effects requires dynamic `import()` after `vi.mock()` and env stubs

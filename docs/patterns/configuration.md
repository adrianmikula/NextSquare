# Configuration & Environment Variables

## Principle

**No fallback logic for configuration.**

Every environment variable the application depends on must be either:
- **Required** — missing/empty values throw a clear, actionable error at build or request time.
- **Genuinely optional** — only for opt-in features (e.g. demo mode flags).

There is no middle ground. Silent fallbacks (e.g. `?? defaultValue`) mask misconfiguration and produce cryptic runtime failures.

## How to Use

### Required variables — use `requireEnv`

```ts
import { requireEnv } from "@/lib/env"

const apiKey = requireEnv("SQUARE_ACCESS_TOKEN")
// throws: Missing required environment variable: SQUARE_ACCESS_TOKEN
//         Add it to your .env.local file. See .env.local.example for reference.
```

This throws eagerly at module evaluation time, so the developer sees the error during build or on first request — not deep in some business logic.

### Optional feature flags — check explicitly

```ts
// This is the ONLY acceptable use of optional env var logic:
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true"
}
```

Do not use `requireEnv` for demo flags — they are opt-in by nature. Do not add fallback URLs, default tokens, or any other "works without config" behavior.

## What NOT to do

```ts
// ❌ Silent fallback — masks misconfiguration
const url = process.env.SITE_URL ?? "http://localhost:3000"

// ❌ Same problem, different syntax
const token = process.env.API_TOKEN || ""

// ❌ Using requireEnv for something that is truly optional
const profile = requireEnv("NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL") // this button is optional
```

## Rationale

A missing env var is a deployment error. Falling back to a default URL, empty string, or sandbox environment means:
1. The developer gets no signal during build/deploy.
2. The first sign of trouble is a cryptic `ERR_INVALID_URL` or `401 Unauthorized` at runtime.
3. Debugging requires tracing through the code to find which env var was missed.

Fail fast with a clear message. It saves time for everyone.

## Demo Mode

When `DEMO_MODE=true` (or `NEXT_PUBLIC_DEMO_MODE=true`), the application disables restrictive Content-Security-Policy headers to avoid blocking inline styles and client-side hydration during development and stakeholder demos. See `docs/patterns/csp-demo-mode.md`.

## Remote Image Patterns

When a tenant uses external image hosts (e.g. RestaurantGuru, Unsplash, TripAdvisor), add each hostname to `next.config.ts` under `images.remotePatterns`. Without this, `<img>` tags and `next/image` will silently fail to load remote assets:

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "img3.restaurantguru.com" },
    { protocol: "https", hostname: "img02.restaurantguru.com" },
  ],
}
```

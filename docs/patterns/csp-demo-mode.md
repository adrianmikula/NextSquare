# CSP, Demo Mode & Security Headers

## Principle

**Security headers must not block development or demo mode.**

In production, strict CSP is appropriate. During local development, content generation, and stakeholder demos, overly restrictive headers cause blank pages, missing styles, and failed API calls.

## The Nonce Problem

When `style-src` contains both a `nonce-xxx` and `'unsafe-inline'`, the CSP specification says the nonce takes precedence and `'unsafe-inline'` is **ignored**.

This means:

```http
Content-Security-Policy: style-src 'nonce-abc123' 'unsafe-inline' 'self' https:;
```

blocks **all** inline styles, including those React 18 generates during hydration (e.g. for CSS custom properties, animation containment). The result is a page that loads but is unstyled or blank, with no console error.

## Demo Mode Flag

Use `DEMO_MODE=true` (or `NEXT_PUBLIC_DEMO_MODE=true`) to skip restrictive security headers during development and demos.

```ts
// lib/env.ts
export function isDemoMode(): boolean {
  return (
    process.env.DEMO_MODE === "true" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  )
}
```

In `proxy.ts`, apply minimal headers in demo mode:

```ts
function getDemoModeHeaders(): Record<string, string> {
  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
  }
}

export default async function proxy(req: NextRequest) {
  // ... auth logic ...

  const nonce = generateNonce()
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-nonce", nonce)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  const headers = isDemoMode() ? getDemoModeHeaders() : getSecurityHeaders(nonce)
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value)
  }

  return response
}
```

In production (`DEMO_MODE=false`), restore full headers including CSP with a nonce. Do not include `'unsafe-inline'` in `style-src` — migrate any necessary inline styles to `<link rel="stylesheet">` or CSS custom properties set via JavaScript on `documentElement` (which does not require inline styles in the CSP sense).

## What NOT to do

```ts
// ❌ Including 'unsafe-inline' in style-src with a nonce does nothing per spec
"style-src 'nonce-xxx' 'unsafe-inline' 'self';"

// ❌ Removing the nonce entirely to make inline styles work
"style-src 'self' 'unsafe-inline';"
```

Both either silently fail to protect inline styles (first case) or are effectively a nonce-free policy (second case).

## Rationale

CSP is a critical production defence. But a broken development loop is worse: it prevents content generation, blocks stakeholder reviews, and wastes engineering time on CSS problems instead of business value. The demo mode flag gives an explicit, documented escape hatch that must be flipped before production deployment.

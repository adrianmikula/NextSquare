# ADR-004: JWT Session Auth with Single Password

**Date:** 2026-05-15  
**Status:** Accepted

## Context

Phase 3 adds an admin dashboard (`/dashboard`) for the cafe owner to edit menu items, prices, and availability. This requires authentication. The project has no database, no user store, and no existing auth infrastructure.

Options considered: Square OAuth, a simple password check, a third-party auth provider (Auth0, Clerk), or JWT-based session cookies.

## Decision

Use **JWT-based sessions** with a single password from an environment variable (`DASHBOARD_PASSWORD`).

### Auth Flow

```
Login form → POST /api/auth/login
  → compare password against DASHBOARD_PASSWORD env var
  → create JWT (jose) with payload { userId: "admin" }
  → set HTTP-only cookie, 7-day expiry

Proxy layer (proxy.ts) on every request:
  → decrypt JWT from cookie
  → if missing/invalid on /dashboard/* → redirect to /login
  → if valid on /login → redirect to /dashboard

Logout → POST /api/auth/logout
  → clear cookie → redirect to /login
```

### Key Implementation Details

```typescript
// Session cookie config
httpOnly: true,
secure: process.env.NODE_ENV === "production",
sameSite: "lax",
path: "/",
maxAge: 60 * 60 * 24 * 7  // 7 days
```

- JWT signing key = `DASHBOARD_PASSWORD` encoded to `Uint8Array`
- Algorithm: HS256
- Auth guard at two layers: `proxy.ts` (routing) + API route check (defense-in-depth)
- No user database, no roles, no permissions model

## Rationale

- **No database** — password stored in env var, no user table needed
- **No OAuth complexity** — Square OAuth requires client ID, redirect URI, token exchange; unnecessary for a single-cafe admin
- **No third-party dependency** — Auth0/Clerk add cost and latency for a single user
- **JWT over plain session** — stateless verification (no session store), 7-day expiry avoids frequent re-login
- **proxy.ts over middleware.ts** — the project uses `proxy.ts` at the root with Next.js `matcher` config for route filtering

## Consequences

- Only one admin user (the person who knows `DASHBOARD_PASSWORD`)
- No password reset flow — if forgotten, check Vercel env vars
- JWT is signed but not encrypted — session payload is minimal (`{ userId: "admin" }`), no sensitive data
- 7-day session means the dashboard stays logged in across visits (acceptable for a single-cafe owner)
- Adding multi-user support would require a database and migration to OAuth

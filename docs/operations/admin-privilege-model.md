# Admin Privilege Model & RBAC

_Status: Single shared admin credential; no RBAC; no least-privilege separation. Phase 7 implements four-role RBAC backed by Square Team API and environment isolation._

---

## Current State

The dashboard authentication model uses a single `DASHBOARD_PASSWORD` shared credential:

- All authenticated users receive the same `admin` role in the JWT payload
- No separation between operators who view orders and those who edit the catalog
- No multi-factor authentication (MFA) until Phase 7 SMS MFA
- No session access logging or periodic access review

### JWT Payload

```ts
export interface SessionPayload extends JWTPayload {
  userId: string
  roles: string[]  // Phase 7 addition
}
```

---

## Consistent Three-Layer RBAC Model (Phase 7)

Square's Team API exposes only one binary authority flag (`isOwner`). To cover all four roles consistently, the model layers **Square team membership** + **Square environment** + **email allowlist**:

| Layer | owner | staff | visitor | developer |
|-------|-------|-------|---------|-----------|
| Square `isOwner` | `true` | `false` | not in team | bypassed |
| Square environment | Production | Production | Production | **Sandbox only** |
| Identifier | Team email | Team email | any auth | `DASHBOARD_DEVELOPER_EMAILS` |
| Catalog mutations | Full | Stock only | None | None |
| Square data risk | Production | Production | None | **Sandbox only** |

The `developer` role is environment-gated: regardless of `SQUARE_ENVIRONMENT`, a developer session always targets the Square sandbox API (`connect.squareupsandbox.com`) and uses `SQUARE_SANDBOX_ACCESS_TOKEN` if configured. Developers can test against mock/sandbox Square data without any risk to production.

### Route Authorization Matrix

| Route | Method | Required Role | Square environment |
|-------|--------|---------------|-------------------|
| `/api/admin/catalog` | GET | All authenticated roles | Per-role (dev=sandbox) |
| `/api/admin/catalog/[id]` | PATCH | `owner` (full) or `staff` (stock-only) | Per-role (dev=sandbox) |
| `/api/square/webhook` | POST | `owner`, `developer` | Per-role (dev=sandbox) |
| `/api/twilio/sms` | POST | `owner`, `developer` | N/A |
| `/api/auth/*` | POST | Any authenticated role | N/A |
| `/dashboard` | GET | Any authenticated role | N/A |

---

## Role Resolution Flow

```
Password correct?
  │
  ▼
Is email in DASHBOARD_DEVELOPER_EMAILS?
  │ YES → role = developer (Square sandbox environment)
  │ NO  ▼
  Is DASHBOARD_ADMIN_EMAIL set?
  │ NO  → role = owner (backward compat, production environment)
  │ YES ▼
  Call teamApi.searchTeamMembers()
  │
  ├─ Success → isOwner? → owner (production) : staff (production)
  │            not found → visitor (production, read-only)
  └─ Failure → 503 (fail-closed)
```

Square environment per role:
- `owner`, `staff`, `visitor` → `SQUARE_ENVIRONMENT` (production or sandbox)
- `developer` → **always sandbox**, using `SQUARE_SANDBOX_ACCESS_TOKEN` if set

---

## Fail-Closed Behavior

When `DASHBOARD_ADMIN_EMAIL` is configured and Square is unreachable, authentication returns `503 Authentication service temporarily unavailable`. There is no fallback role — this prevents silent privilege escalation.

When `DASHBOARD_ADMIN_EMAIL` is **not** configured: defaults to `owner` with no Square API call. This preserves backward compatibility for deployments not using Square RBAC.

---

## Implementation Path

1. `SessionPayload` includes `roles: string[]`
2. `lib/auth/rbac.ts` — permission helpers (`canEditCatalog`, `canEditStock`, `canManageSettings`)
3. Role resolution in `POST /api/auth/challenge` and `POST /api/auth/login`
4. OTP store (`lib/auth/mfa.ts`) carries `role` + `squareRequired` flag through challenge → verify
5. Route enforcement: `PATCH /api/admin/catalog/[id]` blocks `staff` from name/description/price edits

---

## Phase 7: SMS MFA

- Two-step challenge/verify flow
- 6-digit OTP with configurable TTL (default 5 min)
- In-memory OTP store with IP binding
- Rate-limited (5 challenges / 15 min, 10 verifications / 15 min)

See `app/api/auth/challenge/route.ts` and `app/api/auth/verify/route.ts`.

---

## Phase 8: TOTP/WebAuthn Upgrade

- Add TOTP authenticator app support as alternative to SMS
- Evaluate WebAuthn (passkeys) for compatible devices
- Challenge/verify route pattern unchanged; only delivery channel changes

---

## Threat Model

| Threat | Current Mitigation | Gap |
|--------|-------------------|-----|
| Password sharing | None | Shared credential; no attribution |
| Session hijacking | httpOnly + secure cookie | No IP binding or device fingerprinting |
| Privilege escalation | Four-role RBAC enforced server-side | Developer/visitor blocked from catalog mutations |
| Insider threat | Role separation (owner/staff/visitor/developer) | Single credential still shared (address in future) |
| Brute force | Rate limiting on all auth routes | No account lockout (rate limit is the control) |
| Staff overreach | Stock-only PATCH boundary | Staff cannot edit name/description/price |
| Developer data access | `canManageSettings` only | Blocked from catalog and order mutations |
| Square outage | Fail-closed (503) | None — no silent privilege escalation |

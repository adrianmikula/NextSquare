# Admin Privilege Model & RBAC

_Status: Single shared admin credential; no RBAC; no least-privilege separation. Phase 7 implements four-role RBAC._

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

## Four-Role RBAC Model (Phase 7)

| Role | Permissions | Rationale |
|------|-------------|-----------|
| `visitor` | Read-only access to catalog, orders, loyalty data | Public-facing staff or stakeholders who need visibility but no mutation rights |
| `owner` | Full product line management: create, update, delete catalog items; manage all product details and prices | Business owner with complete catalog control |
| `staff` | Stock level management only: update inventory/availability; cannot edit product names, descriptions, or prices | Front-of-house staff who need to mark items sold out or available |
| `developer` | Developer-related settings only: environment config, webhook management, deployment settings, logs | Technical operators who should not touch catalog or order data |

### Route Authorization Matrix

| Route | Method | Required Role |
|-------|--------|---------------|
| `/api/admin/catalog` | GET | `visitor`, `owner`, `staff`, `developer` |
| `/api/admin/catalog/[id]` | PATCH | `owner` (full) or `staff` (stock/availability only) |
| `/api/square/webhook` | POST | `owner`, `developer` |
| `/api/twilio/sms` | POST | `owner`, `developer` |
| `/api/auth/*` | POST | Any authenticated role |
| `/dashboard` | GET | Any authenticated role |

---

## Implementation Path

1. Extend `SessionPayload` to include `roles: string[]`
2. Update JWT creation in `createSession()` to assign roles based on identity provider
3. Build `lib/auth/rbac.ts` with permission checks:
   ```
   hasRole(roles: string[], required: string[]): boolean
   canEditCatalog(roles): boolean
   canEditStock(roles): boolean
   canManageSettings(roles): boolean
   ```
4. Add role-check middleware or helper for admin routes
5. Migrate from single password to per-operator credentials (future: SSO/OIDC)

---

## Phase 7: SMS MFA

Implements the multi-factor requirement using Twilio SMS:

- Two-step challenge/verify flow
- 6-digit OTP with 5-minute TTL
- In-memory OTP store (no persistence)
- Rate-limited to prevent abuse

See `app/api/auth/challenge/route.ts` and `app/api/auth/verify/route.ts`.

---

## Phase 8: TOTP/WebAuthn Upgrade

After SMS MFA is deployed:

- Add TOTP authenticator app support as an alternative to SMS
- Evaluate WebAuthn (passkeys) for operators with compatible devices
- The challenge/verify route pattern remains the same; only the delivery channel changes

---

## Threat Model

| Threat | Current Mitigation | Gap |
|--------|-------------------|-----|
| Password sharing | None | Shared credential; no attribution |
| Session hijacking | httpOnly + secure cookie | No IP binding or device fingerprinting |
| Privilege escalation | None (single role) | Any authenticated user can do everything |
| Insider threat | None | No separation of duties |
| Brute force | None | No account lockout or rate limiting on login (addressed in Phase 7) |
| Staff overreach | None | No stock-only permission boundary (addressed in Phase 7 RBAC) |
| Developer data access | None | Developer can see catalog/orders (addressed in Phase 7 RBAC) |

# Phase 7: Security Hardening — Enterprise Posture

_Remaining security work from Phase 5, tracked separately for prioritization._

---

## 1. Security Headers (HTTP)

_Status: Not implemented in `next.config.ts` or `proxy.ts`_

Enforce the full header suite in all production responses:

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Embedder-Policy` | `require-corp` |
| `Content-Security-Policy` | Nonce-based; restrict script/style/image sources; no `unsafe-inline`/`unsafe-eval` |

Implement via Next.js `headers()` in `app/` or `proxy.ts`. Generate per-request nonces in middleware and pass to layout/server components.

---

## 2. MCP Hygiene & Guardrails

_Status: `mcp.json` uses `@latest`, packages unpinned, no guardrails_

- Pin all MCP packages to specific versions (no `@latest`, no `^` for MCP deps)
- Add `@next-devtools`, `@square/square-mcp-server`, `@twilio-alpha/mcp` to `overrides` in `package.json` with pinned versions
- Add `.mcp.json` and `claude_desktop_config.json` to `.gitignore`
- Audit MCP tool surfaces: reject `shell`, `exec`, `command` tool types; enforce scoped `inputSchema` with regex allowlists
- Add MCP sampling validation: host must inspect and sanitize all `sampling` request payloads before forwarding to any LLM

---

## 3. Secret Scanning in CI

_Status: No scanner integrated_

Integrate `trufflehog` or GitHub secret-scanning push protection into `.github/workflows/ci.yml`:

```yaml
secrets-scan:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@<SHA>
    - uses: trufflesecurity/trufflehog@<SHA>
      with:
        extra_args: --only-verified
```

Fail the workflow on any verified secret. Also add `.gitignore` guard for `.env.local`, `.env*.local`.

---

## 4. CSRF Token on Admin API Routes

_Status: Relies on `SameSite: lax` cookie only_

Add a per-session CSRF token mechanism for all `/api/admin/*` POST/PUT/DELETE routes. Use `crypto.randomUUID()` tied to the session cookie. Validate server-side. Double-submit cookie pattern is preferred.

---

## 5. Rate Limiting on API Routes

_Status: No rate limiting_

Apply tiered rate limits via `proxy.ts` or a lightweight in-memory store:

| Route Tier | Limit | Rationale |
|------------|-------|-----------|
| `/api/admin/*` | 10 req/min per session | Admin mutation surface |
| `/api/square/webhook` | Per-Square retry semantics | Allow Square retries; reject >100/min |
| `/api/twilio/sms` | 5 req/min per session | Cost guardrail |
| All other `/api/*` | 30 req/min per IP | General abuse |

Enforce with a `lib/rate-limit/` module using IP + session keys, returning `429` with `Retry-After`.

---

## 6. Runtime AI-Endpoint Guardrails

_Status: No runtime AI endpoints yet; no guardrail contracts_

Establish guardrail contracts before any future AI integration:

- All `/api/ai/*` routes must: sanitize input (strip `[INST]`, `[System:`, zero-width chars), enforce length limits, apply content-safety classifier wrapper, log all prompts and responses to audit sink, apply output filtering before response
- Prohibit raw client-side LLM API calls (no browser → openai.com / anthropic.com direct)
- Add an AI-era threat design review gate (ADR-style) for any new AI feature

---

## 7. XSS Hardening — DOMPurify in Source

_Status: `dompurify` is pinned as an override but not imported in any source file_

Audit all componentProps and API response rendering paths for:

- `dangerouslySetInnerHTML` usage → wrap content in `DOMPurify.sanitize()` before rendering
- Unsanitized user input rendered via `textContent` is safe (monitor for future refactors)
- Admin dashboard markdown rendering (`Outstatic`): confirm CMS output is sanitized server-side or pre-render through DOMPurify

---

## 8. Enterprise-Grade Secrets Management

_Status: Secrets in plain env vars_

Replace plain-text env var secrets (`SQUARE_ACCESS_TOKEN`, `TWILIO_AUTH_TOKEN`, `OUTSTATIC_API_KEY`, `DASHBOARD_PASSWORD`, `SQUARE_WEBHOOK_SIGNATURE_KEY`) with a secrets manager integration.

**Implementation plan:**

1. Build `lib/secrets/` provider abstraction with interface:
   ```
   getSecret(name: string): Promise<string>
   ```
2. Providers to implement (in priority order):
   - `EnvSecretsProvider` — wraps `requireEnv` for dev/demo only
    - `DopplerProvider | AwsSecretsProvider | VaultProvider` — production
3. Bootstrap at server startup: fail fast if any required secret is missing
4. Add rotation support: secrets fetched once per cold start; restart triggers refresh
5. Add audit logging: every secret fetch logged with name + timestamp (never value)
6. Document in `docs/operations/secrets-management.md`:
   - Provider selection guidance
   - IAM/policy requirements
   - Key rotation runbook
   - CI/CD secret injection (OIDC preferred over static tokens)

**Constraint:** No silent fallbacks. If the secrets provider is configured but returns an error, throw at startup with an actionable message.

---

## 9. Backup Strategy & Data Residency

_Status: No automated Square data backup documented; no recovery runbook_

Add an operational backup posture covering all data classes:

- **Square catalog and order history** — export via Square API on a defined cadence; document recovery-time objectives and export formats
- **Outstatic CMS content** — Git repo is source of truth; confirm backup strategy for the hosting GitHub repository (branch protection + mirror)
- **Environment configuration** — secrets and env vars must be recoverable; point to secrets provider rotation/restore runbook
- **Operational runbook** — create `docs/operations/backup-runbook.md` with step-by-step restore procedures, responsible parties, and testing schedule
- **Automation** — evaluate scheduled export jobs (Square API, Outstatic CLI, or GitHub Dump) for critical data classes; document any chosen tool

---

## 10. Admin Privilege Model & RBAC

_Status: Single shared admin credential; no RBAC; no least-privilege separation_

### 10.1 Current State Audit

Document that current JWT auth uses a single `DASHBOARD_PASSWORD` shared credential with no role separation. Identify all actions available under the single `admin` role.

### 10.2 Role Definitions

Implement four roles with least-privilege permissions:

| Role | Permissions | Rationale |
|------|-------------|-----------|
| `visitor` | Read-only access to catalog, orders, loyalty data | Public-facing staff or stakeholders who need visibility but no mutation rights |
| `owner` | Full product line management: create, update, delete catalog items; manage all product details and prices | Business owner with complete catalog control |
| `staff` | Stock level management only: update inventory/availability; cannot edit product names, descriptions, or prices | Front-of-house staff who need to mark items sold out or available |
| `developer` | Developer-related settings only: environment config, webhook management, deployment settings, logs | Technical operators who should not touch catalog or order data |

### 10.3 Implementation Plan

1. Extend `SessionPayload` JWT claims to include `roles: string[]`
2. Build `lib/auth/rbac.ts` with permission checks:
   ```
   hasRole(roles: string[], required: string[]): boolean
   canEditCatalog(roles): boolean
   canEditStock(roles): boolean
   canManageSettings(roles): boolean
   ```
3. Update `/api/admin/catalog` routes: require `owner` or `staff` (with stock-only checks)
4. Update `/api/square/webhook`, `/api/twilio/sms`, `/api/auth/*` routes: require appropriate role or session
5. Add role assignment mechanism: `DASHBOARD_ADMIN_ROLES` env var mapping or future per-user credential store
6. Enforce role checks server-side on every admin mutation route; never trust client-side role flags

### 10.4 Security Constraints

- All role checks happen server-side; client role display is cosmetic only
- `staff` role must be blocked from fields outside stock/availability (name, description, price)
- `developer` role must be blocked from catalog mutations and order data
- `visitor` role must be blocked from all POST/PUT/DELETE routes
- Generic error messages for authorization failures: "Insufficient permissions" — do not reveal role names or required permissions
- Log all authorization failures with role, route, timestamp, and IP for audit

### 10.5 Immediate Operational Controls

- Unique credentials per human operator (move away from single shared `DASHBOARD_PASSWORD`)
- Session access logging: record operator role, timestamp, IP
- Periodic access review cadence: quarterly review of role assignments

---

## 11. Multi-Factor Authentication via Twilio SMS

_Status: Password-only dashboard auth; Twilio client is ready (`lib/twilio/client.ts`). No OTP flow exists._

Implement a two-step login flow using the existing Twilio SMS client and JWT session infrastructure. This closes Essential Eight Strategy 7 (Multi-factor authentication) for the current deployment model.

**Implementation plan:**

1. Add route `POST /api/auth/challenge`
   - Accepts `password` in request body
   - Validates against `DASHBOARD_PASSWORD` (same logic as current login route)
   - On valid password: generates a 6-digit code via `crypto.getRandomValues()`, stores code + timestamp + IP in an in-memory map (or lightweight Redis if available), calls `sendSms()` to `DASHBOARD_ADMIN_PHONE`
   - Returns `200 { challenge: true }` — does not create session yet
   - Rate-limit: 5 challenge requests per 15 min per IP

2. Add route `POST /api/auth/verify`
   - Accepts `code` in request body
   - Looks up code in store; validates match and expiry (5-min TTL)
   - On valid code: calls `createSession()`, clears code from store
   - Rate-limit: 10 verification attempts per 15 min per IP
   - Returns JWT cookie same as current login route

3. Refactor `app/login/login-form.tsx`
   - Two-step form: password field → submit → OTP field appears
   - State machine: `step: 'password' | 'otp'`
   - On password success: prompt user to enter SMS code
   - On OTP success: redirect to dashboard
   - Show countdown timer for code expiry
   - Allow back-navigation to re-enter password

4. Add required env vars:
   ```
   DASHBOARD_ADMIN_PHONE=+1234567890   # Twilio-compatible, validated via requireEnv
   MFA_CODE_TTL=300                    # seconds, default 5 min
   ```

5. Security constraints:
   - OTP stored in memory only (not in cookies, localStorage, or JWT)
   - Code cleared immediately after successful verification or expiry
   - Generic error messages: "Invalid code" — do not enumerate whether password was correct vs code was wrong on combined steps
   - `sendSms` failure must throw at request time with a clear server error; do not silently allow bypass
   - Store keys prefixed with `mfa:` and include IP to prevent cross-user replay

**Effort estimate:** ~2–3 hours total. No new dependencies. Leverages existing Twilio client, JWT session, and React form patterns.

**Phase 8 upgrade path:** After SMS MFA is deployed, add TOTP/WebAuthn as a secondary factor or replacement for operators who prefer authenticator apps over SMS. The two-step challenge/verify route pattern remains the same; only the delivery channel changes.

---

## Execution Order

1. **Phase 7a** (High / blocking): Security headers + CSP, secret scanning CI, MCP hygiene
2. **Phase 7b** (High): CSRF tokens, rate limiting, DOMPurify usage audit, RBAC implementation, Twilio SMS MFA
3. **Phase 7c** (Medium / architectural): AI guardrail contracts, secrets management provider abstraction, backup strategy & runbook

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

### 10.1 Design Decision: Square Team API + Environment as Source of Truth

Square's Team API exposes exactly one binary authority flag (`isOwner`), so RBAC uses a hybrid model for a consistent three-layer approach:

| Role | Square source | Square environment | Dashboard permissions |
|------|--------------|-------------------|----------------------|
| `owner` | `isOwner: true` | Production (or `SQUARE_ENVIRONMENT`) | Full catalog management |
| `staff` | `isOwner: false` | Production (or `SQUARE_ENVIRONMENT`) | Stock/availability only |
| `visitor` | Not in Square team | Production (read-only) | Read-only catalog/orders |
| `developer` | `DASHBOARD_DEVELOPER_EMAILS` | **Sandbox only** (ignores `SQUARE_ENVIRONMENT`) | Developer settings; cannot touch production Square data |

The `developer` role is environment-gated: regardless of `SQUARE_ENVIRONMENT`, a developer session always targets the Square sandbox API. This means developers can test against mock/sandbox Square data without any risk to production — the isolation is enforced by the API endpoint, not just route permissions.

### 10.2 Implementation

1. Extend `SessionPayload` JWT claims to include `roles: string[]`
2. Build `lib/auth/rbac.ts` with permission checks
3. Build `lib/square/config.ts` helpers:
   - `getSquareEnvironmentForRole(roles)` → returns `"sandbox"` for developers
   - `getSquareHeadersForRole(roles)` → uses `SQUARE_SANDBOX_ACCESS_TOKEN` for developers
   - `getSquareApiBaseForRole(roles)` → sandbox URL for developers
4. Role resolution in MFA challenge step (or legacy login):
   - `DASHBOARD_DEVELOPER_EMAILS` checked first → `developer` role, skip Square Team lookup
   - `DASHBOARD_ADMIN_EMAIL` looked up via `teamApi.searchTeamMembers`
   - `isOwner` → `owner`, non-owner → `staff`, not found → `visitor`
5. Store resolved role alongside OTP in MFA store; retrieve at verify step
6. Future: migrate Square API call sites from `getSquareApiBase()` / `getSquareHeaders()` to `getSquareApiBaseForRole(session.roles)` / `getSquareHeadersForRole(session.roles)` to enforce sandbox isolation per-request

### 10.3 Fail-Closed Behavior

**Critical: If Square API is unreachable and `DASHBOARD_ADMIN_EMAIL` is configured, authentication fails closed (503) rather than silently granting a role.**

| Scenario | Behavior |
|----------|----------|
| `DASHBOARD_ADMIN_EMAIL` unset | Defaults to `owner` (backward-compatible, no Square dependency) |
| `DASHBOARD_ADMIN_EMAIL` set, Square reachable | Role derived from Square team membership |
| `DASHBOARD_ADMIN_EMAIL` set, Square unreachable | **503 — Authentication service temporarily unavailable** |

### 10.4 Security Constraints

- All role checks happen server-side; client role display is cosmetic only
- `staff` role blocked from name, description, price changes — only `availableOnline` permitted
- `developer` role blocked from catalog mutations and order data
- Generic error messages: "Insufficient permissions" — do not reveal role names
- `squareRequired` flag stored with MFA code tracks whether role came from Square (for audit)

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
    DASHBOARD_ADMIN_EMAIL=              # Optional: enables Square Team RBAC lookup
    DASHBOARD_DEVELOPER_EMAILS=         # Optional: comma-separated emails for developer role
    SQUARE_SANDBOX_ACCESS_TOKEN=        # Optional: developer sessions use this token + sandbox URL
                                        # Leave unset to fall back to SQUARE_ACCESS_TOKEN for sandbox calls
    ```

5. Security constraints:
   - OTP stored in memory only (not in cookies, localStorage, or JWT)
   - Code cleared immediately after successful verification or expiry
   - Generic error messages: "Invalid code" — do not enumerate whether password was correct vs code was wrong on combined steps
   - `sendSms` failure must throw at request time with a clear server error; do not silently allow bypass
   - Store keys prefixed with `mfa:` and include IP to prevent cross-user replay

**Effort estimate:** ~2–3 hours total. No new dependencies. Leverages existing Twilio client, JWT session, and React form patterns.

**Phase 8 upgrade path:** After SMS MFA is deployed, add TOTP/WebAuthn as a secondary factor or replacement for operators who prefer authenticator apps over SMS. The two-step challenge/verify route pattern remains the same; only the delivery channel changes.

### 10.6 Future: Per-Role Square Client Switching

The role-aware helpers in `lib/square/config.ts` (`getSquareApiBaseForRole`, `getSquareHeadersForRole`) are available but not yet wired into all Square API call sites. To complete sandbox isolation for developers:

- Migrate `lib/square/catalog.ts`, `lib/square/orders.ts`, `lib/square/payments.ts`, `lib/square/loyalty.ts` to accept `roles` parameter
- Pass `session.roles` from each route handler
- This ensures a developer session can never accidentally write to production Square data

---

## Execution Order

1. **Phase 7a** (High / blocking): Security headers + CSP, secret scanning CI, MCP hygiene
2. **Phase 7b** (High): CSRF tokens, rate limiting, DOMPurify usage audit, RBAC implementation, Twilio SMS MFA
3. **Phase 7c** (Medium / architectural): AI guardrail contracts, secrets management provider abstraction, backup strategy & runbook

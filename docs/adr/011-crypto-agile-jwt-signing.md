# ADR-011: Crypto-Agile JWT Signing

**Date:** 2026-06-15
**Status:** Accepted

## Context

ADR-004 established JWT-based sessions using a hardcoded HS256 algorithm. The security audit flagged this as a risk: if HS256 is deprecated or broken, changing algorithms requires a code change and redeploy. Additionally, harvest-now-decrypt-later attacks against long-lived session tokens motivate the ability to rotate algorithms without code changes.

The JWT signing key is derived from `DASHBOARD_PASSWORD`. There is no separate key material or key rotation mechanism.

## Decision

Make the JWT signing algorithm configurable via the `JWT_ALGORITHM` environment variable:

```typescript
const DEFAULT_ALGORITHM = "HS256"
const SUPPORTED_ALGORITHMS = ["HS256", "HS384", "HS512"]

function getAlgorithm(): string {
  const alg = process.env.JWT_ALGORITHM || DEFAULT_ALGORITHM
  if (!SUPPORTED_ALGORITHMS.includes(alg)) {
    console.warn(`Unsupported JWT_ALGORITHM "${alg}", falling back to "${DEFAULT_ALGORITHM}"`)
    return DEFAULT_ALGORITHM
  }
  return alg
}
```

Key changes from ADR-004:
- Algorithm read from `JWT_ALGORITHM` env var at signing time (not build time)
- Unsupported values fall back to HS256 with a warning
- `decrypt()` accepts the full set of supported algorithms so existing tokens remain valid during algorithm rotation
- Adding a new algorithm requires only updating `SUPPORTED_ALGORITHMS` and deploying

## Rationale

- **Agility without code changes** — rotating from HS256 to HS384 requires only setting `JWT_ALGORITHM=HS384` in the environment, no redeploy needed after the initial rollout
- **Safe fallback** — unknown algorithms don't cause a crash, they fall back with a warning
- **Rolling compatibility** — `decrypt()` accepts all supported algorithms, so tokens signed with the old algorithm remain valid during the rotation window
- **No PQC yet** — ML-DSA (FIPS 204) support is not added because `jose` does not yet support it and there is no immediate need; the abstraction layer is in place for future addition
- **Key material unchanged** — all HMAC variants use the same `DASHBOARD_PASSWORD` as the key; key rotation remains a separate concern

## Consequences

- Operators can rotate the signing algorithm via environment variable without code changes
- Token size increases with stronger algorithms (HS256 = 32-byte key → HS512 = 64-byte key, proportional token expansion)
- The `console.warn` on unknown algorithms is visible in server logs, aiding debugging
- Future PQC migration path: add ML-DSA to `SUPPORTED_ALGORITHMS` once `jose` supports it; signing and verification paths are already abstracted behind `getAlgorithm()`

# Secrets Management

_Status: Secrets currently stored in plain environment variables. Provider abstraction required for production._

---

## Architecture

```
                         ┌──────────────────────────────┐
                         │     lib/secrets/              │
                         │                              │
                         │  getSecret(name: string)     │
                         │  → Promise<string>           │
                         │                              │
                         │  Providers:                  │
                         │   · EnvSecretsProvider       │
                         │   · DopplerProvider          │
                         │   · AwsSecretsProvider       │
                         │   · VaultProvider            │
                         └────────────┬─────────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────────┐
                         │  Application Bootstrap        │
                         │                              │
                         │  Fail fast on missing secret  │
                         │  Log fetch (name + timestamp, │
                         │  never value)                 │
                         │  Refresh on server restart    │
                         └──────────────────────────────┘
```

---

## Provider Interface

All providers must implement:

```ts
export interface SecretsProvider {
  getSecret(name: string): Promise<string>
}
```

### EnvSecretsProvider (Development / Demo)

- Wraps `requireEnv()` from `lib/env.ts`
- Reads from `process.env`
- Used only in development or demo environments
- Throws at startup if any required secret is missing

### DopplerProvider (Production — Recommended)

- Fetches secrets from Doppler at server startup
- Caches secrets in memory for the lifetime of the process
- Requires `DOPPLER_TOKEN` service account token (injected via CI/CD OIDC)
- Rotate token via Doppler UI; restart triggers refresh

### AwsSecretsProvider (Production — Alternative)

- Fetches secrets from AWS Secrets Manager
- Caches secrets in memory for the lifetime of the process
- Requires IAM role with `secretsmanager:GetSecretValue`
- Supports automatic rotation via Lambda

### VaultProvider (Production — Enterprise)

- Fetches secrets from HashiCorp Vault
- Requires `VAULT_ADDR` and `VAULT_TOKEN` or Kubernetes auth
- Caches secrets in memory for the lifetime of the process

---

## Bootstrap Sequence

1. Initialize the configured provider at server startup
2. Fetch all required secrets by name
3. Throw immediately if any secret is missing or provider returns an error
4. Cache secrets in memory; no lazy fetching on hot paths
5. Log each fetch with secret name and timestamp (never the value)

```ts
// lib/secrets/index.ts
import { requireEnv } from "@/lib/env"

const REQUIRED_SECRETS = [
  "SQUARE_ACCESS_TOKEN",
  "SQUARE_WEBHOOK_SIGNATURE_KEY",
  "TWILIO_AUTH_TOKEN",
  "OUTSTATIC_API_KEY",
  "DASHBOARD_PASSWORD",
  "SQUARE_WEBHOOK_SIGNATURE_KEY",
]

let cachedSecrets: Record<string, string> = {}

export async function bootstrapSecrets() {
  const provider = getProvider()
  for (const name of REQUIRED_SECRETS) {
    try {
      cachedSecrets[name] = await provider.getSecret(name)
    } catch (error) {
      throw new Error(
        `Failed to load required secret ${name}: ${error instanceof Error ? error.message : "unknown error"}`
      )
    }
  }
}

export function getSecret(name: string): string {
  const value = cachedSecrets[name]
  if (!value) {
    throw new Error(`Secret ${name} not loaded. Call bootstrapSecrets() at startup.`)
  }
  return value
}
```

---

## Rotation & Restart

- Secrets are fetched once per cold start
- Server restart (deployment, scaling event, crash recovery) triggers a full refresh
- No in-process rotation timer; rely on orchestrator restarts
- For zero-downtime rotation: deploy new instance → old instance drains → old instance terminates

---

## Audit Logging

Every `getSecret()` call must log:

```
[trace] secrets.fetch name=SQUARE_ACCESS_TOKEN timestamp=2026-06-23T14:00:00Z
```

Never log the secret value. Audit logs go to the standard application log sink.

---

## CI/CD Secret Injection

- Prefer OIDC-based short-lived tokens over static long-lived secrets
- GitHub Actions: use `aws-actions/configure-aws-credentials` with OIDC for AWS Secrets Manager
- Doppler: use Doppler GitHub Action with `DOPPLER_TOKEN` from GitHub secret (OIDC rotation)
- Never commit secrets to repository history

---

## Migration Path

1. Implement `lib/secrets/` abstraction and `EnvSecretsProvider`
2. Update `lib/square/client.ts`, `lib/twilio/client.ts`, `lib/webhooks/square.ts`, and `lib/auth/session.ts` to use `getSecret()` instead of `requireEnv()`
3. Deploy to development with `EnvSecretsProvider`
4. Add `DopplerProvider` (or AWS/Vault) and update deployment configuration
5. Remove plain `requireEnv()` calls for sensitive values

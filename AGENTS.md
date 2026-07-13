<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:security-audit-rules -->
# Security audit policy

After every `npm install`, and before releasing/deploying new production versions, run:
1. `npm audit` to check for vulnerabilities
2. Fix any **high** or **critical** severity vulnerabilities by adding appropriate `overrides` in `package.json` (for transitive deps) or upgrading direct dependencies
3. Only skip if there is genuinely no fix available (e.g. bundled dependency in a framework like Next.js, or a breaking API change in an upstream library)

Run `npm audit` again after applying fixes to confirm they resolved.
<!-- END:security-audit-rules -->

<!-- BEGIN:dev-patterns -->
# Development Patterns

These patterns are mandatory conventions. Read the linked file before writing code in the relevant area.

## Environment & Configuration

No silent fallbacks for environment variables. Use `requireEnv("VAR_NAME")` from `lib/env.ts` for required values; missing values throw with a clear actionable message at startup, not at runtime. Optional feature flags (demo mode) may use explicit boolean checks.

Details: [`docs/patterns/configuration.md`](docs/patterns/configuration.md)

## Linting

ESLint config is layered (`eslint-config-next` + project overrides). Do not add inline `// eslint-disable` comments in normal source code. Test files have specific rule suppressions already configured by location. Fix lint errors; don't suppress them.

Details: [`docs/patterns/lint-policy.md`](docs/patterns/lint-policy.md)

## Git Hooks

`ignore-scripts=true` is mandatory in `.npmrc`. This makes `husky` incompatible — do not add it. Use `simple-git-hooks` + `lint-staged` instead, configured via `package.json`. Re-run `npx simple-git-hooks` after `package.json` changes.

Details: [`docs/patterns/pre-commit-hooks.md`](docs/patterns/pre-commit-hooks.md)

## Supply Chain

Never run `npm install`, `npm ci`, or `npm audit` without `--ignore-scripts`. Pin GitHub Actions to commit SHAs (never floating tags). Validate `package.json` has direct dependencies for anything imported in source. Weekly dependency updates are handled by Dependabot.

Details: [`docs/patterns/supply-chain-hardening.md`](docs/patterns/supply-chain-hardening.md)

<!-- BEGIN:theme-variant-servers -->
# Theme Variant Dev Servers

Run each theme variant on a separate port using npm scripts:
- `npm run dev` or `npm run theme:a` — Port 3000, bundle A (default)
- `npm run theme:b` — Port 3001, bundle B
- `npm run theme:c` — Port 3002, bundle C

**RAM constraint:** Never run more than 1 theme variant server concurrently without first checking available RAM (`free -h`) and getting explicit user consent. Each Next.js dev server uses ~500-700MB RAM.

Config uses `NEXT_PUBLIC_THEME_BUNDLE` env var + dynamic `distDir` (`.next-a`, `.next-b`, etc.) in `next.config.ts`.
<!-- END:theme-variant-servers -->

<!-- BEGIN:debugging-rules -->
# Debugging Workflow

## Prerequisites
- Dev server must be running: `npm run dev`
- MCP servers configured in `.mcp.json` (next-devtools, codebase-indexer, github, memory, square, twilio)

## Debugging Runtime Errors

When investigating a runtime error, follow this flow:

1. **Get errors** — Use the MCP `get_errors` tool to capture build/runtime errors from the dev server
2. **Get logs** — Use the MCP `get_logs` tool to fetch recent console output; filter by context prefix (e.g. `[webhook]`, `[orders]`, `[payments]`)
3. **Analyze** — Structured logs include timestamps, severity levels, and context names. Look for `ERROR` and `WARN` entries near the failure point
4. **Fix** — Edit the relevant source file. All logging uses `lib/logger.ts` via `logger("context-name").error|warn|info|debug(message, data)`. Do NOT use `console.*` directly
5. **Verify** — Run `npm run test:fast` for sub-second feedback, then `npm run lint:quiet` for structural checks

## Logger Usage
- Import: `import { logger } from "@/lib/logger"`
- Context names: short kebab-case module identifiers (e.g. `webhook`, `orders`, `payments`, `cart`, `rbac`, `mfa`, `loyalty`, `sms`, `catalog`, `menu-detail`)
- Error objects are serialized with full stack traces automatically
- Non-string data is JSON-serialized
- `LOG_LEVEL` env var controls verbosity (`debug` | `info` | `warn` | `error`); defaults to `debug` in development, `warn` in production

## CI Debugging Workflow
- Validate pipeline config locally before pushing (dry-run)
- Run change-aware signal stages: `npm run lint:quiet` → `npm run typecheck` → `npm run test:fast`
- Only escalate to full CI suite when signal passes
- Split between "signal" (seconds) and "confidence" (minutes) stages
<!-- END:debugging-rules -->
<!-- END:dev-patterns -->

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
<!-- END:dev-patterns -->

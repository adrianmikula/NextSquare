# Coding Standards

This directory documents conventions that should remain stable across the codebase. Agents should follow these standards without deviation.

## Current Standards

- **Logging:** Use `lib/logger.ts` — no `console.*` calls in application code
- **Env vars:** Use `requireEnv()` from `lib/env.ts` for required values; no silent fallbacks
- **Linting:** Fix ESLint errors; do not add inline `// eslint-disable` comments
- **Git hooks:** Use `simple-git-hooks` + `lint-staged` configured in `package.json`
- **Supply chain:** Run `npm install` with `--ignore-scripts`; validate `package.json` direct dependencies
- **Tests:** Run `npm run test:fast` after every change; full suite is CI-only
- **CI signal:** Run `npm run lint:quiet` → `npm run typecheck` → `npm run test:fast` before pushing

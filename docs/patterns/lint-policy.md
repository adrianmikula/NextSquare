# Lint Policy

## Reasoning

The ESLint config in `eslint.config.mjs` is layered: it inherits `eslint-config-next` rules (core-web-vitals + typescript) and applies project-specific overrides. Not all rules are equally valuable in every context — particularly in test files, where pragmatism matters more than strict type enforcement.

## Suppressions by Location

### `__tests__/**` — Test files

| Rule | Reason |
|---|---|
| `@typescript-eslint/no-explicit-any` | Mock data, fixture objects, and partial implementations of complex Square API types routinely require `any`. Adding full type definitions for every test fixture adds maintenance burden without catching real bugs. |
| `@typescript-eslint/no-unused-vars` | Test files often import utilities (`vi`, `afterEach`, `container`) that are used across some tests but not all. Removing them risks churn when a new test needs the import again. |

These are configured as `"off"` via a `files: ["__tests__/**"]` override in the ESLint config. No inline disable comments are needed.

### `.codacy/**` — Vendor config

Entirely ignored via `globalIgnores`. This is an external tool configuration, not project code.

## Rules That Are NOT Suppressed

The following rules apply everywhere, including test files, because violations indicate real problems:

- `@next/next/no-img-element` — using `<img>` instead of `<Image />` causes real performance degradation. These warnings should be fixed, not suppressed.

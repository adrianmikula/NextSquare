# Pre-Commit Hooks

## Reasoning

No automated guardrail exists to prevent committing secrets, lint errors, or malformed code. When `ignore-scripts=true` is set in `.npmrc` (see supply-chain-hardening.md), `husky` cannot auto-install hooks because it relies on a `prepare` lifecycle script. This makes the standard husky workflow incompatible with our own security hardening.

## Approach

Use `simple-git-hooks` instead of `husky`. It configures git hooks via `package.json` without requiring any lifecycle scripts.

### Setup

Hooks are defined in `package.json` under the `simple-git-hooks` key:

```json
{
  "simple-git-hooks": {
    "pre-commit": "npx lint-staged"
  }
}
```

Install hooks once (re-run after `package.json` changes):

```bash
npx simple-git-hooks
```

### What runs on commit

`lint-staged` is configured to run on staged files:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": "eslint --quiet --fix"
  }
}
```

- TypeScript/TSX files are linted with `eslint --fix` in quiet mode (warnings don't block commits)
- Only `.ts` and `.tsx` files are checked — JSON and Markdown are not linted (no prettier dependency)

### Why not husky

| | husky | simple-git-hooks |
|---|---|---|
| Installation requires lifecycle scripts | Yes (`prepare`) | No |
| Works with `ignore-scripts=true` | No | Yes |
| Configuration format | Shell files in `.husky/` | `package.json` |
| Runtime dependency | Git hook shell files | None (config read at hook time) |

Since `ignore-scripts=true` is a mandatory security hardening, `simple-git-hooks` is the only viable choice.

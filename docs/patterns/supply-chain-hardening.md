# Supply Chain Hardening

## Reasoning

The npm ecosystem has 583+ transitive packages in this project. A single compromised dependency with a `postinstall` script can exfiltrate CI credentials or establish persistence. AI-era attacks (Mini Shai-Hulud, May 2026) demonstrated automated dependency poisoning at SLSA Build Level 3. Every layer below reduces the attack surface and buys detection time.

## Rules

### 1. `.npmrc` — Lock install-time exploits

```
ignore-scripts=true
min-release-age=7
```

- `ignore-scripts=true` — prevents `preinstall`/`postinstall` scripts from executing. Dependencies that genuinely need build scripts (e.g., `esbuild`, `sharp`) fail fast at install time and can be allowlisted explicitly if needed.
- `min-release-age=7` — rejects packages published less than 7 days ago. Malicious versions that live <3 hours (Shai-Hulud pattern) won't be installed.

### 2. CI uses `npm ci --ignore-scripts`

Never `npm install`. Never without `--ignore-scripts`. This ensures deterministic, script-free installs in CI.

### 3. GitHub Actions pinned to commit SHAs

Every `uses:` in `.github/workflows/` references a full commit SHA, never a floating tag:

```yaml
- uses: actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10
- uses: actions/setup-node@f4a67bbeca970f103397d3d2b9462cf787cd2980
```

Tags can be moved by an attacker who compromises the action's repository, retroactively applying malicious code to all referencing workflows.

### 4. Least-privilege workflow permissions

Every job declares explicit `permissions:` — never the default (write-all):

```yaml
permissions:
  contents: read
```

Only grant `security-events: write` to jobs that need it (CodeQL).

### 5. Direct dependencies for code-level imports

Any package imported directly in source code must be a direct dependency in `package.json`. Transitive dependencies can be removed or changed by upstream maintainers. Example: `jose` is used in `lib/auth/session.ts` and must be listed in `dependencies` even though it's also pulled in by `outstatic`.

### 6. CI supply chain checks

Every push/PR runs:
- `npm audit --audit-level=high` — fails the build on high/critical vulnerabilities
- CodeQL analysis — JavaScript/TypeScript SAST scanning
- Dependabot — weekly automated PRs for dependency updates

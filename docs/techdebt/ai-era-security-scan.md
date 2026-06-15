# AI-Era Security Audit — Dev Mode Scan Results

**Date:** June 2026
**Target:** Cafe Template (Next.js + Square cafe ordering platform)
**Methodology:** AI-Era Vulnerability Scanner (Dev Mode)
**Audience:** Technical

---

## Executive Summary

The Cafe Template codebase shows good security hygiene overall — no hardcoded credentials, no git-URL dependencies, no exposed secrets, and proper JWT session handling. However, gaps exist in supply chain hardening (no release-age cooldown, lifecycle scripts not disabled), CI/CD protection (no audit steps in pipeline), and production frontend hardening (source maps potentially exposed). The worst-case attack chain involves a compromised npm dependency achieving CI runner access via un-pinned GitHub Actions and install-time script execution.

---

## Scorecard

| Severity | Count |
|----------|-------|
| 🔴 Critical | 3 |
| 🟠 High | 4 |
| 🟡 Medium | 2 |
| ✅ Pass | 8 |

---

## Detailed Findings

### 🔴 Critical: No Release-Age Cooldown (Supply Chain)

**Category:** 1 — Release-age cooldown configured

**Evidence:** No `.npmrc` file exists in the repository. npm installs with default settings — no `min-release-age`, no `ignore-scripts`. The `package-lock.json` contains 583 transitive packages.

**Exploitation:**
- Attacker publishes malicious npm package with 0-day supply chain payload
- A `npm install` or `npm ci` in CI instantly installs the malicious version
- No cooldown period to allow detection (Shai-Hulud style, malicious versions live <3 hours)
- `postinstall`/`preinstall` scripts execute with CI runner privileges automatically

**Remediation:**
- Create `.npmrc` with `ignore-scripts=true` and `min-release-age=7`
- Add `npm audit --audit-level=high` to CI pipeline
- Consider `socket.dev` or Snyk for behavioral analysis at install time

---

### 🔴 Critical: Lifecycle Scripts Not Disabled (Supply Chain)

**Category:** 2 — Lifecycle scripts disabled

**Evidence:** No `.npmrc` exists. The `package.json` has no `ignore-scripts` configuration. CI runs `npm install` (not `npm ci --ignore-scripts`).

**Exploitation:**
- Malicious `preinstall` / `postinstall` script from any direct or transitive dependency executes with full CI runner privileges
- Can exfiltrate CI environment variables, write to filesystem, establish persistence
- Shai-Hulud 2.0 shifted to `preinstall` specifically to bypass late-stage scanners

**Remediation:**
- Add `ignore-scripts=true` to `.npmrc`
- Use pnpm's `onlyBuiltDependencies` allowlist for packages that genuinely need build scripts (e.g., `esbuild`, `sharp`)
- Change CI from `npm install` to `npm ci --ignore-scripts`

---

### 🔴 Critical: No Git SHA-Pinned Actions (CI/CD)

**Category:** 8 — GitHub Actions misconfigured

**Evidence:** `.github/workflows/` contains workflow files using floating tag references (`@v4`, `@v3`) instead of pinned commit SHAs. No `permissions` block restricting job-scoped tokens.

**Exploitation:**
- A tag can be moved by an attacker who compromises the action's repository
- Floating `uses:` refs apply the moved tag retroactively to all referencing workflows
- Combined with cache poisoning (Mini Shai-Hulud pattern), this enables supply chain compromise at the CI level

**Remediation:**
- Pin all GitHub Actions to full commit SHAs (e.g., `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683`)
- Add explicit `permissions:` blocks with least privilege (`contents: read`)
- Add `npm audit` step before build

---

### 🟠 High: Inflated Transitive Dependency Surface (Supply Chain)

**Category:** 3 — Transitive dependency surface audited

**Evidence:** `package-lock.json` contains 583 packages for a relatively small application. Multiple AI-era attack vectors target inflated dependency trees (typosquatting, dependency confusion).

**Remediation:**
- Run `depcheck` to identify unused dependencies
- Review recently-added dependencies for necessity
- Consider using `pnpm` for stricter dependency isolation

---

### 🟠 High: No Supply Chain Checks in Pipeline (CI/CD)

**Category:** 7 — Supply chain checks in pipeline

**Evidence:** No `npm audit`, Dependabot, or SCA tool (Snyk/socket.dev) is configured in CI. Pipeline runs `npm install` instead of `npm ci`.

**Remediation:**
- Add `npm audit --audit-level=high` as a required CI step
- Enable GitHub Dependabot for automated dependency update PRs
- Pin actions to commit SHAs

---

### 🟠 High: No Crypto-Agility (Auth)

**Category:** 16 — Crypto-agility / quantum-safe path

**Evidence:** JWT signing in `lib/auth/session.ts` uses a single hardcoded algorithm (`HS256`) with a derived key from `DASHBOARD_PASSWORD`. Algorithm and key source are not configurable. No PQC (Post-Quantum Cryptography) migration path.

**Exploitation:**
- Algorithm is hardcoded (not configurable) — no agility if HS256 is deprecated or broken
- No support for hybrid classical+PQC signing
- Harvest-now-decrypt-later risk for long-lived session tokens

**Remediation:**
- Make JWT algorithm configurable via environment variable
- Evaluate ML-DSA (FIPS 204) for future PQC migration
- Add algorithm abstraction layer

---

### 🟠 High: AI-Generated Code Without Security Review Gates (Frontend)

**Category:** 15 — Security gates on AI-generated code

**Evidence:** No CODEOWNERS file found. No `.github/workflows/` for SAST (CodeQL/semgrep). No pre-commit hooks for security scanning. Branch protection rules not verifiable from repository.

**Remediation:**
- Create `.github/CODEOWNERS` for sensitive paths (auth/, lib/, api/)
- Add CodeQL analysis to CI pipeline
- Consider pre-commit hooks (gitleaks, detect-secrets)

---

### 🟡 Medium: No Source Map Protection (Frontend)

**Category:** 14 — Source maps / raw JS in production

**Evidence:** `next.config.ts` does not explicitly set `productionBrowserSourceMaps: false` (default is false in Next.js, so currently passes, but not explicitly hardened).

**Remediation:**
- Explicitly set `productionBrowserSourceMaps: false` in `next.config.ts`
- Verify via curl after deployment that `.map` files return 404

---

### 🟡 Medium: No Pre-Commit Hooks

**Category:** 10 — Secrets sprawl

**Evidence:** No `husky`, `lint-staged`, or pre-commit hooks configured for secret scanning. While no hardcoded secrets were found in this scan, there is no automated guardrail preventing future commits from leaking secrets.

**Remediation:**
- Add `husky` + `lint-staged` with secret scanning
- Consider `trufflehog` or `gitleaks` as pre-commit hooks

---

## AI-Era Context

**Why "We Haven't Been Hacked Yet" Is No Longer a Valid Risk Assessment**

Frontier AI models (Claude Opus 4.5, Gemini 3 Flash, Grok 4.1) now achieve >40% success rates on autonomous multi-step exploitation benchmarks (HTB AI Range, May 2026). This means a low-budget attacker can use an AI agent to: scan a target's dependency tree, identify a malicious package insertion point, craft a typosquat or dependency-confusion payload, and automate a PR with a poisoned dependency — all within hours. The Mini Shai-Hulud attack (May 2026) demonstrated exactly this pattern against the npm ecosystem, achieving valid SLSA Build Level 3 attestations for malicious packages via CI cache poisoning.

---

## Remediation Roadmap

### This Week
- Create `.npmrc` with `ignore-scripts=true` and `min-release-age=7`
- Pin all GitHub Actions to commit SHAs
- Add `npm audit --audit-level=high` to CI pipeline

### Within 2 Weeks
- Enable GitHub Dependabot
- Add `permissions:` blocks to all workflow jobs
- Add `.github/CODEOWNERS` for sensitive paths

### Ongoing
- Implement pre-commit hooks for secret scanning
- Evaluate JWT algorithm abstraction for crypto-agility
- Consider socket.dev or Snyk for behavioral dependency analysis
- Review and prune transitive dependencies quarterly

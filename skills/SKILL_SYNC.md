# Skill Sync — TemplateCafeWebsite

This repo uses the [skillify-codebase](https://github.com/anomalyco/AgentSkills/tree/main/skillify-codebase) methodology to maintain lockstep between upstream Claude skills and downstream implementation code.

## Active Skills

| Skill | Path | Status | Maps To |
|-------|------|--------|---------|
| theme-dimensions | `skills/theme-dimensions/` | Active — mapped | `lib/dimensions/`, `content/dimensions/`, `components/cms/ThemeProvider.tsx` |

## Unskilled Modules (TODOs)

The following codebase modules have no upstream skill yet. Create skills for these when the corresponding feature domain needs spec-first development.

| Module | Codebase Paths | TypeSpec | Priority |
|--------|---------------|----------|----------|
| square-integration | `lib/square/`, `app/api/square/`, `lib/webhooks/square.ts` | `specs/square.tsp`, `specs/order.tsp` | Medium |
| auth | `lib/auth/`, `app/api/auth/` | `specs/auth.tsp` | Medium |
| cart-checkout | `lib/store/cart.ts`, `components/cart/`, `components/checkout/`, `app/cart/`, `app/checkout/` | `specs/cart.tsp` | Medium |
| cms-content | `lib/cms.ts`, `lib/renderer.ts`, `lib/schemas.ts`, `components/cms/`, `app/api/cms/` | — | Low |
| loyalty | `lib/square/loyalty.ts`, `components/loyalty/`, `app/api/square/loyalty/` | `specs/loyalty.tsp` | Low |
| notifications | `lib/twilio/client.ts`, `app/api/twilio/sms/` | `specs/notifications.tsp` | Low |
| security | `proxy.ts`, `lib/security/`, `lib/env.ts` | — | Low |
| website-builder | `lib/ai/`, `skills/website-builder/resources/` | — | Low |
| menu-catalog | `lib/square/catalog.ts`, `hooks/useMenu.ts`, `components/menu/`, `app/menu/` | — | Low |

## How to Add a New Skill

1. Create `skills/<skill-name>/` with `SKILL.md`, `config.yaml`, `mapping.toml`, and `resources/`
2. Follow the template in the `skillify-codebase` skill:
   - Phase 1: Analyse the codebase module
   - Phase 2: Generate SKILL.md with matching inputs/outputs
   - Phase 3: Create granular section-level mapping in mapping.toml
   - Phase 4: Document sync workflow
3. Update this file to move the module from "Unskilled" to "Active"

## When to Run a Sync

Run the sync workflow when business logic, config parameters, or data models change in the upstream skill spec and need to propagate to this codebase.

## How an Agent Performs the Sync

1. Load the `skillify-codebase` skill
2. Navigate to `skills/<skill-name>/`
3. Open `mapping.toml` to identify changed sections
4. Follow the Phase 4 sync procedure:
   - **Forward sync** (skill → code): update `config.yaml`, apply file mapping
   - **Reverse sync** (code → skill): update code, then update the skill
   - **Parameter-only**: edit `config.yaml` and propagate mapped files
5. Bump `skill_version` in both `config.yaml` and `mapping.toml`
6. Run all mapped test files to verify
7. Commit with the `skill-sync()` convention

## Drift Detection

If the codebase has drifted from the skill spec:
1. Check `skill_version` match between `config.yaml` and `mapping.toml`
2. Run each capability's test cases against actual codebase behavior
3. Decide direction: forward sync (skill is correct) or reverse sync (code is correct)

## Commit Convention

```
skill-sync(<skill-name>): v<old> → v<new> — <brief description>

Config changes:
- <config key>: <old value> → <new value>

Mapped files updated:
- <file>: <function> — <what changed>

Reverse sync: <yes/no>
```

## Key Constraints

| Rule | Detail |
|------|--------|
| Never change capability interface | Inputs, outputs, and capability names are stable |
| Config first | `config.yaml` is the primary sync target, not source code |
| No source code in the skill | The skillified project is MD, YAML, TOML, JSON only |
| Bump version on every sync | Update `skill_version` in both `config.yaml` and `mapping.toml` |
| Update mapping on structural changes | Every skill section change needs a corresponding `mapping.toml` update |

## Dependencies

- **Methodology:** `skillify-codebase` (in AgentSkills-main repo)
- **Config:** `skills/<skill-name>/config.yaml`
- **Mapping:** `skills/<skill-name>/mapping.toml`

---

**Last sync:** 2026-07-11
**Skill versions:** theme-dimensions v0.1.0

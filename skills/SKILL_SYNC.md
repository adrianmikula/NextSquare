# Skill Sync — TemplateCafeWebsite

This repo uses the [skillify-codebase](https://github.com/anomalyco/AgentSkills/tree/main/skillify-codebase) methodology to maintain lockstep between upstream Claude skills and downstream implementation code.

## Architecture-Aligned Skill Map

Skills are organized by the four architectural boundaries documented in `README.md`. Each major AI-generated config artifact has a dedicated skill.

### Modern Generator Architecture (New)

| Skill | Path | Boundary | Guides | Maps To |
|-------|------|----------|--------|---------|
| **website-generator** | `skills/website-generator/` | AI/Skills (orchestrator) | Full generation loop: brief → preview → iterate | `skills/agent/SKILL.md` (renamed/expanded) |
| **business-profile** | `skills/business-profile/` | Human Input → Code | Extracting/validating `BusinessProfile` from raw data | `lib/ai/multi-source-pipeline.ts` input stage |
| **layout-selector** | `skills/layout-selector/` | AI/Skills → Code | Archetype selection, variant assignment, produces `LayoutOutput` | `lib/ai/archetype-selector.ts` |
| **content-generator** | `skills/content-generator/` | AI/Skills → Code | Block data generation, produces `PageBundle` | `lib/ai/multi-source-pipeline.ts` data stage |
| **sequencer** | `skills/sequencer/` | Code | Industry profiles, section templates, pacing, produces `SiteConfig` | `src/generator/sequencer/assemble.ts` |
| **tuner-system** | `skills/tuner-system/` | Code | Taste Engine tuners, Soltana archetypes, `DesignLanguage` | `src/renderer/compile-tuners.ts`, `src/archetypes/` |
| **gene-designer** | `skills/gene-designer/` | Code | Creating new gene variants as json-render components | `src/genes/`, `src/renderer/registry.tsx` |

### Legacy CMS + Dimension System (Old)

| Skill | Path | Boundary | Notes |
|-------|------|----------|-------|
| **legacy-theme-dimensions** | `skills/legacy-theme-dimensions/` | Config → Code | 9-dimension design system for old CMS theme injection |
| **legacy-theme-uniqueness** | `skills/legacy-theme-uniqueness/` | Code (audit) | Hardcoded value audit for legacy dimension system |
| **legacy-website-builder** | `skills/legacy-website-builder/` | Human Input → Code | End-to-end CMS site builder using old `content/cms/` pipeline |

### External Tool Wrappers

| Skill | Path | Boundary | Notes |
|-------|------|----------|-------|
| **ticonderoga** | `skills/ticonderoga/` | AI/Skills | Wraps standalone Ticonderoga Design Genome Lab CLI |

## Generation Pipeline Skill Ownership

```
Human Input
  └─ business-profile  →  BusinessProfile
        ↓
AI/Skills (orchestrated by website-generator)
  ├─ layout-selector   →  LayoutOutput (archetype + variants per page)
  ├─ content-generator  →  PageBundle (block data per layout)
  └─ sequencer          →  SiteConfig (industry + tone + pacing)
        ↓
Code (rendering)
  ├─ tuner-system       →  CSS custom properties
  ├─ gene-designer      →  React gene components
  └─ renderer           →  React DOM
```

## Active Skills (by layer)

### Human Input Layer

| Skill | Purpose |
|-------|---------|
| `business-profile` | Extract and validate business data into `BusinessProfile` schema |

### AI / Skills Layer

| Skill | Purpose |
|-------|---------|
| `website-generator` | Top-level orchestrator: interpret brief → run pipeline → preview → iterate |
| `layout-selector` | Select archetypes and variants per page using LLM or rule-based fallback |
| `content-generator` | Generate block data maps from layout + business profile |

### Code Layer

| Skill | Purpose |
|-------|---------|
| `sequencer` | Rule-based assembly from industry + tone → `SiteConfig` |
| `tuner-system` | Configure 5 Taste Engine tuners and Soltana archetype tokens |
| `gene-designer` | Create new gene variants registered in json-render catalog |

### Config Layer

| Skill | Purpose |
|-------|---------|
| `legacy-theme-dimensions` | Define/resolve/compile 9-dimension theme specs (legacy) |
| `legacy-theme-uniqueness` | Audit hardcoded theme values (legacy dimension system) |

### External

| Skill | Purpose |
|-------|---------|
| `ticonderoga` | Wraps Ticonderoga CLI for agent competition (Phase 5+) |

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
| menu-catalog | `lib/square/catalog.ts`, `hooks/useMenu.ts`, `components/menu/`, `app/menu/` | — | Low |

## How to Add a New Skill

1. Create `skills/<skill-name>/` with `SKILL.md`
2. Map the skill to one of the four architectural boundaries
3. Ensure it produces or consumes a well-defined config artifact (e.g. `BusinessProfile`, `LayoutOutput`, `PageBundle`, `SiteConfig`)
4. Update this file to register the skill in the appropriate layer table
5. Update `README.md` skill table if the skill is user-facing

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

**Last sync:** 2026-07-16
**Skill versions:** theme-dimensions v0.2.0 (legacy)

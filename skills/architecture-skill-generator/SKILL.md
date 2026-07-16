---
name: architecture-skill-generator
description: >
  Analyze any multi-module codebase, map its architectural boundaries, and produce a
  complete set of Claude skills aligned to those boundaries. Use when asked to document
  an architecture as skills, create an orchestrator skill, or establish clear human/AI
  separation of responsibilities across modules.
---

# Architecture Skill Generator

## Mission

Transform any multi-module codebase into a complete, boundary-aligned skill set. The output
includes an orchestrator skill, one skill per major module, clear input/output contracts per
module, and an explicit separation between what humans do and what AI does.

## Methodology

Follow these phases in order.

---

## Phase 1: Discover the Architecture

Map the codebase into four canonical boundaries. Do not invent a fifth.

### A. Human Input

Everything that originates from a human or an external real-world source and is consumed by
the system as data.

Look for:
- `content/`, `data/`, `static/`, `assets/` directories containing JSON, YAML, Markdown, images
- CMS content, site profiles, catalogues, dimension specs, configuration JSON
- Test fixtures, reference configs, seed data
- External data sources (APIs, scrapers, importers) that feed into the system

For each item, record:
- File path and format
- Schema/contract (if any)
- Whether it is human-editable or machine-fetched

### B. AI / Skills

Everything that decides *what* to generate or *how* to transform inputs.

Look for:
- `skills/`, `.kilo/`, `mcp.json`, `AGENTS.md`
- Pipeline orchestrators, LLM call sites, prompt files
- Agent instructions, workflow definitions
- Any code whose primary role is decision-making rather than data transformation

For each item, record:
- What decision it makes
- What inputs it reads
- What outputs it produces

### C. Code

Everything that deterministically transforms data or renders output.

Look for:
- `src/`, `lib/`, `app/`, `components/`, `api/`
- Generators, sequencers, renderers, compilers
- Schemas, type definitions, validation logic
- Business logic, API routes, rendering pipelines

For each item, record:
- Module responsibility
- Inputs consumed
- Outputs produced
- Dependencies on other modules

### D. Config

Everything that controls the environment, build, or runtime behavior without being business data.

Look for:
- `next.config.*`, `tsconfig.*`, `package.json`, `.env*`, `*.config.*`
- Build scripts, deployment config, CI/CD
- Theme bundles, dimension specs (if they are environment/build-level rather than content)
- Env var enforcement, MCP servers, supply-chain config

For each item, record:
- What it configures
- Which code modules consume it
- Whether it is static (checked in) or dynamic (set at runtime)

### Output of Phase 1

Produce a table:

| Module / File | Boundary | Responsibility | Inputs | Outputs |
|---------------|----------|---------------|--------|---------|

Then produce a **generation flow diagram** showing the primary data path:
```
Human Input → AI/Skills → Code → Rendered Output
```

Identify the **handoff points** — the specific files or data structures where one boundary
passes control to another.

---

## Phase 2: Identify Major Modules

Within the Code boundary, identify the major functional modules. A "major module" is a
cohesive unit that:
- Has a single, clear responsibility
- Produces or consumes a distinct config artifact (a typed object, JSON file, rendered output)
- Could be explained in one paragraph

For each major module, define:
- **Name** (noun phrase, e.g. "Sequencer", "Renderer", "Tuner System")
- **Boundary** (which of the four it belongs to)
- **Input artifact** (the data structure it consumes)
- **Output artifact** (the data structure it produces)
- **Core files** (2-5 key source files)
- **Responsibility** (one sentence)

Group modules by boundary. The goal is to end up with 3-8 major modules per boundary.

---

## Phase 3: Design the Skill Hierarchy

### 3a. Orhestrator Skill

Create one top-level skill that:
- Is named `<project>-generator` or similar (e.g. `website-generator`)
- Lives at `skills/<orchestrator-name>/SKILL.md`
- Describes the full pipeline from user brief to rendered output
- References every sub-skill by path
- Contains the iteration loop: interpret → execute pipeline → preview → verify → iterate
- Is the entry point when a user asks for generation

### 3b. Per-Module Skills

For each major module identified in Phase 2, create a skill at `skills/<module-name>/SKILL.md`.

Each per-module skill must contain:

```markdown
---
name: <module-name>
description: >
  <One sentence: what this skill guides the agent to do, which boundary it belongs to,
  and what artifact it produces or consumes.>
---

# <Module Name> Skill

> **Boundary:** <Human Input | AI/Skills | Code | Config>
> **Input:** <artifact name and brief description>
> **Output:** <artifact name and brief description>

## Mission

<One paragraph: why this module exists, what problem it solves, where it sits in the pipeline.>

## <Artifact> Contract

<If the module produces or consumes a typed artifact, show the TypeScript interface or
JSON schema. If there is no formal schema, describe the shape in prose.>

## Core Files

| File | Responsibility |
|------|---------------|
| `<path>` | `<role>` |
| `<path>` | `<role>` |

## Workflow / Usage

<Step-by-step instructions for the agent:
- How to invoke this module
- What inputs to prepare
- What the expected output looks like
- Error handling or edge cases>

## Related Skills

- `skills/<orchestrator>/SKILL.md` — <relationship>
- `skills/<sibling-1>/SKILL.md` — <relationship>
- `skills/<sibling-2>/SKILL.md` — <relationship>
```

### 3c. Skill Naming Convention

| Module type | Naming rule | Example |
|-------------|-------------|---------|
| Orchestrator | `<project>-generator` | `website-generator` |
| Code module | kebab-case matching module name | `sequencer`, `tuner-system`, `gene-designer` |
| AI module | kebab-case matching module name | `layout-selector`, `content-generator` |
| Human-input module | kebab-case matching data role | `business-profile` |
| Legacy/old module | `legacy-` prefix | `legacy-theme-dimensions` |
| External wrapper | tool name | `ticonderoga` |

### 3d. SKILL_SYNC.md

Create or update `skills/SKILL_SYNC.md` with:

1. **Architecture-Aligned Skill Map** — table of all skills with path, boundary, artifact produced
2. **Pipeline diagram** — ASCII flow showing Human Input → AI/Skills → Code → Output
3. **Active Skills by layer** — four tables (Human Input, AI/Skills, Code, Config)
4. **Unskilled Modules** — table of codebase modules that still need skills
5. **How to Add a New Skill** — instructions
6. **Sync workflow** — how to keep skills aligned with code changes

---

## Phase 4: Define Human / AI Separation

For each boundary, explicitly state:

### Human Input Boundary

- **Human owns:** creation, curation, editing of input files
- **AI may:** read, analyze, fetch from external sources, suggest edits
- **AI may NOT:** silently overwrite human-authored content without confirmation
- **Handoff:** AI reads human inputs, produces config artifacts

### AI / Skills Boundary

- **AI owns:** pipeline orchestration, decision-making, content generation, archetype selection
- **Human may:** override AI decisions by editing the produced config artifacts
- **AI may NOT:** make irreversible changes to production data without human review
- **Handoff:** AI writes to `content/` or config files; human edits same files via CMS or direct edit

### Code Boundary

- **Code owns:** deterministic generation, rendering, validation, API routes
- **AI may:** edit source code when implementing features or fixing bugs (with human oversight)
- **Human may:** read, review, edit source code
- **Handoff:** Code reads config artifacts and human inputs, produces rendered output or API responses

### Config Boundary

- **Human owns:** environment variables, build settings, deployment config
- **AI may:** suggest config changes, generate dimension specs, modify `next.config.ts`
- **AI may NOT:** modify `.env.local` with real secrets; use `.env.local.example` for documentation
- **Handoff:** Config is loaded at startup/build time; code enforces required vars

---

## Phase 5: Write the Skills

For each skill defined in Phase 3, write the full `SKILL.md` following the template in 3b.

Quality checks for each skill:
- [ ] Has YAML frontmatter with `name` and `description`
- [ ] States its boundary and input/output artifacts prominently
- [ ] Contains the artifact contract (TypeScript interface or JSON schema)
- [ ] Lists core files with responsibilities
- [ ] Provides step-by-step workflow or usage instructions
- [ ] Lists related skills with relationship descriptions
- [ ] Does not contain source code (skills are documentation-only, MD/YAML/JSON)

---

## Phase 6: Update Project Documentation

Update the following files:

### `README.md`

Add or update a section:

```markdown
### Architectural Boundaries

<Table of four boundaries with ownership and handoff>

#### Generation flow

<ASCII diagram>

1. **Human Input** — <bullet list of what humans own>
2. **AI / Skills** — <bullet list of what AI owns>
3. **Code** — <bullet list of what code owns>
4. **Config** — <bullet list of what config owns>
```

Update the "Generator skills for AI agents" section to reflect the new skill hierarchy.

### `skills/SKILL_SYNC.md`

Replace with the new Architecture-Aligned Skill Map, pipeline diagram, layer tables, and
unskilled modules list.

---

## Phase 7: Verify Consistency

Run these checks:

1. **Every major module has a skill.** No module from Phase 2 is missing a skill.
2. **Every skill has a boundary.** No skill lacks a stated boundary.
3. **Every skill has an artifact contract.** No skill lacks a clear input or output.
4. **Orchestrator references all sub-skills.** No sub-skill is orphaned.
5. **No circular references in related-skills sections.** A → B → A is acceptable if roles
   are distinct, but avoid A → A.
6. **README and SKILL_SYNC.md are consistent.** Skill names, paths, and descriptions match.
7. **Legacy skills are prefixed.** Any skill covering old/deprecated functionality is named
   `legacy-<name>`.

---

## Output Checklist

When complete, the following must exist:

- [ ] `skills/<orchestrator>/SKILL.md` — top-level orchestrator
- [ ] `skills/<module-1>/SKILL.md` through `skills/<module-n>/SKILL.md` — one per major module
- [ ] `skills/SKILL_SYNC.md` — architecture-aligned skill map, pipeline diagram, layer tables
- [ ] `README.md` — architectural boundaries section, updated skill tables
- [ ] All skills have YAML frontmatter, boundary, artifact contracts, core files, workflow, related skills
- [ ] Legacy skills renamed with `legacy-` prefix
- [ ] Human/AI separation documented for each boundary

---

## Example: Applying This Prompt

Given a codebase with:
- `src/sequencer/` (rule-based generator)
- `src/renderer/` (React renderer)
- `lib/ai/pipeline.ts` (LLM pipeline)
- `content/specs/` (human-editable theme specs)
- `skills/agent/` (old monolithic skill)

This prompt would produce:
- `skills/<project>-generator/SKILL.md` — orchestrator
- `skills/sequencer/SKILL.md` — Code boundary, input: `AssembleOptions`, output: `SiteConfig`
- `skills/renderer/SKILL.md` — Code boundary, input: `SiteConfig`, output: React DOM
- `skills/layout-selector/SKILL.md` — AI/Skills boundary, input: `BusinessProfile`, output: `LayoutOutput`
- `skills/theme-specs/SKILL.md` — Human Input boundary, input: human-authored JSON, output: validated theme config
- `skills/legacy-agent/SKILL.md` — old monolithic skill renamed
- Updated `skills/SKILL_SYNC.md` and `README.md`

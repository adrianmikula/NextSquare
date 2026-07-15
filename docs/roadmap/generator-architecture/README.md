# Generator Architecture: Implementation Roadmap

**Filed:** 2026-07-14
**Status:** Roadmap / Planning
**Target:** 80-90% on market uniqueness spectrum (vs current ~40%)
**Architecture basis:** VULK genes + Taste Engine tuners + Soltana design languages + Ticonderoga agents + Design Guard validation + json-render rendering

## Library vs. Build Decision

| Capability | Approach | Why |
|---|---|---|---|
| **Renderer** (JSON → UI) | **Install** `@json-render/core` + `@json-render/react` | 661K weekly downloads, v0.19.0, Apache-2.0. Schema, catalog, AI prompts, streaming, multi-platform renderers. |
| **Tuners** (continuous design dimensions) | **Install** `taste-engine` | MIT, React provider (`TasteProvider`, `useTaste`, `useTuners`), context-aware recipes, 5 built-in tuners, MCP server. |
| **Design language archetypes** (relief/finish) | **Install** `soltana-ui` + `@soltana-ui/react` | MIT, 3-tier orthogonal model (Theme × Relief × Finish). `flat`, `glassmorphic`, `skeuomorphic`, `neumorphic` reliefs. React bindings, token compiler. |
| **Shape/geometry system** (corner curves) | **Install** `@lisse/react` | MIT, 4 corner curves (squircle, superellipse, clothoid, arc). Figma's algorithm. ~1.5µs per path. |
| **Decorative patterns** (backgrounds, dividers) | **Install** `useinkjet` | MIT, 500 generative SVG patterns across 24 categories. Zero deps. React export. |
| **Validation** (anti-slop rules) | **Install** `@design-guard/core` | MIT, 18 lint rules across 7 categories, DTCG token converter, DESIGN.md scorer. |
| **Gene library** (block variants) | **Build** (VULK-inspired) | No library exists for this — each project's component library is unique. Register genes as json-render components. |
| **Sequencing** (page assembly) | **Build** (VULK-inspired) | No library for industry-aware section sequencing. Custom algorithm using VULK's documented patterns. |
| **Agent competition** (generation) | **Wrap** (Ticonderoga app via skill) | Ticonderoga is a standalone app with a documented CLI/API. `skills/ticonderoga/` wraps it as bash scripts — no reimplementation needed. |
| **Content generation** | **Build** (AI orchestration) | Plug in any AI provider (OpenAI, Claude, Gemini). No library wraps this in a site-generation context. |
| **Cross-site uniqueness guard** | **Build** | Lightweight fingerprint comparison against previously generated sites. No library exists for this. |

## Guiding Principles

1. **We wrap tools and write glue.** Taste Engine handles tuners. json-render handles rendering. Design Guard handles validation. Ticonderoga handles agent competition. We write the parts that connect them: the gene library, the sequencer, and the content layer — plus bash scripts that invoke existing tools.
2. **Complete separation from old code.** New architecture lives in its own directory tree. No shared components, no shared CSS, no shared skills. Old system is preserved as-is until new system is verified.
3. **Document old code before removing.** `docs/techdebt/` catalogs what the old system did and why it was replaced. When the new system is stable, old code is removed in a single cleanup pass.
4. **New skills live in `skills/` alongside old skills.** Each new skill has its own subdirectory. Old skills (`theme-dimensions/`, `theme-uniqueness/`, `website-builder/`) remain untouched until retirement.
5. **JSON as the intermediate format.** The generator produces a json-render spec (extended with gene and tuner metadata). The renderer is just `@json-render/react` with our gene components registered.
6. **Continuous over discrete.** Taste Engine tuners replace bundles. Infinite intermediate states instead of 3 fixed variants.
7. **Quality gate at every phase.** `@design-guard/core` validates output after generation to catch anti-patterns before they ship.

## Control Surface & Iteration Model

The generation process is **agent-guided**, not runtime-tweaked. The primary loop:

1. Agent (LLM or human) writes/edits a `SiteConfig` JSON
2. Restart or hot-reload the Next.js dev server to preview
3. Inspect result via `/preview` route
4. Return to step 1 — edit JSON, regenerate, repeat

The running Next.js app is a **static viewer** — it renders a SiteConfig faithfully but provides no runtime design controls. All iteration happens at the JSON level, driven by the agent.

### Future iteration modes (post-MVP)

| Mode | When | How |
|------|------|-----|
| **LLM-powered refinement** | Later phase | Agent calls generation API with natural-language tweaks ("make it warmer, denser layout") → sequencer produces new SiteConfig |
| **Interactive dev panel** | Later phase | Floating panel on `/preview` with sliders (tuners), picks (relief/finish/shape), and per-section variant dropdowns. Changes emit updated SiteConfig JSON, not live DOM mutations. |
| **Snapshot history** | Phase 5 | Each generation is saved as a named snapshot. Browse history, compare side-by-side, fork from any point. |

This keeps the MVP focused: get the rendering stack and JSON format right first. The interactive control surface is added once the generation pipeline is producing consistently good output.

## Directory Layout

```
src/
  archetypes/                 # Design language archetypes (Soltana wrapper)
    index.ts                  # Archetype → Relief/Finish mapping
    constraints.ts            # Industry → valid archetypes, tuner ranges
    tokens.ts                 # Archetype-specific CSS token overrides
  generator/
    sequencer/                # VULK-inspired section sequencing (custom)
    content/                  # AI content generation (custom)
  genes/                      # VULK-inspired component library (custom)
    hero/
    features/
    testimonials/
    cta/
    ...
  renderer/                   # Thin: configures json-render + Taste Engine + Soltana
    registry.ts               # Wraps json-render defineRegistry with gene catalog
    compile-tuners.ts         # Taste Engine tuners → CSS vars bridge
    site-page.tsx             # <TasteProvider> + <SoltanaProvider> + json-render <Renderer>
    gene-viewer.tsx           # Dev utility to preview isolated genes
  schema/                     # Thin: wraps json-render schema
    site-config.ts            # SiteConfig type with archetype + tuner + spec
    gene-types.ts             # Gene variant type definitions
  validation/                 # Thin: configures @design-guard/core
    index.ts                  # Wraps design guard with tuner-aware thresholds
    rules.ts                  # Additional custom rules beyond the 18 built-in
    uniqueness.ts             # Cross-site fingerprint comparison
skills/
  agent/                      # Agent workflow — guides the AI through the generation loop
  generator/                  # Full generation pipeline skill
  gene-designer/              # Creating new gene variants
  tuner-system/               # Configuring taste-engine tuners
  sequencer/                  # Configuring sequencing rules
  ticonderoga/                # Wraps Ticonderoga app (clone → deconstruct → generate → evolve)
dependencies:
  @json-render/core           # Schema, catalog, AI prompts
  @json-render/react          # React renderer, contexts, hooks
  @json-render/next           # Next.js renderer (full app output)
  taste-engine                # Tuner system, TasteProvider, useTuners
  soltana-ui                  # Core CSS framework (design language archetypes)
  @soltana-ui/react           # React bindings: useSoltana(), SoltanaProvider
  @soltana-ui/tokens          # Token compiler → DTCG JSON
  @lisse/react                # Corner curves: squircle, superellipse, clothoid
  useinkjet                   # 500 generative SVG patterns
  @design-guard/core          # Validation engine, 18 lint rules
vendored/                     # Cloned standalone tools (gitignored)
  .ticonderoga/               # Ticonderoga repo (managed by skills/ticonderoga/resources/setup.sh)
```

## Phases (MVP-First Ordering)

Phases are ordered to produce a **visible working page as early as possible**. Phases 0-3 produce the core rendering stack: by the end of Phase 3, you can hand-write a `SiteConfig` JSON and see a fully rendered page with design language + tuners. Phases 4+ add the automation layers.

---

### Phase 0: Foundation — Dependencies, Schema, Skills, Archetype Stubs

**Goal:** Install libraries, establish data model, create tooling scaffolds, stub the archetype system.

#### Deliverables

**Install dependencies**
```json
{
  "dependencies": {
    "@json-render/core": "^0.19.0",
    "@json-render/react": "^0.19.0",
    "@json-render/next": "^0.19.0",
    "taste-engine": "^0.5.0",
    "soltana-ui": "^1.0.0",
    "@soltana-ui/react": "^1.0.0",
    "@soltana-ui/tokens": "^1.0.0",
    "@lisse/react": "^0.5.0",
    "useinkjet": "^1.0.0",
    "@design-guard/core": "^0.3.1"
  }
}
```

**Configure json-render** (`src/renderer/registry.ts`)
- Define gene catalog using `defineCatalog()` from `@json-render/core`
- Register gene components using `defineRegistry()` from `@json-render/react`
- Pattern:
  ```typescript
  import { defineCatalog } from "@json-render/core"
  import { schema } from "@json-render/react/schema"
  import { defineRegistry, Renderer } from "@json-render/react"

  const catalog = defineCatalog(schema, {
    components: {
      Hero: heroComponentDefinition,
      Features: featuresComponentDefinition,
      Cta: ctaComponentDefinition,
    },
    actions: {},
  })

  const { registry } = defineRegistry(catalog, {
    components: {
      Hero: HeroCentered,
      Features: FeaturesGrid,
      Cta: CtaSimple,
    },
  })
  ```

**SiteConfig schema** (`src/schema/site-config.ts`)
- Wraps json-render's `NextAppSpec` with gene metadata, tuner profiles, and design language
- Top-level extends json-render's spec format:
  ```typescript
  interface SiteConfig {
    meta: { name: string; industry: string; tone: string }
    designLanguage: {
      relief: "flat" | "glassmorphic" | "skeuomorphic" | "neumorphic"
      finish: "matte" | "frosted" | "tinted" | "glossy"
      shape: "arc" | "squircle" | "superellipse" | "clothoid"
    }
    tuners: Record<string, number>         // passed to taste-engine
    spec: NextAppSpec                       // native json-render spec
    content: Record<string, string>          // headlines, copy per section
  }
  ```

**Archetype system stubs** (`src/archetypes/`)
- `index.ts` — maps `designLanguage.relief` → Soltana `data-relief` attribute + imports
- `constraints.ts` — valid relief/finish combos per industry (start with all combos allowed; constrain later)
- `tokens.ts` — per-archetype CSS token overrides (shape radius via @lisse, patterns via inkjet)

**New skills created** (`skills/`)
- `skills/generator/SKILL.md` — Orchestrating the full generation pipeline
- `skills/gene-designer/SKILL.md` — Creating new gene variants as json-render components
- `skills/tuner-system/SKILL.md` — Configuring taste-engine tuners and profiles
- `skills/sequencer/SKILL.md` — Configuring industry profiles and section templates

**Document old system** (`docs/techdebt/`)
- `docs/techdebt/old-architecture-index.md` — Maps every old file to its purpose for safe removal

#### Success criteria
- `npm install` succeeds with all 9 new dependencies
- json-render catalog compiles with at least one stub gene component
- Taste Engine standalone check: `npx taste-engine-mcp` starts
- Soltana imports + data-relief switching works
- Design Guard core imports successfully
- All 4 new skills written and reviewed
- `npm run typecheck` passes
- No new code imports from old `app/`, `components/`, or `lib/`

#### Estimated effort: 2-3 days

#### Dependencies: None (greenfield)

---

### Phase 1: Gene Library — Minimal Viable (3 types × 2-3 variants)

**Goal:** Build just enough block types to construct a testable page. 3 sections, 2-3 variants each.

#### Deliverables

**First gene categories** (`src/genes/`)
- **Hero** (3 variants): centered, split, minimal
- **Features** (2-3 variants): grid, alternating
- **CTA** (2 variants): simple, split

Each gene:
- Is a standalone React component (RSC-compatible)
- Registered in json-render's catalog with typed props and schema
- Reads Soltana archetype tokens from context (`useSoltana()`)
- Consumes taste-engine tuners via `useTuners()` context
- Has its own layout logic and responsive behavior

**Gene component definition format:**
```typescript
import { createComponentDefinition } from "@json-render/core"

const HeroCentered = createComponentDefinition({
  name: "HeroCentered",
  props: {
    headline: { type: "string", required: true },
    subheadline: { type: "string" },
    ctaLabel: { type: "string" },
    ctaLink: { type: "string" },
    image: { type: "string" },
  },
  tuners: ["warmth", "density", "motion", "depth"],
})
```

**json-render spec for a generated page:**
```typescript
const spec = {
  root: "page",
  elements: {
    page: {
      type: "Container",
      props: {},
      children: ["hero-1", "features-1", "cta-1"],
    },
    "hero-1": {
      type: "HeroCentered",
      props: {
        headline: "Fresh Coffee, Great Vibes",
        subheadline: "Handcrafted coffee in Melbourne",
        ctaLabel: "View Menu",
      },
      children: [],
    },
    "features-1": {
      type: "FeaturesGrid",
      props: { /* ... */ },
      children: [],
    },
  },
}
```

#### Success criteria
- 7-8 gene variants render correctly via `@json-render/react`'s `<Renderer>`
- Each variant consumes `useSoltana()` and `useTuners()`
- `npm run typecheck` passes
- No imports from old `components/`, `app/`, or `lib/`

#### Estimated effort: 3-4 days (reduced from 5-7 — only 8 variants needed for MVP)

#### Dependencies: Phase 0 (dependencies, registry pattern, archetype stubs)

---

### Phase 2: Tuner System + Soltana Archetypes (Merged)

**Goal:** Wire Taste Engine tuners AND Soltana design language archetypes into the rendering pipeline. Make genes respond to both continuous tuners and discrete design language switches.

#### Deliverables

**Taste Engine integration** (`src/renderer/`)
- Wrap generator output in `<TasteProvider>` with tuner values from SiteConfig
- Genes read tuners via `useTuners()` hook
- Define tuner profiles (named presets like "Warm & Spacious")

**Soltana integration** (`src/renderer/site-page.tsx`)
- Wrap page in `<SoltanaProvider>` with `relief` + `finish` from SiteConfig
- Apply `data-relief` and `data-finish` attributes at page root
- Bridge Soltana tokens → CSS vars for gene consumption

**Initial tuner set** (start with 5 essential; add 3 custom later):
| Tuner | 0.0 end | 1.0 end | Effect |
|-------|---------|---------|--------|
| `warmth` | Cool blue-gray | Warm amber | HSL shift on accent colors |
| `density` | Sparse padding | Dense compact | Spacing scale |
| `motion` | Static | Cinematic | Animation durations |
| `contrast` | Soft | Sharp | Border/text weight delta |
| `narrative` | Minimal hero | Expansive hero | Hero height |

**Tuner → CSS var bridge** (`src/renderer/compile-tuners.ts`)
- Reads taste-engine theme tokens → produces CSS custom properties
- Merges with Soltana's token system (Soltana handles surface/shadow tokens, we handle tuner-specific tokens)

**Shape/geometry system** (`src/renderer/compile-shape.ts`)
- Maps `designLanguage.shape` → @lisse curve type
- Generates per-section corner radius tokens
- Uses inkjet patterns for decorative backgrounds based on relief archetype

**Archetype → industry constraints** (`src/archetypes/constraints.ts`)
- Initial constraints: all relief/finish combos allowed for all industries
- Later phases tighten this based on testing

#### Success criteria
- Switching `data-relief` between `flat` / `glassmorphic` / `skeuomorphic` / `neumorphic` produces visibly different surfaces
- Switching `data-finish` between `matte` / `frosted` / `tinted` / `glossy` changes surface treatment
- 5 tuners produce visibly different output at 0.0 vs 1.0
- @lisse curve types produce visibly different corners
- No imports from old `lib/dimensions/` or `content/dimensions/`

#### Estimated effort: 2-3 days (Soltana integration is straightforward — data-attribute API)

#### Dependencies: Phase 1 (genes exist to tune and archetype)

---

### Phase 3: Renderer — json-render + Taste Engine + Soltana (MVP)

**Goal:** Wire everything together into a renderer stack. Hand-write a SiteConfig JSON and see a real rendered page. **This is the MVP.**

#### Deliverables

**Page renderer** (`src/renderer/site-page.tsx`)
- Wraps `<SoltanaProvider>` (archetype) → `<TasteProvider>` (tuners) → json-render `<Renderer>` (genes)
- Pattern:
  ```tsx
  import { SoltanaProvider } from "@soltana-ui/react"
  import { TasteProvider } from "taste-engine/react"
  import { Renderer } from "@json-render/react"

  export function SitePage({ config }: { config: SiteConfig }) {
    return (
      <SoltanaProvider relief={config.designLanguage.relief} finish={config.designLanguage.finish}>
        <TasteProvider defaultTuners={config.tuners}>
          <Renderer spec={config.spec} registry={registry} />
        </TasteProvider>
      </SoltanaProvider>
    )
  }
  ```
- Shape tokens injected as CSS vars from `compile-shape.ts`

**Standalone HTML export**
- `SiteConfig` → self-contained HTML file
- Inlined Taste Engine tuners as CSS vars
- Inlined Soltana tokens as CSS vars
- No external dependencies at runtime

**Preview route** (`/preview?config=...`)
- Dev-only tool for verifying SiteConfig output
- Accepts a config filename (`/preview?config=cafe.json`) via query param
- Renders via the same `SitePage` component
- Includes a minimal toolbar showing current config name, relief/finish/shape, and quick-relief-switch buttons for visual comparison
- Hot-reload on JSON file changes during development
- Does NOT include tuner sliders, section variant pickers, or other runtime design controls — those are post-MVP

**Manual test:**
```
1. Write src/test-configs/cafe.json  (hand-authored SiteConfig)
2. Visit /preview  → see rendered page
3. Edit cafe.json  → hot-reload shows updated page
4. Visit /preview?config=saas-glass.json  → different industry, different archetype
```

#### Success criteria
- Renderer produces valid HTML from any valid SiteConfig
- Soltana archetype switching changes visual surface treatment (via quick-switch buttons)
- Taste Engine tuners modulate gene appearance
- @lisse corners render correctly per section
- Standalone export opens with zero errors
- Preview route works with hot-reload
- No imports from old `components/`, `app/`, `pages/`, or `lib/`

**MVP achieved** — the system can produce visually distinct pages from structured input. The agent iterates by editing SiteConfig JSON, not by manipulating runtime controls.

#### Estimated effort: 2-3 days (integration wiring, preview route, export)

#### Dependencies: Phase 1 (genes), Phase 2 (tuners + Soltana)

---

### Phase 4: Sequencing Engine — Page Assembly

**Goal:** Build the algorithm that selects, orders, and paces sections. Outputs a json-render spec. This is the first automation layer — replaces hand-written SiteConfig.

#### Deliverables

**Industry profiles** (`src/generator/sequencer/industry-profiles.ts`)
- 20+ industry patterns (cafe, restaurant, saas, portfolio, ecommerce, etc.)
- Each profile defines preferred gene categories, section template, default tuner profile, archetype, and content tone guidance

**Section templates** (`src/generator/sequencer/section-templates.ts`)
- 12 predefined page rhythm patterns (Storyteller, Showcase, Minimal, Data-heavy, etc.)
- Each defines 5-8 section slots with expected gene categories

**Pacing engine** (`src/generator/sequencer/pacing.ts`)
- Ensures visual variety: no same-category adjacent, at least 3 layout patterns, break up text sections
- CTA appears at least once above the fold

**Assembler** (`src/generator/sequencer/assemble.ts`)
- Takes industry + tone → applies profile → selects template → fills slots → applies pacing → produces complete SiteConfig
- Each section output has gene type, variant, content binding, tuner overrides, and shape token

#### Success criteria
- Assembler produces valid SiteConfig JSON for all 20+ industry profiles
- Pacing engine catches violations
- Each industry produces a visibly different page structure
- Output feeds directly into Phase 3's renderer
- Deterministic: same input = same output

#### Estimated effort: 4-5 days

#### Dependencies: Phase 3 (renderer to validate output)

---

### Phase 5: Generator Engine — Ticonderoga Integration + Snapshot History

**Goal:** Wire the Ticonderoga skill into the generation pipeline. No agent competition code to write — the skill invokes Ticonderoga's existing deconstruct → generate → evolve loop. Add snapshot history for managing multiple generations.

#### Deliverables

**Ticonderoga skill** (`skills/ticonderoga/SKILL.md`) — already created in Phase 0:
- `resources/setup.sh` — clones repo, installs bun deps, installs Playwright
- `resources/deconstruct.sh <url>` — extracts TasteGraph JSON from a URL
- `resources/generate.sh <tastegraph.json>` — 3 specialist agents produce competing pages
- `resources/evolve.sh <winner.html> <tastegraph.json>` — updates TasteGraph with winner's preferences
- `resources/serve.sh` — starts Ticonderoga's Hono backend + Vite frontend for manual use

**Generator → Ticonderoga bridge** (`src/generator/ticonderoga.ts`)
- Converts our sequencer output (gene list + tuner profile) into a TasteGraph-compatible JSON
- Invokes `bash skills/ticonderoga/resources/generate.sh` with the TasteGraph
- Parses the 3 generated HTML variants back into our pipeline
- Reverse-maps winning variant's design tokens back to our tuner profile

**Generator CLI** (`src/generator/cli/`)
- `npx templatecafe generate "cafe in melbourne, warm feel"`
- Runs: parse → industry detect → sequence → Ticonderoga competition → map winner → tune → render → export
- Agent-facing — the CLI is designed to be called by an LLM agent or CI script, not by end users

**Generator API** (`src/generator/api/`)
- `POST /api/generate` with `{ prompt, industry?, tone? }`
- Returns `{ siteConfig: SiteConfig, previewUrl: string }`

**Snapshot history** (`src/generator/snapshots/`)
- Each generation persists as a named snapshot: `{ id, timestamp, prompt, siteConfig, fingerprint }`
- Snapshots stored as JSON files in `content/generator-snapshots/` (gitignored)
- `GET /api/snapshots` — list all snapshots with metadata
- `GET /api/snapshots/:id` — retrieve a specific snapshot
- `POST /api/snapshots` — save current SiteConfig as a new snapshot
- Fingerprint computed from `hash(gene sequence, tuner vector rounded to 0.1, designLanguage)` for uniqueness comparison
- CLI: `npx templatecafe list` shows history, `npx templatecafe fork <id>` starts a new generation from a snapshot

#### Success criteria
- Ticonderoga skill setup completes (clone, install, Playwright)
- 3 agents produce visibly different pages from the same TasteGraph
- Bridge correctly converts sequencer output → TasteGraph → back to tuner profile
- CLI produces a complete SiteConfig from a text prompt
- Snapshots persist across server restarts
- History listing and forking works via CLI and API

#### Estimated effort: 4-5 days (industry profiles) + 2-3 days (snapshots)

#### Dependencies: Phase 3 (renderer to validate output)

---

### Phase 5b: Interactive Dev Panel (Post-MVP)

**Goal:** Add runtime design controls to `/preview` — tuner sliders, archetype pickers, per-section variant swapping. This is the first phase where the running app is used for design iteration rather than just passive previewing.

#### Deliverables

**Dev panel overlay** (`/preview` with `?panel=true`)
- Floating panel toggled by a `?panel=true` query param or a keyboard shortcut
- **Tuner sliders**: 5 range sliders (warmth, density, motion, contrast, narrative) — adjustable from 0.0 to 1.0
- **Archetype pickers**: relief dropdown (flat/glassmorphic/skeuomorphic/neumorphic), finish dropdown (matte/frosted/tinted/glossy), shape dropdown (arc/squircle/superellipse/clothoid)
- **Config output**: "Copy config" button that serializes current state to a SiteConfig JSON (for pasting back into a file or saving as a snapshot)
- Does NOT mutate the DOM directly — all controls update the SiteConfig object and re-render through the normal React tree

**Per-section variant swapping** (gene picker)
- Each rendered section shows a small "swap" button (visible with `?panel=true`)
- Clicking opens a dropdown of all variants in the same gene category
- Swapping replaces the element's `type` and adjusts `props` to match the new variant's schema
- Works within the existing tuner context — doesn't require regeneration

**Snapshot save from panel**
- "Save snapshot" button captures current state (including any swapped sections) to the snapshot store

#### Success criteria
- 5 tuner sliders produce visible visual change on the preview
- All 4 reliefs, 4 finishes, 4 shapes selectable from pickers
- Section swap dropdown shows correct variants for each gene category
- Config export produces valid SiteConfig JSON
- Saved snapshots appear in history listing
- Panel is not visible by default (opt-in via `?panel=true`)

#### Estimated effort: 3-4 days

#### Dependencies: Phase 3 (renderer + preview route), Phase 5 (snapshot system)

---

### Phase 6: Content Generation & Image Resolution

**Goal:** Generate unique content per site. Resolve images from Unsplash or AI.

#### Deliverables

**AI content generators** (`src/generator/content/generators.ts`)
- Plugin architecture supporting OpenAI, Claude, Gemini
- Generates per-section content fitting json-render's prop schema
- Fallback template content when AI unavailable

**Image resolver** (`src/generator/content/images.ts`)
- 100+ curated Unsplash photos mapped to industries and gene categories
- Hero, feature, and CTA images with industry relevance

**Content coherence**
- Generated content maintains consistent tone across all json-render element props
- Tone derived from industry + Taste Engine tuners + design language archetype

#### Success criteria
- Unique content per generation
- Coherent tone across all sections
- Relevant images resolved per section
- Fallback content clearly marked

#### Estimated effort: 3-4 days

#### Dependencies: Phase 5 (generator needs content pipeline)

---

### Phase 7: Validation — Design Guard + Cross-Site Uniqueness

**Goal:** Add quality gates using `@design-guard/core` + cross-site uniqueness checking.

#### Deliverables

**Design Guard wrapper** (`src/validation/index.ts`)
- Configure `@design-guard/core`'s `validateOutput()` with our SiteConfig schema
- Takes rendered HTML + SiteConfig → returns `ValidationReport`
- Report: `{ score: 0-100, failures: [], warnings: [] }`
- Score threshold: < 70 fails generation, 70-79 warns, 80+ passes

**Design Guard's 18 built-in rules** used directly:
- Genericness: default fonts, gradient detection, 3-equal-cards
- Typography: font pairing, hierarchy
- Color: contrast, pure black/white detection
- Spacing: padding, consistency
- Layout: section adjacency, missing CTA
- Content: placeholder text, repetitive headlines
- Responsive: mobile breakpoints

**Tuner-aware threshold configuration**
- Some rules adapt via Design Guard's config API:
  - Low contrast mode (`contrast < 0.3`): relax contrast minimum
  - Glassmorphic relief: relax shadow/elevation rules

**Cross-site uniqueness guard** (`src/validation/uniqueness.ts`)
- Fingerprint: `hash(gene sequence, tuner vector rounded to 0.1, designLanguage, layoutArchitecture)`
- Compare against N most recent generations' fingerprints
- If similarity > 70%, force: change variant in 2+ sections, shift 2+ tuners by ≥0.2, or switch archetype

**Auto-fix suggestions**
- Feed failures back to generator for automatic regeneration with adjusted parameters

#### Success criteria
- Design Guard catches all 18 described anti-patterns
- Tuner-aware thresholds produce no false positives
- Cross-site guard prevents near-duplicate generations
- Validation adds < 500ms to generation time

#### Estimated effort: 2 days

#### Dependencies: Phase 3 (HTML output to validate), Phase 5 (SiteConfig to validate)

---

### Phase 8: Gene Library Expansion — Full Catalog

**Goal:** Expand to 80+ gene variants (VULK-like breadth) across 15 categories.

#### Deliverables

| Category | Variants | Prio | Source |
|----------|----------|------|--------|
| Hero | 8 | Phase 1 | Build |
| Features | 6 | Phase 1 | Build |
| Testimonials | 6 | Medium | Build or DAUB blocks |
| CTA | 6 | Phase 1 | Build |
| Navigation | 8 | High | Build + Soltana nav components |
| Pricing | 6 | High | Build |
| Gallery | 6 | High | Build |
| Stats / Counters | 6 | Medium | Build |
| Footer | 8 | Medium | Build + Soltana |
| FAQ | 4 | Medium | Build |
| Team | 4 | Low | Build |
| Forms / Contact | 4 | Low | Build + Soltana |
| Content / Rich text | 6 | Low | Build |
| Banner / Announcement | 4 | Low | Build |
| Divider / Spacer | 4 | Low | inkjet patterns |

Each new gene registered in json-render's catalog with typed schema, tuner bindings, and Soltana archetype awareness.

**Gene creation skill** (`skills/gene-designer/SKILL.md`)
- Step-by-step for creating a new gene variant as a json-render component
- Template files, testing, validation checklist

#### Success criteria
- 80+ gene variants across 15 categories
- Each registered in json-render catalog with typed schema
- All pass Design Guard validation
- Gene creation skill tested end-to-end

#### Estimated effort: 10-14 days (parallelizable)

#### Dependencies: Phase 1 (pattern established), Phase 7 (validation rules)

---

### Phase 9: Migration & Old System Retirement

**Goal:** Verify new system works, remove all old architecture code in one cleanup pass.

#### Deliverables

**Side-by-side comparison** (`docs/techdebt/new-vs-old-comparison.md`)
- Generate same brief with both systems
- Compare: uniqueness score, visual distinctiveness, generation speed, code size

**Retirement checklist** (from `docs/techdebt/old-architecture-index.md`):
1. [ ] New system generates sites for all 20+ industry profiles
2. [ ] New system passes Design Guard (score ≥ 80) for all profiles
3. [ ] Cross-site uniqueness guard confirms no duplicates
4. [ ] Side-by-side comparison documented
5. [ ] Old architecture fully cataloged
6. [ ] No old imports remain in new code
7. [ ] All team members trained on new skills
8. [ ] Backup of old code exists (git tag)
9. [ ] Run `git rm` on all old files in a single commit
10. [ ] Update README, CONTRIBUTING, root docs

#### Files to remove from old system:
- `app/`, `components/`, `lib/` directories
- `content/dimensions/` (spec files)
- `skills/theme-dimensions/`, `skills/theme-uniqueness/`, `skills/website-builder/`
- `lib/dimensions/` (compiler)
- `app/globals.css`, `next.config.ts` (old config)
- Old `package.json` dependencies (square, cart-related, etc.)

#### Estimated effort: 2-3 days

#### Dependencies: All phases 0-8 complete and verified

---

## Timeline Overview

| Phase | Description | Effort | MVP-critical? | Libraries used |
|-------|-------------|--------|---------------|----------------|
| 0 | Foundation | 2-3 days | Yes | 9 npm packages installed |
| 1 | Minimal gene library (8 variants) | **3-4 days** | Yes | json-render registration |
| 2 | Tuner system + Soltana archetypes | **2-3 days** | Yes | taste-engine, soltana-ui, @lisse, inkjet |
| 3 | Renderer — **first visible output (MVP)** | **2-3 days** | Yes | json-render, taste-engine, soltana-ui |
| 4 | Sequencing engine | 4-5 days | No | Custom (VULK-inspired) |
| 5 | Generator + Ticonderoga + Snapshots | 4-6 days | No | Ticonderoga skill |
| 5b | Interactive dev panel (sliders, section swap) | 3-4 days | No | json-render, taste-engine |
| 6 | Content generation | 3-4 days | No | AI APIs |
| 7 | Validation + uniqueness guard | 2 days | No | @design-guard/core |
| 8 | Gene library expansion (80+) | 10-14 days | No | json-render registration |
| 9 | Migration & retirement | 2-3 days | No | — |

**MVP in 9-13 days** (Phases 0-3). Core system in ~35-49 days (Phases 0-5). Full system in ~51-70 days (Phases 0-9).

**Incremental testing:** At the end of Phase 3, hand-write a SiteConfig JSON and see a real page via `/preview`. After Phase 4, the sequencer produces that JSON automatically. After Phase 5, a text prompt drives it all through the CLI/API, and each generation is saved as a browsable snapshot.

## Dependency Map

```
npm install @json-render/core @json-render/react @json-render/next taste-engine soltana-ui @soltana-ui/react @soltana-ui/tokens @lisse/react useinkjet @design-guard/core
```

```
@json-render/{core,react,next}
  ├── Schema & catalog for gene definitions
  ├── Component registry (maps gene name → React component)
  ├── AI prompt generation (from catalog)
  ├── <Renderer spec={} registry={} /> — renders a spec
  └── <NextApp spec={} /> — renders a full multi-page app

taste-engine
  ├── <TasteProvider tuners={} /> — context provider
  ├── useTuners() — read/write tuner values in genes
  ├── useTaste() — access theme context, recipes
  └── Tuner profiles (named presets)

soltana-ui + @soltana-ui/react
  ├── <SoltanaProvider relief="" finish="" />
  ├── useSoltana() — access current archetype
  ├── data-relief / data-finish CSS attribute system
  └── 4 reliefs × 4 finishes × 4 themes = 64 base combos

@lisse/react
  ├── <SmoothCorners corners={{ radius, smoothing }} />
  └── 4 curve types: arc, squircle, superellipse, clothoid

useinkjet
  ├── exportPattern({ pattern }, "react") → React component
  └── 500 patterns across 24 categories

@design-guard/core
  ├── validateOutput(html, designMd) — 18-rule validation
  ├── scoreDesignMd(schema) — design quality scoring
  └── designMdToDTCG(tokens) — W3C DTCG token export
```

## New Skills Index

| Skill | Purpose | Uses |
|-------|---------|------|
| `skills/agent/SKILL.md` | Agent workflow — guides the AI through the generation loop (interpret brief → write config → preview → iterate → verify uniqueness) | `theme-uniqueness` for verification, all generator libraries |
| `skills/generator/SKILL.md` | Full pipeline orchestration + snapshot management | All libraries + wrapped tools |
| `skills/gene-designer/SKILL.md` | Creating gene components as json-render components | `@json-render/core` catalog |
| `skills/tuner-system/SKILL.md` | Configuring taste-engine tuner profiles | `taste-engine` |
| `skills/sequencer/SKILL.md` | Industry + pacing rules | Custom (VULK pattern) |
| `skills/ticonderoga/SKILL.md` | Wrapping the Ticonderoga app (setup, deconstruct, generate, evolve, serve) | Vendored app at `.ticonderoga/` |

## Old Architecture Index (`docs/techdebt/`)

| Document | Content | Status |
|----------|---------|--------|
| `docs/techdebt/old-architecture-index.md` | Complete file inventory of old system | Phase 0 |
| `docs/techdebt/visual-uniqueness-gap.md` | Root causes of old system's uniqueness failure | Existing |
| `docs/techdebt/theme-rigidity.md` | Hardcoded value fixes in old system | Existing |
| `docs/techdebt/theme-freedom-spectrum.md` | Market positioning of old system | Existing |
| `docs/techdebt/alternative-architecture.md` | Research and design for new architecture | Existing |
| `docs/techdebt/improvements-2026-07-14.md` | Fixes applied to old system (historical) | Existing |
| `docs/techdebt/new-vs-old-comparison.md` | Side-by-side comparison before retirement | Phase 9 |

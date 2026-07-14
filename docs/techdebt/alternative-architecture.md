# Alternative Architecture: Maximum-Uniqueness Next.js Website Generator

**Filed:** 2026-07-14
**Status:** Research / Proposal
**See also:** `docs/techdebt/visual-uniqueness-gap.md`, `skills/theme-uniqueness/SKILL.md`

## Goal

Design a Next.js-based website generator that scores **60-80% on the market uniqueness spectrum** (vs. the current ~40%). The architecture should produce sites that feel genuinely different from each other — not just palette-swapped skins of the same skeleton.

## Research: Open-Source Generators with High Uniqueness

### Projects Analyzed

| Project | Architecture | Uniqueness Mechanism | Market Position |
|---|---|---|---|
| [VULK Genome](https://vulk.dev/blog/how-vulk-genome-generates-unique-website-designs) | Gene-based sequencing engine | 170+ genes across 12 categories, industry-aware sequencing, creative cortex for unexpected elements | Design-system AI (60-70%) |
| [OpenPage](https://github.com/buildingopen/openpage) | JSON-first drag-and-drop builder | 19 block types × 42 layout variants, 10 theme presets, AI generates JSON not code | Visual AI builder (40-50%) |
| [Ticonderoga](https://github.com/kelleyperry/ticonderoga) | Agent competition + TasteGraph | 3 specialist agents compete; TasteGraph learns preferences via confidence scores | Hybrid code-gen (60-70%) |
| [Grid 2.0](https://github.com/adrianwedd/grid2_repo) | Beam search + tone-aware components | Deterministic beam search for section selection; tone variants (minimal/bold/playful/corporate) | Design-system AI (50-60%) |
| [Taste Engine](https://github.com/ShokeyMalik/taste-engine) | Context-aware recipes + tuners | 5 continuous tuners (abstraction/density/motion/contrast/narrative); multi-URL blending | Design-system AI (60-70%) |
| [Siteblaze](https://github.com/DeepCoomer/siteblaze) | Section-picking AI agent | AI selects from fixed component library; reorder/regenerate per-section | Visual AI builder (40-50%) |
| [Design Guard](https://github.com/freptar0/design-guard) | Full pipeline + anti-slop validator | 18 validation rules, DESIGN.md synthesis per business, multi-framework export | Code-gen (60-70%) |
| [json-render](https://github.com/vercel-labs/json-render) | Generative UI via JSON schema | Component registry with guardrails; multi-platform renderers (React/Vue/Svelte/Native) | Hybrid code-gen (50-60%) |

### Key Architectural Patterns for Uniqueness

#### 1. Gene / Variant Library (not singleton components)

Instead of one component per block type, provide **3-18 visual variants**. Each variant has its own layout, responsive behavior, animation, and color adaptation logic.

- **VULK**: 170+ genes across 12 categories (heroes: 18 variants, features: 22, testimonials: 14, etc.)
- **OpenPage**: 42 layout variants across 19 block types
- **TemplateCafe (current)**: ~2 variants for hero + testimonials only; 18+ block types have 0 variants

**Impact on uniqueness spectrum**: ~+15 points

#### 2. Sequencing Algorithm (not fixed skeleton)

Replace `Header → blocks.map(render) → Footer` with an algorithm that selects, orders, and paces sections based on content type and industry.

- **VULK Sequencer**: Industry detection (40+ patterns) → section template selection → pacing (never 2 similar sections adjacent)
- **Grid 2.0 Beam Search**: Evaluates combinations of sections to find optimal arrangement
- **TemplateCafe (current)**: Fixed page skeleton, same block order for all themes

**Impact on uniqueness spectrum**: ~+10 points

#### 3. Structured Design DNA (not flat palette)

Represent design intent as structured data with relationships between values, not just flat CSS variable names.

- **Ticonderoga TasteGraph**: Tokens have confidence scores (0.0-1.0) that evolve with user preference
- **Taste Engine Recipes**: Component-level behavior patterns that adapt to context (not just colors)
- **TemplateCafe (current)**: Flat palette → flat CSS vars → single-point mapping

**Impact on uniqueness spectrum**: ~+10 points

#### 4. Continuous Tuners (not discrete variant selectors)

Replace 3 discrete variants (A/B/C) with continuous value ranges for key dimensions.

- **Taste Engine 5-Tuners**: abstraction (0-1), density (0-1), motion (0-1), contrast (0-1), narrative (0-1)
- Each can produce infinite intermediate states
- **TemplateCafe (current)**: Exactly 3 discrete bundles, each dimension has 3 values at most

**Impact on uniqueness spectrum**: ~+10 points

#### 5. Algorithmic Execution with AI Content (not AI-generated everything)

Let AI handle content and intent understanding; use deterministic algorithms for layout and composition.

- **Grid 2.0**: "AI for understanding, algorithms for execution"
- **Siteblaze**: AI picks sections from fixed library, fills content
- **json-render**: AI generates constrained JSON within component guardrails
- **TemplateCafe (current)**: Dimension specs are human-authored JSON; no AI integration

**Impact on uniqueness spectrum**: ~+5 points

#### 6. Content Generation (not shared content)

Generate unique content (headlines, copy, images) per site instead of sharing identical content across themes.

- **VULK**: 90+ curated Unsplash images mapped to industries
- **Design Guard**: Full copy generation via GPT
- **TemplateCafe (current)**: All themes draw from the same pages.json

**Impact on uniqueness spectrum**: ~+10 points

---

## Proposed Architecture: TemplateCafe v2

### Overview

A Next.js app router website generator where:

1. **A generator skill** produces a complete `SiteConfig` JSON document from a prompt + business profile
2. **A sequencing engine** selects, composes, and paces sections algorithmically
3. **A gene library** provides 6-12 visual variants per block type (not 0-2)
4. **Continuous tuners** replace discrete A/B/C bundles for most dimensions
5. **Content is generated** per-site (headlines, images, copy)
6. **The Next.js app** is a renderer, not a template — it reads SiteConfig and renders whatever the generator produced

### Data Flow

```
User Prompt ("cafe in melbourne, rustic warm feel")
       │
       ▼
┌─────────────────────────────────────┐
│      Generator (CLI / API)          │
│                                     │
│  1. Understand intent (AI/NLP)      │
│  2. Detect industry (cafe)          │
│  3. Select genes (hero=18, ft=16…)  │
│  4. Sequence sections (pacing)      │
│  5. Set tuners (warmth=0.7, …)      │
│  6. Generate content (AI)           │
│  7. Assemble SiteConfig JSON        │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│        SiteConfig JSON              │
│                                     │
│  {                                   │
│    meta: { name, industry, tone },  │
│    tuners: { warmth: 0.7, … },      │
│    sections: [                      │
│      { gene: "hero-split", … },     │
│      { gene: "features-bento", … }, │
│      …                              │
│    ],                               │
│    content: { headlines, copy },    │
│    tokens: { colors, typography }   │
│  }                                   │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Next.js Renderer (this project)    │
│                                     │
│  Reads SiteConfig, renders:         │
│  - <Header /> (reads meta)          │
│  - sections.map(gene → component)   │
│  - <Footer /> (reads meta)          │
│  - Applies tuners as CSS vars       │
└─────────────────────────────────────┘
```

### Component Architecture

#### Gene Library (6-12 variants per block type)

```
components/genes/
  hero/
    hero-centered.tsx       # variant 1
    hero-split.tsx          # variant 2
    hero-fullscreen.tsx     # variant 3
    hero-gradient.tsx       # variant 4
    hero-minimal.tsx        # variant 5
    hero-video.tsx          # variant 6
    hero-animated.tsx       # variant 7
    hero-bento.tsx          # variant 8
  features/
    features-grid.tsx
    features-bento.tsx
    features-list.tsx
    features-alternating.tsx
    features-carousel.tsx
    features-comparison.tsx
  testimonials/
    testimonials-cards.tsx
    testimonials-carousel.tsx
    testimonials-masonry.tsx
    testimonials-spotlight.tsx
    testimonials-video.tsx
  … (12 categories)
```

Each gene:
- Is a self-contained React Server Component
- Accepts `content` (headlines, copy, images) and `tuners` (style parameters)
- Uses daisyUI/Tailwind for base styling
- Has its own layout logic (not a shared template with different colors)
- Has unique responsive behavior and animations

#### Sequencing Engine (`lib/sequencer/`)

```
lib/sequencer/
  industry-profiles.ts      # 40+ industry patterns (cafe, saas, portfolio…)
  section-templates.ts      # 12 section templates (rhythm patterns)
  pacing.ts                 # Ensures visual variety
  beam-search.ts            # Optional: optimal section combination
  assemble.ts               # Builds SiteConfig from selections
```

The sequencer:
1. Maps industry → preferred gene profiles
2. Selects a section template (which defines page rhythm)
3. Fills each slot with a gene variant, checking pacing constraints
4. Avoids adjacency of same-category sections
5. Ensures at least 3 different layout patterns on the page

#### Tuner System (`lib/tuners/`)

```
lib/tuners/
  definitions.ts            # 8-12 continuous tuners with ranges
  compile-tuners.ts         # Tuners → CSS vars (like current compile.ts)
```

Continuous tuners (0.0-1.0 range):

| Tuner | 0.0 end | 1.0 end | CSS effect |
|-------|---------|---------|------------|
| `warmth` | Cool blue-gray | Warm amber | Color temperature shift |
| `density` | Sparse (max padding) | Dense (min padding) | Spacing, font size |
| `motion` | Static | Cinematic | Animation speed, hover lifts |
| `contrast` | Soft (low contrast) | Sharp (high contrast) | Border opacity, text weights |
| `narrative` | Minimal hero | Expansive hero | Hero height, section spacing |
| `depth` | Flat | 3D / layered | Shadows, z-index, backdrop blur |
| `ornament` | Clean/minimal | Ornate/rich | Decorative elements, dividers |
| `rhythm` | Monotone | Varied | Section spacing oscillation |

The tuner system replaces both the current "9 dimensions" and the "component properties" — it's a continuous space, not 3 discrete bundles.

### Generator Skill

The generator (a CLI or API endpoint) uses this flow:

```
1. Parse prompt (NLP or structured input)
   → industry, tone, audience
2. Generate content (via AI or templates)
   → headlines, body copy, image prompts
3. Select genes (industry-matched)
   → picks 4-7 section types, each with a variant
4. Sequence sections (pacing + template)
   → produces ordered section list
5. Set tuners (tone-driven + randomization)
   → produces 8 tuner values
6. Compile tokens (derived from tuners + industry)
   → produces color palette, typography, spacing
7. Assemble SiteConfig JSON
   → final output for the renderer
```

### Renderer (Next.js App Router)

The Next.js app becomes a **thin renderer**:

```tsx
// app/[site]/page.tsx
export default async function SitePage({ params }) {
  const config = await loadSiteConfig(params.site)

  return (
    <html style={tunersToCssVars(config.tuners)}>
      <body className={tokensToClasses(config.tokens)}>
        <Header config={config.meta} />
        <main>
          {config.sections.map((section) => {
            const Gene = geneRegistry[section.gene]
            return <Gene key={section.id} content={section.content} />
          })}
        </main>
        <Footer config={config.meta} />
      </body>
    </html>
  )
}
```

Compared to current architecture:

| Aspect | Current (TemplateCafe) | Proposed (v2) |
|--------|----------------------|---------------|
| Variants | 3 discrete (A/B/C) | Continuous tuners (infinite) |
| Block variants | 0-2 per type | 6-12 per type |
| Page skeleton | Fixed | Algorithmically sequenced |
| Content | Shared (same pages.json) | Generated per-site |
| Themes | Palette swap on fixed skeleton | Gene selection + tuners + content |
| Generator | Human-authored spec JSON | AI + deterministic algorithm |
| Uniqueness spectrum | ~40% | 60-80% |

### Migration Path from Current Codebase

> **Note:** The detailed phased roadmap lives in `docs/roadmap/generator-architecture/README.md`. The summary below is an overview.

The current codebase will be **replaced**, not evolved — the new architecture runs completely separately. Migration happens in 10 phases across three parallel tracks:

1. **Foundation** (Phase 0): Install `@json-render/core`, `taste-engine`, `@design-guard/core`. Create schema, skills, gene registry.
2. **Gene library** (Phase 1, 8): Build 80+ gene variants as json-render components.
3. **Tuner integration** (Phase 2): Wire taste-engine into genes. Bridge tuners → CSS vars.
4. **Sequencing engine** (Phase 3): Industry profiles, section templates, pacing algorithm.
5. **Renderer** (Phase 4): Integrate json-render + taste-engine for SiteConfig → web page.
6. **Generator + agents** (Phase 5): Ticonderoga-style agent competition, TasteGraph learning.
7. **Content generation** (Phase 6): AI copywriting, image resolution.
8. **Validation** (Phase 7): Design Guard quality gate.
9. **Retirement** (Phase 9): Remove old `app/`, `components/`, `lib/`, `content/dimensions/` in one commit.

See `docs/roadmap/generator-architecture/README.md` for full details and timelines.

## Combination Matrix: Library Synergies

Each library excels in a specific layer of the generation pipeline. The real power comes from combining them — each pair addresses a different bottleneck:

### Pairwise Combinations

| | VULK (genes) | Ticonderoga (agents) | Design Guard (validation) | Taste Engine (tuners) | OpenPage (JSON) | json-render (registry) |
|---|---|---|---|---|---|---|
| **VULK (genes)** | — | Agents compete to select VULK gene combinations. TasteGraph learns winning gene → brief mappings. | VULK output validated by 18 anti-slop rules. Catches generic patterns emerging from gene recombination. | VULK genes expressed through continuous tuners. Each variant adapts its layout/spacing/color to tuner values. | VULK genes serialized as OpenPage JSON blocks. Each gene = typed schema entity. | VULK genes registered as json-render components. Multi-platform rendering from same gene set. |
| **Ticonderoga (agents)** | — | — | Competition winners weighted by validation scores (70% preference + 30% quality). Prevents human bias. | Each agent has a tuner profile. Art director = high contrast/low density. Type nerd = low warmth/high ornament. | Agents compete by producing OpenPage JSON. Clean diffs between agent outputs. Version-controllable. | Agents compete by producing json-render specs. Side-by-side rendering for comparison. |
| **Design Guard (validation)** | — | — | — | Validation thresholds are tuner-aware. Low contrast mode relaxes contrast rules. High density mode tightens spacing rules. | Validation metadata embedded in JSON schema. Errors at generation time, not post-hoc. | Per-component validation guardrails in registry. Components self-validate during rendering. |
| **Taste Engine (tuners)** | — | — | — | — | Theme presets become tuner vectors. 10 presets × infinite interpolation. | Tuner context passed through rendering pipeline. Components read tuners to adjust appearance. |
| **OpenPage (JSON)** | — | — | — | — | — | OpenPage SiteConfig rendered via json-render engine. Multi-platform output (React/Vue/Svelte/RN). |
| **json-render (registry)** | — | — | — | — | — | — |

### Top 5 Most Impactful Combinations

#### 1. VULK + Taste Engine — Infinite Expression Multiplier

**Why it's #1:** This is the single highest-leverage combination. VULK provides curated discrete diversity (170+ genes). Taste Engine provides continuous modulation (8 tuners × 10+ meaningful steps each). Together they create an effectively infinite design space from a finite, maintainable component library.

**How it works:**
```
VULK gene (e.g. hero-split)
  ↓
Taste Engine expression:
  warmth=0.7  → warm amber tones, cozy imagery
  density=0.3 → generous padding, large images
  motion=0.8  → parallax scroll, fade-in reveal
  depth=0.6   → subtle shadows, layered composition
  contrast=0.4 → soft borders, muted secondary text
  ↓
Unique rendered hero — same gene, completely different feel
```

**Uniqueness contribution:** +20 points (the largest single contributor)

#### 2. Ticonderoga + Taste Engine — Agent-Tuned Generation

**Why it's #2:** Each Ticonderoga agent embodies a distinct design philosophy. Giving each agent its own tuner profile forces genuinely different design interpretations of the same brief. The TasteGraph learns which tuner profiles win, not just which token values.

**How it works:**
```
Brief: "cafe website, warm feel"

Art Director agent → warmth=0.8, density=0.2, depth=0.7, motion=0.5
Type Nerd agent    → warmth=0.4, density=0.5, contrast=0.8, ornament=0.3
UX Pragmatist      → warmth=0.6, density=0.7, motion=0.2, narrative=0.4

3 pages rendered → human picks → TasteGraph updates
Next iteration: winning tuner profile gets amplified
```

**Uniqueness contribution:** +15 points

#### 3. VULK + Ticonderoga — Curated Gene Selection via Competition

**Why it's #3:** VULK's gene library is too large (170+) for a single deterministic algorithm to always pick optimally. Ticonderoga's agent competition explores the gene space more thoroughly: each agent picks different gene combinations, creating genuinely distinct page compositions. The TasteGraph learns which gene → industry → brief mappings work.

**How it works:**
```
Agent 1 (Art Director):  hero-fullscreen, features-bento, testimonials-spotlight
Agent 2 (Type Nerd):      hero-minimal, features-list, testimonials-carousel
Agent 3 (UX Pragmatist):  hero-split, features-grid, testimonials-cards

Each uses same content, different gene sequence
Winner chosen → TasteGraph strengthens winning gene sequence for "cafe" industry
```

**Uniqueness contribution:** +10 points

#### 4. VULK + Taste Engine + Design Guard — Maximum Diversity Within Quality Constraints

**Why it's #4:** The 3-way combination that maximizes the safe exploration space. VULK provides the raw diversity, Taste Engine modulates it, Design Guard ensures no output falls below quality thresholds. This is the "maximum viable uniqueness" pipeline — as diverse as possible without producing bad output.

**How it works:**
```
VULK genes → Taste Engine expression → prototype page
                                            ↓
                              Design Guard validation (18 rules)
                                            ↓
                           PASS → ship     FAIL → regenerate with adj. params
```

**Design Guard rules that matter most for this combo:**
- *Genericness detection*: flags when a VULK+Taste Engine output matches patterns seen before
- *Default font detection*: flags when tuners produce conservative typography
- *3-equal-cards detection*: flags when gene+expression produces repetitive layouts
- *Gradient inflation detection*: flags overuse of decorative effects

**Uniqueness contribution:** +10 points (safety net that enables bolder exploration)

#### 5. OpenPage + json-render — Universal Render Layer

**Why it's #5:** This decouples generation from rendering completely. Any generator (VULK+Ticonderoga combo, human designer, AI prompt) produces a SiteConfig JSON. json-render renders it on any platform. This means the generator can be replaced or upgraded without touching the renderer, and the renderer can target new platforms without changing the generator.

**How it works:**
```
Any generator → SiteConfig JSON → json-render
                                    ├── React (web)
                                    ├── Vue (web)
                                    ├── Svelte (web)
                                    ├── React Native (mobile)
                                    └── Next.js (full app)
```

**Uniqueness contribution:** +0 points directly, but enables multi-platform uniqueness (sites look equally unique on web and mobile)

### Three-Way Combinations with the Most Potential

#### VULK + Taste Engine + Ticonderoga — The Ultimate Uniqueness Pipeline

The most powerful combination. Each system addresses a different bottleneck:

| Layer | System | Role | Uniqueness mechanism |
|---|---|---|---|
| What to build | VULK (170+ genes) | Curated design diversity | 6-18 variants per block type |
| How to express it | Taste Engine (8 tuners) | Continuous modulation | Infinite variation within each variant |
| What to pick | Ticonderoga (agents + TasteGraph) | Intelligent selection + learning | Competition + preference evolution |

**Pipeline:**
```
Brief → Ticonderoga agents (each with tuner profile)
  → Agent 1 selects VULK genes, applies tuner profile 1
  → Agent 2 selects VULK genes, applies tuner profile 2
  → Agent 3 selects VULK genes, applies tuner profile 3
  → 3 pages rendered side-by-side
  → Human picks winner
  → TasteGraph updates: winning gene combo + tuner profile strengthen
  → Next generation: agents biased toward winning patterns
```

This pipeline produces genuinely unrepeatable designs. Even with the same brief and the same gene library, each generation produces different results because the TasteGraph evolves with each human choice.

#### VULK + Taste Engine + Design Guard — The Quality-Constrained Pipeline

Maximum diversity without quality degradation:

```
VULK genes → Taste Engine expression → Design Guard checks
                                              ↓
                          Score ≥ 80 → ship to renderer
                          Score 50-79 → regenerate (change tuners, keep genes)
                          Score < 50 → regenerate (different genes + tuners)
```

This prevents the "AI slop" problem while enabling bolder tuner settings. You can dial warmth to 0.9 without worrying the page will look amateurish — Design Guard catches it if it does.

#### OpenPage + json-render + VULK — The Multi-Platform Pipeline

Complete decoupling of generation, storage, and rendering:

```
VULK gene library → expressed as OpenPage JSON blocks → stored as SiteConfig
                                                              ↓
                                              json-render renders on target platform
                                              ├── React (next.js web app)
                                              ├── Vue (separate SPA)
                                              └── React Native (mobile app)
```

### Architecture Recommendation

For the highest uniqueness spectrum position (targeting 70-80%), the recommended architecture combines:

1. **VULK-style gene library** with 6-18 variants per block type (the raw material)
2. **Taste Engine-style continuous tuners** (the expression layer)  
3. **Ticonderoga-style agent competition** for generation-time selection (the intelligence layer)
4. **Design Guard-style validation** as a quality gate (the safety net)
5. **OpenPage/json-render-style JSON schema** as the intermediate format (the data layer)

This architecture targets ~75% on the market uniqueness spectrum, positioning alongside Framer AI / Webflow AI on the high end, with the advantage of being fully open-source and self-hostable.

## Summary of Open-Source Projects to Learn From

| Lesson | From | Apply to |
|--------|------|---------|
| Gene library with 6-18 variants per block | VULK | `components/genes/*` |
| Industry-aware section sequencing | VULK, Grid 2.0 | `lib/sequencer/` |
| Continuous tuners instead of discrete bundles | Taste Engine | `lib/tuners/` |
| Design DNA with confidence scoring | Ticonderoga | Future: preference learning |
| AI generates JSON, not code | OpenPage, json-render | Generator outputs SiteConfig |
| Deterministic + AI hybrid approach | Grid 2.0, Siteblaze | Generator architecture |
| Anti-slop validation rules | Design Guard | Generated output validation |
| Component registry with guardrails | json-render | Gene registry pattern |
| Agent competition for selection | Ticonderoga | Generator intelligence layer |
| VULK + Taste Engine = infinite expression | — | Highest-leverage combo |
| VULK + Ticonderoga + Taste Engine = ultimate pipeline | — | Three-layer uniqueness |

---
name: ticonderoga
description: >
  Wrap the Ticonderoga Design Genome Lab — an AI-native design tool that evolves web interfaces
  through agent competition. Clone, configure, and invoke its deconstruct → generate → evolve pipeline
  from bash scripts in `resources/`. No reimplementation needed.
---

# Ticonderoga Skill

> **Status:** Wrapped tool — standalone app invoked via bash scripts.

Ticonderoga is an AI-native design tool that evolves web interfaces through agent competition.
Instead of reimplementing its agent loop and TasteGraph, we invoke it directly.

## How It Works (Ticonderoga's Pipeline)

1. **Deconstruct** — Playwright screenshots a URL → Claude Vision extracts design tokens → structured TasteGraph JSON
2. **Generate** — 3 specialist agents (Art Director, Type Nerd, UX Pragmatist) each produce a complete HTML page inspired by the TasteGraph. Each gets a unique AI-generated hero image.
3. **Compete** — View variants side-by-side, pick a winner
4. **Evolve** — Winner's TasteGraph tokens strengthen, losers' weaken. 3 new variants generate from the evolved DNA.

## Setup

```bash
# Clone Ticonderoga (one-time)
git clone https://github.com/kelleyperry/ticonderoga.git .ticonderoga
cd .ticonderoga && bun install && npx playwright install chromium && cd ..
```

Requires: `bun`, `node >= 20`, Playwright browsers.

## Resources

| Script | Purpose | Invocation |
|--------|---------|------------|
| `resources/setup.sh` | Clone + install dependencies | `bash skills/ticonderoga/resources/setup.sh` |
| `resources/deconstruct.sh` | URL → TasteGraph JSON | `bash skills/ticonderoga/resources/deconstruct.sh <url> [output.json]` |
| `resources/generate.sh` | TasteGraph → 3 competing variants | `bash skills/ticonderoga/resources/generate.sh <tastegraph.json> [output-dir]` |
| `resources/evolve.sh` | Winner → updated TasteGraph | `bash skills/ticonderoga/resources/evolve.sh <winner.html> <tastegraph.json> [output.json]` |
| `resources/serve.sh` | Start Hono backend + Vite frontend | `bash skills/ticonderoga/resources/serve.sh` |

## Integration with Generator Pipeline

Ticonderoga replaces the manual agent-competition step in the generator:

```
User brief → Sequencer (industry + pacing) → Ticonderoga (agent competition)
                                                    │
                                          Ticonderoga generates 3 variants
                                          via its specialist agents
                                                    │
                                          Human or Design Guard picks winner
                                                    │
                                          TasteGraph evolves → next generation improves
                                                    │
                                          Winner → json-render spec → Taste Engine tuners
                                                    │
                                          Rendered page
```

### Data Flow

1. Sequencer produces a gene list + tuner profile → converted to a TasteGraph-compatible JSON
2. `bash resources/generate.sh tastegraph.json ./variants/` → 3 HTML pages
3. Each variant previewed and scored by Design Guard
4. Winner selected → `bash resources/evolve.sh winner.html tastegraph.json evolved.json`
5. Winning variant's structure reverse-mapped to a json-render spec
6. Spec + Taste Engine tuners → final rendered page

## Prerequisites

- Ticonderoga cloned and dependencies installed (run `setup.sh`)
- `bun` available on PATH
- `ANTHROPIC_API_KEY` set (for Claude Vision deconstruction + agent generation)
- `GEMINI_API_KEY` set (for hero image generation)
- Playwright browsers installed

## Constraints

- Do not modify `.ticonderoga/` files directly — it's a vendored tool, not our code
- TasteGraph JSON files are stored as artifacts in the generation session
- Ticonderoga generates raw HTML; we extract the design intent and re-render via our json-render pipeline

# Generator Skill — Full Pipeline Orchestration

Orchestrates the complete site generation flow: intent → config → render.

## Pipeline

```
prompt → detect industry → sequence sections → set archetype + tuners → generate content → assemble SiteConfig → render
```

## Files

- `src/generator/sequencer/` — Industry profiles, section templates, pacing
- `src/generator/content/` — AI content generation
- `src/generator/cli/` — CLI entry point
- `src/generator/api/` — HTTP API

## Commands

```bash
# Generate from prompt (Phase 5+)
npm run generate "cafe in melbourne, warm feel"

# Generate with manual config (Phase 3+)
npm run preview -- --config src/test-configs/cafe.json

# Quick validation
npm run typecheck
```

## Dependencies

- Phase 3+ (renderer must exist to preview output)
- `@json-render/*` — output format
- `taste-engine` — tuner profiles
- `soltana-ui` — design language archetypes

# Dimension: Rhythm

## Purpose

Controls section pacing, information density, alternation patterns, and divider strategy — the vertical rhythm of the page.

## Spec Schema

| Field | Type | Description |
|-------|------|-------------|
| `sectionSpacing` | enum | `compact`, `standard`, `spacious` |
| `density` | enum | `balanced`, `relaxed`, `dense` |
| `dividerStyle` | enum | `none`, `line`, `wave`, `angled`, `dots` |
| `alternationPattern` | enum | `alternating`, `steady` |

## Variant Differences

| Field | Variant A | Variant B |
|-------|-----------|-----------|
| `sectionSpacing` | `standard` | `spacious` |
| `density` | `balanced` | `relaxed` |
| `dividerStyle` | `none` | `line` |
| `alternationPattern` | `alternating` | `steady` |

## CSS Custom Properties Compiled

| Property | Source field | Example value |
|----------|-------------|---------------|
| `--section-py` | `sectionSpacing` (via spacing map) | `4rem` |

## Allowed Values

- `sectionSpacing`: `compact` (→ 2rem), `standard` (→ 4rem), `spacious` (→ 6rem)
- `density`: `balanced`, `relaxed`, `dense`
- `dividerStyle`: `none`, `line`, `wave`, `angled`, `dots`
- `alternationPattern`: `alternating`, `steady`

## Implementation

**File:** `lib/dimensions/compile.ts — compileRhythm()`

Resolves `sectionSpacing` through the `spacingMap` literal:
```
{ compact: "2rem", standard: "4rem", spacious: "6rem" }
```

Note: `compileRhythm()` sets `--section-py` which can conflict with the spatial dimension's `--section-py`. The last-loaded dimension wins. Ensure rhythm and spatial are not both loaded with conflicting values, or use a priority scheme.

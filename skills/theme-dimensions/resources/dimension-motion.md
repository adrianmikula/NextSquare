# Dimension: Motion

## Purpose

Controls animation language, transition speed, hover treatments, scroll effects, and page transitions.

## Spec Schema

| Field | Type | Description |
|-------|------|-------------|
| `transitionSpeed` | enum | `fast`, `normal`, `slow` |
| `hoverLift` | boolean | Cards/buttons lift on hover |
| `fadeIn` | boolean | Sections fade in on scroll |
| `smoothScroll` | boolean | CSS smooth scrolling enabled |

## Variant Differences

| Field | Variant A | Variant B |
|-------|-----------|-----------|
| `transitionSpeed` | `normal` (300ms) | `slow` (500ms) |
| `hoverLift` | `true` | `true` |
| `fadeIn` | `true` | `true` |
| `smoothScroll` | `true` | `true` |

## CSS Custom Properties Compiled

| Property | Source field | Example value |
|----------|-------------|---------------|
| `--transition-speed` | `transitionSpeed` (via speed map) | `300ms` |
| `--motion-hover-lift` | `hoverLift` | `1` (true) or `0` (false) |
| `--motion-fade-in` | `fadeIn` | `1` or `0` |
| `--motion-smooth-scroll` | `smoothScroll` | `1` or `0` |

## Allowed Values

- `transitionSpeed`: `fast` (→ 150ms), `normal` (→ 300ms), `slow` (→ 500ms)
- `hoverLift`: `true`, `false`
- `fadeIn`: `true`, `false`
- `smoothScroll`: `true`, `false`

## Implementation

**File:** `lib/dimensions/compile.ts — compileMotion()`

Resolves `transitionSpeed` through the `speedMap` literal:
```
{ fast: "150ms", normal: "300ms", slow: "500ms" }
```

Boolean values are compiled to `"1"` or `"0"` strings (CSS custom properties are always strings). Supports nested field access for backward compatibility:
- `hoverLift`: `spec.hoverLift ?? hover?.lift`
- `fadeIn`: `spec.fadeIn ?? scroll?.fadeIn`
- `smoothScroll`: `spec.smoothScroll ?? scroll?.smooth`

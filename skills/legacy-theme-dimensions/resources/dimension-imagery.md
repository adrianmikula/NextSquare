# Dimension: Imagery

## Purpose

Controls image sizing, aspect ratio, visual treatment, and overlay style across the site.

## Spec Schema

| Field | Type | Description |
|-------|------|-------------|
| `defaultAspect` | string | Default aspect ratio, e.g. `4:3`, `16:9`, `1:1`, `3:2` |
| `treatment` | enum | `cover`, `contain`, `blur`, `parallax` |
| `overlayOpacity` | number | 0–1 opacity of image overlay |
| `overlayStyle` | enum | `gradient`, `solid` |

## Variant Differences

| Field | Variant A | Variant B |
|-------|-----------|-----------|
| `defaultAspect` | `4:3` | `16:9` |
| `treatment` | `cover` | `cover` |
| `overlayOpacity` | `0.4` | `0.35` |
| `overlayStyle` | `gradient` | `solid` |

## CSS Custom Properties Compiled

| Property | Source field | Example value |
|----------|-------------|---------------|
| `--image-default-aspect` | `defaultAspect` | `4:3` |
| `--image-treatment` | `treatment` | `cover` |

## Allowed Values

- `defaultAspect`: any string in `width:height` format (`4:3`, `16:9`, `1:1`, `3:2`, `21:9`)
- `treatment`: `cover`, `contain`, `blur`, `parallax`
- `overlayOpacity`: number 0–1
- `overlayStyle`: `gradient`, `solid`

## Implementation

**File:** `lib/dimensions/compile.ts — compileImagery()`

Field access with fallback:
- `defaultAspect`: `spec.defaultAspect ?? spec.aspect ?? "4:3"`
- `treatment`: `spec.treatment ?? "cover"`

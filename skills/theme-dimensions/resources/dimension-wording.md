# Dimension: Wording

## Purpose

Controls text tone and CTA style — affects copy voice across the site. Unlike other dimensions, wording does not compile to CSS custom properties. It is a content-level dimension used by the website-builder skill to select copy variants.

## Spec Schema

| Field | Type | Description |
|-------|------|-------------|
| `tone` | enum | `friendly`, `professional`, `playful`, `warm`, `direct` |
| `ctaStyle` | enum | `direct`, `conversational`, `urgent`, `soft` |

## Variant Differences

| Field | Variant A | Variant B |
|-------|-----------|-----------|
| `tone` | `friendly` | `professional` |
| `ctaStyle` | `direct` | `conversational` |

## CSS Custom Properties Compiled

*None.* The wording dimension returns an empty CSS vars map (`{}`). It exists as a data dimension for content selection, not visual styling.

## Allowed Values

- `tone`: `friendly`, `professional`, `playful`, `warm`, `direct`
- `ctaStyle`: `direct`, `conversational`, `urgent`, `soft`

## Implementation

**File:** `lib/dimensions/compile.ts — compileDimension()`

The `wording` case in `compileDimension()` returns `{}` — no CSS compilation. This dimension is consumed by the content generation layer (website-builder skill) to select between copy variants per block.

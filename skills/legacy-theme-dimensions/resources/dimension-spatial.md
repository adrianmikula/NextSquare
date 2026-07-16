# Dimension: Spatial

## Purpose

Controls page layout architecture — content width strategy, section padding, grid model, text alignment, global layout structure (columns, sidebar, hero, header), design balance, and margin width.

## Spec Schema

| Field | Type | Description |
|-------|------|-------------|
| `containerMax` | string (CSS length) | Max content width, e.g. `72rem`, `68rem` |
| `sectionPaddingY` | string (CSS length) | Vertical padding per section |
| `sectionPaddingX` | string (CSS length) | Horizontal padding per section |
| `gridGap` | string (CSS length) | Gap between grid/card children |
| `contentAlign` | enum | `left`, `center`, `right` |
| `canvas` | enum | `boxed`, `narrow-boxed`, `full` |
| `columns` | number | Grid column count |
| `pageColumns` | number | Number of columns for page-level layout (1–12) |
| `sidebar` | enum | `none`, `left`, `right` |
| `heroEnabled` | boolean | Whether hero section is enabled |
| `headerStyle` | enum | `solid`, `floating`, `transparent`, `sticky` |
| `designBalance` | enum | `balanced`, `asymmetric`, `offset` |
| `marginWidth` | string | Side margin width, `auto` for centered, or CSS length |

## Variant Differences

| Field | Variant A | Variant B |
|-------|-----------|-----------|
| `containerMax` | `64rem` | `72rem` |
| `sectionPaddingY` | `3rem` | `4rem` |
| `sectionPaddingX` | `1.25rem` | `1rem` |
| `gridGap` | `1.25rem` | `1.5rem` |
| `contentAlign` | `center` | `left` |
| `canvas` | `narrow-boxed` | `boxed` |
| `columns` | `12` | `12` |
| `pageColumns` | `8` | `12` |
| `sidebar` | `right` | `none` |
| `heroEnabled` | `true` | `false` |
| `headerStyle` | `floating` | `solid` |
| `designBalance` | `asymmetric` | `balanced` |
| `marginWidth` | `2rem` | `auto` |

## CSS Custom Properties Compiled

| Property | Source field | Example value |
|----------|-------------|---------------|
| `--container-max` | `containerMax` | `72rem` |
| `--section-py` | `sectionPaddingY` | `4rem` |
| `--section-px` | `sectionPaddingX` | `1rem` |
| `--grid-gap` | `gridGap` | `1.5rem` |
| `--content-align` | `contentAlign` | `left` |
| `--page-columns` | `pageColumns` | `12` |
| `--sidebar-width` | `sidebar` | `none`, `right` |
| `--hero-enabled` | `heroEnabled` | `true`, `false` |
| `--header-style` | `headerStyle` | `solid`, `floating` |
| `--design-balance` | `designBalance` | `balanced`, `asymmetric` |
| `--margin-width` | `marginWidth` | `auto`, `2rem` |

## Allowed Values

- `containerMax`: any valid CSS length (prefer rem units, 56rem–80rem range)
- `sectionPaddingY`, `sectionPaddingX`: any valid CSS length
- `gridGap`: any valid CSS length
- `contentAlign`: `left`, `center`, `right`
- `canvas`: `boxed`, `narrow-boxed`, `full`
- `columns`: integer 1–12
- `pageColumns`: integer 1–12
- `sidebar`: `none`, `left`, `right`
- `heroEnabled`: boolean
- `headerStyle`: `solid`, `floating`, `transparent`, `sticky`
- `designBalance`: `balanced`, `asymmetric`, `offset`
- `marginWidth`: `auto` or any valid CSS length

## Implementation

**File:** `lib/dimensions/compile.ts — compileSpatial()`

Uses `lookupString()` helper with fallback chain per field:
- `containerMax`: `containerMax` → `maxWidth` → `spacing.containerMax` → `"72rem"`
- `sectionPaddingY`: `sectionPaddingY` → `sectionPy` → `spacing.sectionPaddingY` → `"4rem"`
- `sectionPaddingX`: `sectionPaddingX` → `sectionPx` → `spacing.sectionPaddingX` → `"1rem"`
- `gridGap`: `gridGap` → `spacing.gridGap` → `"1.5rem"`
- `contentAlign`: `contentAlign` → `spacing.contentAlign` → `"center"`
- `pageColumns`: `pageColumns` → `layout.pageColumns` → `12`
- `sidebar`: `sidebar` → `layout.sidebar` → `"none"`
- `heroEnabled`: `heroEnabled` → `layout.heroEnabled` → `"true"`
- `headerStyle`: `headerStyle` → `layout.headerStyle` → `"solid"`
- `designBalance`: `designBalance` → `layout.designBalance` → `"balanced"`
- `marginWidth`: `marginWidth` → `layout.marginWidth` → `"auto"`

# Data Models — theme-dimensions

All TypeScript interfaces and JSON shapes used by the dimension system.

---

## DimensionName

```typescript
type DimensionName = "spatial" | "color" | "typography" | "wording" | "imagery" | "components" | "rhythm" | "motion" | "page-layout"

9 orthogonal design axes. Each dimension is independently variant and independently compiled.

**Source:** `lib/dimensions/types.ts:1-10`

---

## Variant

```typescript
type Variant = "A" | "B"
```

Each dimension has exactly 2 variants. Single-character strings, always uppercase.

**Source:** `lib/dimensions/types.ts:14-15`

---

## DimensionSpec

```typescript
type DimensionSpec = Record<string, unknown>
```

Generic container for per-dimension configuration data. Each dimension defines its own schema (see individual dimension resource files).

**Source:** `lib/dimensions/types.ts:19`

---

## BundleConfig

```typescript
interface BundleConfig {
  name: string
  description?: string
  dimensions: Record<DimensionName, Variant>
}
```

Groups coherent default dimension→variant assignments. Stored as JSON files in `content/dimensions/bundles/`. Each bundle assigns a variant (A or B) to all 8 dimensions.

**Source:** `lib/dimensions/types.ts:21-25`
**Example file:** `content/dimensions/bundles/a.json`

---

## DimensionState

```typescript
type DimensionState = Record<DimensionName, Variant>
```

Runtime state: the resolved variant for each dimension at the current request. Produced by `parseDimensionState()` from URL search params + bundle config.

**Source:** `lib/dimensions/types.ts:27`

---

## BundleDimInfo

```typescript
interface BundleDimInfo {
  id: string
  dimensions: Record<DimensionName, Variant>
}
```

Lightweight bundle descriptor used by `parseDimensionState()` for bundle resolution. Created by `getAllBundleConfigs()` from the loaded `BundleConfig` array.

**Source:** `lib/dimensions/resolve.ts:12-15`

---

## SpecData

```typescript
type SpecData = Record<DimensionName, Record<string, DimensionSpec | null>>
```

Pre-loaded index of all dimension spec files. Structure: `[dimensionName][variant] -> DimensionSpec | null`. Produced by `loadAllSpecData()`.

**Source:** `lib/dimensions/resolve.ts:58`
**Loader:** `lib/dimensions/loader.ts:66-75`

---

## Bundle Metadata

```typescript
{ name: string; description?: string }
```

Shorthand bundle descriptor returned by `loadBundleMetadata()` — used when only display info is needed without the full dimension assignments.

**Source:** `lib/dimensions/loader.ts:51-55`

---

## Per-Dimension Spec Field Reference

| Dimension | Key Fields | Type Constraints |
|-----------|-----------|-----------------|
| spatial | containerMax, sectionPaddingY, sectionPaddingX, gridGap, contentAlign, canvas, columns, pageColumns, sidebar, heroEnabled, headerStyle, designBalance, marginWidth | CSS lengths, enum, number, boolean |
| color | harmony, chroma, backgroundType, backgroundValue, palette { primary, secondary, background, surface, text, accent, border } | enum, hex colours, CSS value |
| typography | headingFont, bodyFont, headingWeight, bodyWeight, headingCase, letterSpacing, lineHeight, scale | font names (curated library of 8+ families), weights, CSS values |
| wording | tone, ctaStyle | enum |
| imagery | defaultAspect, treatment, overlayOpacity, overlayStyle | aspect string, enum, number 0-1 |
| components | borderRadius, cardRadius, buttonRadius, imageRadius, borderWidth, borderStyle, cardBorder, divider, cardShadow, cardHoverShadow, heroStyle, cardStyle, buttonStyle, navStyle, navHeight, navBgOpacity, navLinkStyle | CSS lengths, booleans, enum, number 0-1 |
| rhythm | sectionSpacing, density, dividerStyle, alternationPattern | enum |
 | motion | transitionSpeed, transitionEasing, hoverLift, fadeIn, smoothScroll, staggerEnabled | enum, booleans |
| page-layout | heroVariant, navVariant, sectionContainer, cardVariant, footerVariant, componentOverrides | enum, object (component name map) |

For full field-level details per dimension, see the individual `dimension-*.md` files.

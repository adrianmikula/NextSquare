---
name: theme-dimensions
description: >
  Design system composed of 8 orthogonal, independently variant design dimensions.
  Each dimension has A/B spec files. Bundles group coherent defaults. URL params
  override individual dimensions at request time. Compiled to CSS custom properties.
version: 0.1.0
---

## Overview

The dimension-based design system replaces monolithic theme files with 8 independent design dimensions, each stored as a standalone JSON spec file with A/B variants. At request time, a bundle config (or URL overrides) selects the active variant per dimension, specs are loaded, compiled to CSS custom properties, and applied to `:root` via `ThemeProvider`. This avoids combinatorial explosion — only 16 spec files (8 dimensions x 2 variants) are needed to produce any of 256 possible combinations.

## Capabilities

### Define Dimension Spec

Creates, loads, or modifies a dimension variant spec file.

**Fixed contract:**
| Property | Description |
|----------|-------------|
| Inputs | `dimension: DimensionName`, `variant: Variant`, `specData: Record<string, unknown>` |
| Outputs | `DimensionSpec | null` |
| Business rules | Spec files are JSON. File path is `{specs_root}/{dimension}-{variant}.json`. Parse failure returns null, not an exception. |
| Error semantics | File not found → null. Invalid JSON → null. |

**Open layer:**
| Property | Description |
|----------|-------------|
| Algorithm | Request-time lazy loading vs preloading all specs |
| Storage | File format (JSON) |

**Logic:**

1. Construct file path: `{specs_root}/{dimension}-{variant.toLowerCase()}.json`
2. Read file from filesystem
3. Parse JSON into `Record<string, unknown>`
4. Return parsed spec, or null on any failure

**Config parameters used:**
| Parameter | Config path | Purpose |
|-----------|-------------|---------|
| Specs root path | `paths.specs_root` | Directory containing dimension spec files |
| Dimension names | `dimension_names` | Valid dimension identifiers |

**Error states:**
| Condition | Error | Handling |
|-----------|-------|----------|
| Spec file does not exist | Missing spec | Return null |
| JSON parse failure | Corrupt spec | Return null |

**Example:**
```json
// Input
{ "dimension": "color", "variant": "A", "specData": { "harmony": "analogous", "chroma": "muted", "palette": { "primary": "#2A6B7C", "secondary": "#E4F0F2" } } }

// Output
{ "harmony": "analogous", "chroma": "muted", "palette": { "primary": "#2A6B7C", "secondary": "#E4F0F2", "background": "#F7F9FA", "surface": "#FFFFFF", "text": "#192426", "accent": "#E89B74", "border": "#D0DDE0" } }
```

### Resolve Dimension State

Parses URL search parameters and optional bundle configs to resolve the active variant (A or B) for each of the 8 dimensions.

**Fixed contract:**
| Property | Description |
|----------|-------------|
| Inputs | `searchParams: URLSearchParams`, `bundles?: BundleDimInfo[]` |
| Outputs | `DimensionState` — record mapping each dimension name to its resolved variant |
| Business rules | All dimensions default to "A". If `bundle` param is set and matches a known bundle, load that bundle's assignments as base. Per-dimension overrides in URL win over bundle defaults. If no bundle param and no overrides, return all-A state. |
| Error semantics | Unknown bundle ID → use first available bundle or all-A. Invalid variant value → ignore override, keep current. |

**Open layer:**
| Property | Description |
|----------|-------------|
| Algorithm | First-bundle auto-select vs explicit default |
| Structure | How bundle info is passed vs fetched inside the function |

**Logic:**

1. Start with all dimensions set to `default_variant` ("A")
2. Determine bundle ID:
   - If `bundle` param present and matches a known bundle ID, use it
   - Otherwise use the first bundle in the list, or no bundle
3. If a bundle is selected, apply its dimension→variant assignments
4. For each dimension, check for a per-dimension URL override
5. If override is valid (A or B), set that dimension's variant
6. Return the resolved state

**Config parameters used:**
| Parameter | Config path | Purpose |
|-----------|-------------|---------|
| Default variant | `default_variant` | Fallback variant when no override is set |
| Dimension names | `dimension_names` | Valid dimension identifiers |
| Variant names | `variant_names` | Valid variant identifiers |

**Error states:**
| Condition | Error | Handling |
|-----------|-------|----------|
| Unknown bundle ID | Fallback | Use first available bundle or all-A default |
| Invalid variant value | Ignored | Skip the override, keep current value |
| No bundles directory | Empty list | Return all-A state |

**Example:**
```json
// Input
{ "searchParams": "bundle=a&color=b", "bundles": [{ "id": "A", "dimensions": { "spatial": "A", "color": "A", "typography": "A", "wording": "A", "imagery": "A", "components": "A", "rhythm": "A", "motion": "A" } }] }

// Output
{ "spatial": "A", "color": "B", "typography": "A", "wording": "A", "imagery": "A", "components": "A", "rhythm": "A", "motion": "A" }
```

### Compile Dimensions to CSS

Compiles resolved dimension specs into a flat map of CSS custom properties.

**Fixed contract:**
| Property | Description |
|----------|-------------|
| Inputs | `specs: Record<DimensionName, DimensionSpec \| null>` |
| Outputs | `Record<string, string>` — CSS custom property name → value |
| Business rules | Each dimension has a dedicated compile function. Null specs are skipped — no CSS vars emitted for that dimension. Default values from config are used when spec fields are missing. |
| Error semantics | Null or empty spec map → empty vars map. Partial spec → compile missing fields with defaults. |

**Open layer:**
| Property | Description |
|----------|-------------|
| Algorithm | Single-pass vs per-dimension lazy compilation |
| Structure | Flat function vs class-based |

**Logic:**

For each of the 8 dimensions, if a spec exists, compile it:

1. **Color** — extract harmony, chroma, backgroundType, backgroundValue, and palette (primary/secondary/background/surface/text/accent/border). Map to `--color-*`, `--color-harmony`, `--color-chroma`, `--color-background-type`, `--color-background-value` CSS vars. Resolve palette values from spec or config defaults.
2. **Typography** — extract heading font, body font, weights, case, letter spacing, line height, scale. Map to `--font-*`, `--text-transform-heading`, `--letter-spacing`, `--line-height`, `--typography-scale`.
3. **Spatial** — extract container max-width, section padding, grid gap, content alignment, page columns, sidebar, hero, header style, design balance, margin width. Map to `--container-max`, `--section-py`, `--section-px`, `--grid-gap`, `--content-align`, `--page-columns`, `--sidebar-width`, `--hero-enabled`, `--header-style`, `--design-balance`, `--margin-width`.
4. **Components** — extract border radii, border style/width, shadow levels, nav height/opacity. Map to `--theme-*`, `--nav-*` vars. Resolve shadow names via shadow map.
5. **Motion** — extract transition speed (fast/normal/slow → ms), transition easing, hover lift, fade-in, smooth scroll, stagger booleans. Map to `--transition-speed`, `--motion-easing`, `--motion-*` vars.
6. **Rhythm** — extract section spacing density (compact/standard/spacious → rem). Map to `--section-py`.
7. **Imagery** — extract default aspect ratio and image treatment. Map to `--image-default-aspect`, `--image-treatment`.
8. **Wording** — no CSS vars emitted (content dimension only).

Aggregate all dimension CSS vars into a single flat map.

**Config parameters used:**
| Parameter | Config path | Purpose |
|-----------|-------------|---------|
| Color defaults | `compilation.color.*` | Fallback palette values, harmony, chroma |
| Typography defaults | `compilation.typography.*` | Fallback fonts, weights, scale values |
| Spatial defaults | `compilation.spatial.*` | Fallback container, padding, gap values |
| Component defaults | `compilation.components.*` | Fallback radius, shadow map, nav opacity |
| Motion speed map | `compilation.motion.speed_map` | Maps speed names to CSS ms values |
| Rhythm spacing map | `compilation.rhythm.spacing_map` | Maps density names to CSS rem values |
| Imagery defaults | `compilation.imagery.*` | Fallback aspect ratio, treatment |

**Error states:**
| Condition | Error | Handling |
|-----------|-------|----------|
| Null spec for dimension | Missing | Skip dimension, emit no CSS vars |
| Missing field in spec | Partial | Use default from config.yaml |
| Unknown shadow key | Invalid | Fall back to "md" shadow value |

**Example:**
```json
// Input (partial)
{ "specs": { "color": { "harmony": "analogous", "chroma": "muted", "palette": { "primary": "#2A6B7C", "secondary": "#E4F0F2", "background": "#F7F9FA", "surface": "#FFFFFF", "text": "#192426", "accent": "#E89B74", "border": "#D0DDE0" } }, "typography": { "headingFont": "Inter", "bodyFont": "Inter", "headingWeight": 600, "bodyWeight": 400, "headingCase": "normal", "letterSpacing": "normal", "lineHeight": 1.5, "scale": "1.25" } } }

// Output (partial)
{ "--color-primary": "#2A6B7C", "--color-secondary": "#E4F0F2", "--color-background": "#F7F9FA", "--font-heading": "'Inter', sans-serif", "--font-body": "'Inter', sans-serif", "--font-heading-weight": "600", "--font-body-weight": "400" }
```

### Manage Bundle Configs

Lists, loads, and describes bundle configs that group coherent default dimension→variant assignments.

**Fixed contract:**
| Property | Description |
|----------|-------------|
| Inputs | `bundle?: string` (bundle ID) |
| Outputs | `BundleConfig | null` or `BundleConfig[]` |
| Business rules | Bundle files are JSON in `{bundles_root}/{id}.json`. A bundle assigns one variant (A or B) to every dimension. |
| Error semantics | Unknown bundle → null. Missing bundles root → empty array. |

**Logic:**

1. Load single bundle: construct path `{bundles_root}/{id.toLowerCase()}.json`, read and parse
2. List all bundles: scan `{bundles_root}/` directory for `.json` files, return basenames
3. Get all configs: list bundles → load each → filter nulls → return

**Config parameters used:**
| Parameter | Config path | Purpose |
|-----------|-------------|---------|
| Bundles root path | `paths.bundles_root` | Directory containing bundle JSON files |

**Error states:**
| Condition | Error | Handling |
|-----------|-------|----------|
| Bundle file not found | Missing | Return null |
| Bundles root does not exist | Missing directory | Return empty array |

**Example:**
```json
// Input
{ "bundle": "A" }

// Output
{ "name": "Coastal Mornings", "description": "Warm coastal tones, friendly tone, standard layout", "dimensions": { "spatial": "A", "color": "A", "typography": "A", "wording": "A", "imagery": "A", "components": "A", "rhythm": "A", "motion": "A" } }
```

### Verify Dimension Delta (optional)

Verifies that A and B variants of each dimension differ by a minimum threshold, ensuring generated themes feel perceptibly distinct.

**Behavior modes:**
| Mode | When used |
|------|-----------|
| **Default (on)** | Generating a completely new theme from scratch |
| **Skip** | User explicitly requests copying an existing theme with tweaks, or generating a theme intentionally similar to an existing one |

**Fixed contract:**
| Property | Description |
|----------|-------------|
| Inputs | `specA: DimensionSpec`, `specB: DimensionSpec`, `dimension: DimensionName` |
| Outputs | `{ passes: boolean; deltaPercent: number; totalFields: number; differingFields: number; }` |
| Business rules | Compare all top-level fields present in either spec. A field differs when its JSON value is not strictly equal (`!==`). Skip fields only present in one spec — require both specs to have the field for it to be counted. Nested objects (e.g. `palette`) are compared as single values — the whole `palette` key either matches or doesn't. |
| Error semantics | If either spec is null → skip with `passes: true, skipped: true`. Unknown dimension → treat as pass with warning. |

**Open layer:**
| Property | Description |
|----------|-------------|
| Algorithm | Strict JSON equality |

**Logic:**

1. Collect all field names present in **both** specA and specB
2. Total = count of shared fields
3. Differing = count where `specA[key] !== specB[key]`
4. deltaPercent = `(differing / total) * 100`
5. Passes if `deltaPercent >= 80`

**Config parameters used:**
| Parameter | Config path | Purpose |
|-----------|-------------|---------|
| Threshold | `verification.delta.threshold_percent` | Minimum percentage of differing fields (default: 80) |

**Example:**
```json
// Input
{ "specA": { "headingFont": "Nunito", "bodyFont": "Inter", "headingWeight": 700, "bodyWeight": 400, "headingCase": "normal", "letterSpacing": "normal", "lineHeight": 1.6, "scale": 1.25 }, "specB": { "headingFont": "Playfair Display", "bodyFont": "Inter", "headingWeight": 600, "bodyWeight": 400, "headingCase": "normal", "letterSpacing": "0.02em", "lineHeight": 1.5, "scale": 1.2 }, "dimension": "typography" }

// Output
{ "passes": false, "deltaPercent": 62.5, "totalFields": 8, "differingFields": 5 }
// 62.5% < 80% — typography needs more differentiation
```

## Configuration

Full configuration reference in `config.yaml`. Key sections:

| Variable | Config path | Default | Description |
|----------|-------------|---------|-------------|
| Default variant | `default_variant` | `A` | Fallback when no override is set |
| Specs root | `paths.specs_root` | `content/dimensions/specs/` | Directory of dimension JSON spec files |
| Bundles root | `paths.bundles_root` | `content/dimensions/bundles/` | Directory of bundle JSON config files |
| Color palette defaults | `compilation.color.palette_defaults` | amber-amber-stone | Fallback hex colours |
| Background type default | `compilation.color.default_background_type` | color | Fallback background type |
| Spatial layout defaults | `compilation.spatial.default_page_columns` / sidebar / hero / header / balance / margin | 12 / none / true / solid / balanced / auto | Fallback layout values |
| Font library | `font_library.available_fonts` | 8 curated families | Available next/font preloaded fonts |
| Default heading font | `compilation.typography.default_heading_font` | Inter | Fallback heading font family |
| Default body font | `compilation.typography.default_body_font` | Inter | Fallback body font family |
| Typography scale | `compilation.typography.default_scale` | 1.25 | Modular scale ratio |
| Shadow map | `compilation.components.shadow_map` | {none, sm, md, lg, xl, 2xl} | Maps shadow names to CSS values |
| Speed map | `compilation.motion.speed_map` | {fast: 150ms, normal: 300ms, slow: 500ms} | Maps speed names to CSS transition durations |
| Spacing map | `compilation.rhythm.spacing_map` | {compact: 2rem, standard: 4rem, spacious: 6rem} | Maps density names to CSS rem values |

## Dependencies

- **Runtime:** Node.js 20+, Next.js 16+
- **External services:** None — entirely local filesystem-based
- **Key exports:** `lib/dimensions/index.ts` (server), `lib/dimensions/client.ts` (client-safe)

## Resources

See `resources/` for per-dimension documentation:

| Resource | Covers |
|----------|--------|
| `dimension-spatial.md` | Layout architecture, container, grid, section padding |
| `dimension-color.md` | Colour harmony, palette, chroma |
| `dimension-typography.md` | Font pairing, scale, treatment |
| `dimension-wording.md` | Text tone, CTA style |
| `dimension-imagery.md` | Image sizing, aspect, treatment, overlay |
| `dimension-components.md` | Component morphology, shadows, nav, borders |
| `dimension-rhythm.md` | Section pacing, density, alternation |
| `dimension-motion.md` | Transition speed, hover, scroll effects |
| `data-models.md` | TypeScript interfaces and JSON shapes |
| `api-contract.md` | Function signatures and data flows |
| `test-cases.md` | Example invocations with expected outputs |

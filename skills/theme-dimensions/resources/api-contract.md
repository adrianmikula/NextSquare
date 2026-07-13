# API Contracts — theme-dimensions

Function signatures and data flows for the dimension system.

---

## Server-Side Entry Points

### `lib/dimensions/index.ts`

Re-exports everything from `types`, `state`, and `compile`:

```typescript
export * from "./types"
export * from "./state"
export * from "./compile"
```

### `lib/dimensions/state.ts`

| Function | Signature | Purpose |
|----------|-----------|---------|
| `parseDimensionState` | `(searchParams: URLSearchParams) => DimensionState` | Parse URL params + bundle configs into resolved state |
| `resolveDimensionSpecs` | `(state: DimensionState) => Record<DimensionName, DimensionSpec \| null>` | Load spec files for active variants |
| `defaultDimensionState` | `() => DimensionState` | All dimensions = "A" |
| `buildDimensionSearchParams` | `(state: DimensionState) => URLSearchParams` | Build URL params from state (omits defaults) |

### `lib/dimensions/resolve.ts` (pure logic, no I/O)

| Function | Signature | Purpose |
|----------|-----------|---------|
| `defaultDimensionState` | `() => DimensionState` | All-"A" default state |
| `parseDimensionState` | `(searchParams: URLSearchParams, bundles?: BundleDimInfo[]) => DimensionState` | Resolve state from URL + optional bundles |
| `buildDimensionSearchParams` | `(state: DimensionState) => URLSearchParams` | Serialize state to URL params |
| `resolveDimensionSpecs` | `(state: DimensionState, specData?: SpecData) => Record<DimensionName, DimensionSpec \| null>` | Map state to spec data |

### `lib/dimensions/compile.ts`

| Function | Signature | Purpose |
|----------|-----------|---------|
| `compileSpecsToCssVars` | `(specs: Record<DimensionName, DimensionSpec \| null>) => Record<string, string>` | Compile all dimension specs to CSS custom properties |
| (internal) `compileColor` | `(spec: DimensionSpec) => Record<string, string>` | Color → CSS vars |
| (internal) `compileTypography` | `(spec: DimensionSpec) => Record<string, string>` | Typography → CSS vars |
| (internal) `compileSpatial` | `(spec: DimensionSpec) => Record<string, string>` | Spatial → CSS vars |
| (internal) `compileComponents` | `(spec: DimensionSpec) => Record<string, string>` | Components → CSS vars |
| (internal) `compileMotion` | `(spec: DimensionSpec) => Record<string, string>` | Motion → CSS vars |
| (internal) `compileRhythm` | `(spec: DimensionSpec) => Record<string, string>` | Rhythm → CSS vars |
| (internal) `compileImagery` | `(spec: DimensionSpec) => Record<string, string>` | Imagery → CSS vars |
| (internal) `lookupString` | `(spec: DimensionSpec, keys: string[], fallback: string) => string` | First-found string value or fallback |
| (internal) `lookupNumber` | `(spec: DimensionSpec, keys: string[], fallback: number) => number` | First-found number value or fallback |
| (internal) `resolveColor` | `(val: unknown, fallback: string) => string` | Resolve hex from string or object |

### `lib/dimensions/loader.ts`

| Function | Signature | Purpose |
|----------|-----------|---------|
| `loadBundleConfig` | `(bundle: string) => BundleConfig \| null` | Load single bundle JSON |
| `loadDimensionSpec` | `(dimension: DimensionName, variant: Variant) => DimensionSpec \| null` | Load single spec JSON |
| `listAvailableBundles` | `() => string[]` | List all bundle IDs |
| `loadBundleMetadata` | `(bundle: string) => { name: string; description?: string } \| null` | Load bundle metadata only |
| `getAllBundleConfigs` | `() => Array<{ id, name, description?, dimensions }>` | Load all bundle configs |
| `loadAllSpecData` | `() => Record<DimensionName, Record<string, DimensionSpec \| null>>` | Load all spec files |

---

## Client-Safe Entry Points

### `lib/dimensions/client.ts`

Re-exports everything safe for browser use:

```typescript
export * from "./types"      // Type definitions only
export * from "./compile"    // Pure compilation functions
export { defaultDimensionState, parseDimensionState, buildDimensionSearchParams, resolveDimensionSpecs } from "./resolve"
```

Note: `loader.ts` functions are NOT re-exported from `client.ts` — they use `fs` (Node.js only).

---

## Component Integration

### `components/cms/ThemeProvider.tsx`

```typescript
interface ThemeProviderProps {
  cssVars?: Record<string, string>       // Pre-compiled CSS vars
  dimensionSpecs?: Record<DimensionName, DimensionSpec | null>  // Or raw specs to compile
  children: React.ReactNode
}
```

If `dimensionSpecs` is provided, `compileSpecsToCssVars()` is called client-side via `useMemo`. If `cssVars` is provided (server-pre-compiled), it's used directly. Applied to `document.documentElement` via inline styles in `useEffect`.

---

## Data Flow

```
URL params          Bundle configs
     \                 /
      v               v
  parseDimensionState()
           |
           v
    DimensionState         content/dimensions/specs/
           |                         |
           v                         v
    resolveDimensionSpecs()
           |
           v
    DimensionSpec[8]        config.yaml (defaults)
           |                         |
           v                         v
    compileSpecsToCssVars()
           |
           v
    CSS vars map (Record<string, string>)
           |
           v
    ThemeProvider (setProperty on :root)
```

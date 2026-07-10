import type { DimensionName, DimensionState, Variant, DimensionSpec } from "./types"
import { DIMENSION_NAMES, isVariant, normalizeVariant } from "./types"

export function defaultDimensionState(): DimensionState {
  const state = {} as DimensionState
  for (const dim of DIMENSION_NAMES) {
    state[dim] = "A"
  }
  return state
}

export interface BundleDimInfo {
  id: string
  dimensions: Record<DimensionName, Variant>
}

export function parseDimensionState(
  searchParams: URLSearchParams,
  bundles?: BundleDimInfo[]
): DimensionState {
  const state = defaultDimensionState()

  const bundleParam = searchParams.get("bundle")
  const defaultBundleId = bundles && bundles.length > 0 ? bundles[0].id : "a"
  const bundleId = bundleParam && bundles?.find((b) => b.id === bundleParam.toUpperCase()) ? bundleParam.toUpperCase() : defaultBundleId

  const bundle = bundles?.find((b) => b.id === bundleId)
  if (bundle) {
    for (const dim of DIMENSION_NAMES) {
      const variant = bundle.dimensions[dim]
      if (variant) {
        state[dim] = variant
      }
    }
  }

  for (const dim of DIMENSION_NAMES) {
    const override = searchParams.get(dim)
    if (override && isVariant(override)) {
      state[dim] = normalizeVariant(override)
    }
  }

  return state
}

export function buildDimensionSearchParams(state: DimensionState): URLSearchParams {
  const params = new URLSearchParams()
  const defaults = defaultDimensionState()
  for (const dim of DIMENSION_NAMES) {
    if (state[dim] !== defaults[dim]) {
      params.set(dim, state[dim])
    }
  }
  return params
}

export type SpecData = Record<DimensionName, Record<string, DimensionSpec | null>>

export function resolveDimensionSpecs(
  state: DimensionState,
  specData?: SpecData
): Record<DimensionName, DimensionSpec | null> {
  const specs = {} as Record<DimensionName, DimensionSpec | null>
  if (specData) {
    for (const dim of DIMENSION_NAMES) {
      const dimData = specData[dim]
      specs[dim] = dimData ? (dimData[state[dim]] ?? null) : null
    }
  }
  return specs
}

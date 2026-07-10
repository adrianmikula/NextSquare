import type { DimensionState, DimensionSpec, DimensionName } from "./types"
import {
  defaultDimensionState,
  parseDimensionState as pureParse,
  buildDimensionSearchParams as pureBuild,
  resolveDimensionSpecs as pureResolve,
} from "./resolve"
import { getAllBundleConfigs, loadAllSpecData } from "./loader"

export { loadBundleConfig, loadDimensionSpec, listAvailableBundles, loadBundleMetadata, getAllBundleConfigs, loadAllSpecData } from "./loader"

export function parseDimensionState(searchParams: URLSearchParams): DimensionState {
  return pureParse(searchParams, getAllBundleConfigs())
}

export function resolveDimensionSpecs(state: DimensionState): Record<DimensionName, DimensionSpec | null> {
  return pureResolve(state, loadAllSpecData())
}

export { defaultDimensionState }
export { buildDimensionSearchParams } from "./resolve"

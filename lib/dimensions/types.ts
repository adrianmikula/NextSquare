export const DIMENSION_NAMES = [
  "spatial",
  "color",
  "typography",
  "wording",
  "imagery",
  "components",
  "rhythm",
  "motion",
  "page-layout",
] as const

export type DimensionName = (typeof DIMENSION_NAMES)[number]

export const VARIANT_NAMES = ["A", "B", "C"] as const
export type Variant = (typeof VARIANT_NAMES)[number]

export type BundleName = string

export type DimensionSpec = Record<string, unknown>

export interface BundleConfig {
  name: string
  description?: string
  dimensions: Record<DimensionName, Variant>
}

export type DimensionState = Record<DimensionName, Variant>

export function isDimensionName(name: string): name is DimensionName {
  return (DIMENSION_NAMES as readonly string[]).includes(name)
}

export function isVariant(value: string): value is Variant {
  return (VARIANT_NAMES as readonly string[]).includes(value.toUpperCase())
}

export function normalizeVariant(value: string): Variant {
  return value.toUpperCase() as Variant
}

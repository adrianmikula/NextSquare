import type { DimensionName, DimensionSpec } from "./dimensions/types"

export type ComponentOverrides = Record<string, string>

export function resolveComponentName(
  blockType: string,
  overrides?: ComponentOverrides
): string {
  return overrides?.[blockType] ?? blockType
}

export function extractComponentOverrides(
  specs: Record<DimensionName, DimensionSpec | null>
): ComponentOverrides | undefined {
  const pageLayout = specs["page-layout"]
  if (!pageLayout) return undefined
  const raw = pageLayout.componentOverrides
  if (!raw || typeof raw !== "object") return undefined
  return raw as ComponentOverrides
}

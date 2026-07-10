import fs from "fs"
import path from "path"
import type { DimensionName, DimensionState, Variant, BundleConfig, DimensionSpec } from "./types"
import { DIMENSION_NAMES, VARIANT_NAMES } from "./types"

const DIMENSIONS_ROOT = path.join(process.cwd(), "content", "dimensions")
const SPECS_ROOT = path.join(DIMENSIONS_ROOT, "specs")
const BUNDLES_ROOT = path.join(DIMENSIONS_ROOT, "bundles")

function isBundleName(value: string): boolean {
  if (!value) return false
  const file = path.join(BUNDLES_ROOT, `${value.toLowerCase()}.json`)
  return fs.existsSync(file)
}

export function loadBundleConfig(bundle: string): BundleConfig | null {
  const file = path.join(BUNDLES_ROOT, `${bundle.toLowerCase()}.json`)
  if (!fs.existsSync(file)) return null
  try {
    const raw = fs.readFileSync(file, "utf-8")
    return JSON.parse(raw) as BundleConfig
  } catch {
    return null
  }
}

export function loadDimensionSpec(dimension: DimensionName, variant: Variant): DimensionSpec | null {
  const file = path.join(SPECS_ROOT, `${dimension}-${variant.toLowerCase()}.json`)
  if (!fs.existsSync(file)) return null
  try {
    const raw = fs.readFileSync(file, "utf-8")
    return JSON.parse(raw) as DimensionSpec
  } catch {
    return null
  }
}

export function listAvailableBundles(): string[] {
  if (!fs.existsSync(BUNDLES_ROOT)) return []
  try {
    const files = fs.readdirSync(BUNDLES_ROOT)
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", "").toUpperCase())
      .filter((name) => isBundleName(name))
  } catch {
    return []
  }
}

export function loadBundleMetadata(bundle: string): { name: string; description?: string } | null {
  const config = loadBundleConfig(bundle)
  if (!config) return null
  return { name: config.name, description: config.description }
}

export function getAllBundleConfigs(): Array<{ id: string; name: string; description?: string; dimensions: Record<DimensionName, Variant> }> {
  return listAvailableBundles()
    .map((id) => {
      const config = loadBundleConfig(id)
      return config ? { id, ...config } : null
    })
    .filter((c): c is { id: string; name: string; description?: string; dimensions: Record<DimensionName, Variant> } => c != null)
}

export function loadAllSpecData(): Record<DimensionName, Record<string, DimensionSpec | null>> {
  const data = {} as Record<DimensionName, Record<string, DimensionSpec | null>>
  for (const dim of DIMENSION_NAMES) {
    data[dim] = {} as Record<string, DimensionSpec | null>
    for (const variant of VARIANT_NAMES) {
      data[dim][variant] = loadDimensionSpec(dim, variant)
    }
  }
  return data
}

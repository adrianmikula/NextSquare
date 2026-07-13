import { z } from "zod"
import type { CmsBlock, CmsPage } from "@/lib/cms"
import type { DimensionState } from "@/lib/dimensions"

export const DemoStateSchema = z.object({
  theme: z.enum(["A", "B", "C"]).optional(),
  layout: z.enum(["A", "B", "C"]).optional(),
  text: z.enum(["A", "B", "C"]).optional(),
})

export type DemoState = z.infer<typeof DemoStateSchema>
export type Axis = DemoState["theme"]

export function parseDemoState(searchParams: URLSearchParams): DemoState {
  return DemoStateSchema.parse({
    theme: searchParams.has("theme") ? (searchParams.get("theme") as Axis) : undefined,
    layout: searchParams.has("layout") ? (searchParams.get("layout") as Axis) : undefined,
    text: searchParams.has("text") ? (searchParams.get("text") as Axis) : undefined,
  })
}

export function buildDemoSearchParams(state: DemoState): URLSearchParams {
  const params = new URLSearchParams()
  if (state.theme) params.set("theme", state.theme)
  if (state.layout) params.set("layout", state.layout)
  if (state.text) params.set("text", state.text)
  return params
}

export function resolveBlockData(block: CmsBlock, textVariant: Axis): CmsBlock {
  if (!textVariant) return block
  const resolvedData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(block.data)) {
    if (isVariantField(value)) {
      const variantMap = value as Record<string, string>
      resolvedData[key] = variantMap[textVariant.toLowerCase()] ?? variantMap["a"] ?? value
    } else {
      resolvedData[key] = value
    }
  }
  return { ...block, data: resolvedData }
}

export function resolveBlockDataForVariantA(block: CmsBlock): CmsBlock {
  const resolvedData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(block.data)) {
    if (isVariantField(value)) {
      resolvedData[key] = (value as { a: string }).a
    } else {
      resolvedData[key] = value
    }
  }
  return { ...block, data: resolvedData }
}

export function resolveBlockDataForB(block: CmsBlock): CmsBlock {
  const resolvedData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(block.data)) {
    if (isVariantField(value)) {
      resolvedData[key] = (value as { b: string }).b
    } else {
      resolvedData[key] = value
    }
  }
  return { ...block, data: resolvedData }
}

export function resolveBlockDataForC(block: CmsBlock): CmsBlock {
  const resolvedData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(block.data)) {
    if (isVariantField(value)) {
      const variantMap = value as Record<string, string>
      resolvedData[key] = variantMap["c"] ?? variantMap["a"]
    } else {
      resolvedData[key] = value
    }
  }
  return { ...block, data: resolvedData }
}

export function resolvePageBlocks(
  page: CmsPage & { variants?: Array<{ id: string; blocks: CmsBlock[] }> },
  layoutVariant: Axis
): CmsBlock[] {
  if (!page.variants || page.variants.length === 0) return page.blocks
  const variant = layoutVariant
    ? page.variants.find((v) => v.id === layoutVariant) ?? page.variants[0]
    : page.variants[0]
  return variant.blocks
}

export function isVariantField(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false
  return "a" in (value as Record<string, unknown>) && "b" in (value as Record<string, unknown>)
}

function dimToAxis(dim: string): Axis {
  if (dim === "C") return "C"
  if (dim === "B") return "B"
  return "A"
}

export function dimensionStateToDemoState(dimState: DimensionState): DemoState {
  return {
    layout: dimToAxis(dimState.spatial),
    text: dimToAxis(dimState.wording),
  }
}

export function applyDimensionOverridesToVariant(
  block: CmsBlock,
  dimState: DimensionState
): CmsBlock {
  const textVariant = dimToAxis(dimState.wording)
  return resolveBlockData(block, textVariant)
}

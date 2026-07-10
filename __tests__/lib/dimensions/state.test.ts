import { describe, expect, it } from "vitest"
import { defaultDimensionState, parseDimensionState, buildDimensionSearchParams } from "@/lib/dimensions/state"
import { DIMENSION_NAMES } from "@/lib/dimensions/types"

describe("defaultDimensionState", () => {
  it("returns A for all dimensions", () => {
    const state = defaultDimensionState()
    for (const dim of DIMENSION_NAMES) {
      expect(state[dim]).toBe("A")
    }
  })
})

describe("parseDimensionState", () => {
  it("returns defaults when no params", () => {
    const params = new URLSearchParams()
    const state = parseDimensionState(params)
    for (const dim of DIMENSION_NAMES) {
      expect(state[dim]).toBe("A")
    }
  })

  it("parses per-dimension overrides", () => {
    const params = new URLSearchParams("color=b&typography=b&spatial=a")
    const state = parseDimensionState(params)
    expect(state.color).toBe("B")
    expect(state.typography).toBe("B")
    expect(state.spatial).toBe("A")
    expect(state.wording).toBe("A")
    expect(state.components).toBe("A")
    expect(state.rhythm).toBe("A")
    expect(state.motion).toBe("A")
    expect(state.imagery).toBe("A")
  })

  it("accepts lowercase variant values", () => {
    const params = new URLSearchParams("color=b")
    const state = parseDimensionState(params)
    expect(state.color).toBe("B")
  })

  it("ignores unknown dimension names", () => {
    const params = new URLSearchParams("color=b&unknown=x")
    const state = parseDimensionState(params)
    expect(state.color).toBe("B")
    expect(state.typography).toBe("A")
  })

  it("ignores invalid variant values", () => {
    const params = new URLSearchParams("color=invalid")
    const state = parseDimensionState(params)
    expect(state.color).toBe("A")
  })
})

describe("buildDimensionSearchParams", () => {
  it("only includes non-default dimensions", () => {
    const state = defaultDimensionState()
    state.color = "B"
    state.components = "B"
    const params = buildDimensionSearchParams(state)
    expect(params.get("color")).toBe("B")
    expect(params.get("components")).toBe("B")
    expect(params.get("spatial")).toBeNull()
    expect(params.get("typography")).toBeNull()
    expect(params.get("wording")).toBeNull()
    expect(params.get("rhythm")).toBeNull()
    expect(params.get("motion")).toBeNull()
    expect(params.get("imagery")).toBeNull()
  })

  it("returns empty for all-defaults state", () => {
    const state = defaultDimensionState()
    const params = buildDimensionSearchParams(state)
    const keys = Array.from(params.keys())
    expect(keys.length).toBe(0)
  })

  it("round-trips correctly", () => {
    const state = defaultDimensionState()
    state.color = "B"
    state.motion = "B"
    state.spatial = "B"
    const params = buildDimensionSearchParams(state)
    const parsed = parseDimensionState(params)
    expect(parsed.color).toBe("B")
    expect(parsed.motion).toBe("B")
    expect(parsed.spatial).toBe("B")
    expect(parsed.typography).toBe("A")
  })
})

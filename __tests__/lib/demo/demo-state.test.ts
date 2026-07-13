// @vitest-environment node
import { describe, expect, it } from "vitest"
import {
  parseDemoState,
  buildDemoSearchParams,
  dimensionStateToDemoState,
  isVariantField,
} from "@/lib/demo/demo-state"
import { defaultDimensionState } from "@/lib/dimensions/state"

describe("parseDemoState", () => {
  it("returns empty state when no params", () => {
    const state = parseDemoState(new URLSearchParams())
    expect(state.theme).toBeUndefined()
    expect(state.layout).toBeUndefined()
    expect(state.text).toBeUndefined()
  })

  it("parses theme, layout, text params", () => {
    const state = parseDemoState(new URLSearchParams("theme=A&layout=B&text=B"))
    expect(state.theme).toBe("A")
    expect(state.layout).toBe("B")
    expect(state.text).toBe("B")
  })

  it("ignores unknown params", () => {
    const state = parseDemoState(new URLSearchParams("color=b&unknown=x"))
    expect(state.theme).toBeUndefined()
    expect(state.layout).toBeUndefined()
    expect(state.text).toBeUndefined()
  })
})

describe("buildDemoSearchParams", () => {
  it("builds params from state", () => {
    const params = buildDemoSearchParams({ theme: "B", layout: "A", text: "B" })
    expect(params.get("theme")).toBe("B")
    expect(params.get("layout")).toBe("A")
    expect(params.get("text")).toBe("B")
  })

  it("omits undefined values", () => {
    const params = buildDemoSearchParams({ theme: undefined, layout: "B", text: undefined })
    expect(params.has("theme")).toBe(false)
    expect(params.get("layout")).toBe("B")
    expect(params.has("text")).toBe(false)
  })
})

describe("dimensionStateToDemoState", () => {
  it("maps spatial to layout, wording to text", () => {
    const dimState = defaultDimensionState()
    dimState.spatial = "B"
    dimState.wording = "B"
    const demoState = dimensionStateToDemoState(dimState)
    expect(demoState.layout).toBe("B")
    expect(demoState.text).toBe("B")
  })

  it("returns A for unchanged dimensions", () => {
    const dimState = defaultDimensionState()
    const demoState = dimensionStateToDemoState(dimState)
    expect(demoState.layout).toBe("A")
    expect(demoState.text).toBe("A")
  })
})

describe("isVariantField", () => {
  it("detects { a, b } objects", () => {
    expect(isVariantField({ a: "hello", b: "world" })).toBe(true)
  })

  it("returns false for non-objects", () => {
    expect(isVariantField("hello")).toBe(false)
    expect(isVariantField(42)).toBe(false)
    expect(isVariantField(null)).toBe(false)
    expect(isVariantField(undefined)).toBe(false)
  })

  it("returns false for objects without both a and b", () => {
    expect(isVariantField({ a: "hello" })).toBe(false)
    expect(isVariantField({ b: "world" })).toBe(false)
    expect(isVariantField({})).toBe(false)
  })
})

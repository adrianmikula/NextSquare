// @vitest-environment node
import { describe, expect, it } from "vitest"
import { DIMENSION_NAMES, VARIANT_NAMES, isDimensionName, isVariant, normalizeVariant } from "@/lib/dimensions/types"

describe("DIMENSION_NAMES", () => {
  it("contains 8 dimensions", () => {
    expect(DIMENSION_NAMES.length).toBe(8)
  })

  it("contains all expected dimensions", () => {
    expect(DIMENSION_NAMES).toContain("spatial")
    expect(DIMENSION_NAMES).toContain("color")
    expect(DIMENSION_NAMES).toContain("typography")
    expect(DIMENSION_NAMES).toContain("wording")
    expect(DIMENSION_NAMES).toContain("imagery")
    expect(DIMENSION_NAMES).toContain("components")
    expect(DIMENSION_NAMES).toContain("rhythm")
    expect(DIMENSION_NAMES).toContain("motion")
  })
})

describe("VARIANT_NAMES", () => {
  it("contains A and B", () => {
    expect(VARIANT_NAMES).toEqual(["A", "B"])
  })
})

describe("isDimensionName", () => {
  it("returns true for valid dimension names", () => {
    expect(isDimensionName("color")).toBe(true)
    expect(isDimensionName("typography")).toBe(true)
    expect(isDimensionName("spatial")).toBe(true)
  })

  it("returns false for invalid names", () => {
    expect(isDimensionName("invalid")).toBe(false)
    expect(isDimensionName("")).toBe(false)
    expect(isDimensionName("theme")).toBe(false)
  })
})

describe("isVariant", () => {
  it("returns true for A and B", () => {
    expect(isVariant("A")).toBe(true)
    expect(isVariant("B")).toBe(true)
  })

  it("is case-insensitive", () => {
    expect(isVariant("a")).toBe(true)
    expect(isVariant("b")).toBe(true)
  })

  it("returns false for other values", () => {
    expect(isVariant("C")).toBe(false)
    expect(isVariant("")).toBe(false)
  })
})

describe("normalizeVariant", () => {
  it("uppercases lowercase input", () => {
    expect(normalizeVariant("a")).toBe("A")
    expect(normalizeVariant("b")).toBe("B")
  })

  it("passes through uppercase", () => {
    expect(normalizeVariant("A")).toBe("A")
    expect(normalizeVariant("B")).toBe("B")
  })
})

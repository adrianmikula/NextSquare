// @vitest-environment node
import { describe, expect, it } from "vitest"
import { cn, safeSearchParams } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
  })

  it("handles conditional classes via clsx", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })

  it("merges conflicting Tailwind classes (last wins)", () => {
    expect(cn("px-4", "px-6")).toBe("px-6")
  })

  it("handles array inputs", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c")
  })

  it("handles undefined and null", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b")
  })
})

describe("safeSearchParams", () => {
  it("returns empty URLSearchParams for null", () => {
    const result = safeSearchParams(null)
    expect(result.toString()).toBe("")
  })

  it("returns empty URLSearchParams for undefined", () => {
    const result = safeSearchParams(undefined)
    expect(result.toString()).toBe("")
  })

  it("returns empty URLSearchParams for empty object", () => {
    const result = safeSearchParams({})
    expect(result.toString()).toBe("")
  })

  it("extracts single string values", () => {
    const result = safeSearchParams({ bundle: "a", color: "b" })
    expect(result.get("bundle")).toBe("a")
    expect(result.get("color")).toBe("b")
  })

  it("takes first element from array values", () => {
    const result = safeSearchParams({ bundle: ["a", "b"] })
    expect(result.get("bundle")).toBe("a")
  })

  it("filters out null and undefined values", () => {
    const result = safeSearchParams({ bundle: "a", unused: null, missing: undefined })
    expect(result.get("bundle")).toBe("a")
    expect(result.has("unused")).toBe(false)
    expect(result.has("missing")).toBe(false)
  })

  it("produces valid query string", () => {
    const result = safeSearchParams({ bundle: "a", color: "b" })
    expect(result.toString()).toContain("bundle=a")
    expect(result.toString()).toContain("color=b")
  })
})

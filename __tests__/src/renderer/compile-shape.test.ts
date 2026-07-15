// @vitest-environment node
import { describe, expect, it } from "vitest"
import { compileShapeToCssVars, getShapeLabel } from "@/src/renderer/compile-shape"
import { getShapeTokens } from "@/src/archetypes/tokens"
import type { ShapeCurve } from "@/src/schema/site-config"

const SHAPES: ShapeCurve[] = ["arc", "squircle", "superellipse", "clothoid"]

const SHAPE_CSS_KEYS = [
  "--shape-corner-radius",
  "--shape-corner-smoothing",
  "--shape-button-radius",
  "--shape-card-radius",
  "--shape-image-radius",
  "--shape-divider-style",
  "--shape-decorative-pattern",
  "--shape-surface-blur",
] as const

describe("compileShapeToCssVars", () => {
  it("returns all expected keys for every shape", () => {
    for (const shape of SHAPES) {
      const vars = compileShapeToCssVars(shape)
      for (const key of SHAPE_CSS_KEYS) {
        expect(vars).toHaveProperty(key)
        expect(vars[key]).toBeTypeOf("string")
      }
    }
  })

  it("produces distinct values per shape", () => {
    const results = SHAPES.map((s) => compileShapeToCssVars(s))
    const cornerRadii = results.map((r) => r["--shape-corner-radius"])
    const uniqueRadii = new Set(cornerRadii)
    expect(uniqueRadii.size).toBe(4)
  })

  it("arc has minimal corner radius and straight divider", () => {
    const vars = compileShapeToCssVars("arc")
    expect(vars["--shape-corner-radius"]).toBe("8px")
    expect(vars["--shape-corner-smoothing"]).toBe("0")
    expect(vars["--shape-divider-style"]).toBe("solid")
  })

  it("clothoid has largest corner radius and decorative pattern", () => {
    const vars = compileShapeToCssVars("clothoid")
    expect(vars["--shape-corner-radius"]).toBe("24px")
    expect(vars["--shape-corner-smoothing"]).toBe("1")
    expect(vars["--shape-decorative-pattern"]).toBe("blob-scene")
  })

  it("superellipse has corner-smoothing 0.85 and dashed divider", () => {
    const vars = compileShapeToCssVars("superellipse")
    expect(vars["--shape-corner-smoothing"]).toBe("0.85")
    expect(vars["--shape-divider-style"]).toBe("dashed")
  })

  it("squircle has 12px corner radius", () => {
    const vars = compileShapeToCssVars("squircle")
    expect(vars["--shape-corner-radius"]).toBe("12px")
    expect(vars["--shape-corner-smoothing"]).toBe("0.6")
  })

  it("falls back to squircle for unknown shape", () => {
    const vars = compileShapeToCssVars("unknown" as ShapeCurve)
    expect(vars["--shape-corner-radius"]).toBe("12px")
  })
})

describe("getShapeLabel", () => {
  it("returns a label for every shape", () => {
    for (const shape of SHAPES) {
      const label = getShapeLabel(shape)
      expect(label).toBeTypeOf("string")
      expect(label.length).toBeGreaterThan(5)
    }
  })

  it("includes the shape name in the label", () => {
    expect(getShapeLabel("clothoid").toLowerCase()).toContain("clothoid")
  })

  it("falls back to squircle for unknown shape", () => {
    const label = getShapeLabel("unknown" as ShapeCurve)
    expect(label.toLowerCase()).toContain("squircle")
  })
})

describe("shape consistency between compile-shape.ts and archetypes/tokens.ts", () => {
  it("superellipse cornerSmoothing matches (0.85 vs 0.8)", () => {
    const shapeVars = compileShapeToCssVars("superellipse")
    const tokens = getShapeTokens("superellipse")
    const smoothingFromShape = Number(shapeVars["--shape-corner-smoothing"])
    const smoothingFromTokens = tokens.cornerSmoothing
    expect(smoothingFromShape).toBe(smoothingFromTokens)
  })

  it("clothoid cornerRadius matches (24px vs 20px)", () => {
    const shapeVars = compileShapeToCssVars("clothoid")
    const tokens = getShapeTokens("clothoid")
    expect(shapeVars["--shape-corner-radius"]).toBe(tokens.cornerRadius)
  })

  it("superellipse cornerRadius matches (16px vs 16px should agree)", () => {
    const shapeVars = compileShapeToCssVars("superellipse")
    const tokens = getShapeTokens("superellipse")
    expect(shapeVars["--shape-corner-radius"]).toBe(tokens.cornerRadius)
  })

  it("dividerStyle semantics are consistent across files", () => {
    const shapeVars = compileShapeToCssVars("superellipse")
    const tokens = getShapeTokens("superellipse")

    const shapeDivider = shapeVars["--shape-divider-style"]
    const tokensDividerLabel = tokens.dividerStyle

    const dividerMap: Record<string, string[]> = {
      straight: ["solid"],
      rounded: ["solid"],
      curved: ["dashed"],
      organic: ["dotted"],
    }

    const expectedShapeValues = dividerMap[tokensDividerLabel] ?? [tokensDividerLabel]
    expect(expectedShapeValues).toContain(shapeDivider)
  })

  it("squircle values are consistent across files", () => {
    const shapeVars = compileShapeToCssVars("squircle")
    const tokens = getShapeTokens("squircle")
    expect(Number(shapeVars["--shape-corner-smoothing"])).toBe(tokens.cornerSmoothing)
  })

  it("arc values are consistent across files", () => {
    const shapeVars = compileShapeToCssVars("arc")
    const tokens = getShapeTokens("arc")
    expect(Number(shapeVars["--shape-corner-smoothing"])).toBe(tokens.cornerSmoothing)
    expect(shapeVars["--shape-corner-radius"]).toBe(tokens.cornerRadius)
  })
})

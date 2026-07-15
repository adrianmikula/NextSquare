// @vitest-environment node
import { describe, expect, it } from "vitest"
import { getArchetypeTokens } from "@/src/archetypes"
import { getShapeTokens, archetypeTokensToCssVars } from "@/src/archetypes/tokens"
import type { DesignLanguage, Relief, Finish, ShapeCurve } from "@/src/schema/site-config"

const ALL_RELIEFS: Relief[] = ["flat", "glassmorphic", "skeuomorphic", "neumorphic"]
const ALL_FINISHES: Finish[] = ["matte", "frosted", "tinted", "glossy"]
const ALL_SHAPES: ShapeCurve[] = ["arc", "squircle", "superellipse", "clothoid"]

function makeLang(overrides: Partial<DesignLanguage> = {}): DesignLanguage {
  return { relief: "flat", finish: "matte", shape: "squircle", ...overrides }
}

describe("getArchetypeTokens", () => {
  it("returns all required keys", () => {
    const tokens = getArchetypeTokens(makeLang())
    const expectedKeys = [
      "surfaceBg",
      "surfaceShadow",
      "surfaceBorder",
      "cardBg",
      "cardShadow",
      "buttonShape",
      "inputStyle",
      "navStyle",
    ] as const
    for (const key of expectedKeys) {
      expect(tokens).toHaveProperty(key)
      expect(tokens[key]).toBeTypeOf("string")
    }
  })

  it("flat relief has no shadow on surfaces", () => {
    const tokens = getArchetypeTokens(makeLang({ relief: "flat" }))
    expect(tokens.surfaceShadow).toBe("none")
    expect(tokens.cardShadow).toBe("none")
  })

  it("glassmorphic relief uses rgba backgrounds (with frosted finish)", () => {
    const tokens = getArchetypeTokens(makeLang({ relief: "glassmorphic", finish: "frosted" }))
    expect(tokens.surfaceBg).toContain("rgba")
    expect(tokens.cardBg).toContain("rgba")
    expect(tokens.surfaceShadow).toContain("32px")
  })

  it("neumorphic relief uses dual shadows", () => {
    const tokens = getArchetypeTokens(makeLang({ relief: "neumorphic" }))
    expect(tokens.surfaceShadow).toContain("8px 8px 16px")
    expect(tokens.surfaceShadow).toContain("-8px -8px 16px")
    expect(tokens.surfaceBorder).toBe("none")
  })

  it("skeuomorphic relief uses inset shadows", () => {
    const tokens = getArchetypeTokens(makeLang({ relief: "skeuomorphic" }))
    expect(tokens.surfaceShadow).toContain("inset")
    expect(tokens.cardShadow).toContain("inset")
  })

  it("matte finish uses var(--surface) background", () => {
    const tokens = getArchetypeTokens(makeLang({ finish: "matte" }))
    expect(tokens.surfaceBg).toBe("var(--surface)")
  })

  it("glossy finish uses gradient background", () => {
    const tokens = getArchetypeTokens(makeLang({ finish: "glossy" }))
    expect(tokens.surfaceBg).toContain("linear-gradient")
    expect(tokens.surfaceShadow).toContain("inset")
  })

  it("frosted finish uses rgba background", () => {
    const tokens = getArchetypeTokens(makeLang({ finish: "frosted" }))
    expect(tokens.surfaceBg).toContain("rgba")
    expect(tokens.surfaceBorder).toContain("rgba")
  })

  it("tinted finish uses color-mix", () => {
    const tokens = getArchetypeTokens(makeLang({ finish: "tinted" }))
    expect(tokens.surfaceBg).toContain("color-mix")
  })

  it("merges relief and finish correctly", () => {
    const tokens = getArchetypeTokens(makeLang({ relief: "glassmorphic", finish: "frosted" }))
    expect(tokens.surfaceShadow).toContain("32px")
    expect(tokens.surfaceBg).toContain("rgba")
  })

  it("produces distinct tokens per relief", () => {
    const results = ALL_RELIEFS.map((r) => getArchetypeTokens(makeLang({ relief: r })))
    const shadows = results.map((t) => t.surfaceShadow)
    const uniqueShadows = new Set(shadows)
    expect(uniqueShadows.size).toBe(4)
  })

  it("produces distinct tokens per finish", () => {
    const results = ALL_FINISHES.map((f) => getArchetypeTokens(makeLang({ finish: f })))
    const backgrounds = results.map((t) => t.surfaceBg)
    const uniqueBgs = new Set(backgrounds)
    expect(uniqueBgs.size).toBe(4)
  })
})

describe("getShapeTokens", () => {
  it("returns all required shape token fields", () => {
    const tokens = getShapeTokens("squircle")
    const expectedKeys = ["cornerRadius", "cornerSmoothing", "dividerStyle", "decorativePattern"]
    for (const key of expectedKeys) {
      expect(tokens).toHaveProperty(key)
    }
  })

  it("clothoid has decorative pattern", () => {
    const tokens = getShapeTokens("clothoid")
    expect(tokens.decorativePattern).toBe("blob")
    expect(tokens.cornerSmoothing).toBe(1)
  })

  it("arc has no decorative pattern and straight divider", () => {
    const tokens = getShapeTokens("arc")
    expect(tokens.decorativePattern).toBeNull()
    expect(tokens.dividerStyle).toBe("straight")
  })

  it("returns distinct tokens per shape", () => {
    const results = ALL_SHAPES.map((s) => getShapeTokens(s))
    const radii = results.map((t) => t.cornerRadius)
    const uniqueRadii = new Set(radii)
    expect(uniqueRadii.size).toBe(4)
  })

  it("falls back to squircle for unknown shape", () => {
    const tokens = getShapeTokens("unknown" as ShapeCurve)
    expect(tokens.cornerRadius).toBe("12px")
    expect(tokens.cornerSmoothing).toBe(0.6)
  })
})

describe("archetypeTokensToCssVars", () => {
  it("returns all expected CSS var keys", () => {
    const archTokens = getArchetypeTokens(makeLang())
    const shapeTokens = getShapeTokens("squircle")
    const vars = archetypeTokensToCssVars(archTokens, shapeTokens)

    const expectedKeys = [
      "--arch-surface-bg",
      "--arch-surface-shadow",
      "--arch-surface-border",
      "--arch-card-bg",
      "--arch-card-shadow",
      "--arch-corner-radius",
      "--arch-corner-smoothing",
      "--arch-divider-style",
    ]
    for (const key of expectedKeys) {
      expect(vars).toHaveProperty(key)
      expect(vars[key]).toBeTypeOf("string")
    }
  })

  it("round-trips shape tokens through CSS vars", () => {
    const shapeTokens = getShapeTokens("clothoid")
    const archTokens = getArchetypeTokens(makeLang())
    const vars = archetypeTokensToCssVars(archTokens, shapeTokens)

    expect(vars["--arch-corner-radius"]).toBe(shapeTokens.cornerRadius)
    expect(vars["--arch-corner-smoothing"]).toBe(String(shapeTokens.cornerSmoothing))
    expect(vars["--arch-divider-style"]).toBe(shapeTokens.dividerStyle)
  })
})

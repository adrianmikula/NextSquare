// @vitest-environment node
import { describe, expect, it } from "vitest"
import {
  ARCHETYPE_CONSTRAINTS,
  isValidArchetypeForIndustry,
  getDefaultTunerRange,
} from "@/src/archetypes/constraints"
import type { DesignLanguage, Relief, Finish } from "@/src/schema/site-config"
import { RELIEF_OPTIONS, FINISH_OPTIONS } from "@/src/archetypes"

function makeLang(overrides: Partial<DesignLanguage> = {}): DesignLanguage {
  return { relief: "flat", finish: "matte", shape: "squircle", ...overrides }
}

describe("ARCHETYPE_CONSTRAINTS", () => {
  it("has an entry for every relief type", () => {
    const reliefs = ARCHETYPE_CONSTRAINTS.map((c) => c.relief)
    expect(new Set(reliefs)).toEqual(new Set(RELIEF_OPTIONS))
  })

  it("each constraint has a description", () => {
    for (const c of ARCHETYPE_CONSTRAINTS) {
      expect(c.description).toBeTypeOf("string")
      expect(c.description.length).toBeGreaterThan(5)
    }
  })

  it("flat relief allows all finishes", () => {
    const flat = ARCHETYPE_CONSTRAINTS.find((c) => c.relief === "flat")!
    expect(flat.finishes).toEqual(FINISH_OPTIONS)
  })

  it("glassmorphic only allows frosted and tinted finishes", () => {
    const glass = ARCHETYPE_CONSTRAINTS.find((c) => c.relief === "glassmorphic")!
    expect(glass.finishes).toEqual(["frosted", "tinted"])
    expect(glass.finishes).not.toContain("matte")
    expect(glass.finishes).not.toContain("glossy")
  })

  it("skeuomorphic only allows matte and glossy finishes", () => {
    const skeuo = ARCHETYPE_CONSTRAINTS.find((c) => c.relief === "skeuomorphic")!
    expect(skeuo.finishes).toEqual(["matte", "glossy"])
    expect(skeuo.finishes).not.toContain("frosted")
    expect(skeuo.finishes).not.toContain("tinted")
  })

  it("neumorphic only allows matte and tinted finishes", () => {
    const neumo = ARCHETYPE_CONSTRAINTS.find((c) => c.relief === "neumorphic")!
    expect(neumo.finishes).toEqual(["matte", "tinted"])
    expect(neumo.finishes).not.toContain("frosted")
    expect(neumo.finishes).not.toContain("glossy")
  })

  it("all constraints allow all industries (*)", () => {
    for (const c of ARCHETYPE_CONSTRAINTS) {
      expect(c.allowedIndustries).toContain("*")
    }
  })
})

describe("isValidArchetypeForIndustry", () => {
  it("returns true for valid relief and finish with any industry", () => {
    expect(isValidArchetypeForIndustry(makeLang({ relief: "flat", finish: "matte" }), "cafe")).toBe(true)
  })

  it("returns true for glassmorphic with frosted finish", () => {
    expect(isValidArchetypeForIndustry(makeLang({ relief: "glassmorphic", finish: "frosted" }), "tech")).toBe(true)
  })

  it("returns false for glassmorphic with matte finish", () => {
    expect(isValidArchetypeForIndustry(makeLang({ relief: "glassmorphic", finish: "matte" }), "cafe")).toBe(false)
  })

  it("returns false for skeuomorphic with frosted finish", () => {
    expect(isValidArchetypeForIndustry(makeLang({ relief: "skeuomorphic", finish: "frosted" }), "cafe")).toBe(false)
  })

  it("returns false for neumorphic with glossy finish", () => {
    expect(isValidArchetypeForIndustry(makeLang({ relief: "neumorphic", finish: "glossy" }), "cafe")).toBe(false)
  })

  it("returns false for unknown relief", () => {
    expect(isValidArchetypeForIndustry(makeLang({ relief: "unknown" as Relief }), "cafe")).toBe(false)
  })

  it("is case-sensitive for industry matching (all are lowercase)", () => {
    expect(isValidArchetypeForIndustry(makeLang({ relief: "flat" }), "CAFE")).toBe(true)
  })
})

describe("getDefaultTunerRange", () => {
  it("returns {0,1} for flat relief", () => {
    expect(getDefaultTunerRange(makeLang({ relief: "flat" }))).toEqual({ min: 0, max: 1 })
  })

  it("returns {0,1} for skeuomorphic relief", () => {
    expect(getDefaultTunerRange(makeLang({ relief: "skeuomorphic" }))).toEqual({ min: 0, max: 1 })
  })

  it("returns {0.3,0.8} for neumorphic relief", () => {
    expect(getDefaultTunerRange(makeLang({ relief: "neumorphic" }))).toEqual({ min: 0.3, max: 0.8 })
  })

  it("returns {0.2,0.9} for glassmorphic relief", () => {
    expect(getDefaultTunerRange(makeLang({ relief: "glassmorphic" }))).toEqual({ min: 0.2, max: 0.9 })
  })

  it("returns {0,1} for unknown relief", () => {
    expect(getDefaultTunerRange(makeLang({ relief: "unknown" as Relief }))).toEqual({ min: 0, max: 1 })
  })
})

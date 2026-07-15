// @vitest-environment node
import { describe, expect, it } from "vitest"
import {
  TUNER_PROFILES,
  getTunerProfile,
  getProfileForIndustry,
} from "@/src/renderer/tuner-profiles"

const PROFILE_NAMES = [
  "Warm & Spacious",
  "Bold & Compact",
  "Calm & Professional",
  "Dynamic & Playful",
  "Balanced",
  "Minimal & Airy",
  "Luxury & Premium",
  "Data Dense",
]

describe("TUNER_PROFILES", () => {
  it("has 8 profiles", () => {
    expect(TUNER_PROFILES.length).toBe(8)
  })

  it("every profile has a name, description, and values with 5 keys", () => {
    for (const profile of TUNER_PROFILES) {
      expect(profile.name).toBeTypeOf("string")
      expect(profile.description).toBeTypeOf("string")
      expect(profile.description.length).toBeGreaterThan(10)
      expect(profile.values).toHaveProperty("warmth")
      expect(profile.values).toHaveProperty("density")
      expect(profile.values).toHaveProperty("motion")
      expect(profile.values).toHaveProperty("contrast")
      expect(profile.values).toHaveProperty("narrative")
      expect(Object.keys(profile.values).length).toBe(5)
    }
  })

  it("all tuner values are in range [0, 1]", () => {
    for (const profile of TUNER_PROFILES) {
      const { warmth, density, motion, contrast, narrative } = profile.values
      for (const val of [warmth, density, motion, contrast, narrative]) {
        expect(val).toBeGreaterThanOrEqual(0)
        expect(val).toBeLessThanOrEqual(1)
      }
    }
  })

  it("each profile has a unique name", () => {
    const names = TUNER_PROFILES.map((p) => p.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it("the Balanced profile has all 0.5 values", () => {
    const balanced = TUNER_PROFILES.find((p) => p.name === "Balanced")!
    expect(balanced.values).toEqual({
      warmth: 0.5,
      density: 0.5,
      motion: 0.5,
      contrast: 0.5,
      narrative: 0.5,
    })
  })
})

describe("getTunerProfile", () => {
  it("returns the profile for a known name", () => {
    const profile = getTunerProfile("Warm & Spacious")
    expect(profile).toBeDefined()
    expect(profile!.name).toBe("Warm & Spacious")
    expect(profile!.values.warmth).toBe(0.8)
  })

  it("returns undefined for an unknown name", () => {
    expect(getTunerProfile("NonExistentProfile")).toBeUndefined()
  })

  it("returns undefined for empty string", () => {
    expect(getTunerProfile("")).toBeUndefined()
  })

  it("is case-sensitive", () => {
    expect(getTunerProfile("warm & spacious")).toBeUndefined()
    expect(getTunerProfile("Warm & Spacious")).toBeDefined()
  })

  it("can find every defined profile", () => {
    for (const name of PROFILE_NAMES) {
      expect(getTunerProfile(name)).toBeDefined()
    }
  })
})

describe("getProfileForIndustry", () => {
  it("returns Warm & Spacious for cafe", () => {
    const profile = getProfileForIndustry("cafe")
    expect(profile.name).toBe("Warm & Spacious")
  })

  it("returns Warm & Spacious for restaurant", () => {
    expect(getProfileForIndustry("restaurant").name).toBe("Warm & Spacious")
  })

  it("returns Warm & Spacious for hospitality", () => {
    expect(getProfileForIndustry("hospitality").name).toBe("Warm & Spacious")
  })

  it("returns Bold & Compact for saas", () => {
    expect(getProfileForIndustry("saas").name).toBe("Bold & Compact")
  })

  it("returns Bold & Compact for tech", () => {
    expect(getProfileForIndustry("tech").name).toBe("Bold & Compact")
  })

  it("returns Calm & Professional for finance", () => {
    expect(getProfileForIndustry("finance").name).toBe("Calm & Professional")
  })

  it("returns Calm & Professional for legal", () => {
    expect(getProfileForIndustry("legal").name).toBe("Calm & Professional")
  })

  it("returns Dynamic & Playful for entertainment", () => {
    expect(getProfileForIndustry("entertainment").name).toBe("Dynamic & Playful")
  })

  it("returns Dynamic & Playful for education", () => {
    expect(getProfileForIndustry("education").name).toBe("Dynamic & Playful")
  })

  it("returns Minimal & Airy for portfolio", () => {
    expect(getProfileForIndustry("portfolio").name).toBe("Minimal & Airy")
  })

  it("returns Minimal & Airy for agency", () => {
    expect(getProfileForIndustry("agency").name).toBe("Minimal & Airy")
  })

  it("returns Balanced for ecommerce", () => {
    expect(getProfileForIndustry("ecommerce").name).toBe("Balanced")
  })

  it("returns Balanced for general", () => {
    expect(getProfileForIndustry("general").name).toBe("Balanced")
  })

  it("returns Balanced for unknown industry", () => {
    expect(getProfileForIndustry("unknown-industry").name).toBe("Balanced")
  })

  it("is case-insensitive", () => {
    expect(getProfileForIndustry("CAFE").name).toBe("Warm & Spacious")
    expect(getProfileForIndustry("SaaS").name).toBe("Bold & Compact")
  })
})

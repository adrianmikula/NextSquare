// @vitest-environment node
import { describe, expect, it } from "vitest"
import {
  compileTunersToCssVars,
  compileColorBridge,
  cssVarsToStyleString,
  tunerValuesToTasteEngine,
  DEFAULT_TUNER_VALUES,
} from "@/src/renderer/compile-tuners"

const TUNER_KEYS = [
  "--tuner-warmth",
  "--tuner-density",
  "--tuner-motion",
  "--tuner-contrast",
  "--tuner-narrative",
  "--tuner-spacing-scale",
  "--tuner-padding-compact",
  "--tuner-gap-size",
  "--tuner-section-py",
  "--tuner-transition-duration",
  "--tuner-hover-lift",
  "--tuner-scale-factor",
  "--tuner-border-opacity",
  "--tuner-text-weight-heading",
  "--tuner-text-weight-body",
  "--tuner-shadow-intensity",
  "--tuner-section-min-height",
  "--tuner-hero-scale",
  "--tuner-content-max-width",
  "--tuner-accent-hue",
  "--tuner-accent-saturation",
  "--tuner-accent-lightness",
] as const

const COLOR_BRIDGE_KEYS = [
  "--color-primary",
  "--color-primary-hover",
  "--color-primary-muted",
  "--color-hero-bg",
  "--color-hero-text",
  "--color-hero-muted",
  "--color-section-bg",
  "--color-section-bg-alt",
  "--color-section-bg-cta",
  "--color-section-bg-inverse",
  "--color-card-bg",
  "--color-card-border",
  "--color-heading",
  "--color-body",
  "--color-muted",
  "--color-cta-text",
  "--color-background-value",
  "--border",
  "--surface",
  "--card",
  "--bg",
  "--color-shadow",
] as const

describe("compileTunersToCssVars", () => {
  it("returns default values when no tuners provided", () => {
    const vars = compileTunersToCssVars({})
    for (const key of TUNER_KEYS) {
      expect(vars).toHaveProperty(key)
    }
  })

  it("returns all expected keys", () => {
    const vars = compileTunersToCssVars(DEFAULT_TUNER_VALUES)
    expect(Object.keys(vars).length).toBe(TUNER_KEYS.length)
    for (const key of TUNER_KEYS) {
      expect(vars).toHaveProperty(key)
      expect(vars[key]).toBeTypeOf("string")
    }
  })

  it("maps warmth to hue range (cool at 0, warm at 1)", () => {
    const cool = compileTunersToCssVars({ warmth: 0 })
    const warm = compileTunersToCssVars({ warmth: 1 })
    expect(Number(cool["--tuner-accent-hue"])).toBeGreaterThan(Number(warm["--tuner-accent-hue"]))
  })

  it("maps density to spacing values", () => {
    const sparse = compileTunersToCssVars({ density: 0 })
    const dense = compileTunersToCssVars({ density: 1 })
    expect(sparse["--tuner-section-py"]).toBe("6rem")
    expect(dense["--tuner-section-py"]).toBe("3rem")
    expect(sparse["--tuner-padding-compact"]).toBe("2.5rem")
    expect(dense["--tuner-padding-compact"]).toBe("1rem")
  })

  it("maps motion to transition duration", () => {
    const still = compileTunersToCssVars({ motion: 0 })
    const cinematic = compileTunersToCssVars({ motion: 1 })
    expect(still["--tuner-transition-duration"]).toBe("200ms")
    expect(cinematic["--tuner-transition-duration"]).toBe("800ms")
    expect(still["--tuner-hover-lift"]).toBe("none")
    expect(cinematic["--tuner-hover-lift"]).toBe("translateY(-4px)")
  })

  it("maps contrast to text weight and border opacity", () => {
    const soft = compileTunersToCssVars({ contrast: 0 })
    const sharp = compileTunersToCssVars({ contrast: 1 })
    expect(soft["--tuner-text-weight-heading"]).toBe("400")
    expect(sharp["--tuner-text-weight-heading"]).toBe("700")
    expect(soft["--tuner-border-opacity"]).toBe("0.1")
    expect(sharp["--tuner-border-opacity"]).toBe("0.5")
  })

  it("maps narrative to section min-height", () => {
    const minimal = compileTunersToCssVars({ narrative: 0 })
    const expansive = compileTunersToCssVars({ narrative: 1 })
    expect(minimal["--tuner-section-min-height"]).toBe("40vh")
    expect(expansive["--tuner-section-min-height"]).toBe("80vh")
  })
})

describe("compileColorBridge", () => {
  it("returns all expected color keys", () => {
    const vars = compileColorBridge(DEFAULT_TUNER_VALUES, "flat")
    for (const key of COLOR_BRIDGE_KEYS) {
      expect(vars).toHaveProperty(key)
      expect(vars[key]).toBeTypeOf("string")
    }
  })

  it("produces different HSL values for cold vs warm", () => {
    const cold = compileColorBridge({ warmth: 0, contrast: 0.5 }, "flat")
    const warm = compileColorBridge({ warmth: 1, contrast: 0.5 }, "flat")
    expect(cold["--color-primary"]).not.toBe(warm["--color-primary"])
  })

  it("produces darker text at high contrast", () => {
    const soft = compileColorBridge({ contrast: 0, warmth: 0.5 }, "flat")
    const sharp = compileColorBridge({ contrast: 1, warmth: 0.5 }, "flat")
    const softMatch = soft["--color-heading"]?.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%\)/)
    const sharpMatch = sharp["--color-heading"]?.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%\)/)
    expect(softMatch).not.toBeNull()
    expect(sharpMatch).not.toBeNull()
    expect(Number(sharpMatch![1])).toBeLessThan(Number(softMatch![1]))
  })

  it("always sets --color-cta-text to white", () => {
    const vars = compileColorBridge({ warmth: 0, contrast: 0 }, "flat")
    expect(vars["--color-cta-text"]).toBe("#ffffff")
  })

  it("works with all relief types", () => {
    for (const relief of ["flat", "glassmorphic", "skeuomorphic", "neumorphic"] as const) {
      const vars = compileColorBridge(DEFAULT_TUNER_VALUES, relief)
      expect(vars["--color-hero-bg"]).toBeTypeOf("string")
    }
  })

  it("produces different color bridge values for flat vs glassmorphic vs skeuomorphic vs neumorphic", () => {
    const flat = compileColorBridge(DEFAULT_TUNER_VALUES, "flat")
    const glass = compileColorBridge(DEFAULT_TUNER_VALUES, "glassmorphic")
    const skeo = compileColorBridge(DEFAULT_TUNER_VALUES, "skeuomorphic")
    const neumo = compileColorBridge(DEFAULT_TUNER_VALUES, "neumorphic")

    const keys = ["--color-hero-bg", "--color-section-bg", "--color-card-bg"] as const
    for (const key of keys) {
      const values = new Set([flat[key], glass[key], skeo[key], neumo[key]])
      expect(values.size).toBe(4)
    }
  })
})

describe("tunerValuesToTasteEngine", () => {
  it("maps warmth to abstraction", () => {
    const result = tunerValuesToTasteEngine({ warmth: 0.8 })
    expect(result.abstraction).toBe(0.8)
  })

  it("maps density directly", () => {
    const result = tunerValuesToTasteEngine({ density: 0.3 })
    expect(result.density).toBe(0.3)
  })

  it("maps motion directly", () => {
    const result = tunerValuesToTasteEngine({ motion: 0.7 })
    expect(result.motion).toBe(0.7)
  })

  it("maps contrast directly", () => {
    const result = tunerValuesToTasteEngine({ contrast: 0.9 })
    expect(result.contrast).toBe(0.9)
  })

  it("maps narrative directly", () => {
    const result = tunerValuesToTasteEngine({ narrative: 0.2 })
    expect(result.narrative).toBe(0.2)
  })

  it("uses defaults for missing tuners", () => {
    const result = tunerValuesToTasteEngine({ warmth: 0.1 })
    expect(result.abstraction).toBe(0.1)
    expect(result.density).toBe(DEFAULT_TUNER_VALUES.density)
    expect(result.motion).toBe(DEFAULT_TUNER_VALUES.motion)
    expect(result.contrast).toBe(DEFAULT_TUNER_VALUES.contrast)
    expect(result.narrative).toBe(DEFAULT_TUNER_VALUES.narrative)
  })

  it("returns all defaults for empty input", () => {
    const result = tunerValuesToTasteEngine({})
    expect(result.abstraction).toBe(DEFAULT_TUNER_VALUES.warmth)
    expect(result.density).toBe(DEFAULT_TUNER_VALUES.density)
    expect(result.motion).toBe(DEFAULT_TUNER_VALUES.motion)
    expect(result.contrast).toBe(DEFAULT_TUNER_VALUES.contrast)
    expect(result.narrative).toBe(DEFAULT_TUNER_VALUES.narrative)
  })

  it("returns exactly 5 keys", () => {
    const result = tunerValuesToTasteEngine({ warmth: 0.5, density: 0.5, motion: 0.5, contrast: 0.5, narrative: 0.5 })
    expect(Object.keys(result).length).toBe(5)
  })
})

describe("cssVarsToStyleString", () => {
  it("converts vars to semicolon-separated string", () => {
    const result = cssVarsToStyleString({ "--a": "1", "--b": "2" })
    expect(result).toBe("--a:1;--b:2")
  })

  it("skips undefined and null values", () => {
    const result = cssVarsToStyleString({
      "--a": "1",
      "--b": undefined as unknown as string,
      "--c": null as unknown as string,
    })
    expect(result).toBe("--a:1")
    expect(result).not.toContain("--b")
    expect(result).not.toContain("--c")
  })

  it("returns empty string for empty input", () => {
    expect(cssVarsToStyleString({})).toBe("")
  })
})

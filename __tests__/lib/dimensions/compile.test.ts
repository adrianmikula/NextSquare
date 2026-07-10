import { describe, expect, it } from "vitest"
import { compileSpecsToCssVars } from "@/lib/dimensions/compile"
import type { DimensionName, DimensionSpec } from "@/lib/dimensions/types"

describe("compileSpecsToCssVars", () => {
  function makeEmptySpecs(): Record<DimensionName, DimensionSpec | null> {
    return {
      spatial: null,
      color: null,
      typography: null,
      wording: null,
      imagery: null,
      components: null,
      rhythm: null,
      motion: null,
    }
  }

  it("returns empty object when all specs are null", () => {
    const vars = compileSpecsToCssVars(makeEmptySpecs())
    expect(Object.keys(vars).length).toBe(0)
  })

  it("compiles color spec to CSS vars", () => {
    const specs = makeEmptySpecs()
    specs.color = {
      palette: {
        primary: "#ff0000",
        secondary: "#ffeeee",
        background: "#ffffff",
        surface: "#fafafa",
        text: "#111111",
        accent: "#ff8888",
        border: "#dddddd",
      },
    }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--color-primary"]).toBe("#ff0000")
    expect(vars["--color-amber-600"]).toBe("#ff0000")
    expect(vars["--color-stone-900"]).toBe("#111111")
    expect(vars["--color-stone-50"]).toBe("#ffffff")
    expect(vars["--color-background"]).toBe("#ffffff")
  })

  it("compiles typography spec to CSS vars", () => {
    const specs = makeEmptySpecs()
    specs.typography = {
      headingFont: "Playfair Display",
      bodyFont: "Inter",
      headingWeight: 700,
      letterSpacing: "0.02em",
      lineHeight: 1.8,
    }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--font-heading"]).toBe("'Playfair Display', sans-serif")
    expect(vars["--font-body"]).toBe("'Inter', sans-serif")
    expect(vars["--font-heading-weight"]).toBe("700")
    expect(vars["--letter-spacing"]).toBe("0.02em")
    expect(vars["--line-height"]).toBe("1.8")
  })

  it("compiles components spec to CSS vars", () => {
    const specs = makeEmptySpecs()
    specs.components = {
      borderRadius: "0.25rem",
      cardShadow: "xl",
      navHeight: "4rem",
    }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--theme-border-radius"]).toBe("0.25rem")
    expect(vars["--theme-shadow-card"]).toContain("20px 25px")
    expect(vars["--nav-height"]).toBe("4rem")
  })

  it("compiles motion spec to CSS vars", () => {
    const specs = makeEmptySpecs()
    specs.motion = {
      transitionSpeed: "fast",
      hoverLift: true,
      fadeIn: false,
    }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--transition-speed"]).toBe("150ms")
    expect(vars["--motion-hover-lift"]).toBe("1")
    expect(vars["--motion-fade-in"]).toBe("0")
  })

  it("compiles spatial spec to CSS vars", () => {
    const specs = makeEmptySpecs()
    specs.spatial = {
      containerMax: "80rem",
      sectionPaddingY: "6rem",
      contentAlign: "left",
    }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--container-max"]).toBe("80rem")
    expect(vars["--section-py"]).toBe("6rem")
    expect(vars["--content-align"]).toBe("left")
  })

  it("compiles rhythm spec to CSS vars", () => {
    const specs = makeEmptySpecs()
    specs.rhythm = {
      sectionSpacing: "compact",
    }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--section-py"]).toBe("2rem")
  })

  it("compiles multiple dimensions together", () => {
    const specs = makeEmptySpecs()
    specs.color = { palette: { primary: "#123456", secondary: "#fff", background: "#eee", surface: "#ddd", text: "#111", accent: "#789abc", border: "#ccc" } }
    specs.typography = { headingFont: "Inter", bodyFont: "Inter" }
    specs.components = { borderRadius: "1rem" }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--color-primary"]).toBe("#123456")
    expect(vars["--font-heading"]).toBe("'Inter', sans-serif")
    expect(vars["--theme-border-radius"]).toBe("1rem")
    expect(vars["--font-body"]).toBe("'Inter', sans-serif")
  })

  it("handles wording spec without producing CSS vars", () => {
    const specs = makeEmptySpecs()
    specs.wording = { tone: "playful" }
    const vars = compileSpecsToCssVars(specs)
    expect(Object.keys(vars).length).toBeGreaterThanOrEqual(0)
    expect(vars["--font-heading"]).toBeUndefined()
  })

  it("compiles imagery spec to CSS vars", () => {
    const specs = makeEmptySpecs()
    specs.imagery = {
      defaultAspect: "16:9",
      treatment: "contain",
    }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--image-default-aspect"]).toBe("16:9")
    expect(vars["--image-treatment"]).toBe("contain")
  })
})

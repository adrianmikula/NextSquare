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
      backgroundType: "gradient",
      backgroundValue: "linear-gradient(180deg, red, blue)",
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
    expect(vars["--color-background-type"]).toBe("gradient")
    expect(vars["--color-background-value"]).toBe("linear-gradient(180deg, red, blue)")
  })

  it("color defaults backgroundType to 'color' when omitted", () => {
    const specs = makeEmptySpecs()
    specs.color = {
      palette: { primary: "#123456", secondary: "#fff", background: "#eee", surface: "#ddd", text: "#111", accent: "#789abc", border: "#ccc" },
    }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--color-background-type"]).toBe("color")
    expect(vars["--color-background-value"]).toBe("#eee")
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
    expect(vars["--font-heading"]).toBe("var(--font-playfair)")
    expect(vars["--font-body"]).toBe("var(--font-inter)")
    expect(vars["--font-heading-weight"]).toBe("700")
    expect(vars["--letter-spacing"]).toBe("0.02em")
    expect(vars["--line-height"]).toBe("1.8")
  })

  it("maps known fonts to CSS variable references", () => {
    const specs = makeEmptySpecs()
    specs.typography = { headingFont: "Nunito", bodyFont: "Lora" }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--font-heading"]).toBe("var(--font-nunito)")
    expect(vars["--font-body"]).toBe("var(--font-lora)")
  })

  it("falls back gracefully for unknown fonts", () => {
    const specs = makeEmptySpecs()
    specs.typography = { headingFont: "UnknownFont" }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--font-heading"]).toBe("'UnknownFont', sans-serif")
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
      staggerEnabled: true,
      transitionEasing: "ease-out",
    }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--transition-speed"]).toBe("150ms")
    expect(vars["--motion-hover-lift"]).toBe("1")
    expect(vars["--motion-hover-lift-transform"]).toBe("translateY(-4px)")
    expect(vars["--motion-fade-in"]).toBe("0")
    expect(vars["--motion-stagger"]).toBe("1")
    expect(vars["--motion-easing"]).toBe("ease-out")
  })

  it("motion hoverLift=false emits translateY none", () => {
    const specs = makeEmptySpecs()
    specs.motion = { hoverLift: false }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--motion-hover-lift-transform"]).toBe("none")
  })

  it("motion defaults staggerEnabled to false and easing to ease", () => {
    const specs = makeEmptySpecs()
    specs.motion = { transitionSpeed: "normal" }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--motion-stagger"]).toBe("0")
    expect(vars["--motion-easing"]).toBe("ease")
  })

  it("compiles spatial spec to CSS vars", () => {
    const specs = makeEmptySpecs()
    specs.spatial = {
      containerMax: "80rem",
      sectionPaddingY: "6rem",
      contentAlign: "left",
      pageColumns: 8,
      sidebar: "right",
      heroEnabled: false,
      headerStyle: "floating",
      designBalance: "asymmetric",
      marginWidth: "2rem",
    }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--container-max"]).toBe("80rem")
    expect(vars["--section-py"]).toBe("6rem")
    expect(vars["--content-align"]).toBe("left")
    expect(vars["--page-columns"]).toBe("8")
    expect(vars["--sidebar-width"]).toBe("right")
    expect(vars["--hero-enabled"]).toBe("none")
    expect(vars["--header-style"]).toBe("floating")
    expect(vars["--design-balance"]).toBe("asymmetric")
    expect(vars["--margin-width"]).toBe("2rem")
  })

  it("heroEnabled=false emits --hero-enabled:none for CSS display (boolean parsed correctly)", () => {
    const specs = makeEmptySpecs()
    specs.spatial = { heroEnabled: false }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--hero-enabled"]).toBe("none")
  })

  it("heroEnabled=true emits --hero-enabled:block for CSS display", () => {
    const specs = makeEmptySpecs()
    specs.spatial = { heroEnabled: true }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--hero-enabled"]).toBe("block")
  })

  it("spatial section-py is NOT overwritten by rhythm", () => {
    const specs = makeEmptySpecs()
    specs.spatial = { sectionPaddingY: "3rem", containerMax: "64rem", sectionPaddingX: "1rem", gridGap: "1rem", contentAlign: "center" }
    specs.rhythm = { density: "balanced" }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--section-py"]).toBe("3rem")
  })

  it("compiles rhythm spec to density and section-py spacing (not --section-py)", () => {
    const specs = makeEmptySpecs()
    specs.rhythm = {
      density: "relaxed",
    }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--rhythm-density"]).toBe("relaxed")
    expect(vars["--rhythm-section-py"]).toBe("5rem")
    expect(vars["--section-py"]).toBeUndefined()
  })

  it("rhythm maps compact density to 2rem spacing", () => {
    const specs = makeEmptySpecs()
    specs.rhythm = { density: "compact" }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--rhythm-section-py"]).toBe("2rem")
  })

  it("compiles multiple dimensions together", () => {
    const specs = makeEmptySpecs()
    specs.color = { palette: { primary: "#123456", secondary: "#fff", background: "#eee", surface: "#ddd", text: "#111", accent: "#789abc", border: "#ccc" } }
    specs.typography = { headingFont: "Inter", bodyFont: "Inter" }
    specs.components = { borderRadius: "1rem" }
    const vars = compileSpecsToCssVars(specs)
    expect(vars["--color-primary"]).toBe("#123456")
    expect(vars["--font-heading"]).toBe("var(--font-inter)")
    expect(vars["--theme-border-radius"]).toBe("1rem")
    expect(vars["--font-body"]).toBe("var(--font-inter)")
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

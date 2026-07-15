// @vitest-environment node
import { describe, expect, it } from "vitest"
import {
  getGeneCatalog,
  getGene,
  containerDef,
  heroCenteredDef,
  heroSplitDef,
  heroMinimalDef,
  featuresGridDef,
  featuresAlternatingDef,
  ctaSimpleDef,
  ctaSplitDef,
} from "@/src/renderer/registry"

describe("getGeneCatalog", () => {
  it("returns all 8 gene definitions (Container + 7 content genes)", () => {
    const catalog = getGeneCatalog()
    expect(catalog.length).toBe(8)
  })

  it("includes Container, all Hero, all Features, all CTA genes", () => {
    const catalog = getGeneCatalog()
    const names = catalog.map((g) => g.name).sort()
    expect(names).toEqual([
      "Container",
      "CtaSimple",
      "CtaSplit",
      "FeaturesAlternating",
      "FeaturesGrid",
      "HeroCentered",
      "HeroMinimal",
      "HeroSplit",
    ])
  })

  it("every gene has a name", () => {
    for (const gene of getGeneCatalog()) {
      expect(gene.name).toBeTypeOf("string")
      expect(gene.name.length).toBeGreaterThan(0)
    }
  })

  it("Container gene has no props and no tuners", () => {
    expect(containerDef.props).toEqual({})
    expect(containerDef.tuners).toEqual([])
  })

  it("HeroCentered has required headline and optional subheadline/cta/image", () => {
    expect(heroCenteredDef.props.headline.required).toBe(true)
    expect(heroCenteredDef.props.headline.type).toBe("string")
    expect(heroCenteredDef.props.subheadline.type).toBe("string")
    expect(heroCenteredDef.props.subheadline.required).toBeUndefined()
    expect(heroCenteredDef.props.ctaLabel.type).toBe("string")
    expect(heroCenteredDef.props.image.type).toBe("string")
  })

  it("HeroMinimal has only headline (required) and subheadline", () => {
    expect(heroMinimalDef.props.headline.required).toBe(true)
    expect(heroMinimalDef.props.subheadline).toBeDefined()
    expect(heroMinimalDef.props.ctaLabel).toBeUndefined()
    expect(heroMinimalDef.props.image).toBeUndefined()
  })

  it("FeaturesGrid has required headline and items (array)", () => {
    expect(featuresGridDef.props.headline.required).toBe(true)
    expect(featuresGridDef.props.items.required).toBe(true)
    expect(featuresGridDef.props.items.type).toBe("array")
  })

  it("CtaSimple has required headline and optional ctaLabel/ctaLink", () => {
    expect(ctaSimpleDef.props.headline.required).toBe(true)
    expect(ctaSimpleDef.props.ctaLabel).toBeDefined()
    expect(ctaSimpleDef.props.image).toBeUndefined()
  })

  it("CtaSplit has required headline and optional subheadline/cta/image", () => {
    expect(ctaSplitDef.props.headline.required).toBe(true)
    expect(ctaSplitDef.props.subheadline).toBeDefined()
    expect(ctaSplitDef.props.image).toBeDefined()
  })
})

describe("getGene", () => {
  it("returns Container when asked", () => {
    const gene = getGene("Container")
    expect(gene).toBeDefined()
    expect(gene!.name).toBe("Container")
  })

  it("returns HeroCentered when asked", () => {
    const gene = getGene("HeroCentered")
    expect(gene).toBeDefined()
    expect(gene!.name).toBe("HeroCentered")
  })

  it("returns undefined for unknown gene name", () => {
    expect(getGene("NonExistentGene")).toBeUndefined()
  })

  it("returns undefined for empty string", () => {
    expect(getGene("")).toBeUndefined()
  })

  it("is case-sensitive", () => {
    expect(getGene("herocentered")).toBeUndefined()
    expect(getGene("HeroCentered")).toBeDefined()
  })

  it("can retrieve every gene in the catalog by name", () => {
    for (const gene of getGeneCatalog()) {
      const retrieved = getGene(gene.name)
      expect(retrieved).toBeDefined()
      expect(retrieved!.name).toBe(gene.name)
    }
  })
})

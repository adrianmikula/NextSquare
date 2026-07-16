import { describe, expect, it } from "vitest"

import { SECTION_TEMPLATES, getSectionTemplate } from "@/src/generator/sequencer/section-templates"
import { INDUSTRY_PROFILES, getIndustryProfile } from "@/src/generator/sequencer/industry-profiles"
import {
  checkPacing,
  enforcePacing,
  checkAdjacentDuplicates,
  checkCtaAboveFold,
  checkMinimumSections,
  getVariantCategory,
} from "@/src/generator/sequencer/pacing"
import { assemble, getAvailableIndustries, validateAssembleOptions, VALID_RELIEFS, VALID_FINISHES, VALID_SHAPES, VALID_TEMPLATE_IDS, VALID_INDUSTRIES } from "@/src/generator/sequencer/assemble"
import type { SectionInfo } from "@/src/generator/sequencer/pacing"

const DEFAULT_TUNERS = { warmth: 0.5, density: 0.5, motion: 0.5, contrast: 0.5, narrative: 0.5 }

function defaultsFor(industry: string) {
  const profile = getIndustryProfile(industry)
  return {
    industry,
    tone: profile?.toneGuidance ?? "",
    name: "Test Site",
    designLanguage: profile?.preferredArchetype ?? { relief: "flat", finish: "matte", shape: "squircle" },
    templateId: profile?.sectionTemplateId ?? "storyteller",
    tuners: DEFAULT_TUNERS,
  }
}

describe("section-templates", () => {
  it("has exactly 12 templates", () => {
    expect(SECTION_TEMPLATES).toHaveLength(12)
  })

  it("every template has a unique id", () => {
    const ids = SECTION_TEMPLATES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("every template has at least 2 sections", () => {
    for (const t of SECTION_TEMPLATES) {
      expect(t.sections.length).toBeGreaterThanOrEqual(2)
    }
  })

  it("every template has at least one hero section", () => {
    for (const t of SECTION_TEMPLATES) {
      expect(t.sections.some((s) => s.category === "hero")).toBe(true)
    }
  })

  it("every template has at least one cta section", () => {
    for (const t of SECTION_TEMPLATES) {
      expect(t.sections.some((s) => s.category === "cta")).toBe(true)
    }
  })

  it("every section slot has valid variant names", () => {
    const validVariants = [
      "HeroCentered", "HeroSplit", "HeroMinimal",
      "FeaturesGrid", "FeaturesAlternating",
      "CtaSimple", "CtaSplit",
    ]
    for (const t of SECTION_TEMPLATES) {
      for (const s of t.sections) {
        for (const v of s.variants) {
          expect(validVariants).toContain(v)
        }
      }
    }
  })

  it("getSectionTemplate returns correct template", () => {
    expect(getSectionTemplate("minimal")?.name).toBe("Minimal")
    expect(getSectionTemplate("nonexistent")).toBeUndefined()
  })

  it("every section has a contentKey", () => {
    for (const t of SECTION_TEMPLATES) {
      for (const s of t.sections) {
        expect(s.contentKey).toBeTypeOf("string")
        expect(s.contentKey.length).toBeGreaterThan(0)
      }
    }
  })
})

describe("industry-profiles", () => {
  it("has at least 20 industry profiles", () => {
    expect(INDUSTRY_PROFILES.length).toBeGreaterThanOrEqual(20)
  })

  it("every profile has a unique industry key", () => {
    const keys = INDUSTRY_PROFILES.map((p) => p.industry)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it("every profile references a valid section template", () => {
    const templateIds = SECTION_TEMPLATES.map((t) => t.id)
    for (const p of INDUSTRY_PROFILES) {
      expect(templateIds).toContain(p.sectionTemplateId)
    }
  })

  it("every profile references a valid tuner profile", () => {
    const validTuners = [
      "Warm & Spacious", "Bold & Compact", "Calm & Professional",
      "Dynamic & Playful", "Balanced", "Minimal & Airy",
      "Luxury & Premium", "Data Dense",
    ]
    for (const p of INDUSTRY_PROFILES) {
      expect(validTuners).toContain(p.tunerProfileName)
    }
  })

  it("every profile has valid archetype values", () => {
    const validReliefs = ["flat", "glassmorphic", "skeuomorphic", "neumorphic"]
    const validFinishes = ["matte", "frosted", "tinted", "glossy"]
    const validShapes = ["arc", "squircle", "superellipse", "clothoid"]
    for (const p of INDUSTRY_PROFILES) {
      expect(validReliefs).toContain(p.preferredArchetype.relief)
      expect(validFinishes).toContain(p.preferredArchetype.finish)
      expect(validShapes).toContain(p.preferredArchetype.shape)
    }
  })

  it("every profile has content with all required fields", () => {
    for (const p of INDUSTRY_PROFILES) {
      expect(p.content.heroHeadline).toBeTypeOf("string")
      expect(p.content.heroSubheadline).toBeTypeOf("string")
      expect(p.content.ctaHeadline).toBeTypeOf("string")
      expect(p.content.ctaLabel).toBeTypeOf("string")
      expect(Array.isArray(p.content.featureGroups)).toBe(true)
      expect(p.content.featureGroups.length).toBeGreaterThanOrEqual(1)
      for (const group of p.content.featureGroups) {
        expect(group.length).toBeGreaterThanOrEqual(1)
        for (const item of group) {
          expect(item.title).toBeTypeOf("string")
          expect(item.description).toBeTypeOf("string")
        }
      }
    }
  })

  it("getIndustryProfile returns correct profile", () => {
    expect(getIndustryProfile("cafe")?.name).toBe("Cafe & Coffee Shop")
    expect(getIndustryProfile("nonexistent")).toBeUndefined()
  })

  it("covers diverse industries", () => {
    const industries = INDUSTRY_PROFILES.map((p) => p.industry)
    expect(industries).toContain("cafe")
    expect(industries).toContain("saas")
    expect(industries).toContain("finance")
    expect(industries).toContain("portfolio")
    expect(industries).toContain("ecommerce")
    expect(industries).toContain("nonprofit")
    expect(industries).toContain("healthcare")
    expect(industries).toContain("education")
  })
})

describe("pacing engine", () => {
  it("passes valid section arrangements", () => {
    const sections: SectionInfo[] = [
      { id: "hero", category: "hero", variant: "HeroCentered" },
      { id: "features", category: "features", variant: "FeaturesGrid" },
      { id: "cta", category: "cta", variant: "CtaSimple" },
    ]
    const result = checkPacing(sections)
    expect(result.valid).toBe(true)
    expect(result.violations.filter((v) => v.severity === "error")).toHaveLength(0)
  })

  it("flags cta-below-fold for sections where cta is in last half of 3+ sections", () => {
    const sections: SectionInfo[] = [
      { id: "hero", category: "hero", variant: "HeroCentered" },
      { id: "features", category: "features", variant: "FeaturesGrid" },
      { id: "cta", category: "cta", variant: "CtaSimple" },
    ]
    const result = checkPacing(sections)
    const foldWarnings = result.violations.filter((v) => v.type === "cta-below-fold")
    expect(foldWarnings).toHaveLength(1)
  })

  it("no cta-below-fold for sections where cta is in first half", () => {
    const sections: SectionInfo[] = [
      { id: "hero", category: "hero", variant: "HeroCentered" },
      { id: "cta", category: "cta", variant: "CtaSimple" },
    ]
    const result = checkPacing(sections)
    const foldWarnings = result.violations.filter((v) => v.type === "cta-below-fold")
    expect(foldWarnings).toHaveLength(0)
  })

  it("detects adjacent duplicate categories", () => {
    const sections: SectionInfo[] = [
      { id: "hero", category: "hero", variant: "HeroCentered" },
      { id: "features-1", category: "features", variant: "FeaturesGrid" },
      { id: "features-2", category: "features", variant: "FeaturesGrid" },
      { id: "cta", category: "cta", variant: "CtaSimple" },
    ]
    const result = checkAdjacentDuplicates(sections)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe("adjacent-duplicate-category")
  })

  it("flags missing CTA as error", () => {
    const sections: SectionInfo[] = [
      { id: "hero", category: "hero", variant: "HeroCentered" },
      { id: "features", category: "features", variant: "FeaturesGrid" },
    ]
    const result = checkCtaAboveFold(sections)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe("missing-cta")
    expect(result[0].severity).toBe("error")
  })

  it("flags too-few-sections for single section", () => {
    const sections: SectionInfo[] = [
      { id: "hero", category: "hero", variant: "HeroCentered" },
    ]
    const result = checkMinimumSections(sections)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe("too-few-sections")
  })

  it("enforcePacing adds missing CTA", () => {
    const sections: SectionInfo[] = [
      { id: "hero", category: "hero", variant: "HeroCentered" },
      { id: "features", category: "features", variant: "FeaturesGrid" },
    ]
    const result = enforcePacing(sections)
    expect(result.sections.length).toBe(3)
    expect(result.sections[2].category).toBe("cta")
    expect(result.fixed).toHaveLength(1)
    expect(result.fixed[0].type).toBe("auto-added-cta")
  })

  it("getVariantCategory returns correct category", () => {
    expect(getVariantCategory("HeroCentered")).toBe("hero")
    expect(getVariantCategory("FeaturesGrid")).toBe("features")
    expect(getVariantCategory("CtaSimple")).toBe("cta")
    expect(getVariantCategory("Unknown")).toBeUndefined()
  })
})

describe("assemble", () => {
  it("produces a valid SiteConfig for cafe industry", () => {
    const result = assemble(defaultsFor("cafe"))
    expect(result.config.meta.industry).toBe("cafe")
    expect(result.config.meta.name).toBeTypeOf("string")
    expect(result.config.meta.name.length).toBeGreaterThan(0)
    expect(result.config.designLanguage.relief).toBe("flat")
    expect(result.config.designLanguage.finish).toBe("matte")
    expect(result.config.tuners).toBeTypeOf("object")
    expect(result.config.tuners.warmth).toBeTypeOf("number")
    expect(result.config.spec.root).toBe("page")
    expect(result.config.spec.elements).toBeTypeOf("object")
  })

  it("produces a valid SiteConfig for saas industry", () => {
    const result = assemble(defaultsFor("saas"))
    expect(result.config.meta.industry).toBe("saas")
    expect(result.config.designLanguage.relief).toBe("glassmorphic")
    expect(result.config.designLanguage.shape).toBe("superellipse")
  })

  it("produces deterministic output for same input", () => {
    const a = assemble(defaultsFor("cafe"))
    const b = assemble(defaultsFor("cafe"))
    expect(a.config.meta.name).toBe(b.config.meta.name)
    expect(a.config.designLanguage.relief).toBe(b.config.designLanguage.relief)
    expect(JSON.stringify(a.config.spec)).toBe(JSON.stringify(b.config.spec))
  })

  it("produces a valid SiteConfig for every industry profile", () => {
    const industries = getAvailableIndustries()
    expect(industries.length).toBeGreaterThanOrEqual(20)

    for (const industry of industries) {
      const result = assemble(defaultsFor(industry))
      expect(result.config.meta.industry).toBe(industry)
      expect(result.config.meta.name).toBeTypeOf("string")
      expect(result.config.spec.elements).toBeTypeOf("object")

      const elements = result.config.spec.elements as Record<string, unknown>
      expect(elements["page"]).toBeDefined()

      const sectionIds = Object.keys(elements).filter((k) => k !== "page")
      expect(sectionIds.length).toBeGreaterThanOrEqual(2)

      expect(result.template).toBeDefined()
      expect(result.profile).toBeDefined()
    }
  })

  it("all industry outputs have valid spec format with props", () => {
    const industries = getAvailableIndustries()
    for (const industry of industries) {
      const result = assemble(defaultsFor(industry))
      const elements = result.config.spec.elements as Record<string, unknown>

      for (const [id, el] of Object.entries(elements)) {
        if (id === "page") {
          const page = el as { type: string; children: string[] }
          expect(page.type).toBe("Container")
          expect(Array.isArray(page.children)).toBe(true)
          expect(page.children.length).toBeGreaterThan(0)
        } else {
          const section = el as { type: string; props: Record<string, unknown>; children: string[] }
          expect(section.type).toBeTypeOf("string")
          expect(section.props).toBeTypeOf("object")
          expect(Array.isArray(section.children)).toBe(true)
        }
      }
    }
  })

  it("each industry produces a visibly different page structure", () => {
    const results = getAvailableIndustries().map((ind) => assemble(defaultsFor(ind)))
    const specStrs = results.map((r) => JSON.stringify(r.config.spec))
    const unique = new Set(specStrs)
    expect(unique.size).toBeGreaterThan(10)
  })

  it("accepts custom name and tone", () => {
    const result = assemble({
      ...defaultsFor("cafe"),
      name: "My Cafe",
      tone: "cozy and warm",
    })
    expect(result.config.meta.name).toBe("My Cafe")
    expect(result.config.meta.tone).toBe("cozy and warm")
  })

  it("accepts custom name via options", () => {
    const result = assemble({
      ...defaultsFor("restaurant"),
      name: "Mama's Kitchen",
    })
    expect(result.config.meta.name).toBe("Mama's Kitchen")
  })

  it("throws for unknown industry", () => {
    expect(() => assemble({
      ...defaultsFor("cafe"),
      industry: "nonexistent",
    })).toThrow("Invalid industry")
  })

  it("features sections contain items array with expected structure", () => {
    const result = assemble(defaultsFor("cafe"))
    const elements = result.config.spec.elements as Record<string, unknown>
    const featureSection = Object.entries(elements).find(
      ([id, el]) => id !== "page" && (el as { type: string }).type.startsWith("Features"),
    )
    expect(featureSection).toBeDefined()
    const [, el] = featureSection!
    const props = (el as { props: Record<string, unknown> }).props
    expect(props.items).toBeDefined()
    expect(Array.isArray(props.items)).toBe(true)
    const items = props.items as Array<{ title: string; description: string }>
    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[0].title).toBeTypeOf("string")
    expect(items[0].description).toBeTypeOf("string")
  })

  it("accepts explicit designLanguage override", () => {
    const result = assemble({
      ...defaultsFor("cafe"),
      designLanguage: { relief: "skeuomorphic", finish: "glossy", shape: "clothoid" },
    })
    expect(result.config.designLanguage.relief).toBe("skeuomorphic")
    expect(result.config.designLanguage.finish).toBe("glossy")
    expect(result.config.designLanguage.shape).toBe("clothoid")
  })

  it("accepts explicit templateId override", () => {
    const result = assemble({
      ...defaultsFor("cafe"),
      templateId: "minimal",
    })
    expect(result.template.id).toBe("minimal")
    expect(result.template.sections.length).toBe(3)
  })

  it("accepts explicit tuner overrides", () => {
    const result = assemble({
      ...defaultsFor("cafe"),
      tuners: { warmth: 0.9, contrast: 0.85, density: 0.5, motion: 0.5, narrative: 0.5 },
    })
    expect(result.config.tuners.warmth).toBe(0.9)
    expect(result.config.tuners.contrast).toBe(0.85)
  })

  it("explicit tuners merge with profile defaults (partial override)", () => {
    const result = assemble({
      ...defaultsFor("cafe"),
      tuners: { warmth: 0.9, density: 0.5, motion: 0.5, contrast: 0.5, narrative: 0.5 },
    })
    expect(result.config.tuners.warmth).toBe(0.9)
    expect(result.config.tuners.density).toBeTypeOf("number")
    expect(result.config.tuners.motion).toBeTypeOf("number")
    expect(result.config.tuners.contrast).toBeTypeOf("number")
    expect(result.config.tuners.narrative).toBeTypeOf("number")
  })

  it("uses profile default designLanguage when no override given", () => {
    const cafe = assemble(defaultsFor("cafe"))
    expect(cafe.config.designLanguage.relief).toBe("flat")
    expect(cafe.config.designLanguage.finish).toBe("matte")
  })

  it("explicit designLanguage overrides profile default completely", () => {
    const cafe = assemble({
      ...defaultsFor("cafe"),
      designLanguage: { relief: "glassmorphic", finish: "frosted", shape: "superellipse" },
    })
    expect(cafe.config.designLanguage.relief).toBe("glassmorphic")
  })
})

describe("validation", () => {
  it("rejects invalid industry", () => {
    expect(() => validateAssembleOptions({
      ...defaultsFor("cafe"),
      industry: "nonexistent",
    })).toThrow("Invalid industry")
  })

  it("rejects invalid templateId", () => {
    expect(() => validateAssembleOptions({
      ...defaultsFor("cafe"),
      templateId: "nonexistent",
    })).toThrow("Invalid templateId")
  })

  it("rejects invalid relief", () => {
    expect(() => validateAssembleOptions({
      ...defaultsFor("cafe"),
      designLanguage: { relief: "invalid" as any, finish: "matte", shape: "squircle" },
    })).toThrow("Invalid relief")
  })

  it("rejects invalid finish", () => {
    expect(() => validateAssembleOptions({
      ...defaultsFor("cafe"),
      designLanguage: { relief: "flat", finish: "invalid" as any, shape: "squircle" },
    })).toThrow("Invalid finish")
  })

  it("rejects invalid shape", () => {
    expect(() => validateAssembleOptions({
      ...defaultsFor("cafe"),
      designLanguage: { relief: "flat", finish: "matte", shape: "invalid" as any },
    })).toThrow("Invalid shape")
  })

  it("rejects tuner values outside 0-1 range", () => {
    expect(() => validateAssembleOptions({
      ...defaultsFor("cafe"),
      tuners: { warmth: 1.5, density: 0.5, motion: 0.5, contrast: 0.5, narrative: 0.5 },
    })).toThrow("Invalid tuner")
  })
})

describe("getAvailableIndustries", () => {
  it("returns all industry keys", () => {
    const industries = getAvailableIndustries()
    expect(industries.length).toBe(INDUSTRY_PROFILES.length)
    expect(industries).toContain("cafe")
    expect(industries).toContain("saas")
  })
})

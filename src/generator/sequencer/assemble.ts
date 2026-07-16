import type { SiteConfig, DesignLanguage, Relief, Finish, ShapeCurve } from "@/src/schema/site-config"
import type { IndustryProfile, FeatureContent } from "./industry-profiles"
import { getIndustryProfile, INDUSTRY_PROFILES } from "./industry-profiles"
import type { SectionTemplate } from "./section-templates"
import { getSectionTemplate, SECTION_TEMPLATES } from "./section-templates"
import { enforcePacing } from "./pacing"
import type { SectionInfo, PacingViolation } from "./pacing"
import { getTunerProfile } from "@/src/renderer/tuner-profiles"
import type { TunerValues } from "@/src/renderer/compile-tuners"

export interface AssembleOptions {
  industry: string
  tone: string
  name: string
  designLanguage: DesignLanguage
  templateId: string
  tuners: TunerValues
}

export interface AssembleResult {
  config: SiteConfig
  profile: IndustryProfile
  template: SectionTemplate
  sectionAssignments: SectionInfo[]
  pacingFixes: PacingViolation[]
}

export const VALID_RELIEFS: Relief[] = ["flat", "glassmorphic", "skeuomorphic", "neumorphic"]
export const VALID_FINISHES: Finish[] = ["matte", "frosted", "tinted", "glossy"]
export const VALID_SHAPES: ShapeCurve[] = ["arc", "squircle", "superellipse", "clothoid"]
export const VALID_TEMPLATE_IDS = SECTION_TEMPLATES.map((t) => t.id)
export const VALID_INDUSTRIES = INDUSTRY_PROFILES.map((p) => p.industry)

export function validateAssembleOptions(options: AssembleOptions): void {
  if (!VALID_INDUSTRIES.includes(options.industry)) {
    throw new Error(
      `Invalid industry: "${options.industry}". Available: ${VALID_INDUSTRIES.join(", ")}`,
    )
  }
  if (!VALID_TEMPLATE_IDS.includes(options.templateId)) {
    throw new Error(
      `Invalid templateId: "${options.templateId}". Available: ${VALID_TEMPLATE_IDS.join(", ")}`,
    )
  }
  if (!VALID_RELIEFS.includes(options.designLanguage.relief)) {
    throw new Error(
      `Invalid relief: "${options.designLanguage.relief}". Available: ${VALID_RELIEFS.join(", ")}`,
    )
  }
  if (!VALID_FINISHES.includes(options.designLanguage.finish)) {
    throw new Error(
      `Invalid finish: "${options.designLanguage.finish}". Available: ${VALID_FINISHES.join(", ")}`,
    )
  }
  if (!VALID_SHAPES.includes(options.designLanguage.shape)) {
    throw new Error(
      `Invalid shape: "${options.designLanguage.shape}". Available: ${VALID_SHAPES.join(", ")}`,
    )
  }
  const requiredTuners: (keyof TunerValues)[] = ["warmth", "density", "motion", "contrast", "narrative"]
  for (const key of requiredTuners) {
    const value = options.tuners[key]
    if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 1) {
      throw new Error(`Invalid tuner ${String(key)}: ${value}. Must be a number between 0 and 1.`)
    }
  }
}

type SectionAssignment = SectionInfo & { contentKey: string }

function pickVariant(
  category: string,
  templateVariants: string[],
  profilePreferredVariants: Record<string, string[]>,
): string {
  const preferred = profilePreferredVariants[category]
  if (preferred && preferred.length > 0) {
    const match = templateVariants.find((v) => preferred.includes(v))
    if (match) return match
  }
  return templateVariants[0]
}

function getFeatureGroupForSection(
  profile: IndustryProfile,
  featureIndex: number,
): FeatureContent[] {
  const groups = profile.content.featureGroups
  if (groups.length === 0) return []
  if (featureIndex < groups.length) return groups[featureIndex]
  return groups[groups.length - 1]
}

function generateContentMap(
  profile: IndustryProfile,
  name: string,
  sections: SectionAssignment[],
): Record<string, string> {
  const content: Record<string, string> = {}
  const t = profile.content

  let featureSectionCount = 0

  for (const section of sections) {
    const prefix = section.contentKey

    switch (section.category) {
      case "hero": {
        content[`${prefix}-headline`] = t.heroHeadline.replace(/\{name\}/g, name)
        content[`${prefix}-subheadline`] = t.heroSubheadline.replace(/\{name\}/g, name)
        break
      }
      case "features": {
        const idx = featureSectionCount++
        const group = getFeatureGroupForSection(profile, idx)
        const headline =
          idx === 0
            ? `Why Choose ${name}`
            : idx === 1
              ? `What We Offer`
              : `More About ${name}`
        content[`${prefix}-headline`] = headline
        content[`${prefix}-items`] = JSON.stringify(group)
        break
      }
      case "cta": {
        content[`${prefix}-headline`] = t.ctaHeadline
        content[`${prefix}-subheadline`] = t.ctaSubheadline ?? `Join ${name} today.`
        content[`${prefix}-label`] = t.ctaLabel
        break
      }
    }
  }

  content["hero-headline"] = t.heroHeadline.replace(/\{name\}/g, name)
  content["cta-headline"] = t.ctaHeadline
  content["cta-label"] = t.ctaLabel

  return content
}

function buildSpecElements(
  sections: SectionAssignment[],
  content: Record<string, string>,
): Record<string, unknown> {
  const elements: Record<string, unknown> = {
    page: {
      type: "Container",
      props: {},
      children: [] as string[],
    },
  }

  const children: string[] = []

  for (const section of sections) {
    const elementId = section.id
    children.push(elementId)
    const props: Record<string, unknown> = {}

    switch (section.category) {
      case "hero": {
        props.headline = content[`${section.contentKey}-headline`] ?? ""
        const subKey = `${section.contentKey}-subheadline`
        if (content[subKey]) {
          props.subheadline = content[subKey]
        }
        if (section.variant !== "HeroMinimal") {
          props.ctaLabel = content["cta-label"] ?? "Learn More"
          props.ctaLink = "#"
        }
        break
      }
      case "features": {
        props.headline = content[`${section.contentKey}-headline`] ?? "Our Features"
        const itemsRaw = content[`${section.contentKey}-items`]
        if (itemsRaw) {
          try {
            props.items = JSON.parse(itemsRaw)
          } catch {
            props.items = [
              { title: "Feature One", description: "Description of the first feature." },
              { title: "Feature Two", description: "Description of the second feature." },
              { title: "Feature Three", description: "Description of the third feature." },
            ]
          }
        } else {
          props.items = [
            { title: "Feature One", description: "Description of the first feature." },
            { title: "Feature Two", description: "Description of the second feature." },
            { title: "Feature Three", description: "Description of the third feature." },
          ]
        }
        break
      }
      case "cta": {
        props.headline = content[`${section.contentKey}-headline`] ?? "Get Started Today"
        props.ctaLabel = content[`${section.contentKey}-label`] ?? "Get Started"
        props.ctaLink = "#"
        if (section.variant === "CtaSplit") {
          const subheadline = content[`${section.contentKey}-subheadline`]
          if (subheadline) props.subheadline = subheadline
        }
        break
      }
    }

    elements[elementId] = {
      type: section.variant,
      props,
      children: [],
    }
  }

  const page = elements["page"] as {
    children: string[]
    type: string
    props: Record<string, unknown>
  }
  page.children = children

  return elements
}

export function assemble(options: AssembleOptions): AssembleResult {
  validateAssembleOptions(options)

  const industry = options.industry.toLowerCase()
  const profile = getIndustryProfile(industry)
  if (!profile) {
    throw new Error(
      `Unknown industry: "${industry}". Available: ${VALID_INDUSTRIES.join(", ")}`,
    )
  }

  const template = getSectionTemplate(options.templateId)
  if (!template) {
    throw new Error(
      `Section template "${options.templateId}" not found for industry "${industry}".`,
    )
  }

  const rawSectionInfos: SectionAssignment[] = template.sections.map((slot) => {
    const variant = pickVariant(slot.category, slot.variants, profile.preferredVariants)
    return {
      id: `${slot.contentKey}`,
      category: slot.category,
      variant,
      contentKey: slot.contentKey,
    }
  })

  const pacingResult = enforcePacing(rawSectionInfos)
  const finalSections = pacingResult.sections.map((s) => {
    const existing = rawSectionInfos.find((r) => r.id === s.id)
    if (existing) {
      return { ...existing, variant: s.variant, id: s.id }
    }
    return {
      id: s.id,
      category: s.category,
      variant: s.variant,
      contentKey: s.id.replace(/-auto$/, ""),
    }
  })

  const content = generateContentMap(profile, options.name, finalSections)
  const elements = buildSpecElements(finalSections, content)

  const config: SiteConfig = {
    meta: {
      name: options.name,
      industry: profile.industry,
      tone: options.tone,
    },
    designLanguage: options.designLanguage,
    tuners: { ...options.tuners } as Record<string, number>,
    spec: {
      root: "page",
      elements,
    },
    content,
  }

  return {
    config,
    profile,
    template,
    sectionAssignments: finalSections,
    pacingFixes: pacingResult.fixed,
  }
}

export function getAvailableIndustries(): string[] {
  return INDUSTRY_PROFILES.map((p) => p.industry)
}

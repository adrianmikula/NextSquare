import type { GeneCategory } from "./section-templates"

export interface PacingViolation {
  type: string
  message: string
  severity: "error" | "warning"
}

export interface PacingResult {
  valid: boolean
  violations: PacingViolation[]
}

export interface SectionInfo {
  id: string
  category: GeneCategory
  variant: string
}

const VARIANT_CATEGORY_MAP: Record<string, GeneCategory> = {
  HeroCentered: "hero",
  HeroSplit: "hero",
  HeroMinimal: "hero",
  FeaturesGrid: "features",
  FeaturesAlternating: "features",
  CtaSimple: "cta",
  CtaSplit: "cta",
}

export function getVariantCategory(variant: string): GeneCategory | undefined {
  return VARIANT_CATEGORY_MAP[variant]
}

export const FEATURES_VARIANTS = ["FeaturesGrid", "FeaturesAlternating"]
export const HERO_VARIANTS = ["HeroCentered", "HeroSplit", "HeroMinimal"]
export const CTA_VARIANTS = ["CtaSimple", "CtaSplit"]

export function checkAdjacentDuplicates(sections: SectionInfo[]): PacingViolation[] {
  const violations: PacingViolation[] = []
  for (let i = 1; i < sections.length; i++) {
    const prev = sections[i - 1]
    const curr = sections[i]
    if (prev.category === curr.category) {
      violations.push({
        type: "adjacent-duplicate-category",
        message: `Sections "${prev.id}" and "${curr.id}" are both "${prev.category}" category. At least one different category should separate them.`,
        severity: "warning",
      })
    }
  }
  return violations
}

export function checkCtaAboveFold(sections: SectionInfo[]): PacingViolation[] {
  const hasCta = sections.some((s) => s.category === "cta")
  if (!hasCta) {
    return [{
      type: "missing-cta",
      message: "No CTA section found. At least one CTA section is recommended.",
      severity: "error",
    }]
  }

  if (sections.length >= 3) {
    const firstHalf = sections.slice(0, Math.ceil(sections.length / 2))
    const ctaInFirstHalf = firstHalf.some((s) => s.category === "cta")
    if (!ctaInFirstHalf) {
      return [{
        type: "cta-below-fold",
        message: "CTA should appear at least once in the first half of sections to ensure visibility above the fold.",
        severity: "warning",
      }]
    }
  }

  return []
}

export function checkTextSectionVariety(sections: SectionInfo[]): PacingViolation[] {
  const violations: PacingViolation[] = []

  if (sections.length < 3) return violations

  const gridCount = sections.filter((s) => s.variant === "FeaturesGrid").length
  const altCount = sections.filter((s) => s.variant === "FeaturesAlternating").length

  if (gridCount >= 3) {
    violations.push({
      type: "too-many-grid-sections",
      message: `${gridCount} grid sections may feel repetitive. Consider alternating with alternating layout.`,
      severity: "warning",
    })
  }

  if (altCount >= 3) {
    violations.push({
      type: "too-many-alternating-sections",
      message: `${altCount} alternating sections may feel repetitive. Consider mixing with grid layout.`,
      severity: "warning",
    })
  }

  return violations
}

export function checkMinimumSections(sections: SectionInfo[]): PacingViolation[] {
  if (sections.length < 2) {
    return [{
      type: "too-few-sections",
      message: `Only ${sections.length} sections defined. Minimum 2 sections (hero + CTA) required for a complete page.`,
      severity: "error",
    }]
  }
  return []
}

export function checkPacing(sections: SectionInfo[]): PacingResult {
  const violations: PacingViolation[] = [
    ...checkMinimumSections(sections),
    ...checkAdjacentDuplicates(sections),
    ...checkCtaAboveFold(sections),
    ...checkTextSectionVariety(sections),
  ]

  const errors = violations.filter((v) => v.severity === "error")
  return {
    valid: errors.length === 0,
    violations,
  }
}

export function enforcePacing(sections: SectionInfo[]): {
  sections: SectionInfo[]
  fixed: PacingViolation[]
} {
  const result = checkPacing(sections)
  const fixed: PacingViolation[] = []
  const working = [...sections]

  const ctaExists = working.some((s) => s.category === "cta")
  if (!ctaExists) {
    working.push({
      id: "cta-auto",
      category: "cta",
      variant: "CtaSimple",
    })
    fixed.push({
      type: "auto-added-cta",
      message: "Auto-added CtaSimple section at end of page.",
      severity: "warning",
    })
  }

  const adjViolations = result.violations.filter((v) => v.type === "adjacent-duplicate-category")
  for (const violation of adjViolations) {
    const idx = working.findIndex((s) => s.id === violation.message.split('"')[1])
    if (idx > 0 && idx < working.length) {
      const current = working[idx]
      if (current.category === "features") {
        const newVariant = current.variant === "FeaturesGrid" ? "FeaturesAlternating" : "FeaturesGrid"
        working[idx] = { ...current, variant: newVariant }
        fixed.push({
          type: "auto-swapped-variant",
          message: `Swapped ${current.id} from ${current.variant} to ${newVariant} to break adjacent duplicate.`,
          severity: "warning",
        })
      }
    }
  }

  return { sections: working, fixed }
}

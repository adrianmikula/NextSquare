import type { Relief, Finish, DesignLanguage } from "@/src/schema/site-config"

export interface ArchetypeConstraint {
  relief: Relief
  finishes: Finish[]
  allowedIndustries: string[]
  description: string
}

export const ARCHETYPE_CONSTRAINTS: ArchetypeConstraint[] = [
  {
    relief: "flat",
    finishes: ["matte", "frosted", "tinted", "glossy"],
    allowedIndustries: ["*"],
    description: "Clean, standard web design. Works everywhere.",
  },
  {
    relief: "glassmorphic",
    finishes: ["frosted", "tinted"],
    allowedIndustries: ["*"],
    description: "Modern frosted-glass aesthetic. Good for tech, creative, and lifestyle.",
  },
  {
    relief: "skeuomorphic",
    finishes: ["matte", "glossy"],
    allowedIndustries: ["*"],
    description: "Realistic textures and depth. Good for creative agencies and premium brands.",
  },
  {
    relief: "neumorphic",
    finishes: ["matte", "tinted"],
    allowedIndustries: ["*"],
    description: "Soft UI with subtle depth. Best for dashboards, tools, and minimalist brands.",
  },
]

export function isValidArchetypeForIndustry(
  lang: DesignLanguage,
  industry: string,
): boolean {
  const constraint = ARCHETYPE_CONSTRAINTS.find((c) => c.relief === lang.relief)
  if (!constraint) return false

  if (!constraint.finishes.includes(lang.finish)) return false

  if (constraint.allowedIndustries.includes("*")) return true
  return constraint.allowedIndustries.includes(industry)
}

export function getDefaultTunerRange(
  lang: DesignLanguage,
): { min: number; max: number } {
  switch (lang.relief) {
    case "neumorphic":
      return { min: 0.3, max: 0.8 }
    case "glassmorphic":
      return { min: 0.2, max: 0.9 }
    default:
      return { min: 0, max: 1 }
  }
}

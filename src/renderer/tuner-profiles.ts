import type { TunerValues } from "./compile-tuners"

export interface TunerProfile {
  name: string
  description: string
  values: TunerValues
}

export const TUNER_PROFILES: TunerProfile[] = [
  {
    name: "Warm & Spacious",
    description: "Generous padding with warm amber tones. Great for hospitality, lifestyle, and creative brands.",
    values: { warmth: 0.8, density: 0.2, motion: 0.3, contrast: 0.4, narrative: 0.7 },
  },
  {
    name: "Bold & Compact",
    description: "Dense, high-contrast layout with strong visual hierarchy. Suits SaaS, dashboards, and tech.",
    values: { warmth: 0.3, density: 0.8, motion: 0.6, contrast: 0.85, narrative: 0.3 },
  },
  {
    name: "Calm & Professional",
    description: "Cool tones, balanced spacing, minimal motion. Good for B2B, legal, financial services.",
    values: { warmth: 0.15, density: 0.4, motion: 0.15, contrast: 0.5, narrative: 0.4 },
  },
  {
    name: "Dynamic & Playful",
    description: "High motion, warm accents, expansive hero. Suits entertainment, education, and startups.",
    values: { warmth: 0.7, density: 0.3, motion: 0.9, contrast: 0.6, narrative: 0.85 },
  },
  {
    name: "Balanced",
    description: "Neutral midpoint across all tuners. Safe default for most industries.",
    values: { warmth: 0.5, density: 0.5, motion: 0.5, contrast: 0.5, narrative: 0.5 },
  },
  {
    name: "Minimal & Airy",
    description: "Sparse density, low contrast, cool tones. Clean aesthetic for portfolios and agencies.",
    values: { warmth: 0.25, density: 0.1, motion: 0.2, contrast: 0.25, narrative: 0.5 },
  },
  {
    name: "Luxury & Premium",
    description: "Warm gold tones, ample spacing, elegant motion. For premium brands and high-end products.",
    values: { warmth: 0.6, density: 0.2, motion: 0.5, contrast: 0.7, narrative: 0.6 },
  },
  {
    name: "Data Dense",
    description: "Compact layout, low motion, high contrast. Suits analytics, reports, and internal tools.",
    values: { warmth: 0.2, density: 0.85, motion: 0.1, contrast: 0.9, narrative: 0.2 },
  },
]

export function getTunerProfile(name: string): TunerProfile | undefined {
  return TUNER_PROFILES.find((p) => p.name === name)
}

export function getProfileForIndustry(industry: string): TunerProfile {
  const industryDefaults: Record<string, TunerProfile> = {
    cafe: TUNER_PROFILES[0],
    restaurant: TUNER_PROFILES[0],
    hospitality: TUNER_PROFILES[0],
    saas: TUNER_PROFILES[1],
    tech: TUNER_PROFILES[1],
    finance: TUNER_PROFILES[2],
    legal: TUNER_PROFILES[2],
    entertainment: TUNER_PROFILES[3],
    education: TUNER_PROFILES[3],
    portfolio: TUNER_PROFILES[5],
    agency: TUNER_PROFILES[5],
    ecommerce: TUNER_PROFILES[4],
    general: TUNER_PROFILES[4],
  }

  const key = industry?.toLowerCase()
  return industryDefaults[key] ?? TUNER_PROFILES[4]
}

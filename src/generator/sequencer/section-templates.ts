export type GeneCategory = "hero" | "features" | "cta"

export interface SectionSlot {
  category: GeneCategory
  variants: string[]
  contentKey: string
}

export interface SectionTemplate {
  id: string
  name: string
  description: string
  sections: SectionSlot[]
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: "storyteller",
    name: "Storyteller",
    description: "Narrative-driven layout that builds emotional connection. Best for brands with a story to tell.",
    sections: [
      { category: "hero", variants: ["HeroCentered", "HeroSplit"], contentKey: "hero" },
      { category: "features", variants: ["FeaturesAlternating", "FeaturesGrid"], contentKey: "features-1" },
      { category: "features", variants: ["FeaturesGrid", "FeaturesAlternating"], contentKey: "features-2" },
      { category: "cta", variants: ["CtaSimple", "CtaSplit"], contentKey: "cta" },
    ],
  },
  {
    id: "showcase",
    name: "Showcase",
    description: "Visual-first layout emphasizing product or service imagery. Suits app demos and product pages.",
    sections: [
      { category: "hero", variants: ["HeroSplit", "HeroCentered"], contentKey: "hero" },
      { category: "features", variants: ["FeaturesGrid", "FeaturesAlternating"], contentKey: "features-1" },
      { category: "features", variants: ["FeaturesAlternating", "FeaturesGrid"], contentKey: "features-2" },
      { category: "cta", variants: ["CtaSplit", "CtaSimple"], contentKey: "cta" },
    ],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean, sparse layout with maximum whitespace. Best for portfolios, agencies, and personal brands.",
    sections: [
      { category: "hero", variants: ["HeroMinimal", "HeroCentered"], contentKey: "hero" },
      { category: "features", variants: ["FeaturesGrid"], contentKey: "features-1" },
      { category: "cta", variants: ["CtaSimple"], contentKey: "cta" },
    ],
  },
  {
    id: "data-heavy",
    name: "Data Heavy",
    description: "Dense layout optimized for information-rich content. Suits SaaS, analytics, and dashboards.",
    sections: [
      { category: "hero", variants: ["HeroSplit", "HeroCentered"], contentKey: "hero" },
      { category: "features", variants: ["FeaturesGrid", "FeaturesAlternating"], contentKey: "features-1" },
      { category: "features", variants: ["FeaturesGrid"], contentKey: "features-2" },
      { category: "cta", variants: ["CtaSimple", "CtaSplit"], contentKey: "cta" },
    ],
  },
  {
    id: "product-launch",
    name: "Product Launch",
    description: "High-impact layout for launching a new product or service. Strong CTA above and below.",
    sections: [
      { category: "hero", variants: ["HeroSplit", "HeroCentered"], contentKey: "hero" },
      { category: "features", variants: ["FeaturesAlternating", "FeaturesGrid"], contentKey: "features-1" },
      { category: "features", variants: ["FeaturesGrid", "FeaturesAlternating"], contentKey: "features-2" },
      { category: "cta", variants: ["CtaSplit", "CtaSimple"], contentKey: "cta" },
    ],
  },
  {
    id: "landing-page",
    name: "Landing Page",
    description: "Conversion-optimized layout with clear hierarchy. Good for lead generation and signups.",
    sections: [
      { category: "hero", variants: ["HeroCentered", "HeroSplit"], contentKey: "hero" },
      { category: "features", variants: ["FeaturesGrid", "FeaturesAlternating"], contentKey: "features-1" },
      { category: "features", variants: ["FeaturesAlternating", "FeaturesGrid"], contentKey: "features-2" },
      { category: "cta", variants: ["CtaSimple", "CtaSplit"], contentKey: "cta" },
    ],
  },
  {
    id: "long-form",
    name: "Long Form",
    description: "Extended narrative with multiple feature sections. Best for storytelling and educational content.",
    sections: [
      { category: "hero", variants: ["HeroCentered", "HeroMinimal"], contentKey: "hero" },
      { category: "features", variants: ["FeaturesAlternating"], contentKey: "features-1" },
      { category: "features", variants: ["FeaturesGrid"], contentKey: "features-2" },
      { category: "features", variants: ["FeaturesAlternating"], contentKey: "features-3" },
      { category: "cta", variants: ["CtaSimple", "CtaSplit"], contentKey: "cta" },
    ],
  },
  {
    id: "app-showcase",
    name: "App Showcase",
    description: "Designed for mobile apps and software products. Split hero with feature highlights.",
    sections: [
      { category: "hero", variants: ["HeroSplit", "HeroCentered"], contentKey: "hero" },
      { category: "features", variants: ["FeaturesGrid"], contentKey: "features-1" },
      { category: "features", variants: ["FeaturesAlternating"], contentKey: "features-2" },
      { category: "cta", variants: ["CtaSplit", "CtaSimple"], contentKey: "cta" },
    ],
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Creative-focused layout with understated hero and alternating work samples. Suits designers, artists, photographers.",
    sections: [
      { category: "hero", variants: ["HeroMinimal", "HeroCentered"], contentKey: "hero" },
      { category: "features", variants: ["FeaturesAlternating", "FeaturesGrid"], contentKey: "features-1" },
      { category: "cta", variants: ["CtaSimple", "CtaSplit"], contentKey: "cta" },
    ],
  },
  {
    id: "lead-gen",
    name: "Lead Generation",
    description: "Conversion-first layout with compelling hero and strong closing CTA. For marketing campaigns.",
    sections: [
      { category: "hero", variants: ["HeroSplit", "HeroCentered"], contentKey: "hero" },
      { category: "features", variants: ["FeaturesGrid", "FeaturesAlternating"], contentKey: "features-1" },
      { category: "cta", variants: ["CtaSplit"], contentKey: "cta" },
    ],
  },
  {
    id: "event",
    name: "Event",
    description: "Bold, urgent layout with centered hero and registration CTA. For conferences, launches, and meetups.",
    sections: [
      { category: "hero", variants: ["HeroCentered", "HeroSplit"], contentKey: "hero" },
      { category: "features", variants: ["FeaturesGrid"], contentKey: "features-1" },
      { category: "cta", variants: ["CtaSimple", "CtaSplit"], contentKey: "cta" },
    ],
  },
  {
    id: "coming-soon",
    name: "Coming Soon",
    description: "Minimal pre-launch layout with a single hero and waitlist CTA.",
    sections: [
      { category: "hero", variants: ["HeroMinimal", "HeroCentered"], contentKey: "hero" },
      { category: "cta", variants: ["CtaSimple"], contentKey: "cta" },
    ],
  },
]

export function getSectionTemplate(id: string): SectionTemplate | undefined {
  return SECTION_TEMPLATES.find((t) => t.id === id)
}

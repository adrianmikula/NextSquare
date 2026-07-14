import type { ComponentRegistry } from "@json-render/react"
import type { GeneDefinition } from "@/src/schema/site-config"

import {
  HeroCentered,
  HeroSplit,
  HeroMinimal,
  FeaturesGrid,
  FeaturesAlternating,
  CtaSimple,
  CtaSplit,
} from "@/src/genes"

const geneCatalog = new Map<string, GeneDefinition>()

function defineGene(def: GeneDefinition): GeneDefinition {
  geneCatalog.set(def.name, def)
  return def
}

export const heroCenteredDef = defineGene({
  name: "HeroCentered",
  props: {
    headline: { type: "string", required: true },
    subheadline: { type: "string" },
    ctaLabel: { type: "string" },
    ctaLink: { type: "string" },
    image: { type: "string" },
  },
  tuners: ["abstraction", "density", "motion", "contrast", "narrative"],
})

export const heroSplitDef = defineGene({
  name: "HeroSplit",
  props: {
    headline: { type: "string", required: true },
    subheadline: { type: "string" },
    ctaLabel: { type: "string" },
    ctaLink: { type: "string" },
    image: { type: "string" },
  },
  tuners: ["abstraction", "density", "contrast", "narrative"],
})

export const heroMinimalDef = defineGene({
  name: "HeroMinimal",
  props: {
    headline: { type: "string", required: true },
    subheadline: { type: "string" },
  },
  tuners: ["contrast", "narrative"],
})

export const featuresGridDef = defineGene({
  name: "FeaturesGrid",
  props: {
    headline: { type: "string", required: true },
    items: { type: "array", required: true },
  },
  tuners: ["density", "contrast", "abstraction"],
})

export const featuresAlternatingDef = defineGene({
  name: "FeaturesAlternating",
  props: {
    headline: { type: "string", required: true },
    items: { type: "array", required: true },
  },
  tuners: ["density", "motion", "narrative"],
})

export const ctaSimpleDef = defineGene({
  name: "CtaSimple",
  props: {
    headline: { type: "string", required: true },
    ctaLabel: { type: "string" },
    ctaLink: { type: "string" },
  },
  tuners: ["abstraction", "contrast", "motion"],
})

export const ctaSplitDef = defineGene({
  name: "CtaSplit",
  props: {
    headline: { type: "string", required: true },
    subheadline: { type: "string" },
    ctaLabel: { type: "string" },
    ctaLink: { type: "string" },
    image: { type: "string" },
  },
  tuners: ["abstraction", "density", "contrast", "narrative"],
})

export function getGeneCatalog(): GeneDefinition[] {
  return Array.from(geneCatalog.values())
}

export function getGene(name: string): GeneDefinition | undefined {
  return geneCatalog.get(name)
}

export const componentRegistry: ComponentRegistry = {
  HeroCentered: ({ element: { props } }) => <HeroCentered {...(props as any)} />,
  HeroSplit: ({ element: { props } }) => <HeroSplit {...(props as any)} />,
  HeroMinimal: ({ element: { props } }) => <HeroMinimal {...(props as any)} />,
  FeaturesGrid: ({ element: { props } }) => <FeaturesGrid {...(props as any)} />,
  FeaturesAlternating: ({ element: { props } }) => <FeaturesAlternating {...(props as any)} />,
  CtaSimple: ({ element: { props } }) => <CtaSimple {...(props as any)} />,
  CtaSplit: ({ element: { props } }) => <CtaSplit {...(props as any)} />,
}

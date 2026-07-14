import type { GeneDefinition } from "@/src/schema/site-config"

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
  tuners: ["warmth", "density", "motion", "depth"],
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
  tuners: ["warmth", "density", "contrast", "narrative"],
})

export const heroMinimalDef = defineGene({
  name: "HeroMinimal",
  props: {
    headline: { type: "string", required: true },
    subheadline: { type: "string" },
    ctaLabel: { type: "string" },
    ctaLink: { type: "string" },
  },
  tuners: ["warmth", "contrast", "narrative"],
})

export const featuresGridDef = defineGene({
  name: "FeaturesGrid",
  props: {
    headline: { type: "string", required: true },
    items: { type: "array", required: true },
  },
  tuners: ["density", "contrast", "depth"],
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
  tuners: ["warmth", "contrast", "motion"],
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
  tuners: ["warmth", "density", "contrast", "narrative"],
})

export function getCatalog(): GeneDefinition[] {
  return Array.from(geneCatalog.values())
}

export function getGene(name: string): GeneDefinition | undefined {
  return geneCatalog.get(name)
}

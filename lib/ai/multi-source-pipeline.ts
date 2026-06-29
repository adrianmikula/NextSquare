import fs from "fs"
import path from "path"
import { z } from "zod"
import type { ArchetypeCatalog } from "@/lib/schemas"
import { PageBundleSchema } from "@/lib/schemas"
import { renderBundle } from "@/lib/renderer"
import type { ArchetypeSelectorInput } from "./archetype-selector"
import { resolveLayout } from "./archetype-selector"

export type BusinessProfile = {
  name: string
  type: string
  tagline: string
  description: string
  location: { address: string; suburb: string; city: string }
  hours: Array<{ day: string; open: string; close: string }>
  phone: string
  vibe: { palette: string[]; adjectives: string[] }
  audience: string
  tone: "casual" | "refined" | "rustic" | "modern" | "playful"
  features: string[]
  testimonials: Array<{ author: string; text: string; source: string }>
  catalogue: {
    categories: string[]
    items: Array<{
      name: string
      description: string
      category: string
      priceHint?: number
      modifiers?: Array<{ name: string; options: string[] }>
    }>
  }
  services?: Array<{
    name: string
    description: string
    priceHint?: number
    duration?: string
  }>
  media: { hero?: string; logo?: string; gallery: string[] }
  deliveryUrls?: { uberEats?: string; doorDash?: string }
  social?: {
    instagram?: string
  }
  story?: string
  tripAdvisorSummary?: { rating?: number; reviewCount?: number; topKeywords: string[] }
}

export type PipelinePageConfig = {
  slug: string
  label: string
  archetype: string
  seo?: { title: string; description: string }
}

export type PipelineInput = {
  businessProfile: BusinessProfile
  tenant: string
  pages?: PipelinePageConfig[]
  llmCall?: (prompt: string, systemPrompt: string) => Promise<string>
}

export type PipelineResult = {
  bundle: z.infer<typeof PageBundleSchema>
  layout: import("@/lib/schemas").LayoutOutput
  layoutSource: "llm" | "fallback"
  skippedPages: string[]
}

const BLOCK_DATA_BUILDERS: Record<string, (profile: BusinessProfile) => Record<string, unknown>> = {
  hero: (profile) => ({
    headline: profile.name,
    subheadline: profile.tagline,
    image: profile.media.hero,
    ctaLabel: "View Menu",
    ctaLink: "/menu",
  }),

  text: (profile) => ({
    heading: "Welcome",
    body: profile.description,
  }),

  gallery: (profile) => ({
    images: profile.media.gallery,
    caption: profile.vibe.adjectives.join(" ") || "Our gallery",
  }),

  products: (profile) => {
    const items = profile.catalogue.items.slice(0, 4).map((item) => ({
      name: item.name,
      description: item.description,
      price: item.priceHint,
      image: undefined,
    }))
    return { title: "Popular Right Now", items }
  },

  services: (profile) => ({
    title: "Our Services",
    items: (profile.services ?? []).slice(0, 4).map((s) => ({
      name: s.name,
      description: s.description,
      priceHint: s.priceHint,
      duration: s.duration,
    })),
  }),

  testimonials: (profile) => ({
    items: profile.testimonials.slice(0, 3).map((t) => ({
      author: t.author,
      text: t.text,
      source: t.source,
    })),
  }),

  cta: (profile) => ({
    heading: `Visit ${profile.name}`,
    subtext: profile.tagline,
    buttonLabel: "Get in Touch",
    buttonLink: "/contact",
  }),

  hours: (profile) => ({
    schedule: profile.hours,
  }),

  faq: () => ({
    items: [],
  }),

  form: () => ({
    title: "Contact Us",
    fields: [
      { name: "name", type: "text", label: "Name", required: true },
      { name: "email", type: "email", label: "Email", required: true },
      { name: "message", type: "textarea", label: "Message", required: true },
    ],
  }),

  promo: (profile) => ({
    heading: "Special Offer",
    body: profile.description,
    ctaLabel: "Learn More",
    ctaLink: "/menu",
    image: undefined,
  }),

  delivery: (profile) => ({
    heading: "Order Delivery",
    body: "Get it delivered to your door",
    platforms: [
      ...(profile.deliveryUrls?.uberEats
        ? [{ name: "Uber Eats", url: profile.deliveryUrls.uberEats, label: "Uber Eats" }]
        : []),
      ...(profile.deliveryUrls?.doorDash
        ? [{ name: "DoorDash", url: profile.deliveryUrls.doorDash, label: "DoorDash" }]
        : []),
    ],
  }),

  slideshow: (profile) => ({
    images: profile.media.gallery,
    caption: profile.vibe.adjectives.join(" ") || "Our gallery",
  }),

  "social-icons": (profile) => ({
    platforms: [
      ...(profile.social?.instagram
        ? [{ name: "Instagram", url: `https://instagram.com/${profile.social.instagram}`, icon: "📷" }]
        : []),
      ...(profile.deliveryUrls?.uberEats
        ? [{ name: "Uber Eats", url: profile.deliveryUrls.uberEats, icon: "🛵" }]
        : []),
      ...(profile.deliveryUrls?.doorDash
        ? [{ name: "DoorDash", url: profile.deliveryUrls.doorDash, icon: "🛵" }]
        : []),
    ],
  }),

  callout: (profile) => {
    const featured = profile.testimonials[0]
    return {
      quote: featured?.text || profile.description || "Come visit us for a great experience.",
      author: featured?.author,
      role: featured?.source || "Customer",
    }
  },

  hr: () => ({ style: "solid", color: undefined }),

  "image-text": (profile) => ({
    items: [
      {
        image: profile.media.hero,
        heading: "Our Story",
        body: profile.description,
        align: "left",
      },
      ...(profile.story
        ? [
            {
              image: profile.media.gallery?.[1],
              heading: "What Makes Us Different",
              body: profile.story,
              align: "right",
            },
          ]
        : []),
    ],
  }),

  comparison: (profile) => ({
    title: "Why Choose Us",
    columns: [
      {
        header: "Us",
        features: [
          { name: "Fresh ingredients", included: true },
          { name: "Locally roasted coffee", included: true },
          { name: "Community space", included: true },
          { name: "Delivery available", included: !!profile.deliveryUrls },
        ],
      },
      {
        header: "Others",
        features: [
          { name: "Fresh ingredients", included: false },
          { name: "Locally roasted coffee", included: false },
          { name: "Community space", included: false },
          { name: "Delivery available", included: false },
        ],
      },
    ],
    ctaLabel: "Visit Us",
    ctaLink: "/contact",
  }),
}

export function buildDataMap(archetypeBlocks: string[], profile: BusinessProfile): Record<string, Record<string, unknown>> {
  const dataMap: Record<string, Record<string, unknown>> = {}
  for (const symbol of archetypeBlocks) {
    const builder = BLOCK_DATA_BUILDERS[symbol]
    if (builder) {
      dataMap[symbol] = builder(profile)
    } else {
      dataMap[symbol] = {}
    }
  }
  return dataMap
}

export function loadArchetypeCatalog(tenant: string): ArchetypeCatalog | null {
  const catalogPath = path.join(process.cwd(), "content", "archetypes", `${tenant}.json`)
  if (!fs.existsSync(catalogPath)) return null
  const raw = fs.readFileSync(catalogPath, "utf-8")
  return JSON.parse(raw) as ArchetypeCatalog
}

export function buildSelectorInput(
  profile: BusinessProfile,
  catalog: ArchetypeCatalog,
  pages: PipelinePageConfig[],
): ArchetypeSelectorInput {
  return {
    businessProfile: profile as unknown as Record<string, unknown>,
    archetypeCatalog: {
      archetypes: catalog.archetypes,
      blockVocabulary: catalog.blockVocabulary,
    },
    selectionRules: pages.map((p) => ({
      condition: buildDefaultCondition(p.slug),
      archetype: p.archetype,
      page: p.slug,
    })),
  }
}

export async function runPipeline(input: PipelineInput): Promise<PipelineResult> {
  const catalog = loadArchetypeCatalog(input.tenant)
  const archetypeCatalog = catalog ?? {
    version: "1.0",
    tenant: input.tenant,
    blockVocabulary: {},
    archetypes: {},
  }

  const pages = input.pages ?? getDefaultPages()

  const selectorInput = buildSelectorInput(input.businessProfile, archetypeCatalog, pages)
  const { output: layout, source: layoutSource } = await resolveLayout(selectorInput, input.llmCall)

  const skipped: string[] = []
  const bundlePages: Parameters<typeof renderBundle>[0] = {}

  for (const page of pages) {
    const archetypeName = layout.selected[page.slug]
    if (!archetypeName) {
      skipped.push(page.slug)
      continue
    }

    const blocks = archetypeCatalog.archetypes[archetypeName]?.blocks ?? []
    const dataMap = buildDataMap(blocks, input.businessProfile)

    bundlePages[page.slug] = {
      archetype: archetypeName,
      label: page.label,
      dataMap,
      seo: page.seo,
    }
  }

  const rawBundle = renderBundle(bundlePages)

  const parsedBundle = {
    pages: rawBundle.map((p) => ({
      slug: p.slug,
      label: p.label,
      blocks: p.blocks,
      ...(p.seo ? { seo: p.seo } : {}),
    })),
  }

  const validated = PageBundleSchema.parse(parsedBundle)

  return {
    bundle: validated,
    layout,
    layoutSource,
    skippedPages: skipped,
  }
}

function getDefaultPages(): PipelinePageConfig[] {
  return [
    { slug: "home", label: "Home", archetype: "DEFAULT_HOME", seo: { title: "Home", description: "" } },
    { slug: "menu", label: "Menu", archetype: "MENU_DEFAULT" },
    { slug: "about", label: "About", archetype: "ABOUT_STORY" },
    { slug: "contact", label: "Contact", archetype: "CONTACT_DIRECT" },
  ]
}

function buildDefaultCondition(page: string): string {
  const defaults: Record<string, string> = {
    home: "true",
    menu: "catalogue.categories.length > 0",
    about: "description.length >= 50",
    contact: "phone OR location.address present",
    faq: "features contains faq",
    gallery: "media.gallery.length >= 3",
    events: "features contains events",
    loyalty: "features contains loyalty",
    membership: "features contains membership",
    pricing: "services is non-empty AND type in {salon, spa, consultant}",
  }
  return defaults[page] ?? "true"
}

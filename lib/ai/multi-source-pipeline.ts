import fs from "fs"
import path from "path"
import { z } from "zod"
import type { ArchetypeCatalog, LayoutVariant } from "@/lib/schemas"
import { PageBundleSchema } from "@/lib/schemas"
import { renderBundle, type BlockData, type RenderPageConfig, type RenderedPage, getArchetypeBlocks } from "@/lib/renderer"
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
  seo?: { title: string; description: string }
}

export type PipelineInput = {
  businessProfile: BusinessProfile
  llmCall?: (prompt: string, systemPrompt: string) => Promise<string>
}

export type PipelineResult = {
  bundle: z.infer<typeof PageBundleSchema>
  layout: import("@/lib/schemas").LayoutOutput
  layoutSource: "llm" | "fallback"
  skippedPages: string[]
}

function makeVariantField(valueA: string, valueB: string): { a: string; b: string } {
  return { a: valueA, b: valueB }
}

const BLOCK_DATA_BUILDERS: Record<string, (profile: BusinessProfile) => Record<string, unknown>> = {
  gallery: (profile) => ({
    images: profile.media.gallery,
    caption: makeVariantField(
      profile.vibe.adjectives.join(" ") || "Our gallery",
      "See inside ${profile.name}"
    ).replace("${profile.name}", profile.name),
  }),

  products: (profile) => {
    const items = profile.catalogue.items.slice(0, 4).map((item) => ({
      name: item.name,
      description: item.description,
      price: item.priceHint,
      image: undefined,
    }))
    return { title: makeVariantField("Popular Right Now", "What We're Serving"), items }
  },

  services: (profile) => ({
    title: makeVariantField("Our Services", "What We Offer"),
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
      text: makeVariantField(t.text, `"${t.text.slice(0, 60)}${t.text.length > 60 ? '...' : ''}"`),
      source: t.source,
    })),
  }),

  cta: (profile) => ({
    heading: makeVariantField(`Visit ${profile.name}`, `Ready to experience ${profile.name}?`),
    subtext: makeVariantField(profile.tagline, "Walk in, order online, or give us a call."),
    buttonLabel: makeVariantField("Get in Touch", "Order Now"),
    buttonLink: "/contact",
  }),

  hours: (profile) => ({
    schedule: profile.hours,
  }),

  faq: (_profile) => ({
    items: [],
  }),

  form: (profile) => ({
    title: makeVariantField("Contact Us", "Get in Touch"),
    fields: [
      { name: "name", type: "text", label: "Name", required: true },
      { name: "email", type: "email", label: "Email", required: true },
      { name: "message", type: "textarea", label: "Message", required: true },
    ],
  }),

  promo: (profile) => ({
    heading: makeVariantField("Special Offer", "Today's Special"),
    body: makeVariantField(profile.description, "Don't miss out on our latest offerings."),
    ctaLabel: makeVariantField("Learn More", "See Details"),
    ctaLink: "/menu",
    image: undefined,
  }),

  delivery: (profile) => ({
    heading: makeVariantField("Order Delivery", "Get It Delivered"),
    body: makeVariantField("Get it delivered to your door", "Fresh food, straight to your door."),
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
    caption: makeVariantField(
      profile.vibe.adjectives.join(" ") || "Our gallery",
      "Moments from ${profile.name}"
    ).replace("${profile.name}", profile.name),
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
      quote: makeVariantField(
        featured?.text || profile.description || "Come visit us for a great experience.",
        featured?.text
          ? `"${featured.text.slice(0, 100)}${featured.text.length > 100 ? '...' : ''}"`
          : "Come visit us for a great experience."
      ),
      author: featured?.author,
      role: makeVariantField(featured?.source || "Customer", "Verified customer"),
    }
  },

  hr: () => ({ style: "solid", color: undefined }),

  "image-text": (profile) => ({
    items: [
      {
        image: profile.media.hero,
        heading: makeVariantField("Our Story", "Fresh from the start"),
        body: makeVariantField(profile.description, "Every dish tells a story of quality and care."),
        align: "left",
      },
      ...(profile.story
        ? [
            {
              image: profile.media.gallery?.[1],
              heading: makeVariantField("What Makes Us Different", "More Than Just a Cafe"),
              body: makeVariantField(profile.story, "We source locally, bake fresh, and treat every customer like family."),
              align: "right",
            },
          ]
        : []),
    ],
  }),

  comparison: (profile) => ({
    title: makeVariantField("Why Choose Us", "How We Stack Up"),
    columns: [
      {
        header: makeVariantField("Us", "${profile.name}").replace("${profile.name}", profile.name),
        features: [
          { name: "Fresh ingredients", included: true },
          { name: "Locally roasted coffee", included: true },
          { name: "Community space", included: true },
          { name: "Delivery available", included: !!profile.deliveryUrls },
        ],
      },
      {
        header: makeVariantField("Others", "Alternatives"),
        features: [
          { name: "Fresh ingredients", included: false },
          { name: "Locally roasted coffee", included: false },
          { name: "Community space", included: false },
          { name: "Delivery available", included: false },
        ],
      },
    ],
    ctaLabel: makeVariantField("Visit Us", "Come See for Yourself"),
    ctaLink: "/contact",
  }),

  map: (profile) => ({
    address: profile.location.address,
    suburb: profile.location.suburb,
    city: profile.location.city,
    directionsUrl: `https://maps.google.com/?q=${encodeURIComponent(profile.location.address + " " + profile.location.city)}`,
  }),

  team: (profile) => ({
    title: makeVariantField("Our Team", "Meet the Crew"),
    items: (profile.services ?? []).slice(0, 4).map((s) => ({
      name: s.name,
      role: s.name,
      bio: s.description,
      photo: undefined,
    })),
  }),

  reservation: (profile) => ({
    title: makeVariantField("Make a Reservation", "Book a Table"),
    fields: [
      { name: "name", type: "text", label: "Name", required: true },
      { name: "date", type: "date", label: "Date", required: true },
      { name: "time", type: "time", label: "Time", required: true },
      { name: "partySize", type: "number", label: "Party Size", required: true },
      { name: "phone", type: "tel", label: "Phone", required: true },
      { name: "notes", type: "textarea", label: "Special Requests", required: false },
    ],
    prefillName: undefined,
    prefillPhone: profile.phone ? profile.phone : undefined,
  }),

  logo: (profile) => ({
    image: profile.media.logo,
    text: profile.name,
    link: "/",
  }),

  "business-name": (profile) => ({
    text: profile.name,
    link: "/",
  }),

  slogan: (profile) => ({
    text: makeVariantField(profile.tagline || "", "Fresh coffee, great food, good vibes."),
  }),

  nav: (_profile) => ({
    links: [
      { href: "/", label: "Home" },
      { href: "/menu", label: "Menu" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
    sticky: false,
    variant: "home",
  }),

  sitemap: (_profile) => ({
    columns: [
      {
        title: "Explore",
        links: [
          { href: "/", label: "Home" },
          { href: "/menu", label: "Menu" },
          { href: "/about", label: "About" },
        ],
      },
      {
        title: "Connect",
        links: [
          { href: "/contact", label: "Contact" },
          { href: "/cart", label: "Cart" },
        ],
      },
    ],
  }),

  announcement: (_profile) => ({
    text: "Welcome! Order online for pickup or delivery.",
    link: "/menu",
    linkLabel: "Order Now",
  }),

  copyright: (profile) => ({
    text: `© ${new Date().getFullYear()} ${profile.name}. All rights reserved.`,
    name: profile.name,
    year: new Date().getFullYear(),
  }),

  phone: (profile) => ({
    number: profile.phone,
    display: profile.phone,
    label: "Call us",
  }),

  hero: (profile) => {
    const base = {
      headline: makeVariantField(profile.name, profile.name),
      subheadline: makeVariantField(profile.tagline, `Discover ${profile.name} — great food, great coffee, great vibes.`),
      image: profile.media.hero,
      ctaLabel: makeVariantField("View Menu", "Order Online"),
      ctaLink: "/menu",
    }
    if (profile.media.hero) {
      return {
        ...base,
        variant: {
          backgroundStyle: "image",
          overlayOpacity: 0.4,
          textAlign: "center",
          headingSize: "4xl",
        },
      }
    }
    return base
  },

  text: (profile) => ({
    heading: makeVariantField("Welcome", "Our Story"),
    body: makeVariantField(profile.description, `At ${profile.name}, we believe in fresh, local ingredients and a warm atmosphere. Come for the coffee, stay for the community.`),
  }),

  "business-name": (profile) => ({
    text: profile.name,
    link: "/",
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

  "page-layout": () => ({
    maxWidth: "standard",
    contentAlign: "center",
    sectionSpacing: "standard",
    sidebarPosition: "none",
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

export function loadArchetypeCatalog(): ArchetypeCatalog | null {
  const catalogPath = path.join(process.cwd(), "content", "archetypes", "catalog.json")
  if (!fs.existsSync(catalogPath)) return null
  const raw = fs.readFileSync(catalogPath, "utf-8")
  return JSON.parse(raw) as ArchetypeCatalog
}

export function buildSelectorInput(
  profile: BusinessProfile,
  catalog: ArchetypeCatalog,
): ArchetypeSelectorInput {
  const pages = getDefaultPages()
  return {
    businessProfile: profile as unknown as Record<string, unknown>,
    archetypeCatalog: {
      archetypes: catalog.archetypes,
      blockVocabulary: catalog.blockVocabulary,
    },
    selectionRules: pages.map((p) => ({
      condition: buildDefaultCondition(p.slug),
      archetype: guessArchetype(p.slug),
      page: p.slug,
    })),
  }
}

export async function runPipeline(input: PipelineInput): Promise<PipelineResult> {
  const catalog = loadArchetypeCatalog()

  const archetypeCatalog = catalog ?? {
    version: "1.0",
    blockVocabulary: {},
    archetypes: {},
  }

  const pages = getDefaultPages()

  const selectorInput = buildSelectorInput(input.businessProfile, archetypeCatalog)
  const { output: layout, source: layoutSource } = await resolveLayout(selectorInput, input.llmCall)

  const skipped: string[] = []
  const bundlePages: Record<string, RenderPageConfig> = {}

  for (const page of pages) {
    const pageLayout = layout.selected[page.slug]
    if (!pageLayout) {
      skipped.push(page.slug)
      continue
    }

    const archetypeName = pageLayout.archetype
    const blocks = archetypeCatalog.archetypes[archetypeName]?.blocks ?? getArchetypeBlocks(archetypeName)
    const dataMap = buildDataMap(blocks, input.businessProfile)

    const variants: LayoutVariant[] = pageLayout.variants ?? [
      {
        archetype: archetypeName,
        order: blocks,
        reasoning: "Default ordering.",
      },
    ]

    bundlePages[page.slug] = {
      label: page.label,
      archetype: archetypeName,
      variants: variants.map((v) => ({
        id: v.id ?? "A",
        reasoning: v.reasoning ?? "",
        order: v.order,
      })),
      dataMap,
      seo: page.seo,
    }
  }

  const rawBundle = renderBundle(bundlePages)

  type RawCmsBlock = { type: string; data: Record<string, unknown> }

  function buildRawBlocks(order: string[], dataMap: Record<string, BlockData>): RawCmsBlock[] {
    return order.map((symbol) => {
      const data = dataMap[symbol] ?? {}
      return { type: symbol, data: { ...data } }
    })
  }

  const parsedBundle = {
    pages: rawBundle.map((p: RenderedPage) => {
      const pageCfg = bundlePages[p.slug]
      const rawVariants = p.variants.map((v) => ({
        id: v.id,
        reasoning: v.reasoning,
        order: v.order,
        blocks: buildRawBlocks(v.order, pageCfg.dataMap),
      }))
      const defaultVariant = rawVariants[0]
      return {
        slug: p.slug,
        label: p.label,
        archetype: p.archetype,
        blocks: defaultVariant?.blocks ?? [],
        variants: rawVariants,
        ...(p.seo ? { seo: p.seo } : {}),
      }
    }),
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
    { slug: "home", label: "Home", seo: { title: "Home", description: "" } },
    { slug: "menu", label: "Menu" },
    { slug: "about", label: "About" },
    { slug: "contact", label: "Contact" },
    { slug: "header", label: "Header" },
    { slug: "footer", label: "Footer" },
    { slug: "page-layout", label: "Page Layout" },
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
    team: "features contains team OR features contains staff",
    reservations: "features contains reservations OR type in {restaurant, cafe, hotel}",
    locations: "features contains multi-location OR locations.length > 1",
    header: "true",
    footer: "true",
    "page-layout": "true",
  }
  return defaults[page] ?? "true"
}

function guessArchetype(page: string): string {
  const defaults: Record<string, string> = {
    home: "DEFAULT_HOME",
    menu: "MENU_DEFAULT",
    about: "ABOUT_STORY",
    contact: "CONTACT_DIRECT",
    faq: "FAQ_FULL",
    gallery: "GALLERY_FULL",
    events: "EVENTS_PAGE",
    loyalty: "LOYALTY_PAGE",
    membership: "MEMBERSHIP_PAGE",
    pricing: "PRICING_PAGE",
    team: "TEAM_PAGE",
    reservations: "RESERVATIONS_PAGE",
    locations: "LOCATIONS_PAGE",
    header: "STANDARD_HEADER",
    footer: "STANDARD_FOOTER",
    "page-layout": "STANDARD_CONTAINER",
  }
  return defaults[page] ?? "DEFAULT_HOME"
}

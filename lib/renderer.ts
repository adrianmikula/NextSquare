import type { CmsBlock } from "@/lib/cms"

// ── Types ────────────────────────────────────────────────────────────────────

export interface BlockData {
  [key: string]: unknown
}

// ── Individual block renderers ────────────────────────────────────────────────
// Each returns just the `data` object; `renderBlock` wraps it with `{ type, data }`.

function renderHero(data: BlockData): BlockData {
  const out: BlockData = {
    headline: String(data.headline ?? ""),
    subheadline: String(data.subheadline ?? ""),
    ctaLabel: String(data.ctaLabel ?? data.ctaLebel ?? ""),
    ctaLink: String(data.ctaLink ?? "/menu"),
    image: data.image as string | undefined,
  }
  if (typeof data.variant === "object" && data.variant !== null) {
    out.variant = data.variant
  }
  return out
}

function renderText(data: BlockData): BlockData {
  return {
    heading: String(data.heading ?? ""),
    body: String(data.body ?? ""),
  }
}

function renderGallery(data: BlockData): BlockData {
  return {
    images: (data.images as string[]) ?? [],
    caption: data.caption as string | undefined,
  }
}

function renderProducts(data: BlockData): BlockData {
  return {
    title: String(data.title ?? ""),
    items: (data.items as Array<{ name: string; description: string; price?: number; image?: string }>) ?? [],
  }
}

function renderServices(data: BlockData): BlockData {
  return {
    title: String(data.title ?? ""),
    items: (data.items as Array<{ name: string; description: string; priceHint?: number; duration?: string }>) ?? [],
  }
}

function renderTestimonials(data: BlockData): BlockData {
  return {
    items: (data.items as Array<{ author: string; text: string; source?: string }>) ?? [],
  }
}

function renderCta(data: BlockData): BlockData {
  return {
    heading: String(data.heading ?? ""),
    subtext: String(data.subtext ?? ""),
    buttonLabel: String(data.buttonLabel ?? ""),
    buttonLink: String(data.buttonLink ?? "/menu"),
  }
}

function renderHours(data: BlockData): BlockData {
  return {
    schedule: (data.schedule as Array<{ day: string; open: string; close: string }>) ?? [],
  }
}

function renderFaq(data: BlockData): BlockData {
  return {
    items: (data.items as Array<{ question: string; answer: string }>) ?? [],
  }
}

function renderForm(data: BlockData): BlockData {
  return {
    title: String(data.title ?? ""),
    fields: (data.fields as Array<{ name: string; type: string; label: string; required: boolean }>) ?? [],
  }
}

function renderPromo(data: BlockData): BlockData {
  return {
    heading: String(data.heading ?? ""),
    body: String(data.body ?? ""),
    ctaLabel: String(data.ctaLabel ?? ""),
    ctaLink: String(data.ctaLink ?? "/menu"),
    image: data.image as string | undefined,
  }
}

function renderDelivery(data: BlockData): BlockData {
  return {
    heading: String(data.heading ?? ""),
    body: String(data.body ?? ""),
    platforms: (data.platforms as Array<{ name: string; url: string; label: string }>) ?? [],
  }
}

function renderSlideshow(data: BlockData): BlockData {
  return {
    images: (data.images as string[]) ?? [],
    caption: data.caption as string | undefined,
    interval: data.interval as number | undefined,
  }
}

function renderSocialIcons(data: BlockData): BlockData {
  return {
    platforms: (data.platforms as Array<{ name: string; url: string; icon?: string }>) ?? [],
  }
}

function renderCallout(data: BlockData): BlockData {
  return {
    quote: String(data.quote ?? ""),
    author: data.author as string | undefined,
    role: data.role as string | undefined,
  }
}

function renderHr(data: BlockData): BlockData {
  return {
    style: (data.style as "solid" | "dashed" | "dotted") ?? "solid",
    color: data.color as string | undefined,
  }
}

function renderImageText(data: BlockData): BlockData {
  return {
    items: (data.items as Array<{ image?: string; heading: string; body: string; align?: "left" | "right" }>) ?? [],
  }
}

function renderComparison(data: BlockData): BlockData {
  return {
    title: data.title as string | undefined,
    columns: (data.columns as Array<{ header: string; features: Array<{ name: string; included: boolean }> }>) ?? [],
    ctaLabel: data.ctaLabel as string | undefined,
    ctaLink: data.ctaLink as string | undefined,
  }
}

function renderMap(data: BlockData): BlockData {
  return {
    address: String(data.address ?? ""),
    suburb: String(data.suburb ?? ""),
    city: String(data.city ?? ""),
    embedUrl: data.embedUrl as string | undefined,
    directionsUrl: data.directionsUrl as string | undefined,
  }
}

function renderTeam(data: BlockData): BlockData {
  return {
    title: String(data.title ?? "Our Team"),
    items: (data.items as Array<{ name: string; role: string; bio?: string; photo?: string }>) ?? [],
  }
}

function renderReservation(data: BlockData): BlockData {
  return {
    title: String(data.title ?? "Make a Reservation"),
    fields: (data.fields as Array<{ name: string; type: string; label: string; required: boolean }>) ?? [],
    prefillName: data.prefillName as string | undefined,
    prefillPhone: data.prefillPhone as string | undefined,
  }
}

function renderPageLayout(data: BlockData): BlockData {
  return {
    maxWidth: (data.maxWidth as string | undefined) || "standard",
    contentAlign: (data.contentAlign as string | undefined) || "center",
    sectionSpacing: (data.sectionSpacing as string | undefined) || "standard",
    sidebarPosition: (data.sidebarPosition as string | undefined) || "none",
  }
}

function renderLogo(data: BlockData): BlockData {
  return {
    image: data.image as string | undefined,
    text: data.text as string | undefined,
    link: data.link as string | undefined,
  }
}

function renderBusinessName(data: BlockData): BlockData {
  return {
    text: String(data.text ?? ""),
    link: data.link as string | undefined,
  }
}

function renderSlogan(data: BlockData): BlockData {
  return {
    text: String(data.text ?? ""),
  }
}

function renderNav(data: BlockData): BlockData {
  return {
    links: (data.links as Array<{ href: string; label: string }>) ?? [],
    sticky: data.sticky as boolean | undefined,
    variant: data.variant as string | undefined,
  }
}

function renderSitemap(data: BlockData): BlockData {
  return {
    columns: (data.columns as Array<{ title: string; links: Array<{ href: string; label: string }> }>) ?? [],
  }
}

function renderAnnouncement(data: BlockData): BlockData {
  return {
    text: String(data.text ?? ""),
    link: data.link as string | undefined,
    linkLabel: data.linkLabel as string | undefined,
  }
}

function renderCopyright(data: BlockData): BlockData {
  return {
    text: data.text as string | undefined,
    name: data.name as string | undefined,
    year: data.year as number | undefined,
  }
}

function renderPhone(data: BlockData): BlockData {
  return {
    number: String(data.number ?? ""),
    display: data.display as string | undefined,
    label: data.label as string | undefined,
  }
}

const RENDERERS: Record<string, (data: BlockData) => BlockData> = {
  hero: renderHero,
  text: renderText,
  gallery: renderGallery,
  products: renderProducts,
  services: renderServices,
  testimonials: renderTestimonials,
  cta: renderCta,
  hours: renderHours,
  faq: renderFaq,
  form: renderForm,
  promo: renderPromo,
  delivery: renderDelivery,
  slideshow: renderSlideshow,
  "social-icons": renderSocialIcons,
  callout: renderCallout,
  hr: renderHr,
  "image-text": renderImageText,
  comparison: renderComparison,
  map: renderMap,
  team: renderTeam,
  reservation: renderReservation,
  logo: renderLogo,
  "business-name": renderBusinessName,
  slogan: renderSlogan,
  nav: renderNav,
  sitemap: renderSitemap,
  announcement: renderAnnouncement,
  copyright: renderCopyright,
  phone: renderPhone,
  "page-layout": renderPageLayout,
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface PageVariantConfig {
  id: string
  reasoning?: string
  order: string[]
}

export interface RenderPageConfig {
  label: string
  archetype?: string
  order?: string[]
  variants?: PageVariantConfig[]
  dataMap: Record<string, BlockData>
  seo?: { title: string; description: string }
}

export interface RenderedPage {
  slug: string
  label: string
  archetype: string
  variants: Array<{
    id: string
    reasoning: string
    order: string[]
    blocks: CmsBlock[]
  }>
  seo?: { title: string; description: string }
}

export function renderBlock(symbol: string, data: BlockData = {}): CmsBlock {
  const renderer = RENDERERS[symbol]
  if (!renderer) {
    throw new Error(`Unknown block symbol: ${symbol}. Known symbols: ${Object.keys(RENDERERS).join(", ")}`)
  }
  return { type: symbol, data: renderer(data) }
}

export function renderPage(orderedBlocks: string[], dataMap: Record<string, BlockData> = {}): CmsBlock[] {
  return orderedBlocks.map((symbol) => {
    const data = dataMap[symbol] ?? {}
    return renderBlock(symbol, data)
  })
}

function resolveBlockOrder(page: RenderPageConfig): string[] {
  if (page.order) return page.order
  if (page.variants && page.variants.length > 0) return page.variants[0].order
  if (page.archetype && ARCHETYPE_BLOCKS[page.archetype]) return ARCHETYPE_BLOCKS[page.archetype]
  return page.archetype ? [page.archetype] : []
}

export function renderBundle(pages: Record<string, RenderPageConfig>): RenderedPage[] {
  return Object.entries(pages).map(([slug, page]) => {
    const archetypeName = page.archetype ?? ""
    const variants = page.variants && page.variants.length > 0
      ? page.variants.map((v) => ({
          id: v.id,
          reasoning: v.reasoning ?? "",
          order: v.order,
          blocks: renderPage(v.order, page.dataMap),
        }))
      : [
          {
            id: "A",
            reasoning: "Default arrangement",
            order: resolveBlockOrder(page),
            blocks: renderPage(resolveBlockOrder(page), page.dataMap),
          },
        ]

    return {
     slug,
      label: page.label,
      archetype: archetypeName,
      variants,
      seo: page.seo,
    }
  })
}

// ── Archetype Block Registry ──────────────────────────────────────────────────
// This registry maps archetype names to their block sequences.
// It is populated at build time from `content/archetypes/catalog.json`
// or from the hardcoded fallbacks below.

const ARCHETYPE_BLOCKS: Record<string, string[]> = {
  DEFAULT_HOME: ["hero", "text", "products", "cta"],
  GALLERY_FIRST: ["hero", "gallery", "text", "cta", "hours"],
  GALLERY_FULL_HOME: ["hero", "gallery", "text", "products", "cta"],
  SERVICES_HOME: ["hero", "services", "text", "testimonials", "cta", "hours"],
  SOCIAL_PROOF_HOME: ["hero", "testimonials", "text", "products", "cta", "testimonials"],
  MINIMAL_HOME: ["hero", "text", "cta"],
  MENU_FOCUSED: ["hero", "products", "text", "cta"],
  EVENTS_HOME: ["hero", "text", "promo", "services", "cta", "hours"],
  LOYALTY_HOME: ["hero", "text", "products", "cta", "testimonials"],
  MENU_DEFAULT: ["hero", "products", "cta"],
  ABOUT_STORY: ["hours", "text", "testimonials", "callout", "cta"],
  CONTACT_DIRECT: ["hours", "text", "form", "social-icons", "cta"],
  FAQ_FULL: ["faq", "text", "cta"],
  GALLERY_FULL: ["gallery", "text", "cta"],
  EVENTS_PAGE: ["hero", "promo", "text", "form", "cta"],
  LOYALTY_PAGE: ["hero", "text", "testimonials", "cta"],
  MEMBERSHIP_PAGE: ["hero", "text", "form", "cta"],
  PRICING_PAGE: ["hero", "services", "comparison", "cta"],
  STORY_IMAGE: ["hero", "image-text", "cta"],
  GALLERY_FULL_HOME_ALT: ["hero", "slideshow", "text", "products", "cta"],
  TEAM_HOME: ["hero", "team", "text", "products", "cta"],
  TEAM_PAGE: ["hero", "team", "text", "cta"],
  RESERVATIONS_PAGE: ["hero", "text", "reservation", "hours", "map", "cta"],
  LOCATIONS_PAGE: ["hours", "map", "text", "cta"],
  MINIMAL_HEADER: ["nav", "logo"],
  STANDARD_HEADER: ["announcement", "nav", "logo"],
  BRANDED_HEADER: ["announcement", "nav", "logo", "cta", "slogan"],
  MINIMAL_FOOTER: ["copyright", "social-icons"],
  STANDARD_FOOTER: ["copyright", "social-icons", "phone", "sitemap"],
  SOCIAL_FOOTER: ["social-icons", "sitemap", "copyright"],
  HEADER_DEFAULT: ["logo", "business-name", "nav", "phone"],
  FOOTER_DEFAULT: ["business-name", "slogan", "social-icons", "copyright", "sitemap"],
  STANDARD_CONTAINER: ["page-layout"],
  NARROW_PROSE: ["page-layout"],
  WIDE_MARGIN: ["page-layout"],
  COMPACT_MARGIN: ["page-layout"],
  ASYMMETRIC: ["page-layout"],
  SIDEBAR_RIGHT: ["page-layout"],
}

export function getArchetypeBlocks(archetype: string): string[] {
  return ARCHETYPE_BLOCKS[archetype] ?? [archetype]
}

import type { CmsBlock } from "@/lib/cms"

// ── Types ────────────────────────────────────────────────────────────────────

export interface BlockData {
  [key: string]: unknown
}

// ── Individual block renderers ────────────────────────────────────────────────
// Each returns just the `data` object; `renderBlock` wraps it with `{ type, data }`.

function renderHero(data: BlockData): BlockData {
  return {
    headline: String(data.headline ?? ""),
    subheadline: String(data.subheadline ?? ""),
    ctaLabel: String(data.ctaLabel ?? data.ctaLebel ?? ""),
    ctaLink: String(data.ctaLink ?? "/menu"),
    image: data.image as string | undefined,
  }
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

// ── Dispatch ──────────────────────────────────────────────────────────────────

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
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Render a single block symbol with its data into a CMS block.
 * @throws Error if the symbol is not a known CMS block type.
 */
export function renderBlock(symbol: string, data: BlockData = {}): CmsBlock {
  const renderer = RENDERERS[symbol]
  if (!renderer) {
    throw new Error(`Unknown block symbol: ${symbol}. Known symbols: ${Object.keys(RENDERERS).join(", ")}`)
  }
  return { type: symbol, data: renderer(data) }
}

/**
 * Render an archetype (ordered list of block symbols) into a CMS page's block array.
 *
 * @param archetypeBlocks - Ordered list of block symbols (e.g. ["hero", "text", "products", "cta"])
 * @param dataMap - Map of symbol → data object. Missing symbols get empty data.
 * @returns Array of CMS blocks ready for `pages.json`
 *
 * @example
 * renderPage(["hero", "text", "products"], {
 *   hero: { headline: "Welcome", subheadline: "...", ctaLabel: "Menu", ctaLink: "/menu" },
 *   text: { heading: "About", body: "We are..." },
 *   products: { title: "Popular", items: [...] }
 * })
 */
export function renderPage(archetypeBlocks: string[], dataMap: Record<string, BlockData> = {}): CmsBlock[] {
  return archetypeBlocks.map((symbol) => {
    const data = dataMap[symbol] ?? {}
    return renderBlock(symbol, data)
  })
}

/**
 * Render a full PageBundle from an archetype selection + data map.
 *
 * @param pages - Map of page slug → { archetype, label, dataMap, seo? }
 * @returns PageBundle ready for `pages.json`
 */
export function renderBundle(
  pages: Record<
    string,
    {
      archetype: string
      label: string
      dataMap: Record<string, BlockData>
      seo?: { title: string; description: string }
    }
  >
): { slug: string; label: string; blocks: CmsBlock[]; seo?: { title: string; description: string } }[] {
  // Look up the archetype definitions. These come from the archetype catalog (archetypes.json)
  // or are passed in directly. For now, we expect the caller to pass the block list.
  return Object.entries(pages).map(([slug, page]) => ({
    slug,
    label: page.label,
    blocks: renderPage(page.archetype ? ARCHETYPE_BLOCKS[page.archetype] ?? [page.archetype] : [], page.dataMap),
    seo: page.seo,
  }))
}

// ── Archetype Block Registry ──────────────────────────────────────────────────
// This registry maps archetype names to their block sequences.
// It is populated at build time from `content/archetypes/<tenant>.json`
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
}

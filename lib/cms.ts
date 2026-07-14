import fs from "fs"
import path from "path"

const CMS_ROOT = path.join(process.cwd(), "content", "cms", "site")
const ARCHETYPES_ROOT = path.join(process.cwd(), "content", "archetypes")
const SITE_PROFILE_PATH = path.join(process.cwd(), "content", "site-profile", "demo", "site-profile.json")
const CATALOGUE_PATH = path.join(process.cwd(), "content", "catalogue", "demo", "catalogue.json")

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(raw) as T
}

// ── Site Profile ──────────────────────────────────────────────────────────────

export interface SiteProfile {
  siteName: string
  tagline?: string
  description?: string
  address?: {
    street: string
    suburb: string
    state: string
    postcode: string
    country?: string
    full: string
  }
  contact?: {
    phone?: string
    phoneDisplay?: string
    email?: string
    hours?: {
      weekdays?: string
      saturday?: string
      sunday?: string
    }
  }
  social?: {
    instagram?: string
  }
  foundedYear?: string
  story?: string
  values?: Array<{ title: string; description: string }>
  seo?: {
    title?: string
    description?: string
  }
  [key: string]: unknown
}

export function readSiteProfile(): SiteProfile | null {
  if (!fs.existsSync(SITE_PROFILE_PATH)) return null
  return readJson<SiteProfile>(SITE_PROFILE_PATH)
}

// ── CMS Pages ─────────────────────────────────────────────────────────────────

export type BlockLayout = "full-width" | "half-width" | "two-thirds" | "sidebar-content" | "card-grid" | "full-bleed"

export interface CmsBlock {
  type: string
  data: Record<string, unknown>
  layout?: BlockLayout
}

export interface CmsPage {
  slug: string
  label: string
  blocks: CmsBlock[]
  seo?: { title: string; description: string }
}

export interface CmsPageWithVariants {
  slug: string
  label: string
  blocks: CmsBlock[]
  variants: Array<{
    id: string
    order: string[]
    reasoning?: string
    blocks: CmsBlock[]
  }>
  seo?: { title: string; description: string }
  [key: string]: unknown
}

export function readCmsPages(): CmsPage[] {
  const file = path.join(CMS_ROOT, "pages.json")
  if (!fs.existsSync(file)) return []
  const parsed = readJson<{
    pages?: Array<CmsPage & { variants?: Array<{ id: string; blocks: CmsBlock[] }>; archetype?: string }>
  }>(file)
  const rawPages = parsed.pages ?? []
  return rawPages.map((p) => {
    if (p.variants && p.variants.length > 0) {
      const defaultVariant = p.variants.find((v) => v.id === "A") ?? p.variants[0]
      const resolvedBlocks = defaultVariant.blocks.map((b) => resolveVariantA(b))
      return {
        slug: p.slug,
        label: p.label,
        blocks: resolvedBlocks,
        seo: p.seo,
      }
    }
    return p
  })
}

function resolveVariantA(block: CmsBlock): CmsBlock {
  const resolvedData = resolveDataForVariant(block.data, "a")
  return { ...block, data: resolvedData }
}

function resolveDataForVariant(
  data: Record<string, unknown>,
  variant: "a" | "b"
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "object" && value !== null && "a" in (value as Record<string, unknown>)) {
      resolved[key] = (value as Record<string, unknown>)[variant]
    } else if (Array.isArray(value)) {
      resolved[key] = value.map((item) =>
        typeof item === "object" && item !== null
          ? resolveDataForVariant(item as Record<string, unknown>, variant)
          : item
      )
    } else if (typeof value === "object" && value !== null) {
      resolved[key] = resolveDataForVariant(value as Record<string, unknown>, variant)
    } else {
      resolved[key] = value
    }
  }
  return resolved
}

export function readCmsPageVariants(slug: string): CmsPageWithVariants | null {
  const file = path.join(CMS_ROOT, "pages.json")
  if (!fs.existsSync(file)) return null
  const parsed = readJson<{ pages?: CmsPageWithVariants[] }>(file)
  return (parsed.pages ?? []).find((p) => p.slug === slug) ?? null
}

export function resolvePageLayoutCssVars(page: CmsPageWithVariants | null, variantId: string = "A"): string {
  if (!page || !page.variants || page.variants.length === 0) return ""
  const variant = page.variants.find((v) => v.id === variantId) ?? page.variants[0]
  const layoutBlock = variant.blocks.find((b) => b.type === "page-layout")
  if (!layoutBlock) return ""

  const data = layoutBlock.data as Record<string, unknown>
  const maxWidth = data.maxWidth as string | undefined
  const contentAlign = data.contentAlign as string | undefined
  const sectionSpacing = data.sectionSpacing as string | undefined
  const sidebarPosition = data.sidebarPosition as string | undefined

  const maxWidthMap: Record<string, string> = {
    narrow: "680px",
    standard: "1140px",
    wide: "1440px",
    full: "100%",
  }

  const spacingMap: Record<string, string> = {
    compact: "2rem",
    standard: "4rem",
    spacious: "8rem",
  }

  const parts: string[] = []
  if (maxWidth && maxWidthMap[maxWidth]) {
    parts.push(`--container-max:${maxWidthMap[maxWidth]}`)
  }
  if (contentAlign) {
    parts.push(`--content-align:${contentAlign}`)
  }
  if (sectionSpacing && spacingMap[sectionSpacing]) {
    parts.push(`--section-py:${spacingMap[sectionSpacing]}`)
  }
  if (sidebarPosition && sidebarPosition !== "none") {
    parts.push(`--sidebar-position:${sidebarPosition}`)
  }

  return parts.join(";")
}

// ── Archetype Catalog ─────────────────────────────────────────────────────────

export function readArchetypeCatalog(): ArchetypeCatalog | null {
  const file = path.join(ARCHETYPES_ROOT, "catalog.json")
  if (!fs.existsSync(file)) return null
  return readJson<ArchetypeCatalog>(file)
}

export interface ArchetypeCatalog {
  version: string
  blockVocabulary: Record<string, { description: string; fields: string[] }>
  archetypes: Record<string, {
    blocks: string[]
    minData?: Record<string, string>
    excludes?: string[]
    bestFor?: string[]
    typicalOrder?: number
  }>
  selectionRules?: Array<{ condition: string; archetype: string; page: string }>
  generatedAt?: string
}

// ── Catalogue ─────────────────────────────────────────────────────────────────

export interface CatalogueDoc {
  categories?: Array<{
    name: string
    description?: string
    items: Array<{
      name: string
      description: string
      price?: number
      modifiers?: Array<{ name: string; options: Array<{ name: string; priceDelta?: number }> }>
    }>
  }>
  [key: string]: unknown
}

export function readCatalogue(): CatalogueDoc | null {
  if (!fs.existsSync(CATALOGUE_PATH)) return null
  return readJson<Record<string, unknown>>(CATALOGUE_PATH) as CatalogueDoc
}



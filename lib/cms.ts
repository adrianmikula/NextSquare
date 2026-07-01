import fs from "fs"
import path from "path"

const CMS_ROOT = path.join(process.cwd(), "content", "cms", "site")
const THEMES_ROOT = path.join(process.cwd(), "content", "themes")
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

export interface CmsBlock {
  type: string
  data: Record<string, unknown>
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

// ── Themes ────────────────────────────────────────────────────────────────────

export interface ThemeConfig {
  name: string
  description?: string
  colors?: {
    primary?: string
    secondary?: string
    background?: string
    surface?: string
    text?: string
    accent?: string
    border?: string
  }
  typography?: {
    headingFont?: string
    bodyFont?: string
    weights?: { heading: number; body: number }
    headingCase?: "normal" | "uppercase" | "small-caps"
    letterSpacing?: string
    lineHeight?: string
  }
  spacing?: {
    sectionPaddingY?: string
    sectionPaddingX?: string
    containerMax?: string
    gridGap?: string
    contentAlign?: "left" | "center" | "right"
  }
  shape?: {
    borderRadius?: string
    cardRadius?: string
    buttonRadius?: string
    imageRadius?: string
  }
  borders?: {
    width?: string
    style?: "solid" | "dashed" | "none"
    cardBorder?: boolean
    divider?: boolean
  }
  shadows?: {
    card?: "none" | "sm" | "md" | "lg" | "xl" | "2xl"
    cardHover?: "none" | "sm" | "md" | "lg"
    tint?: boolean
  }
  components?: {
    heroStyle?: "image" | "split" | "minimal" | "gradient"
    cardStyle?: "elevated" | "flat" | "bordered" | "glass"
    buttonStyle?: "filled" | "outlined" | "ghost" | "underline"
    navStyle?: "solid" | "transparent" | "sticky" | "floating"
  }
  hero?: {
    overlayOpacity?: number
    overlayColor?: string
    textAlign?: "left" | "center" | "right"
    paddingY?: string
    gradientDirection?: string
    imageTreatment?: "cover" | "contain" | "blur" | "parallax"
  }
  cards?: {
    hover?: "lift" | "glow" | "border-accent" | "none"
    imageAspect?: "square" | "landscape" | "portrait" | "auto"
    imageRadius?: string
    innerPadding?: string
  }
  buttons?: {
    radius?: string
    paddingX?: string
    fontWeight?: number
    hover?: "darken" | "lift" | "glow" | "none"
    fullWidthMobile?: boolean
  }
  nav?: {
    backgroundOpacity?: number
    logoSize?: "sm" | "md" | "lg"
    linkStyle?: "underline" | "pill" | "minimal" | "bold"
    height?: string
    shadow?: boolean
  }
  menu?: {
    layout?: "list" | "grid" | "cards"
    priceAlign?: "left" | "right" | "center"
    priceStyle?: "inline" | "badge" | "large"
    divider?: boolean
    hover?: "highlight" | "slide" | "none"
  }
  testimonials?: {
    layout?: "grid" | "carousel" | "stacked"
    quoteStyle?: "border-left" | "italics" | "large"
    avatar?: boolean
  }
  forms?: {
    inputRadius?: string
    inputBorder?: "full" | "bottom-only" | "none"
    focusRing?: "primary" | "ring" | "none"
    labelWeight?: number
  }
  footer?: {
    background?: "light" | "dark" | "primary" | "transparent"
    layout?: "centered" | "multi-column" | "minimal"
    borderTop?: boolean
    socialStyle?: "icons" | "text" | "none"
  }
  dividers?: {
    style?: "none" | "line" | "wave" | "angled" | "dots"
    color?: string
    height?: string
  }
  motion?: {
    transitionSpeed?: "fast" | "normal" | "slow"
    hoverLift?: boolean
    fadeIn?: boolean
    smoothScroll?: boolean
  }
  [key: string]: unknown
}

export function readTheme(variant: string): ThemeConfig | null {
  const file = path.join(THEMES_ROOT, `theme-${variant}.json`)
  if (!fs.existsSync(file)) return null
  return readJson<Record<string, unknown>>(file) as ThemeConfig
}

export function listThemeVariants(): string[] {
  if (!fs.existsSync(THEMES_ROOT)) return []
  return fs
    .readdirSync(THEMES_ROOT)
    .filter((f) => f.startsWith("theme-") && f.endsWith(".json"))
    .map((f) => f.replace("theme-", "").replace(".json", ""))
}

export const ACTIVE_THEME_VARIANT = process.env.THEME_VARIANT || "a"

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

// ── CSS Vars ──────────────────────────────────────────────────────────────────

export function toCssVars(theme: ThemeConfig, variant: string = "a"): Record<string, string> {
  const colors = theme.colors || {}
  const shape = theme.shape || {}
  const borders = theme.borders || {}
  const shadows = theme.shadows || {}
  const typo = theme.typography || {}
  const motion = theme.motion || {}
  const nav = theme.nav || {}
  const spacing = theme.spacing || {}

  const fallbackA = {
    primary: "#b45309",
    secondary: "#fef3c7",
    background: "#ffffff",
    surface: "#fffbeb",
    text: "#1c1917",
    accent: "#d4a373",
  }

  const fallbackB = {
    primary: "#166534",
    secondary: "#f0fdf4",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#0f172a",
    accent: "#d4a373",
  }

  const f = variant === "b" ? fallbackB : fallbackA

  const shadowMap: Record<string, string> = {
    none: "none",
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  }

  const cardShadow = shadows.card || "md"
  const cardHoverShadow = shadows.cardHover || "lg"
  const motionSpeed: Record<string, string> = { fast: "150ms", normal: "300ms", slow: "500ms" }
  const speed = motionSpeed[motion.transitionSpeed || "normal"] || motionSpeed.normal

  return {
    "--color-amber-600": colors.primary || f.primary,
    "--color-amber-700": colors.primary || f.primary,
    "--color-amber-900": colors.primary || f.primary,
    "--color-amber-400": colors.accent || f.accent,
    "--color-amber-50": colors.secondary || f.secondary,
    "--color-amber-100": colors.secondary || f.secondary,
    "--color-stone-50": colors.background || f.background,
    "--color-stone-100": colors.surface || f.surface,
    "--color-stone-900": colors.text || f.text,
    "--color-stone-700": colors.text || f.text,
    "--color-stone-600": colors.text || f.text,
    "--color-stone-500": colors.text || f.text,
    "--color-stone-400": colors.text || f.text,
    "--color-stone-200": colors.border || colors.text || f.text,
    "--font-heading": `'${typo.headingFont || "Inter"}', sans-serif`,
    "--font-body": `'${typo.bodyFont || "Inter"}', sans-serif`,
    "--text-transform-heading": typo.headingCase === "uppercase"
      ? "uppercase"
      : typo.headingCase === "small-caps"
        ? "small-caps"
        : "none",
    "--letter-spacing": typo.letterSpacing || "normal",
    "--line-height": typo.lineHeight || "1.5",
    "--theme-border-radius": shape.borderRadius || "0.5rem",
    "--theme-card-radius": shape.cardRadius || shape.borderRadius || "0.5rem",
    "--theme-button-radius": shape.buttonRadius || "0.5rem",
    "--theme-image-radius": shape.imageRadius || shape.borderRadius || "0.5rem",
    "--theme-border-width": borders.width || "1px",
    "--theme-shadow-card": shadowMap[cardShadow] || shadowMap["md"],
    "--theme-shadow-card-hover": shadowMap[cardHoverShadow] || shadowMap["lg"],
    "--section-py": spacing.sectionPaddingY || "4rem",
    "--section-px": spacing.sectionPaddingX || "1rem",
    "--container-max": spacing.containerMax || "72rem",
    "--grid-gap": spacing.gridGap || "1.5rem",
    "--nav-height": nav.height || "4rem",
    "--nav-bg-opacity": String(nav.backgroundOpacity ?? 0.95),
    "--transition-speed": speed,
  }
}

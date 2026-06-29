import fs from "fs"
import path from "path"

const CMS_ROOT = path.join(process.cwd(), "content", "cms")
const THEMES_ROOT = path.join(process.cwd(), "content", "themes")
const SITE_PROFILE_ROOT = path.join(process.cwd(), "content", "site-profile")

export function readSiteProfile(tenant: string): SiteProfile | null {
  const file = path.join(SITE_PROFILE_ROOT, tenant, "site-profile.json")
  if (!fs.existsSync(file)) return null
  return readJson<SiteProfile>(file)
}

export function getTenantDir(tenant: string, kind: "cms" | "themes" | "catalogue" | "site-profile") {
  return path.join(process.cwd(), "content", kind, tenant)
}

export function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(raw) as T
}

export function listTenants(kind: "cms" | "themes" | "catalogue" | "site-profile" = "cms"): string[] {
  const root = path.join(process.cwd(), "content", kind)
  if (!fs.existsSync(root)) return []
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

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

export function readCmsPages(tenant: string): CmsPage[] {
  const file = path.join(CMS_ROOT, tenant, "pages.json")
  if (!fs.existsSync(file)) return []
  const parsed = readJson<{ pages?: CmsPage[] }>(file)
  return parsed.pages || []
}

export function readTheme(tenant: string, variant: string): ThemeConfig | null {
  const file = path.join(THEMES_ROOT, tenant, `theme-${variant}.json`)
  if (!fs.existsSync(file)) return null
  return readJson<Record<string, unknown>>(file) as ThemeConfig
}

export function listThemeVariants(tenant: string): string[] {
  const dir = path.join(THEMES_ROOT, tenant)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("theme-") && f.endsWith(".json"))
    .map((f) => f.replace("theme-", "").replace(".json", ""))
}

export function getActiveTenant(): string {
  return process.env.ACTIVE_TENANT || "demo"
}

export function getActiveThemeVariant(): string {
  return process.env.THEME_VARIANT || "a"
}

export function readCatalogue(tenant: string): CatalogueDoc | null {
  const file = path.join(process.cwd(), "content", "catalogue", tenant, "catalogue.json")
  if (!fs.existsSync(file)) return null
  return readJson<Record<string, unknown>>(file)
}

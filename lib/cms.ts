import fs from "fs"
import path from "path"

const CMS_ROOT = path.join(process.cwd(), "content", "cms")
const THEMES_ROOT = path.join(process.cwd(), "content", "themes")

export function getTenantDir(tenant: string, kind: "cms" | "themes" | "catalogue") {
  return path.join(process.cwd(), "content", kind, tenant)
}

export function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(raw) as T
}

export function listTenants(kind: "cms" | "themes" | "catalogue" = "cms"): string[] {
  const root = path.join(process.cwd(), "content", kind)
  if (!fs.existsSync(root)) return []
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

export interface ThemeConfig {
  colors?: {
    primary?: string
    secondary?: string
    background?: string
    surface?: string
    text?: string
    accent?: string
  }
  fonts?: {
    heading?: string
    body?: string
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

export function toCssVars(theme: ThemeConfig): Record<string, string> {
  const colors = theme.colors || {}
  return {
    "--theme-primary": colors.primary || "#212121",
    "--theme-secondary": colors.secondary || "#f5f5f0",
    "--theme-background": colors.background || "#ffffff",
    "--theme-surface": colors.surface || "#f5f5f0",
    "--theme-text": colors.text || "#212121",
    "--theme-accent": colors.accent || "#d4a373",
  }
}

export function readCmsPages(tenant: string): CmsPage[] {
  const file = path.join(CMS_ROOT, tenant, "pages.json")
  if (!fs.existsSync(file)) return []
  const parsed = readJson<{ pages?: CmsPage[] }>(file)
  return parsed.pages || []
}

export function readTheme(tenant: string, variant: "a" | "b"): ThemeConfig | null {
  const file = path.join(THEMES_ROOT, tenant, `theme-${variant}.json`)
  if (!fs.existsSync(file)) return null
  return readJson<Record<string, unknown>>(file)
}

export function readCatalogue(tenant: string): CatalogueDoc | null {
  const file = path.join(process.cwd(), "content", "catalogue", tenant, "catalogue.json")
  if (!fs.existsSync(file)) return null
  return readJson<Record<string, unknown>>(file)
}

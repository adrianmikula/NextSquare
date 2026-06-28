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

export function readCmsPages(tenant: string): CmsPage[] {
  const file = path.join(CMS_ROOT, tenant, "pages.json")
  if (!fs.existsSync(file)) return []
  const parsed = readJson<{ pages?: CmsPage[] }>(file)
  return parsed.pages || []
}

export function readTheme(tenant: string, variant: "a" | "b") {
  const file = path.join(THEMES_ROOT, tenant, `theme-${variant}.json`)
  if (!fs.existsSync(file)) return null
  return readJson<Record<string, unknown>>(file)
}

export function readCatalogue(tenant: string) {
  const file = path.join(process.cwd(), "content", "catalogue", tenant, "catalogue.json")
  if (!fs.existsSync(file)) return null
  return readJson<Record<string, unknown>>(file)
}

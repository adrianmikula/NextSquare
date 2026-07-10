/**
 * generate-archetypes.ts
 *
 * Reads `skills/website-builder/resources/archetypes.md` and emits a runtime
 * JSON artifact to `content/archetypes/catalog.json`.
 *
 * Usage:
 *   npx tsx skills/website-builder/resources/generate-archetypes.ts
 *
 * Single-tenant: output is always catalog.json.
 * No markdown parsing happens at runtime.
 */

import fs from "fs"
import path from "path"

const SKILL_DIR = path.join(process.cwd(), "skills", "website-builder")
const ARCHETYPES_MD = path.join(SKILL_DIR, "resources", "archetypes.md")
const CONTENT_DIR = path.join(process.cwd(), "content", "archetypes")

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
  BRANDED_HEADER: ["announcement", "nav", "logo", "phone", "slogan"],
  MINIMAL_FOOTER: ["copyright", "social-icons"],
  STANDARD_FOOTER: ["copyright", "social-icons", "phone", "sitemap"],
  SOCIAL_FOOTER: ["social-icons", "sitemap", "copyright"],
  STANDARD_CONTAINER: ["page-layout"],
  NARROW_PROSE: ["page-layout"],
  WIDE_MARGIN: ["page-layout"],
  COMPACT_MARGIN: ["page-layout"],
  ASYMMETRIC: ["page-layout"],
  SIDEBAR_RIGHT: ["page-layout"],
}

export function generateArchetypes() {
  const md = fs.readFileSync(ARCHETYPES_MD, "utf-8")

  const vocab: Record<string, { description: string; fields: string[] }> = {}
  const tableRows = md.match(/\| `([^`]+)` \| (.+) \|/g) ?? []
  for (const row of tableRows) {
    const match = row.match(/^\| `([^`]+)` \| (.+) \|$/)
    if (!match) continue
    const symbol = match[1]
    const desc = match[2].trim()
    if (symbol === "Symbol") continue
    vocab[symbol] = {
      description: desc,
      fields: extractFieldsForSymbol(md, symbol),
    }
  }

  const archetypes: Record<string, {
    blocks: string[]
    minData?: Record<string, string>
    excludes?: string[]
    bestFor?: string[]
    typicalOrder?: number
  }> = {}
  for (const [name, blocks] of Object.entries(ARCHETYPE_BLOCKS)) {
    archetypes[name] = { blocks }
  }

  const rules = parseSelectionRules(md)

  const output = {
    version: "1.0",
    blockVocabulary: vocab,
    archetypes,
    selectionRules: rules,
    generatedAt: new Date().toISOString(),
  }

  fs.mkdirSync(CONTENT_DIR, { recursive: true })
  const outPath = path.join(CONTENT_DIR, "catalog.json")
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n")
  console.log(`Wrote ${outPath} (${Object.keys(archetypes).length} archetypes, ${Object.keys(vocab).length} block symbols, ${rules.length} selection rules)`)
}

function extractFieldsForSymbol(md: string, symbol: string): string[] {
  const sectionMatch = md.match(new RegExp(`\\*\\*${symbol}\\*\\* — ([^\\n]+)`))
  if (!sectionMatch) return []
  const fieldsStr = sectionMatch[1]
  return fieldsStr.split(",").map((f) => f.trim().replace(/\?$/, "").replace(/:.*$/, "").replace(/`/g, ""))
}

function parseSelectionRules(md: string): Array<{ condition: string; archetype: string; page: string }> {
  const rules: Array<{ condition: string; archetype: string; page: string }> = []

  const homeSection = md.match(/\*\*Home page selection:\*\*\n\n(\|.+\|\n(?:\|[-| ]+\|\n)?(?:\|.+\|\n)*)/)
  if (homeSection) {
    const rows = homeSection[1].split("\n").filter((r) => r.trim().startsWith("|"))
    for (const row of rows) {
      const cells = row.split("|").map((c) => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)
      if (cells.length < 2 || cells[0] === "Condition" || cells[0] === "Default fallback") continue
      rules.push({ condition: cells[0], archetype: cells[1], page: "home" })
    }
    const fallbackRow = rows.find((r) => r.includes("Default fallback"))
    if (fallbackRow) {
      const cells = fallbackRow.split("|").map((c) => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)
      if (cells.length >= 2) {
        rules.push({ condition: "true", archetype: cells[1], page: "home" })
      }
    }
  }

  const innerSection = md.match(/\*\*Inner page selection:\*\*\n\n(\|.+\|\n(?:\|[-| ]+\|\n)?(?:\|.+\|\n)*)/)
  if (innerSection) {
    const rows = innerSection[1].split("\n").filter((r) => r.trim().startsWith("|"))
    const pageToSlug: Record<string, string> = {
      menu: "menu",
      about: "about",
      contact: "contact",
      faq: "faq",
      gallery: "gallery",
      events: "events",
      loyalty: "loyalty",
      membership: "membership",
      pricing: "pricing",
      team: "team",
      reservations: "reservations",
      locations: "locations",
    }
    for (const row of rows) {
      const cells = row.split("|").map((c) => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)
      if (cells.length < 3 || cells[0] === "Page" || cells[0] === "---") continue
      const slug = pageToSlug[cells[0].toLowerCase()]
      const archetype = cells[1]
      if (slug && archetype) {
        rules.push({ condition: cells[2], archetype, page: slug })
      }
    }
  }

  const layoutSection = md.match(/\*\*Layout selection:\*\*\n\n(\|.+\|\n(?:\|[-| ]+\|\n)?(?:\|.+\|\n)*)/)
  if (layoutSection) {
    const rows = layoutSection[1].split("\n").filter((r) => r.trim().startsWith("|"))
    const pageToSlug: Record<string, string> = {
      header: "header",
      footer: "footer",
    }
    for (const row of rows) {
      const cells = row.split("|").map((c) => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)
      if (cells.length < 3 || cells[0] === "Page" || cells[0] === "---") continue
      const slug = pageToSlug[cells[0].toLowerCase()]
      const archetype = cells[1]
      if (slug && archetype) {
        rules.push({ condition: cells[2], archetype, page: slug })
      }
    }
  }

  const pageLayoutSection = md.match(/\*\*Page layout selection:\*\*\n\n(\|.+\|\n(?:\|[-| ]+\|\n)?(?:\|.+\|\n)*)/)
  if (pageLayoutSection) {
    const rows = pageLayoutSection[1].split("\n").filter((r) => r.trim().startsWith("|"))
    for (const row of rows) {
      const cells = row.split("|").map((c) => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)
      if (cells.length < 2 || cells[0] === "Condition" || cells[0] === "Default fallback") continue
      rules.push({ condition: cells[0], archetype: cells[1], page: "page-layout" })
    }
    const fallbackRow = rows.find((r) => r.includes("Default fallback"))
    if (fallbackRow) {
      const cells = fallbackRow.split("|").map((c) => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)
      if (cells.length >= 2) {
        rules.push({ condition: "true", archetype: cells[1], page: "page-layout" })
      }
    }
  }

  return rules
}

generateArchetypes()

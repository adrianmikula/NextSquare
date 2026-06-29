/**
 * generate-archetypes.ts
 *
 * Reads `skills/website-builder/resources/archetypes.md` and emits a runtime
 * JSON artifact to `content/archetypes/<tenant>.json`.
 *
 * Usage:
 *   npx tsx skills/website-builder/resources/generate-archetypes.ts --tenant demo
 *
 * The JSON is consumed by `lib/renderer.ts` and the CMS layer.
 * No markdown parsing happens at runtime.
 */

import fs from "fs"
import path from "path"

// ── Configuration ─────────────────────────────────────────────────────────────

const SKILL_DIR = path.join(process.cwd(), "skills", "website-builder")
const ARCHETYPES_MD = path.join(SKILL_DIR, "resources", "archetypes.md")
const CONTENT_DIR = path.join(process.cwd(), "content", "archetypes")

// ── Archetype block registry (mirrors lib/renderer.ts ARCHETYPE_BLOCKS) ────────

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

// ── Main ──────────────────────────────────────────────────────────────────────

function getTenant(): string {
  const idx = process.argv.indexOf("--tenant")
  if (idx === -1 || !process.argv[idx + 1]) {
    console.error("Usage: generate-archetypes.ts --tenant <tenant-id>")
    process.exit(1)
  }
  return process.argv[idx + 1]
}

function generate(tenant: string) {
  const md = fs.readFileSync(ARCHETYPES_MD, "utf-8")

  // Extract block vocabulary from markdown table
  const vocab: Record<string, { description: string; fields: string[] }> = {}
  const tableRows = md.match(/\| `([^`]+)` \| ([^|]+) \|/g) ?? []
  for (const row of tableRows) {
    const match = row.match(/\| `([^`]+)` \| (.+?) \|$/)
    if (match) {
      const symbol = match[1]
      const desc = match[2].trim()
      vocab[symbol] = {
        description: desc,
        fields: extractFieldsForSymbol(md, symbol),
      }
    }
  }

  // Build archetypes from the hardcoded registry + metadata from markdown
  const archetypes: Record<string, {
    blocks: string[]
    minData?: Record<string, string>
    excludes?: string[]
    bestFor?: string[]
    typicalOrder?: number
  }> = {}

  // Extract archetype metadata blocks from markdown
  const metadataMatch = md.match(/```\n([\s\S]*?)\n```/)
  if (metadataMatch) {
    // Parse YAML-like metadata
    const currentArchetype = parseMetadataBlock(metadataMatch[1])
    for (const [name, meta] of Object.entries(currentArchetype)) {
      archetypes[name] = {
        blocks: ARCHETYPE_BLOCKS[name] ?? [],
        ...meta,
      }
    }
  }

  // Fallback: ensure all registry entries exist (overwrites any parsed metadata)
  for (const [name, blocks] of Object.entries(ARCHETYPE_BLOCKS)) {
    archetypes[name] = { blocks }
  }

  const output = {
    version: "1.0",
    tenant,
    blockVocabulary: vocab,
    archetypes,
    selectionRules: [],
    generatedAt: new Date().toISOString(),
  }

  fs.mkdirSync(CONTENT_DIR, { recursive: true })
  const outPath = path.join(CONTENT_DIR, `${tenant}.json`)
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n")
  console.log(`Wrote ${outPath} (${Object.keys(archetypes).length} archetypes, ${Object.keys(vocab).length} block symbols)`)
}

function extractFieldsForSymbol(md: string, symbol: string): string[] {
  // Find the field contract section for this symbol
  const sectionMatch = md.match(new RegExp(`\\*\\*${symbol}\\*\\* — ([^\\n]+)`))
  if (!sectionMatch) return []
  const fieldsStr = sectionMatch[1]
  // Extract field names (before any `?` or `:`)
  return fieldsStr.split(",").map((f) => f.trim().replace(/\?$/, "").replace(/:.*$/, ""))
}

function parseMetadataBlock(block: string): Record<string, Record<string, unknown>> {
  const result: Record<string, Record<string, unknown>> = {}
  const lines = block.split("\n")
  let current: string | null = null
  let currentObj: Record<string, unknown> = {}

  for (const line of lines) {
    const archetypeMatch = line.match(/^(\w+):\s*$/)
    if (archetypeMatch) {
      if (current) result[current] = currentObj
      current = archetypeMatch[1]
      currentObj = {}
      continue
    }
    if (!current) continue

    const kvMatch = line.match(/^\s+(\w+):\s*(.+)$/)
    if (kvMatch) {
      const key = kvMatch[1]
      const rawVal = kvMatch[2].trim()

      if (rawVal.startsWith("[") && rawVal.endsWith("]")) {
        const arrStr = rawVal.slice(1, -1)
        const items = arrStr.split(",").map((s) => s.trim().replace(/['"]/g, ""))
        currentObj[key] = items
      } else if (rawVal.startsWith('"') || rawVal.startsWith("'")) {
        currentObj[key] = rawVal.replace(/^['"]|['"]$/g, "")
      } else if (rawVal === "true" || rawVal === "false") {
        currentObj[key] = rawVal === "true"
      } else if (!isNaN(Number(rawVal))) {
        currentObj[key] = Number(rawVal)
      } else {
        currentObj[key] = rawVal
      }
    }
  }

  if (current) result[current] = currentObj
  return result
}

generate(getTenant())

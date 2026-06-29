/**
 * rebuild-demo.ts
 *
 * Rebuilds the Aydin's Cafe (demo tenant) website from scratch using
 * the archetype-driven pipeline.
 *
 * Usage:
 *   npx tsx skills/website-builder/resources/rebuild-demo.ts
 */

import fs from "fs"
import path from "path"
import { runPipeline } from "@/lib/ai/multi-source-pipeline"

// ── Load persisted data ───────────────────────────────────────────────────────

const SITE_PROFILE_PATH = path.join(process.cwd(), "content", "site-profile", "demo", "site-profile.json")
const CATALOGUE_PATH = path.join(process.cwd(), "content", "catalogue", "demo", "catalogue.json")

const siteProfile = JSON.parse(fs.readFileSync(SITE_PROFILE_PATH, "utf-8"))
const catalogue = JSON.parse(fs.readFileSync(CATALOGUE_PATH, "utf-8"))

// ── Construct BusinessProfile ─────────────────────────────────────────────────

const businessProfile = {
  name: siteProfile.siteName,
  type: "cafe",
  tagline: siteProfile.tagline,
  description: siteProfile.description,
  location: {
    address: siteProfile.address.full,
    suburb: siteProfile.address.suburb,
    city: `${siteProfile.address.suburb} ${siteProfile.address.state}`,
  },
  hours: [
    { day: "Monday", open: "07:00", close: "15:00" },
    { day: "Tuesday", open: "07:00", close: "15:00" },
    { day: "Wednesday", open: "07:00", close: "15:00" },
    { day: "Thursday", open: "07:00", close: "15:00" },
    { day: "Friday", open: "07:00", close: "15:00" },
    { day: "Saturday", open: "08:00", close: "14:00" },
    { day: "Sunday", open: "Closed", close: "Closed" },
  ],
  phone: siteProfile.contact.phone,
  vibe: {
    palette: ["#8B5E3C", "#D4A574", "#F5E6D3", "#2C1810", "#E8D5C4"],
    adjectives: ["casual", "friendly", "fresh"],
  },
  audience: "locals",
  tone: "casual",
  features: ["breakfast", "brunch", "delivery"],
  testimonials: [
    {
      author: "Louis L.",
      text: "Very tasty, I don't usually write review but I took my phone while eating this cheeseburger to write about it.",
      source: "Uber Eats",
    },
    {
      author: "Steven W.",
      text: "The burgers are excellent, made fresh. Taste is on point with the OG sauce.",
      source: "Uber Eats",
    },
    {
      author: "Chris D.",
      text: "Chips are excellent and the burgers are top shelf.",
      source: "Uber Eats",
    },
  ],
  catalogue: {
    categories: catalogue.categories.map((c: { name: string }) => c.name),
    items: catalogue.categories.flatMap((c: { items: Array<{ name: string; description: string; price: number }> }) =>
      c.items.map((item: { name: string; description: string; price: number }) => ({
        name: item.name,
        description: item.description,
        category: c.name,
        priceHint: item.price,
      }))
    ),
  },
  media: {
    hero: "https://img3.restaurantguru.com/w550/h367/rf19-Aydins-Cafe-interior-2025-05.jpg",
    logo: undefined,
    gallery: [
      "https://img3.restaurantguru.com/w550/h367/rf19-Aydins-Cafe-interior-2025-05.jpg",
      "https://img02.restaurantguru.com/c871-Restaurant-Aydins-Cafe-food.jpg",
      "https://img02.restaurantguru.com/c385-Aydins-Cafe-Joondalup-french-fries.jpg",
      "https://img02.restaurantguru.com/c010-Restaurant-Aydins-Cafe-pulled-pork-sandwich.jpg",
      "https://img02.restaurantguru.com/cf7f-Restaurant-Aydins-Cafe-meals.jpg",
      "https://img02.restaurantguru.com/cf5c-Aydins-Cafe-Joondalup-interior.jpg",
      "https://img02.restaurantguru.com/c538-Aydins-Cafe-Joondalup-french-fries.jpg",
    ],
  },
  deliveryUrls: {
    uberEats: "https://www.ubereats.com/au/store/aydins-cafe/IJbz4BeDWlqHKtlczc8EXg",
  },
}

// ── Run pipeline ─────────────────────────────────────────────────────────────

async function main() {
  console.log("Rebuilding Aydin's Cafe (demo tenant) with archetype pipeline...")

  const tenant = "demo"
  const result = await runPipeline({
    businessProfile,
    tenant,
    pages: [
      { slug: "home", label: "Home", archetype: "DEFAULT_HOME", seo: { title: `${siteProfile.siteName} - ${siteProfile.tagline}`, description: siteProfile.description } },
      { slug: "menu", label: "Menu", archetype: "MENU_DEFAULT" },
      { slug: "about", label: "About", archetype: "ABOUT_STORY", seo: { title: "About - Aydin's Cafe", description: siteProfile.description } },
      { slug: "contact", label: "Contact", archetype: "CONTACT_DIRECT", seo: { title: "Contact - Aydin's Cafe", description: "Find Aydin's Cafe in Joondalup, view opening hours, and order delivery." } },
    ],
  })

  console.log(`Layout source: ${result.layoutSource}`)
  console.log(`Skipped pages: ${result.skippedPages.join(", ") || "none"}`)

  // Write CMS output
  const cmsDir = path.join(process.cwd(), "content", "cms", tenant)
  fs.mkdirSync(cmsDir, { recursive: true })
  const pagesPath = path.join(cmsDir, "pages.json")
  fs.writeFileSync(pagesPath, JSON.stringify(result.bundle, null, 2) + "\n")
  console.log(`Wrote ${pagesPath}`)

  // Write page-selection.md
  const scratchDir = path.join(process.cwd(), "content", "scratch", tenant)
  fs.mkdirSync(scratchDir, { recursive: true })
  const selectionDoc = `# Page Selection — ${siteProfile.siteName}

## Selected Archetypes

| Page | Archetype | Source |
|------|-----------|--------|
${Object.entries(result.layout.selected).map(([page, archetype]) => `| ${page} | ${archetype} | ${result.layoutSource} |`).join("\n")}

## Omitted Pages

${result.skippedPages.length > 0 ? result.skippedPages.map(p => `- ${p}`).join("\n") : "None"}

## Reasoning

${result.layout.reasoning || "Rule-based archetype selection."}
`
  fs.writeFileSync(path.join(scratchDir, "page-selection.md"), selectionDoc)
  console.log(`Wrote ${path.join(scratchDir, "page-selection.md")}`)
}

main().catch((err) => {
  console.error("Rebuild failed:", err)
  process.exit(1)
})

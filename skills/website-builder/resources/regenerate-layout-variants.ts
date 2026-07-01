/**
 * regenerate-layout-variants.ts
 *
 * Post-processes the CMS pages.json to generate distinct A/B variants for
 * header, footer, and page-layout pages specifically for Aydin's Cafe.
 *
 * This runs AFTER rebuild-demo.ts and patches the generated pages.json.
 *
 * Usage:
 *   npx tsx skills/website-builder/resources/regenerate-layout-variants.ts
 */

import fs from "fs"
import path from "path"

const CMS_DIR = path.join(process.cwd(), "content", "cms", "site")
const PAGES_PATH = path.join(CMS_DIR, "pages.json")

function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(raw) as T
}

function writeJson(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n")
}

function patchPage(pages: Array<{ slug: string; variants?: Array<{ id: string; order: string[]; blocks: Array<{ type: string; data: Record<string, unknown> }> }> }>, slug: string, mutator: (page: { slug: string; variants?: Array<{ id: string; order: string[]; blocks: Array<{ type: string; data: Record<string, unknown> }> }> }) => void) {
  const page = pages.find((p) => p.slug === slug)
  if (!page) {
    throw new Error(`Page ${slug} not found in CMS pages`)
  }
  mutator(page)
}

function main() {
  if (!fs.existsSync(PAGES_PATH)) {
    console.error(`CMS pages.json not found at ${PAGES_PATH}`)
    process.exit(1)
  }

  const pagesJson = readJson<{ pages: Array<{ slug: string; variants?: Array<{ id: string; order: string[]; blocks: Array<{ type: string; data: Record<string, unknown> }> }> }> }>(PAGES_PATH)
  const pages = pagesJson.pages

  // ── Header Variants ─────────────────────────────────────────────────────────
  // A: STANDARD_HEADER — full conversion: announcement + sticky nav + logo
  // B: MINIMAL_HEADER — clean brand-first: logo + non-sticky nav (no announcement)
  patchPage(pages, "header", (page) => {
    page.variants = [
      {
        id: "A",
        reasoning: "STANDARD_HEADER with announcement bar and sticky nav for maximum conversion visibility.",
        order: ["announcement", "nav", "logo"],
        blocks: [
          {
            type: "announcement",
            data: {
              text: "Welcome! Order online for pickup or delivery.",
              link: "/menu",
              linkLabel: "Order Now",
            },
          },
          {
            type: "nav",
            data: {
              links: [
                { href: "/", label: "Home" },
                { href: "/menu", label: "Menu" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ],
              sticky: true,
              variant: "home",
            },
          },
          {
            type: "logo",
            data: {
              text: "Aydin's Cafe",
              link: "/",
            },
          },
        ],
      },
      {
        id: "B",
        reasoning: "MINIMAL_HEADER without announcement bar for cleaner brand-first presentation and more hero space.",
        order: ["logo", "nav"],
        blocks: [
          {
            type: "logo",
            data: {
              text: "Aydin's Cafe",
              link: "/",
            },
          },
          {
            type: "nav",
            data: {
              links: [
                { href: "/", label: "Home" },
                { href: "/menu", label: "Menu" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ],
              sticky: false,
              variant: "page",
            },
          },
        ],
      },
    ]
  })

  // ── Footer Variants ─────────────────────────────────────────────────────────
  // A: STANDARD_FOOTER — exploratory, sitemap-first, social proof
  // B: LOCAL_FOOTER — trust-first, phone/address prominent, minimal sitemap
  patchPage(pages, "footer", (page) => {
    page.variants = [
      {
        id: "A",
        reasoning: "STANDARD_FOOTER with full sitemap and social proof for exploration and SEO.",
        order: ["sitemap", "social-icons", "phone", "copyright"],
        blocks: [
          {
            type: "sitemap",
            data: {
              columns: [
                {
                  title: "Explore",
                  links: [
                    { href: "/", label: "Home" },
                    { href: "/menu", label: "Menu" },
                    { href: "/about", label: "About" },
                  ],
                },
                {
                  title: "Connect",
                  links: [
                    { href: "/contact", label: "Contact" },
                    { href: "/cart", label: "Cart" },
                  ],
                },
              ],
            },
          },
          {
            type: "social-icons",
            data: {
              platforms: [
                { name: "Uber Eats", url: "https://www.ubereats.com/au/store/aydins-cafe/IJbz4BeDWlqHKtlczc8EXg", icon: "🛵" },
              ],
            },
          },
          {
            type: "phone",
            data: {
              number: "+61 8 9403 3709",
              display: "+61 8 9403 3709",
              label: "Call us",
            },
          },
          {
            type: "copyright",
            data: {
              text: "© 2026 Aydin's Cafe. All rights reserved.",
              name: "Aydin's Cafe",
              year: 2026,
            },
          },
        ],
      },
      {
        id: "B",
        reasoning: "LOCAL_FOOTER emphasizing direct contact and local presence over broad navigation.",
        order: ["phone", "address", "social-icons", "copyright"],
        blocks: [
          {
            type: "phone",
            data: {
              number: "+61 8 9403 3709",
              display: "+61 8 9403 3709",
              label: "Call us",
            },
          },
          {
            type: "business-name",
            data: {
              text: "Aydin's Cafe",
              link: "/",
            },
          },
          {
            type: "social-icons",
            data: {
              platforms: [
                { name: "Uber Eats", url: "https://www.ubereats.com/au/store/aydins-cafe/IJbz4BeDWlqHKtlczc8EXg", icon: "🛵" },
              ],
            },
          },
          {
            type: "copyright",
            data: {
              text: "© 2026 Aydin's Cafe. All rights reserved.",
              name: "Aydin's Cafe",
              year: 2026,
            },
          },
        ],
      },
    ]
  })

  // ── Page Layout Variants ────────────────────────────────────────────────────
  // A: STANDARD_CONTAINER — modern brand presence, 1140px centered
  // B: NARROW_PROSE — reading-optimised, focused content experience
  patchPage(pages, "page-layout", (page) => {
    page.variants = [
      {
        id: "A",
        reasoning: "STANDARD_CONTAINER for maximum content width and modern brand presence.",
        order: ["page-layout"],
        blocks: [
          {
            type: "page-layout",
            data: {
              maxWidth: "standard",
              contentAlign: "center",
              sectionSpacing: "standard",
              sidebarPosition: "none",
            },
          },
        ],
      },
      {
        id: "B",
        reasoning: "NARROW_PROSE for improved readability and focused dining content experience.",
        order: ["page-layout"],
        blocks: [
          {
            type: "page-layout",
            data: {
              maxWidth: "narrow",
              contentAlign: "center",
              sectionSpacing: "standard",
              sidebarPosition: "none",
            },
          },
        ],
      },
    ]
  })

  writeJson(PAGES_PATH, pagesJson)
  console.log(`Patched ${PAGES_PATH} with distinct A/B variants for header, footer, and page-layout`)
}

main()

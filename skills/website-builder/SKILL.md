---
name: website-builder
description: >
  Build a demo website from business data sources (Facebook, Instagram, Google Business,
  uploaded photos, TripAdvisor, WordPress, Uber Eats, DoorDash). Generates CMS content and two theme variants, runs the
  test suite, starts the dev server, and asks which theme to preview. Use when the user
  says "build a site", "generate a website", "demo from", or provides business data sources.
---

# Website Builder Skill

## Mission

Given at least one real data source, build a working demo website by extracting the business's catalogue, content, and visual identity, then writing the platform CMS and theme config files. Run tests, start the dev server, and ask the user which theme to preview.

## Prerequisites

- Project scaffold in place using the App Router (`app/`, `lib/`, `components/`).
- React Server Components are the default; add `"use client"` only when a component uses browser APIs (`useEffect`, `useState`, `window`, etc.).
- Theme system supports a `?theme=` query parameter.
- Test scripts defined in `package.json` (`lint`, `typecheck`, `test`).
- Dev server honours a `DEMO_MODE=true` flag that skips restrictive security headers.

For environment variable rules, remote image patterns, and demo mode configuration, see `docs/patterns/configuration.md`.

## Non-Negotiable Technical Rules

These rules prevent the blank-page, CSP, and server/client render mismatches observed in prior builds. For implementation details, see `docs/patterns/cms-rendering.md` and `docs/patterns/csp-demo-mode.md`.

1. **CMS JSON shape is fixed.** `pages.json` MUST use the wrapper `{ "pages": [...] }`. The CMS reader in `lib/cms.ts` must return `parsed.pages || []`, never the raw parsed object.
2. **Block renderers are Server Components by default.** Do NOT add `"use client"` to `CmsRenderer` or any block function unless they consume browser-only APIs.
3. **No dynamic Tailwind class construction.** Do not build arbitrary Tailwind classes at runtime. Use inline styles for dynamic background images. For scan-safe markdown docs, see `docs/patterns/tailwind-scanning.md`.
4. **Theme injection must not block the app shell.** Do not wrap the root layout in a client-side `ThemeProvider` that returns `null`. It must render `children` after applying CSS custom properties.
5. **Avoid `dynamic = "force-dynamic"` unless required.** Server components can read sync files (`fs`) directly.
6. **CSP in dev.** When `DEMO_MODE=true`, ensure the proxy skips restrictive headers and the page renders full HTML when fetched with `curl`.

---

## Workflow

```
Input Sources  →  Fetch & Scratchpad  →  Analyse  →  Page Structure  →  Generate CMS  →  Themes  →  Catalogue  →  Test  →  Launch
```

### Step 1: Collect Inputs

Gather whatever the user can provide. Mark missing sources as `∅`.

| Source | Ask for |
|--------|---------|
| Facebook | Page URL (public) |
| Instagram | Business account URL or handle |
| Google | Place ID or business name + city |
| Photos | Upload via file picker: menu, interior, logo shots |
| WordPress | Site URL (optionally application password) |
| Uber Eats | Restaurant/storefront URL |
| DoorDash | Restaurant/storefront URL |
| TripAdvisor | Business listing URL |
| **Branding** | Ask the user directly: *What is the exact business name, tagline, and short description?* *How should the site feel — e.g. warm and rustic, modern and minimal, playful?* If they have an existing website, ask for a screenshot or URL and derive visual direction from it. Consult `resources/theme-examples.md` for industry-specific direction keywords and palettes. |

Required: at least one source. If none available, stop and list what is needed.

### Step 2: Fetch & Scratchpad

**Mandatory exhaustive search before declaring a source missing:**
- For each source type, run targeted searches with `site:` prefix where applicable:
  - TripAdvisor: `site:tripadvisor.com "<business name>" <city>`
  - Facebook: `site:facebook.com "<business name>" <city>`
  - Instagram: `site:instagram.com "<business name>" <city>`
  - Google Business: `"<business name>" <city> Google Business Profile` or Google Places query
  - DoorDash: `site:doordash.com "<business name>" <city>`
  - Menulog: `site:menulog.com "<business name>" <city>`
- Do not silently skip TripAdvisor or image-heavy sources. If a search result reveals the URL, attempt the fetch/scrape.

For each provided or discovered source, fetch and save raw data to `content/scratch/<tenant>/`.

Implementation details and API endpoints are in `resources/api-hints.md`.

Do not invent data. If a source returns nothing after exhaustive search, note the gap and its `mediaStatus` in `content/scratch/<tenant>/analysis.md`.

### Step 3: Analyse & Extract

From the scratchpad, produce a single `BusinessProfile` matching the schema in `resources/schemas.md` (`BusinessProfile` interface).

**Do not write `BusinessProfile` to a file.** It exists as working memory only. All persisted tenant data flows through `SiteProfile` (written in Step 5).

**Rules:**
- Derive all values from fetched source data. Do not inject preset examples.
- Infer prices only where clearly hinted (e.g. "$4", "affordable").
- Keep only the 2–3 strongest testimonials. Tag each with its `source` (e.g. "Google", "TripAdvisor", "Facebook").
- Populate `deliveryUrls` if Uber Eats or DoorDash listings are found.
- Populate `tripAdvisorSummary` from TripAdvisor reviews: aggregate rating, review count, and top descriptive keywords.

**Media gate (mandatory):**
See `docs/patterns/source-media-gate.md` for the full protocol. In short: if `media.hero` and `media.gallery` are both empty, STOP and request user uploads before generating pages, themes, or catalogue.

### Step 4: Determine Page Structure (Archetype-Based)

Before writing any content, decide which pages the site needs and which block composition each page uses. All decisions flow from the **archetype catalog** in `resources/archetypes.md`. No hardcoded "always home, add menu if..." rules.

#### 4a. Load Archetype Catalog

Read `skills/website-builder/resources/archetypes.md`. You need:
- The block vocabulary (symbols the platform CMS can render)
- The archetype definitions (named block compositions for each page type)
- The selection rules (heuristics mapping BusinessProfile signals to archetypes)
- The `minData` gates and `excludes` lists per archetype

Validate that every block symbol referenced in the catalog is listed in the block vocabulary and has a data shape in `resources/schemas.md`.

#### 4b. Select Archetypes Per Page

Use the rule-based selection protocol in `lib/ai/archetype-selector.ts`:

```typescript
import { resolveLayout } from "@/lib/ai/archetype-selector"

const selectorInput = {
  businessProfile: businessProfile,
  archetypeCatalog: JSON.parse(fs.readFileSync(`content/archetypes/${tenant}.json`, "utf-8")),
  selectionRules: [
    { condition: "media.gallery.length >= 5", archetype: "GALLERY_FULL_HOME", page: "home" },
    { condition: "features contains events", archetype: "EVENTS_HOME", page: "home" },
    // one entry per archetype rule from archetypes.md
  ],
}

const { output: layout, source } = resolveLayout(selectorInput, llmCall) // llmCall optional
```

1. Load the generated `content/archetypes/<tenant>.json` (produced by `skills/website-builder/resources/generate-archetypes.ts`).
2. Build the `selectionRules` array from the selection table in `archetypes.md`.
3. Call `resolveLayout(selectorInput, llmCall?)`. If `llmCall` is provided and configured, it will attempt LLM archetype selection; otherwise it immediately returns the rule-based output.
4. Validate the returned `layout.selected` with `LayoutOutputSchema` from `lib/schemas.ts`.
5. Record the selected archetype per page and the source (`llm` or `fallback`).

#### 4c. Expand Archetypes to PageBundle

Use `lib/ai/multi-source-pipeline.ts` `runPipeline()` to orchestrate Layer 1 (Layout) + Layer 2 (Copy) + Layer 3 (Markup):

```typescript
import { runPipeline } from "@/lib/ai/multi-source-pipeline"

const result = await runPipeline({
  businessProfile,
  tenant,
  pages: [
    { slug: "home", label: "Home", archetype: "DEFAULT_HOME", seo: { title: "...", description: "..." } },
    { slug: "menu", label: "Menu", archetype: "MENU_DEFAULT" },
    // one entry per page selected in 4b
  ],
  llmCall, // optional: (prompt, systemPrompt) => Promise<string>
})

// result.bundle is a validated PageBundle ready for pages.json
// result.layout is the LayoutOutput (with reasoning if LLM was used)
// result.skippedPages lists any pages that failed gating
```

The pipeline performs:
1. Archetype selection via `lib/ai/archetype-selector.ts` `resolveLayout()`
2. Deterministic data population from `BusinessProfile` to each block symbol in the archetype
3. Rendering via `lib/renderer.ts` `renderBundle()` to produce final CMS blocks

**The deterministic renderer is the only permitted way to produce CMS block output.** Claude does not write raw CMS JSON or Gutenberg HTML directly. Claude populates `data` objects; the renderer produces the final `{ type, data }` structure.

```typescript
// Equivalent manual expansion (if you aren't using runPipeline):
import { renderBundle } from "@/lib/renderer"
import { buildDataMap } from "@/lib/ai/multi-source-pipeline"

const pages = {
  home: {
    archetype: "DEFAULT_HOME",       // from 4b
    label: "Home",
    dataMap: buildDataMap(["hero","text","products","cta"], businessProfile),
    seo: { title: `${businessProfile.name} - ${businessProfile.tagline}`, description: businessProfile.description.slice(0, 160) },
  },
}

const bundle = renderBundle(pages)
// bundle[0].blocks = [
//   { type: "hero",    data: { headline: "...", subheadline: "...", ctaLabel: "...", ctaLink: "...", image: "..." } },
//   { type: "text",    data: { heading: "...", body: "..." } },
//   { type: "products", data: { title: "...", items: [...] } },
//   { type: "cta",     data: { heading: "...", subtext: "...", buttonLabel: "...", buttonLink: "..." } },
// ]
```

#### 4d. Validate and Document

1. If using `runPipeline`, the returned `bundle` is already Zod-validated. If expanding manually, validate the final `PageBundle` with `PageBundleSchema` from `lib/schemas.ts` before proceeding. Fix any validation errors.
2. Write `content/scratch/<tenant>/page-selection.md` documenting:
   - The selected archetype per page, the matching rule, and the selection source (`llm` or `fallback`)
   - Any pages that were gated/omitted and why (`runPipeline` returns `skippedPages`)
   - The archetype blocks list vs the final block count (if excludes/gating reduced it)
3. If `media.gallery` is empty and a gallery page or gallery blocks were selected, note the placeholder strategy.

Write every page in the bundle with at least one block; empty pages are not allowed.

### Step 5: Generate CMS Content

Write `content/cms/<tenant>/pages.json`, containing the `PageBundle` from Step 4 with blocks fully populated.

**Validation before write (mandatory):** Run the bundle through `PageBundleSchema` from `lib/schemas.ts`. Fix errors before writing. If using `runPipeline`, the bundle is already validated.

**Rendering rule (non-negotiable):** Claude populates `data` objects for each block. The deterministic `lib/renderer.ts` `renderPage()` function produces the final `{ type, data }` CMS block structure. Claude does **not** write raw CMS JSON or Gutenberg HTML directly.

```typescript
import { renderBundle } from "@/lib/renderer"
import { PageBundleSchema } from "@/lib/schemas"
import { runPipeline } from "@/lib/ai/multi-source-pipeline"

// Preferred: use the pipeline (validated internally)
const result = await runPipeline({ businessProfile, tenant, pages })
writeJson(`content/cms/${tenant}/pages.json`, { pages: result.bundle.pages })

// Manual alternative:
const pages = {
  home: {
    archetype: "DEFAULT_HOME",  // from Step 4
    label: "Home",
    dataMap: {
      hero: {
        headline: businessProfile.name,
        subheadline: businessProfile.tagline,
        ctaLabel: "View Menu",
        ctaLink: "/menu",
        image: businessProfile.media.hero,
      },
      text: { heading: "Welcome", body: businessProfile.description },
      products: {
        title: "Popular Right Now",
        items: businessProfile.catalogue.items.slice(0, 4).map(item => ({
          name: item.name, description: item.description, price: item.priceHint,
        })),
      },
    },
    seo: { title: `${businessProfile.name} - ${businessProfile.tagline}`, description: businessProfile.description.slice(0, 160) },
  },
}

const rawBundle = renderBundle(pages)  // produces PageBundle
const validated = PageBundleSchema.parse({ pages: rawBundle })
writeJson(`content/cms/${tenant}/pages.json`, validated)
```

**Content rules:**
- Tone must match `BusinessProfile.tone` and `audience`.
- Use real testimonials from sources (trim to <=140 characters where needed).
- Use actual hours, phone, and address from the profile. Do not invent values.
- Write one draft only. The owner will edit via `/dashboard/cms`.
- Use only the block types that Step 4 selected. Do not include empty or placeholder blocks.
- If `media` is empty, use image blocks with `placeholder: true` and a descriptive label (e.g. "Hero image – awaiting upload") rather than omitting image fields entirely.

### Step 6: Generate Theme Variants

Write one file per variant under `content/themes/<tenant>/`:
- `content/themes/<tenant>/theme-a.json`
- `content/themes/<tenant>/theme-b.json`
- Optionally `theme-c.json`, `theme-d.json`, etc. if the user requests more.

**Consult `resources/theme-dimensions.md`** for the full catalogue of 16 styling dimensions
(colour, typography, spacing, shape, borders, shadows, hero, cards, buttons, nav, menu,
testimonials, forms, footer, dividers, motion) and the required variance checklist.

**Rules:**
- Every theme MUST derive colours from the `vibe.palette` and `vibe.adjectives` captured in analysis.
- **Mandatory distinctness check (non-negotiable).** Before writing any theme file, perform this check against every previously written theme for the same tenant. Two themes are considered too similar if ALL of the following are true:
  1. Their primary colours fall within **30° of hue** on the HSL colour wheel, **OR** within **20% relative luminance** difference.
  2. Their background colours are within **10%** luminance of each other.
  3. They differ in fewer than **three** of the following component properties: `heroStyle`, `cardStyle`, `buttonStyle`, `navStyle`, `sectionPadding`.
- **Full variance requirement.** Each new theme variant must differ from every previously written variant in at least **8 of the 16 dimension categories** defined in `resources/theme-dimensions.md`. At minimum, themes must differ in: colour palette, typography, card style, hero style, plus four additional dimensions (e.g. nav, spacing, shape, buttons, menu, motion, shadows, borders, dividers, heroes, cards, testimonials, forms, footer).
- If two themes fail the check, the weaker one must be regenerated with a **contrasting adjective** from the adjective list. Do not emit both themes with the same dominant hue family (e.g., two different warm browns).
- If `vibe.adjectives` contains fewer than 2 items, **invent no more than one additional direction keyword** that contrasts the existing one. Build the second theme from that keyword + the contrasting half of the palette extraction (darkest colour becomes primary, lightest becomes secondary, mid-tone becomes accent — do not use the same extraction order for both themes).
- For additional variants beyond A/B (C, D...), each new variant must differ from **every previously written variant** by at least **two** of: dominant hue, lightness band, saturation band, heroStyle, cardStyle, buttonStyle, navStyle, sectionPadding, shape, motion, typography.
- Image URLs (hero, gallery) live in the CMS pages and `site-profile.json`, not in theme files. Theme JSON should contain only colours, typography, and component style flags.
- Consult `resources/theme-examples.md` for industry-specific palettes, typography, and direction keywords. Match the business `type` to the corresponding subcategory section and use that as a starting point.
- Themes must never reuse names from other tenants. Names should reflect the chosen direction keyword for this specific tenant (e.g. `"Rustic Warmth"`, `"Cool Minimal"`).

`ThemeConfig` shape is defined in `resources/schemas.md`. Do not use preset theme definitions. Generate each theme pair afresh from the current `BusinessProfile`.

### Step 7: Scaffold Square Catalogue (Stub)

Write `content/catalogue/<tenant>/catalogue.json` using the `CatalogueDoc` schema in `resources/schemas.md`.

Populate from `BusinessProfile.catalogue`. Do not call Square APIs yet.

### Step 8: Run Tests

Run and verify:

```bash
npm run lint
npm run typecheck
npm test
```

If `node_modules` is missing, install with:
```bash
npm install --ignore-scripts
```
See `docs/patterns/supply-chain-hardening.md` for why `--ignore-scripts` is mandatory.

If tests fail:
1. Fix before proceeding.
2. Document unrelated failures in `content/scratch/<tenant>/analysis.md`.
3. Do not launch until the suite passes.

For ESLint suppression rules by location (e.g. test files), see `docs/patterns/lint-policy.md`.

### Step 9: Start Dev Server

```bash
npm run dev
```

Wait for readiness (default port 3000). Confirm:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

**Blank-page guard (mandatory):**
```bash
curl -s http://localhost:3000 | grep -q "Cafe Template\|Aydin's\|Business Name"
```
If this returns nothing or the HTML is missing expected page content, see `docs/patterns/cms-rendering.md` for troubleshooting steps. Do not proceed to Step 10 until `curl` returns real content.

### Step 10: Present Themes & Ask for Choice

Report:

```
Generated assets are in:
  content/cms/<tenant>/pages.json
  content/themes/<tenant>/theme-a.json  →  Theme: "<name from file>"
  content/themes/<tenant>/theme-b.json  →  Theme: "<name from file>"
  content/catalogue/<tenant>/catalogue.json

Dev server running at http://localhost:3000

Preview both themes at:
  http://localhost:3000/?theme=theme-a
  http://localhost:3000/?theme=theme-b

Which theme would you like to try first? (A / B)
```

Wait for the user's answer. Do not proceed without it.

### Step 11: Apply Theme & Confirm

After the user picks A or B:

1. Update the tenant default config if the project uses one (e.g. `app/tenants/<tenant>/config.ts`).
2. Set the selected theme as the default so the site loads without `?theme=`.
3. Report:

```
Applied Theme <A|B> ("<name>") as default.

Edit CMS content in:
  /dashboard/cms

Regenerate individual sections:
  Rerun this skill or edit files directly.

To publish to Square later:
  Follow the Phase 10 / "website-builder publish" pipeline.
```

---

## Constraints

- **LLM APIs**: Phase 9a runs without LLM APIs (rule-based archetype selection, deterministic renderer). Phase 9b+ may use LLM APIs when configured. Always fall back to rule-based if the API fails.
- **Do not** make Square API calls. The catalogue is staged locally.
- **Do not** overwrite existing content without explicit user confirmation.
- **Do not** add `// eslint-disable` comments.
- **Do not** commit or push unless asked.

## Future (Out of Scope)

Mark as TODOs in `content/scratch/<tenant>/analysis.md`:

- Replace rule-based archetype selection with LLM-assisted selection (Phase 9b).
- Auto-connect Facebook/Instagram/Google via OAuth.
- Auto-upload generated catalogue to Square Catalog API.
- Regenerate individual sections on demand.
- Image generation for missing assets via DALL-E / Replicate.
- WordPress content migration formatting fixes.
- Enforce mandatory media gate with user upload prompt instead of silent fallback.
- Make archetype catalog open/extensible per vertical (review in Phase 9b).
- Add CMS block components for `social-proof`, `instagram-feed`, `menu-preview`.
- Add exhaustive `site:`-prefixed search protocol for all source types (especially TripAdvisor) before declaring source gaps.

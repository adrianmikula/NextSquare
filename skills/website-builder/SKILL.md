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

- Project scaffold in place (`app/`, `lib/`, `components/`, `tests/`).
- Theme system supports a `?theme=` query parameter.
- Test scripts defined in `package.json` (`lint`, `typecheck`, `test`).

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

Required: at least one source. If none available, stop and list what is needed.

### Step 2: Fetch & Scratchpad

For each provided source, fetch and save raw data to `content/scratch/<tenant>/`.

Implementation details and API endpoints are in `resources/api-hints.md`.

Do not invent data. If a source returns nothing, note the gap in `content/scratch/<tenant>/analysis.md`.

### Step 3: Analyse & Extract

From the scratchpad, produce a single `BusinessProfile` matching the schema in `resources/schemas.md` (`BusinessProfile` interface).

Write `content/cms/<tenant>/profile.json`.

**Rules:**
- Derive all values from fetched source data. Do not inject preset examples.
- Infer prices only where clearly hinted (e.g. "$4", "affordable").
- Keep only the 2–3 strongest testimonials. Tag each with its `source` (e.g. "Google", "TripAdvisor", "Facebook").
- If no photos exist, leave `media` empty; themes will fall back to CSS gradients / generated assets.
- Populate `deliveryUrls` if Uber Eats or DoorDash listings are found.
- Populate `tripAdvisorSummary` from TripAdvisor reviews: aggregate rating, review count, and top descriptive keywords.

### Step 4: Determine Page Structure

Before writing any content, decide which pages the site needs based on the business profile. Do not use a fixed list. Derive from:

- `type` (e.g. "cafe" → menu-centric; "bakery" → gallery + menu; "caterer" → services + enquiry)
- `catalogue.categories` (if empty, omit category pages)
- `services` (if present, add a services page)
- `features` (e.g. "delivery" → add delivery-info page; "events" → add events page)
- `media.gallery` length (≥2 → add gallery page)
- `location` + `hours` (always present → pages can include contact/hours)
- `audience` (e.g. "tourists" → add local-area / getting-here page)
- `features` containing "loyalty" or "subscriptions" → add membership page
- `deliveryUrls` present → add delivery-info block on relevant pages
- `tripAdvisorSummary.rating` high (≥4.0) → surface "award-winning" or "top-rated" social proof

Output a `PageBundle` matching the schema in `resources/schemas.md` (`PageBundle` interface).

**Decision rules (apply heuristics, do not hardcode):**
- Always include `home`.
- Add `menu` if `catalogue.categories.length` > 0.
- Add `gallery` if `media.gallery.length` >= 2.
- Add `contact` if `phone` or `location.address` is present.
- Add `about` if `description` is substantive (≥50 chars) or there are ≥2 testimonials.
- Add `testimonials` as a standalone page only if there are >=3 items.
- Add `services` if `BusinessProfile.services` is defined and non-empty.
- Add `faq` if a `faq` field was populated during analysis; otherwise omit.
- Add block types inside pages only when there is data to fill them:
  - `products` block → if the page is menu-related and catalogue items exist
  - `services` block → if the page is services-related and services exist
  - `form` block → if an enquiry or booking mechanism is relevant
  - `promo` block → if seasonal offers or specials are mentioned in sources
  - `delivery` block → if `deliveryUrls` is present

Write every page in the bundle with at least one block; empty pages are not allowed.

Document the reasoning per page in `content/scratch/<tenant>/page-selection.md`.

### Step 5: Generate CMS Content

Write `content/cms/<tenant>/pages.json`, containing the `PageBundle` from Step 4 with blocks fully populated.

**Rules:**
- Tone must match `BusinessProfile.tone` and `audience`.
- Use real testimonials from sources (trim to <=140 characters where needed).
- Use actual hours, phone, and address from the profile. Do not invent values.
- Write one draft only. The owner will edit via `/dashboard/cms`.
- Use only the block types that Step 4 selected. Do not include empty or placeholder blocks.

### Step 6: Generate Two Theme Variants

Write:
- `content/themes/<tenant>/theme-a.json`
- `content/themes/<tenant>/theme-b.json`

**Rules:**
- Both themes must derive colours from the `vibe.palette` captured in analysis.
- Select two distinct directions from the `vibe.adjectives` list. Each theme should lean toward a different adjective or combination of adjectives.
- Themes must differ in at least `components.heroStyle`, `components.cardStyle`, and `components.buttonStyle`.
- Both themes reference the same `media.hero` and `media.logo` paths.

`ThemeConfig` shape is defined in `resources/schemas.md`. Do not use preset theme definitions. Generate each theme pair afresh from the current `BusinessProfile`.

### Step 7: Scaffold Square Catalogue (Stub)

Write `content/catalogue/<tenant>/catalogue.json` using the `CatalogueDoc` schema in `resources/schemas.md`.

Populate from `BusinessProfile.catalogue`. Do not call Square APIs yet.

### Step 8: Run Tests

Run and verify:

```bash
npm install --ignore-scripts   # only if node_modules missing
npm run lint
npm run typecheck
npm test
```

If tests fail:
1. Fix before proceeding.
2. Document unrelated failures in `content/scratch/<tenant>/analysis.md`.
3. Do not launch until the suite passes.

### Step 9: Start Dev Server

```bash
npm run dev
```

Wait for readiness (default port 3000). Confirm:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

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

- **Do not** call OpenAI, Anthropic, or any LLM API.
- **Do not** make Square API calls. The catalogue is staged locally.
- **Do not** overwrite existing content without explicit user confirmation.
- **Do not** add `// eslint-disable` comments.
- **Do not** commit or push unless asked.

## Future (Out of Scope)

Mark as TODOs in `content/scratch/<tenant>/analysis.md`:

- Replace heuristic analysis with LLM calls (Phase 14 pipeline).
- Auto-connect Facebook/Instagram/Google via OAuth.
- Auto-upload generated catalogue to Square Catalog API.
- Regenerate individual sections on demand.
- Image generation for missing assets via DALL-E / Replicate.
- WordPress content migration formatting fixes.

# Website Generation Retrospective & Improvement Prompt

## What Worked Well

- **Exhaustive search protocol** found real data sources (Uber Eats, RestaurantGuru, Zest Events) without needing user uploads.
- **Media gate** correctly identified that images were available and didn't block progress unnecessarily.
- **CMS JSON shape convention** (`{ pages: [...] }` wrapper) is clean and unambiguous once documented.
- **Inline styles for dynamic images** avoided Tailwind arbitrary-value parsing issues entirely.
- **`@source` / `@source not` directives** in Tailwind CSS cleanly excluded docs/skills/scratch from scanning.
- **Demo mode flag** (`DEMO_MODE=true`) made dev iteration fast by skipping restrictive CSP headers.
- **ThemeProvider rendering children** (not `null`) ensured the app shell always painted.
- **Profile + Pages + Themes + Catalogue** separation keeps tenant data cleanly organised.

## What Was Harder Than It Should Have Been

1. **Tailwind scanning non-code files**: Markdown docs and skill files containing literal Tailwind class examples caused CSS parse failures. It took multiple iterations to find the right fix (`@source` in CSS vs PostCSS plugin config).
2. **Stale `.next` cache**: After fixing CSS errors, the broken reference persisted across server restarts until `.next` was manually purged.
3. **CSP / nonce conflict**: React 18's inline styles were silently blocked by `style-src 'nonce-xxx' 'unsafe-inline'` because the nonce takes precedence and `unsafe-inline` is ignored.
4. **Server/client boundary confusion**: Needed explicit documentation about when `"use client"` is required vs. when it causes blank pages.
5. **Manual CMS wiring**: Had to manually create `lib/cms.ts`, `CmsRenderer.tsx`, `ThemeProvider.tsx`, API route, and update `layout.tsx` — these should be scaffolded automatically.
6. **Inconsistent linking**: The skill described concepts (theme queries, CMS pages) that didn't have obvious corresponding code paths.

## Separation of Concerns Issues

- **Platform code vs tenant code**: `app/page.tsx`, `app/layout.tsx`, and `proxy.ts` are platform infrastructure, but they were edited to accommodate a single tenant's CMS data. Multi-tenant support should be structural, not ad-hoc.
- **Theme injection location**: Fetching theme config in a client `useEffect` is fragile. Theme should be resolved server-side and injected as CSS custom properties in the HTML response.
- **Content vs configuration**: CMS content files, theme configs, and catalogue stubs are all in `content/`, but they are written and read by different parts of the system with no shared interface contracts.

## Prompt to Improve the Skill and App Structure

Improve the `website-builder` Claude skill and the Next.js app scaffold so that generating a clean, working tenant website from real-world business data requires minimal debugging and no retrofitting.

### For the Next.js App Scaffold

1. **Tenant-aware routing**
   Add a route segment pattern like `app/[tenant]/page.tsx` that automatically reads `content/cms/[tenant]/pages.json` and renders blocks via `CmsBlockRenderer`. The root `app/page.tsx` should redirect to the default tenant or show a tenant selector, not contain hardcoded CMS reads.

2. **Server-side theme injection**
   Replace the client-only `ThemeProvider` (which fetches via `useEffect`) with a server-side mechanism:
   - Read the theme in the layout or page server component
   - Set CSS custom properties on `<html>` inline during render
   - Only fall back to client fetch for `?theme=` query param changes

3. **Built-in CMS reader contracts**
   Export typed helpers from `lib/cms.ts` that the skill can rely on:
   - `readCmsPages(tenant): CmsPage[]`
   - `readTheme(tenant, variant): ThemeConfig`
   - `readCatalogue(tenant): CatalogueDoc`
   - `listTenants(): string[]`
   Make these the single source of truth for CMS file locations and JSON shapes.

4. **Tenant-remote image allowlist**
   In `next.config.ts`, automatically include `restaurantguru.com`, `tripadvisor.com`, `ubereats.com`, `doordash.com`, and `menulog.com` hostnames in `images.remotePatterns` so the skill never has to remember to add them.

5. **Demo-mode-aware proxy**
   Make `proxy.ts`'s CSP behaviour fully driven by `DEMO_MODE` without any code edits. Include a comment block documenting the nonce/unsafe-inline conflict so future developers understand why demo mode skips CSP.

### For the `website-builder` Skill

1. **Scaffold CMS infrastructure automatically**
   After Step 3 (Analysis), before generating content, create the full CMS wiring if it doesn't exist:
   - `lib/cms.ts` (typed readers)
   - `components/cms/CmsRenderer.tsx` (all standard block types)
   - `components/cms/ThemeProvider.tsx` (server-compatible)
   - `app/api/cms/theme/route.ts`
   - `app/[tenant]/page.tsx` skeleton
   Do not write tenant content into platform files. Tenant code lives only under `content/<kind>/<tenant>/`.

2. **Separate content generation from platform modification**
   The skill should never edit `app/layout.tsx`, `proxy.ts`, `next.config.ts`, or `lib/env.ts` as part of generating a single tenant's website. Those are platform concerns. The only acceptable tenant-specific edits are:
   - Writing files under `content/<kind>/<tenant>/`
   - Creating a tenant route segment under `app/[tenant]/`
   - Updating a tenant registry/config if one exists

3. **Reference pattern docs, don't duplicate them**
   Where the skill currently explains CSP, server/client boundaries, or Tailwind scanning inline, replace with a one-line reference to the canonical doc in `docs/patterns/`. The skill should state the rule and point to the explanation.

4. **Add a Tailwind source-control step**
   When the skill writes new markdown or scratch files that might contain class strings, ensure `app/globals.css` already has `@source not` rules for those directories. If not, flag it as a platform issue to fix manually rather than silently risking a broken build.

5. **Add a CMS integration checklist before launch**
   Before Step 9 (Start Dev Server), verify:
   - `lib/cms.ts` exports all required readers
   - `app/[tenant]/page.tsx` exists and uses `readCmsPages`
   - `next.config.ts` includes image hostnames used by this tenant's sources
   - `DEMO_MODE=true` is set in `.env.local` for development
   - No platform files (`app/layout.tsx`, `proxy.ts`) were modified

### Expected Outcome

A developer or Claude running the website-builder skill should be able to go from "here is a business name and city" to a fully rendered, multi-page CMS-driven website with two theme variants, without ever touching `app/layout.tsx`, `proxy.ts`, or `next.config.ts`. Tenant isolation should be structural: each business lives entirely under `content/<kind>/<tenant>/` and `app/[tenant]/`.

---

## Session Retrospective: Theme System Overhaul (2026-06-29)

### What Changed Since the Original Retrospective

1. **Single-tenant model confirmed.** Multi-tenant runtime switching was removed. `ACTIVE_TENANT` and `THEME_VARIANT` env vars now select the business and theme at build/startup time. The `app/page.tsx` root redirect and `app/layout.tsx` app shell both read from `getActiveTenant()`.

2. **Server-side theme injection wins.** The original retrospective called for server-side injection; this session implemented it. A `<style>` tag is emitted in `app/[tenant]/layout.tsx` with all CSS custom properties set before first paint. This eliminated the orange/blue flash caused by the previous client-side `useEffect` pattern.

3. **ThemeProvider simplified.** It no longer fetches from `/api/cms/theme`. It is now a thin client component that applies the server-provided `cssVars` object. The API route still exists for client-side re-renders if needed.

4. **Tailwind token remapping.** Instead of emitting custom `--theme-*` variables and using `var(--theme-*)` inside `@theme` (which Turbopack did not reliably resolve at runtime), `toCssVars()` now emits **exact Tailwind token names** (`--color-amber-600`, `--color-stone-900`, etc.) with direct hex values. This overrides the static `@theme` defaults on `:root`.

5. **Expanded theme dimensions.** The website-builder skill's Step 6 previously only covered `colors` and `components` (hero/card/button style). It now supports 16 styling dimensions (colour, typography, spacing, shape, borders, shadows, hero, cards, buttons, nav, menu, testimonials, forms, footer, dividers, motion) with a mandatory 8-dimension variance check between any two variants. See `skills/website-builder/resources/theme-dimensions.md`.

6. **CSS specificity guardrail.** `.card-themed` and related classes in `app/globals.css` use `!important` for `border-radius` and `border` to override Tailwind utility specificity. This is now documented as a known gotcha in `docs/patterns/theme-system.md`.

7. **`readTheme()` accepts any variant string.** Removed the `"a" | "b"` union constraint so `theme-c.json`, `theme-d.json`, etc. work without code changes.

### Remaining Gaps

- **Menu page (`app/menu/page.tsx`) does not consume theme dimensions.** `MenuItemCard` still uses hardcoded `border-stone-200`, `shadow-sm`, `bg-amber-600`, etc. Theme-aware variants exist in `theme.json` (`menu.layout`, `menu.hover`, `cards.hover`) but the menu component does not read them. Future work: pass the active `ThemeConfig` to `MenuGrid` and `CategoryNav`.
- **API route `/api/cms/theme` is now redundant** for the primary theme flow. Consider removing it or keeping it only for client-side preview toggling.
- **Google Fonts for theme fonts.** `Playfair Display` and `Lora` are referenced in themes but not loaded. The skill must ensure `next/font/google` imports match the theme's `headingFont`/`bodyFont`, or fonts must be self-hosted.

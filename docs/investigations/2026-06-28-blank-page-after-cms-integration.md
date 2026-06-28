# Investigation: Blank White Page After CMS Integration

## Session Date
2026-06-28

## Symptom
After generating Aydin's Cafe content via the website-builder skill, the homepage renders as a completely plain white page. No JS errors in console after CSP fixes, but zero visible content.

## Initial Hypothesis
Something in the newly generated CMS content files (`pages.json`, themes, catalogue) or the new CMS rendering pipeline is breaking the page.

## Git Diff Analysis
The last working commit (`94ae9e2`) had a fully functional static homepage. The uncommitted changes touched exactly these files:

- `app/layout.tsx`
- `app/page.tsx`
- `lib/env.ts`
- `proxy.ts`

The CMS content files (`content/cms/aydins-cafe/pages.json`, etc.) are **new untracked files** and therefore not in the diff. This immediately suggests the breakage is in how the code reads/renders those files, not the files themselves.

## Root Causes Found

### 1. `pages.json` Structure Mismatch (Primary)
**Files:** `app/page.tsx`, `lib/cms.ts`

The generated `pages.json` has this shape:
```json
{
  "pages": [
    { "slug": "home", "blocks": [...] },
    ...
  ]
}
```

But the initial `readCmsPages()` implementation returned the parsed JSON object directly and called `.find()` on it:
```ts
return readJson<CmsPage[]>(file)  // returns { pages: [...] }
```

Calling `.find()` on `{ pages: [...] }` threw `pages.find is not a function`, which caused the server component to crash and render nothing.

**Fix:** Updated `readCmsPages()` to return `parsed.pages || []`.

### 2. CSS Template Literal in Server Component
**File:** `components/cms/CmsRenderer.tsx`

Early versions of the CMS renderer built dynamic background-image classes using string concatenation inside JSX:
```tsx
<div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url('https://example.com/photo.jpg')" }} />
```

This produced invalid JSX/templating that broke the build, and even after fixing to template literals, a stale `.next` cache kept the broken version alive.

**Fix:** Switched to inline `style={{ backgroundImage: "url('https://example.com/photo.jpg')" }}` for dynamic images, avoiding Tailwind arbitrary value parsing of runtime strings.

### 3. CSS Cache Corruption Cascade
**Files:** `app/globals.css`, `.next/dev/cache/turbopack/`

After fixing the template literal bug, the browser still showed blank pages. Inspection revealed the CSS file was being served (54 KB, contains `.bg-stone-900` etc.), but the page was still white. The `.next` cache had been corrupted by earlier failed compilations (SST file panics). Even rebuilding did not recover because the broken CSS reference persisted in the manifest. Clearing `.next` after the JS fix resolved it.

### 4. CSP / Nonce Conflict with Inline Styles
**File:** `proxy.ts`

The production-style CSP header included both a `nonce-xxx` and `'unsafe-inline'` in `style-src`. Per CSP spec, if a nonce is present, `'unsafe-inline'` is ignored for style tags, but React 18 in dev mode uses `eval()` and inline style objects, which triggered:
- `eval() is not supported` (needed `'unsafe-eval'` in `script-src`)
- `Applying inline style violates Content Security Policy` (inline style objects blocked)

**Fix:** Introduced `DEMO_MODE` toggle:
- `DEMO_MODE=true` (default in `.env.local`): only sends `X-Frame-Options` and `X-Content-Type-Options`. No CSP, no nonce cookies.
- `DEMO_MODE=false`: full CSP with nonce, `unsafe-eval` (dev only), COOP/COEP, HSTS.

This gives a single-config switch between heavy production security and unblocked demo/dev mode.

## Key Lessons

1. **Validate CMS data shapes before wiring them into components.** A single mismatch between JSON structure and TypeScript interface caused a silent server crash.

2. **Don't replace working static components with CMS-driven rendering until the CMS pipeline is proven.** The original `app/page.tsx` with hard-coded `<Hero />`, `<MenuPreview />`, etc. worked flawlessly. Replacing it with `readCmsPages()` + `<CmsBlockRenderer />` introduced three separate bugs at once.

3. **Keep a working fallback in the component.** The initial CMS `page.tsx` render had a `) : (<div>404</div>)` fallback that made the failure mode visible (and alarming). A better pattern is to render the original static sections when CMS data is missing, so the site never goes completely blank.

4. **`.next` cache can survive intent to clear.** After fixing JS/CSS bugs, always do a full `rm -rf .next && npm run dev` rather than relying on HMR to recover from corrupted Turbopack state.

5. **CSP nonces must match the exact header model.** You cannot mix nonce-based stylesheet loading with React inline style objects in the same `style-src` directive without either removing the nonce or adding `'unsafe-inline'`. The nonce-ignores-unsafe-inline behavior is per spec.

## Verification That It Works
After fixes, with `DEMO_MODE=true`:
- Response 200
- No console errors
- Aydin's content renders correctly: "Aydin's Cafe", "Fresh breakfast and brunch in Joondalup", menu items, testimonials

## Recommended Next Steps
1. Add a "safe render" wrapper that falls back to the original static sections if CMS data is absent or malformed.
2. Unit test `readCmsPages()` against the actual `pages.json` shape to catch structure mismatches at build time.
3. Consider making `CmsBlockRenderer` a client component with proper error boundaries so a single bad block doesn't blank the whole page.

# Server/Client Component Boundaries & CMS Rendering

## Principle

**Default to Server Components. Add `"use client"` only when the component uses browser-only APIs.**

This project uses the App Router. Crossing the server/client boundary incorrectly is the most common cause of blank pages, hydration errors, and CSP failures.

## Server/Client Decision Tree

| Needs | Component Type |
|-------|---------------|
| Reads files (`fs`), fetches CMS/theme data, or calls APIs without hooks | **Server Component** |
| Uses `useEffect`, `useState`, `useSearchParams`, or browser globals | **Client Component** (`"use client"`) |
| Passes data to children only | **Server Component** |
| Renders a Suspense boundary around async data | **Server Component** (Suspense is native) |
| Calls `document.documentElement` or `window` | **Client Component** |

## Mandatory Rules

### 1. CMS block renderers are Server Components by default

- `components/cms/CmsRenderer.tsx` must NOT have `"use client"`.
- Individual block functions (`CmsHero`, `CmsProducts`, etc.) must NOT use `"use client"`.
- If a block somehow needs client-side interactivity in the future, extract only that sub-tree into a separate client component.

```tsx
// ✅ Server Component
export function CmsBlockRenderer({ block }: { block: CmsBlock }) {
  const { type, data } = block
  switch (type) {
    case "hero":
      return <CmsHero data={...} />
    // ...
  }
}
```

### 2. `ThemeProvider` must render children

A client component used for theme injection should return its children after applying CSS custom properties, not `null`. Returning `null` delays or drops the paint of the entire subtree beneath it.

```tsx
"use client"

import { useEffect } from "react"

export function ThemeProvider({ cssVars, children }: { cssVars?: Record<string, string>; children: React.ReactNode }) {
  useEffect(() => {
    if (!cssVars) return
    const root = document.documentElement
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [cssVars])

  return <>{children}</>  // MUST render children
}
```

The server-side layout in `app/layout.tsx` reads the bundle config from `content/dimensions/bundles/`, resolves the active dimension specs from `content/dimensions/specs/*.json`, compiles them with `compileSpecsToCssVars()`, and injects a `<style>` tag on `:root` before first paint. The client-side `ThemeProvider` only reapplies if the variant changes without a full reload (via `DimensionThemeSync`).

```tsx
// app/layout.tsx
const bundleId = (process.env.NEXT_PUBLIC_THEME_BUNDLE || "A").toUpperCase()
const bundles = getAllBundleConfigs()
const activeBundle = bundles.find((b) => b.id === bundleId)
const dimState = activeBundle?.dimensions ?? defaultDimensionState()
const dimSpecs = resolveDimensionSpecs(dimState)
const cssVars = compileSpecsToCssVars(dimSpecs)

return (
  <ThemeProvider cssVars={cssVars}>
    <style dangerouslySetInnerHTML={{ __html: `:root{${cssVarsStyle}}` }} />
    {children}
  </ThemeProvider>
)
```

**Old behaviour (removed):** The legacy `ThemeConfig` system (`content/themes/theme-*.json` + `toCssVars()`) was removed in favour of the dimension-based system. The `?theme=a|b` URL param no longer works — use `?bundle=a|b` instead.

### 3. Avoid `dynamic = "force-dynamic"` unless required

`export const dynamic = "force-dynamic"` forces the page to render on every request at request time, even when content is static. This:

- Increases TTFB significantly
- Bypasses Next.js caching
- Can interact badly with client boundary detection in Turbopack

Use only when the page truly depends on per-request data (e.g. cookies, auth headers).

```tsx
// ❌ Avoid unless strictly necessary
export const dynamic = "force-dynamic"

// ✅ Let Next.js infer static/dynamic from actual usage
export default function Page() {
  // Reading a CMS file at module top-level is fine on the server
  const pages = readCmsPages("tenant")
  // ...
}
```

### 4. CMS JSON shape is fixed

`pages.json` MUST use the wrapper `{ "pages": [...] }`. The CMS reader must unwrap it:

```ts
export function readCmsPages(tenant: string): CmsPage[] {
  const file = path.join(CMS_ROOT, tenant, "pages.json")
  if (!fs.existsSync(file)) return []
  const parsed = readJson<{ pages?: CmsPage[] }>(file)
  return parsed.pages || []  // MUST unwrap; do NOT return parsed directly
}
```

Returning the raw parsed object and calling `.find()` on it throws:
```
TypeError: parsed.find is not a function
```
This silently crashes the server component and renders a blank page.

### 5. Inline styles for dynamic background images

Never build Tailwind class strings with runtime template literals in Server Components. Turbopack will attempt to statically analyse them and may:

- Generate invalid CSS
- Throw `Module not found: Can't resolve '...'`
- Break the entire CSS bundle for every page

```tsx
// ❌ Causes Turbopack CSS parse failures
<div className="bg-[url('https://example.com/photo.jpg')] bg-cover" />
```

See `docs/patterns/tailwind-scanning.md` for the full explanation.

## Rationale

Server/Client boundary mistakes have unique failure modes:

1. **Blank pages with no console errors**: A server component that throws during render produces an empty response. The client never hydrates, so there is no JS error.
2. **Hydration mismatches**: A client component that returns `null` instead of children drops the subtree.
3. **CSS cascade failures**: Turbopack CSS errors apply to the whole app, not just the offending component.

Explicit rules about where boundaries sit, and how JSON flows through the CMS, prevent these silent failures.

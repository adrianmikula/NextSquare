# CSS Custom Property Override Strategy

When multiple systems inject CSS custom properties on the same page, specificity determines which values take effect. This document documents the patterns used in this codebase to ensure correct override behavior.

## Problem: Inline styles vs `<style>` blocks

The old `ThemeProvider` (`components/cms/ThemeProvider.tsx`) sets CSS vars as **inline styles** on `<html>` via `useEffect` + `root.style.setProperty()`:

```tsx
useEffect(() => {
  const root = document.documentElement
  entries.forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}, [compiled])
```

Inline styles on an element have higher CSS specificity than any `<style>:root{...}` declaration in the document. This means a `<style>:root{--color-primary: red}</style>` block cannot override `document.documentElement.style.setProperty("--color-primary", "blue")`.

## Pattern 1: Attribute-scoped styles (for content regions)

When you need to override ThemeProvider values only within a specific subtree, use an attribute selector scoped to a wrapper element:

```tsx
<div data-site-page="">
  <style>{`[data-site-page]{--color-primary: red}`}</style>
</div>
```

The attribute selector `[data-site-page]` has higher specificity than inline styles on a different element (`:root`/`<html>`), so it successfully overrides within the scoped subtree.

**Used in:** `src/renderer/site-page.tsx` — `CssVarInjector` generates a `<style>` scoped to `[data-site-page]` for gene content.

## Pattern 2: `useEffect` with `document.documentElement.style` (for layout regions)

When you need to override ThemeProvider values for the entire page (including header, footer, and other layout elements outside the scoped subtree), use the same mechanism as ThemeProvider: set inline styles on `document.documentElement` via `useEffect`. Since the override effect runs after the ThemeProvider effect, it wins via last-write-wins for the same CSS property on the same element:

```tsx
function CssVarInjector({ cssVars }) {
  useEffect(() => {
    const root = document.documentElement
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    return () => {
      Object.entries(cssVars).forEach(([key]) => root.style.removeProperty(key))
    }
  }, [cssVars])

  return (
    <>
      <style>{`:root{${cssVarsToStyleString(cssVars)}}`}</style>
      <style>{`[data-site-page]{${cssVarsToStyleString(cssVars)}}`}</style>
    </>
  )
}
```

The cleanup function removes the overridden vars when the component unmounts or `cssVars` changes, preventing stale values.

**Used in:** `src/renderer/site-page.tsx` — `CssVarInjector` uses `useEffect` to apply vars on `document.documentElement`, overriding ThemeProvider for the entire page including header/footer.

## Pattern 3: Complement the var set

When layout components (header, footer, nav) reference CSS vars like `--color-nav-bg` or `--color-footer-bg` that the tuner/color system doesn't produce, those vars won't update regardless of override mechanism. Ensure the var-producing function (`compileColorBridge`, `compileTunersToCssVars`, etc.) emits **all vars that layout components reference**.

**Checklist when adding a new CSS var to a layout component:**
1. Add the var to `compileColorBridge` (for color-related vars) or `compileTunersToCssVars` (for spacing/typography vars) in `src/renderer/compile-tuners.ts`
2. Add the var to the `COLOR_BRIDGE_KEYS` / `TUNER_KEYS` test arrays in `__tests__/src/renderer/compile-tuners.test.ts`
3. Add a "produces distinct X per relief" test if the var should vary by relief
4. Add a "sets X as inline style on documentElement" test in `__tests__/src/renderer/site-page.test.tsx`

## Pattern 4: Shape and archetype token consistency

Shape definitions exist in two places with different concerns:
- `src/renderer/compile-shape.ts` — produces actual CSS values (`--shape-*` vars with `solid`/`dashed`/`dotted` divider styles)
- `src/archetypes/tokens.ts` — produces higher-level design tokens (`--arch-corner-*` vars with `straight`/`rounded`/`curved`/`organic` divider style labels)

When adding or changing a shape, verify both files have **matching numerical values**:
- `cornerRadius` / `--shape-corner-radius` should match
- `cornerSmoothing` should match
- Labels may differ intentionally (tokens uses abstract labels, shape uses CSS values), but maintain a consistent mapping

Add cross-file consistency tests in `__tests__/src/renderer/compile-shape.test.ts` under `describe("shape consistency between compile-shape.ts and archetypes/tokens.ts")`.

## Pattern 5: Config content merge

The `SiteConfig.content` field is a flat key-value map intended for AI agent editing. To render content changes, merge it into the spec's element props before passing to the Renderer:

```tsx
const spec = mergeContentIntoSpec(
  config.spec as Record<string, unknown>,
  config.content ?? {},
) as unknown as Spec
```

The merge function (`src/renderer/site-page.tsx:45`) walks spec elements and replaces prop values where the content key matches `{elementTypePrefix}-{propName}`.

**Test pattern:** Check both that the mock Renderer receives the merged spec (`site-page.test.tsx`) and that the real Renderer renders the merged content (`gene-rendering.test.tsx`).

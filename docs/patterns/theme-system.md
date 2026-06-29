# Theme System

## Principle

**One active tenant, multiple theme variants.** The site no longer supports switching between tenants at runtime. Instead, `ACTIVE_TENANT` selects the business, and `THEME_VARIANT` selects which visual theme to apply. All content (CMS pages, catalogue, site-profile) comes from that single tenant directory.

## Environment Variables

```env
# .env.local
ACTIVE_TENANT=demo              # directory name under content/{cms,themes,catalogue,site-profile}
THEME_VARIANT=a                # filename suffix: theme-a.json, theme-b.json, etc.
```

Both are read server-side and exposed through helpers in `lib/cms.ts`:

```ts
export function getActiveTenant(): string {
  return process.env.ACTIVE_TENANT || "demo"
}

export function getActiveThemeVariant(): string {
  return process.env.THEME_VARIANT || "a"
}
```

Changing either value requires a server restart.

## Theme File Layout

```
content/
├── cms/<tenant>/pages.json
├── catalogue/<tenant>/catalogue.json
├── site-profile/<tenant>/site-profile.json
└── themes/<tenant>/
    ├── theme-a.json
    ├── theme-b.json
    └── theme-c.json   # optional extra variants
```

## ThemeConfig Shape

The expanded schema is documented in `skills/website-builder/resources/schemas.md`.
A summary of supported top-level keys:

```ts
interface ThemeConfig {
  name: string
  colors: { primary, secondary, background, surface, text, accent, border?: string }
  typography: { headingFont, bodyFont, weights, headingCase?, letterSpacing?, lineHeight? }
  spacing: { sectionPaddingY, sectionPaddingX?, containerMax, gridGap?, contentAlign? }
  shape: { borderRadius?, cardRadius?, buttonRadius?, imageRadius? }
  borders: { width?, style?, cardBorder?, divider? }
  shadows: { card?, cardHover?, tint? }
  components: { heroStyle, cardStyle, buttonStyle, navStyle }
  hero?: { overlayOpacity?, overlayColor?, textAlign?, paddingY?, gradientDirection?, imageTreatment? }
  cards?: { hover?, imageAspect?, imageRadius?, innerPadding? }
  buttons?: { radius?, paddingX?, fontWeight?, hover?, fullWidthMobile? }
  nav?: { backgroundOpacity?, logoSize?, linkStyle?, height?, shadow? }
  menu?: { layout?, priceAlign?, priceStyle?, divider?, hover? }
  testimonials?: { layout?, quoteStyle?, avatar? }
  forms?: { inputRadius?, inputBorder?, focusRing?, labelWeight? }
  footer?: { background?, layout?, borderTop?, socialStyle? }
  dividers?: { style?, color?, height? }
  motion?: { transitionSpeed?, hoverLift?, fadeIn?, smoothScroll? }
}
```

See `skills/website-builder/resources/theme-dimensions.md` for the full 16-dimension catalogue, allowed enum values, and variance requirements.

## How Themes Are Applied

### Server-side (default path)

`app/[tenant]/layout.tsx` reads the theme and emits a `<style>` tag that sets CSS custom properties on `:root` before the first paint:

```tsx
// app/[tenant]/layout.tsx
const theme = readTheme(activeTenant, themeVariant)
const cssVars = theme ? toCssVars(theme, themeVariant) : undefined

return (
  <ThemeProvider tenant={activeTenant} cssVars={cssVars}>
    <style dangerouslySetInnerHTML={{ __html: `:root{${cssVarsStyle}}` }} />
    {children}
  </ThemeProvider>
)
```

This eliminates the previous orange/blue flash caused by client-side `useEffect` firing after initial paint.

### Client-side (ThemeProvider)

`components/cms/ThemeProvider.tsx` is a thin client component. It applies the server-provided `cssVars` to `document.documentElement` in a `useEffect` to handle any subsequent variant changes without a full reload. It does **not** fetch from `/api/cms/theme` anymore.

## CSS Variable Mapping

`lib/cms.ts` → `toCssVars()` maps theme fields directly to Tailwind token overrides:

- `colors.primary` → `--color-amber-600/700/900`
- `colors.accent` → `--color-amber-400`
- `colors.secondary` → `--color-amber-50/100`
- `colors.background` → `--color-stone-50`
- `colors.surface` → `--color-stone-100`
- `colors.text` → `--color-stone-900/700/600/500/400/200`
- `typography.headingFont` → `--font-heading`
- `typography.bodyFont` → `--font-body`
- `shape.borderRadius` → `--theme-border-radius` (and card/button/image overrides)
- `borders.width` → `--theme-border-width`
- `shadows.card` / `shadows.cardHover` → `--theme-shadow-card` / `--theme-shadow-card-hover`
- `spacing.sectionPaddingY/X` → `--section-py` / `--section-px`
- `spacing.containerMax` → `--container-max`
- `spacing.gridGap` → `--grid-gap`
- `nav.height` → `--nav-height`
- `nav.backgroundOpacity` → `--nav-bg-opacity`
- `motion.transitionSpeed` → `--transition-speed`

## Theme-Aware Component Classes

`app/globals.css` defines reusable theme-aware utility classes:

- `.section-py` / `.section-px` — section padding
- `.container-max` — centered max-width container
- `.card-themed` — shadow + border-radius + border + transition (uses `!important` for border-radius and border-width to override Tailwind utility specificity)
- `.button-themed` — border-radius + font-family + transition
- `.image-themed` — border-radius for gallery/menu images

Components should consume these rather than hardcoding Tailwind spacing/shape utilities when the value needs to respond to the active theme.

## Specificity Gotcha

Tailwind utility classes like `rounded-xl`, `border`, `p-6` on a single element will **override** CSS custom properties set in `.card-themed` unless the CSS rule uses `!important` or the Tailwind class is removed. The current approach removes Tailwind shape/border utilities from themed cards and relies on `.card-themed { border-radius: var(--theme-card-radius) !important; border: var(--theme-border-width) solid var(--color-stone-200) !important; }`.

If you add new Tailwind shape/border utilities to a themed component, confirm they don't mask the CSS variable.

## Variance Requirements

When generating N theme variants for a tenant (see `skills/website-builder/SKILL.md` Step 6):

1. Every theme derives colours from `vibe.palette` and `vibe.adjectives`.
2. A **mandatory distinctness check** must be performed before writing any theme file. Two themes are too similar if:
   - Primary hue is within 30° AND luminance within 20%
   - Background luminance within 10%
   - Fewer than 3 of `heroStyle`, `cardStyle`, `buttonStyle`, `navStyle`, `sectionPadding` differ
3. Each new variant must differ from **every previously written variant** in at least **8 of the 16 dimension categories** in `theme-dimensions.md`.
4. Failure → regenerate the weaker variant with a contrasting direction keyword.

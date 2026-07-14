import type { DimensionName, DimensionSpec } from "./types"
import { DIMENSION_NAMES } from "./types"

const SHADOW_MAP: Record<string, string> = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
}

export function compileSpecsToCssVars(specs: Record<DimensionName, DimensionSpec | null>): Record<string, string> {
  const vars: Record<string, string> = {}

  for (const dim of DIMENSION_NAMES) {
    const spec = specs[dim]
    if (!spec) continue
    const compiled = compileDimension(dim, spec)
    Object.assign(vars, compiled)
  }

  return vars
}

function lookupString(spec: DimensionSpec, keys: string[], fallback: string): string {
  for (const key of keys) {
    const val = spec[key]
    if (typeof val === "string" && val.length > 0) return val
  }
  return fallback
}

function lookupNumber(spec: DimensionSpec, keys: string[], fallback: number): number {
  for (const key of keys) {
    const val = spec[key]
    if (typeof val === "number") return val
  }
  return fallback
}

function lookupBoolean(spec: DimensionSpec, keys: string[], fallback: boolean): boolean {
  for (const key of keys) {
    const val = spec[key]
    if (typeof val === "boolean") return val
  }
  return fallback
}

function compileDimension(dim: DimensionName, spec: DimensionSpec): Record<string, string> {
  switch (dim) {
    case "color":
      return compileColor(spec)
    case "typography":
      return compileTypography(spec)
    case "spatial":
      return compileSpatial(spec)
    case "components":
      return compileComponents(spec)
    case "motion":
      return compileMotion(spec)
    case "rhythm":
      return compileRhythm(spec)
    case "wording":
      return {}
    case "imagery":
      return compileImagery(spec)
    case "page-layout":
      return compilePageLayout(spec)
  }
}

function resolveColor(val: unknown, fallback: string): string {
  if (typeof val === "string") return val
  if (typeof val === "object" && val !== null) {
    const v = val as Record<string, unknown>
    return String(v.value ?? v.hex ?? v.light ?? fallback)
  }
  return fallback
}

function compileColor(spec: DimensionSpec): Record<string, string> {
  const c = (spec.palette ?? spec.colors ?? {}) as Record<string, unknown>

  const primary = resolveColor(c.primary, "#6b7280")
  const secondary = resolveColor(c.secondary, "#f3f4f6")
  const background = resolveColor(c.background, "#ffffff")
  const surface = resolveColor(c.surface, "#f9fafb")
  const text = resolveColor(c.text, "#111827")
  const accent = resolveColor(c.accent, "#6b7280")
  const border = resolveColor(c.border, text)
  const success = resolveColor(c.success, "#10b981")
  const error = resolveColor(c.error, "#ef4444")
  const info = resolveColor(c.info, "#3b82f6")
  const overlay = resolveColor(c.overlay, "rgba(0, 0, 0, 0.5)")

  const backgroundValue = String(spec.backgroundValue ?? background)

  // Flat Tailwind color slot mapping (backward compat)
  const flatVars = {
    "--color-amber-600": primary,
    "--color-amber-700": primary,
    "--color-amber-900": primary,
    "--color-amber-400": accent,
    "--color-amber-50": secondary,
    "--color-amber-100": secondary,
    "--color-stone-50": background,
    "--color-stone-100": surface,
    "--color-stone-900": text,
    "--color-stone-700": text,
    "--color-stone-600": text,
    "--color-stone-500": text,
    "--color-stone-400": text,
    "--color-stone-300": border,
    "--color-stone-200": border,
  }

  // Semantic role color variables — independently controllable
  const semanticVars = {
    "--color-section-bg": background,
    "--color-section-bg-alt": secondary,
    "--color-section-bg-inverse": text,
    "--color-section-bg-cta": primary,
    "--color-heading": text,
    "--color-body": text,
    "--color-muted": `color-mix(in srgb, ${text} 55%, ${background})`,
    "--color-label": `color-mix(in srgb, ${text} 75%, ${background})`,
    "--color-link": `color-mix(in srgb, ${text} 85%, ${background})`,
    "--color-link-hover": primary,
    "--color-price": primary,
    "--color-star": accent,
    "--color-check": primary,
    "--color-cta-text": background,
    "--color-cta-muted": secondary,
    "--color-hero-bg": text,
    "--color-hero-text": background,
    "--color-hero-muted": `color-mix(in srgb, ${background} 65%, ${text})`,
    "--color-announcement-bg": primary,
    "--color-announcement-text": background,
    "--color-card-bg": surface,
    "--color-card-border": border,
    "--color-input-border": border,
    "--color-nav-bg": `color-mix(in srgb, ${background} 96%, ${text})`,
    "--color-overlay": overlay,
    "--color-nav-link": `color-mix(in srgb, ${text} 85%, ${background})`,
    "--color-nav-link-hover": primary,
    "--color-footer-bg": `color-mix(in srgb, ${background} 90%, ${text})`,
    "--color-footer-heading": `color-mix(in srgb, ${text} 80%, ${background})`,
    "--color-footer-link": `color-mix(in srgb, ${text} 70%, ${background})`,
    "--color-footer-link-hover": primary,
    "--color-footer-muted": `color-mix(in srgb, ${text} 55%, ${background})`,
    "--color-primary-hover": primary,
    "--color-button-outline-border": border,
    "--color-button-outline-hover-bg": secondary,
    "--color-button-secondary-bg": surface,
    "--color-button-secondary-hover-bg": background,
    "--color-button-ghost-hover-bg": surface,
  }

  // DaisyUI theme color vars — map our palette to daisyUI's CSS vars
  // so all daisyUI components automatically receive our theme.
  const daisyVars: Record<string, string> = {
    "--color-base-100": surface,
    "--color-base-200": background,
    "--color-base-300": border,
    "--color-base-content": text,
    "--color-primary": primary,
    "--color-primary-content": background,
    "--color-secondary": secondary,
    "--color-secondary-content": text,
    "--color-accent": accent,
    "--color-accent-content": text,
    "--color-neutral": text,
    "--color-neutral-content": background,
    "--color-info": info,
    "--color-info-content": background,
    "--color-success": success,
    "--color-success-content": background,
    "--color-error": error,
    "--color-error-content": background,
    "--color-warning": accent,
    "--color-warning-content": background,
  }

  return {
    ...flatVars,
    ...semanticVars,
    ...daisyVars,
    "--color-primary": primary,
    "--color-background": background,
    "--color-background-value": backgroundValue,
    "--color-success": success,
    "--color-error": error,
    "--color-info": info,
  }
}

const FONT_VAR_MAP: Record<string, string> = {
  Inter: "var(--font-inter)",
  Nunito: "var(--font-nunito)",
  "Playfair Display": "var(--font-playfair)",
  Lora: "var(--font-lora)",
  "DM Sans": "var(--font-dm-sans)",
  Fraunces: "var(--font-fraunces)",
  "Space Grotesk": "var(--font-space-grotesk)",
  "Instrument Sans": "var(--font-instrument-sans)",
}

function compileTypography(spec: DimensionSpec): Record<string, string> {
  const heading = spec.heading as Record<string, unknown> | undefined
  const body = spec.body as Record<string, unknown> | undefined

  const headingFont = String(spec.headingFont ?? heading?.font ?? "Inter")
  const bodyFont = String(spec.bodyFont ?? body?.font ?? "Inter")
  const headingWeight = lookupNumber(spec, ["headingWeight", "heading.weight"], 600)
  const bodyWeight = lookupNumber(spec, ["bodyWeight", "body.weight"], 400)
  const headingCase = String(spec.headingCase ?? heading?.case ?? "normal")
  const letterSpacing = String(spec.letterSpacing ?? heading?.tracking ?? "normal")
  const lineHeight = String(spec.lineHeight ?? body?.leading ?? "1.5")

  return {
    "--font-heading": FONT_VAR_MAP[headingFont] ?? `'${headingFont}', sans-serif`,
    "--font-body": FONT_VAR_MAP[bodyFont] ?? `'${bodyFont}', sans-serif`,
    "--font-heading-weight": String(headingWeight),
    "--font-body-weight": String(bodyWeight),
    "--text-transform-heading":
      headingCase === "uppercase"
        ? "uppercase"
        : headingCase === "small-caps"
          ? "small-caps"
          : "none",
    "--letter-spacing": letterSpacing,
    "--line-height": lineHeight,
  }
}

function compileSpatial(spec: DimensionSpec): Record<string, string> {
  const containerMax = lookupString(spec, ["containerMax", "maxWidth", "spacing.containerMax"], "72rem")
  const sectionPy = lookupString(spec, ["sectionPaddingY", "sectionPy", "spacing.sectionPaddingY"], "4rem")
  const sectionPx = lookupString(spec, ["sectionPaddingX", "sectionPx", "spacing.sectionPaddingX"], "1rem")
  const gridGap = lookupString(spec, ["gridGap", "spacing.gridGap"], "1.5rem")
  const contentAlign = lookupString(spec, ["contentAlign", "spacing.contentAlign"], "center")
  const heroEnabled = lookupBoolean(spec, ["heroEnabled", "layout.heroEnabled"], true)
  const headerStyle = lookupString(spec, ["headerStyle", "layout.headerStyle"], "solid")
  const marginWidth = lookupString(spec, ["marginWidth", "layout.marginWidth"], "auto")

  return {
    "--container-max": containerMax,
    "--section-py": sectionPy,
    "--section-px": sectionPx,
    "--grid-gap": gridGap,
    "--content-align": contentAlign,
    "--hero-enabled": heroEnabled ? "block" : "none",
    "--header-style": headerStyle,
    "--margin-width": marginWidth,
  }
}

function compileComponents(spec: DimensionSpec): Record<string, string> {
  const vars: Record<string, string> = {}

  const borderRadius = lookupString(spec, ["borderRadius", "shape.borderRadius"], "0.5rem")
  const cardRadius = lookupString(spec, ["cardRadius", "shape.cardRadius"], borderRadius)
  const buttonRadius = lookupString(spec, ["buttonRadius", "shape.buttonRadius"], borderRadius)
  const imageRadius = lookupString(spec, ["imageRadius", "shape.imageRadius"], borderRadius)
  const borderWidth = lookupString(spec, ["borderWidth", "borders.width"], "1px")
  const borderStyle = lookupString(spec, ["borderStyle", "borders.style"], "solid")

  const cardShadow = lookupString(spec, ["cardShadow", "shadows.card"], "md")
  const cardHoverShadow = lookupString(spec, ["cardHoverShadow", "shadows.cardHover"], "lg")

  const navHeight = lookupString(spec, ["navHeight", "nav.height"], "4rem")

  vars["--theme-border-radius"] = borderRadius
  vars["--theme-card-radius"] = cardRadius
  vars["--theme-button-radius"] = buttonRadius
  vars["--theme-image-radius"] = imageRadius
  vars["--theme-border-width"] = borderWidth
  vars["--theme-border-style"] = borderStyle
  vars["--theme-shadow-card"] = SHADOW_MAP[cardShadow] ?? SHADOW_MAP["md"]
  vars["--theme-shadow-card-hover"] = SHADOW_MAP[cardHoverShadow] ?? SHADOW_MAP["lg"]
  vars["--nav-height"] = navHeight

  // DaisyUI layout/theme vars — maps our shape tokens to daisyUI's CSS vars
  const DEPTH_MAP: Record<string, string> = {
    none: "0",
    sm: "0.2",
    md: "0.4",
    lg: "0.6",
    xl: "0.8",
    "2xl": "1",
  }
  vars["--radius-selector"] = borderRadius
  vars["--radius-field"] = buttonRadius
  vars["--radius-box"] = cardRadius
  vars["--size-selector"] = "0.25rem"
  vars["--size-field"] = "0.25rem"
  vars["--border"] = borderWidth
  vars["--depth"] = DEPTH_MAP[cardShadow] ?? "0.4"
  vars["--noise"] = "0"

  return vars
}

function compileMotion(spec: DimensionSpec): Record<string, string> {
  const rawSpeed = String(spec.transitionSpeed ?? spec.speed ?? "normal")
  const speedMap: Record<string, string> = { fast: "150ms", normal: "300ms", slow: "500ms" }
  const speed = speedMap[rawSpeed] ?? speedMap["normal"]

  const hover = spec.hover as Record<string, unknown> | undefined
  const hoverLift = spec.hoverLift ?? hover?.lift ?? true
  const hoverLiftTransform = hoverLift ? "translateY(-4px)" : "none"
  const rawEasing = String(spec.transitionEasing ?? "ease")
  const easingMap: Record<string, string> = {
    "ease-out": "ease-out",
    "ease-in-out": "ease-in-out",
    "ease-in": "ease-in",
    ease: "ease",
  }
  const easing = easingMap[rawEasing] ?? "ease"

  return {
    "--transition-speed": speed,
    "--motion-hover-lift-transform": hoverLiftTransform,
    "--motion-easing": easing,
  }
}

function compileRhythm(_spec: DimensionSpec): Record<string, string> {
  return {}
}

function compileImagery(spec: DimensionSpec): Record<string, string> {
  const vars: Record<string, string> = {}

  const aspect = String(spec.defaultAspect ?? spec.aspect ?? "4:3")
  vars["--image-default-aspect"] = aspect

  const treatment = String(spec.treatment ?? "cover")
  vars["--image-treatment"] = treatment

  return vars
}

function compilePageLayout(spec: DimensionSpec): Record<string, string> {
  const heroVariant = lookupString(spec, ["heroVariant", "layout.heroVariant"], "fullscreen")
  const navVariant = lookupString(spec, ["navVariant", "layout.navVariant"], "top-bar")
  const sectionContainer = lookupString(spec, ["sectionContainer", "layout.sectionContainer"], "alternating")
  const cardVariant = lookupString(spec, ["cardVariant", "layout.cardVariant"], "elevated")
  const footerVariant = lookupString(spec, ["footerVariant", "layout.footerVariant"], "columns")

  return {
    "--layout-hero-variant": heroVariant,
    "--layout-nav-variant": navVariant,
    "--layout-section-container": sectionContainer,
    "--layout-card-variant": cardVariant,
    "--layout-footer-variant": footerVariant,

    // Structural CSS overrides — same component, architecturally different layout
    "--hero-min-height": heroVariant === "fullscreen" ? "100vh" : heroVariant === "split" ? "60vh" : heroVariant === "overlay" ? "70vh" : "50vh",
    "--hero-overlay-display": heroVariant === "overlay" ? "block" : "none",
    "--hero-content-align": heroVariant === "split" ? "flex-start" : "center",
    "--hero-content-flow": heroVariant === "split" ? "row wrap" : "column",

    "--nav-position": navVariant === "floating" || navVariant === "top-bar" ? "fixed" : "relative",
    "--nav-layout": navVariant === "sidebar" ? "column" : "row",
    "--nav-width": navVariant === "sidebar" ? "16rem" : "100%",
    "--nav-inset-block-start": navVariant === "bottom-bar" ? "auto" : "0",
    "--nav-inset-block-end": navVariant === "bottom-bar" ? "0" : "auto",
    "--nav-inline-size": navVariant === "sidebar" ? "16rem" : "100%",
    "--nav-min-height-block": navVariant === "sidebar" ? "100vh" : "auto",
    "--nav-align": navVariant === "sidebar" ? "flex-start" : "center",

    "--section-columns": sectionContainer === "cards" ? "2" : "1",
    "--section-list-style": sectionContainer === "bordered" ? "solid" : "none",

    "--card-shadow": cardVariant === "elevated" ? "0 10px 15px -3px rgb(0 0 0 / 0.1)" : cardVariant === "flat" ? "none" : cardVariant === "outlined" ? "none" : "none",
    "--card-border-toggle": cardVariant === "outlined" ? "1px solid" : "0px solid",
    "--card-bg-fill": cardVariant === "flat" ? "transparent" : "var(--color-card-bg)",

    "--footer-grid": footerVariant === "simple" || footerVariant === "minimal" ? "1" : footerVariant === "columns" ? "3" : footerVariant === "social" ? "2" : "3",
    "--footer-text-align": footerVariant === "centered" || footerVariant === "simple" ? "center" : "left",
  }
}

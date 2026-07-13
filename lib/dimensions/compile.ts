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
  const harmony = String(spec.harmony ?? "monochromatic")
  const chroma = String(spec.chroma ?? "muted")

  const c = (spec.palette ?? spec.colors ?? {}) as Record<string, unknown>

  const primary = resolveColor(c.primary, "#b45309")
  const secondary = resolveColor(c.secondary, "#fef3c7")
  const background = resolveColor(c.background, "#ffffff")
  const surface = resolveColor(c.surface, "#fffbeb")
  const text = resolveColor(c.text, "#1c1917")
  const accent = resolveColor(c.accent, "#d4a373")
  const border = resolveColor(c.border, text)

  const backgroundType = String(spec.backgroundType ?? "color")
  const backgroundValue = String(spec.backgroundValue ?? background)

  return {
    "--color-primary": primary,
    "--color-secondary": secondary,
    "--color-background": background,
    "--color-surface": surface,
    "--color-text": text,
    "--color-accent": accent,
    "--color-border": border,
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
    "--color-harmony": harmony,
    "--color-chroma": chroma,
    "--color-background-type": backgroundType,
    "--color-background-value": backgroundValue,
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
  const scale = String(spec.scale ?? "1.25")

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
    "--typography-scale": scale,
  }
}

function compileSpatial(spec: DimensionSpec): Record<string, string> {
  const containerMax = lookupString(spec, ["containerMax", "maxWidth", "spacing.containerMax"], "72rem")
  const sectionPy = lookupString(spec, ["sectionPaddingY", "sectionPy", "spacing.sectionPaddingY"], "4rem")
  const sectionPx = lookupString(spec, ["sectionPaddingX", "sectionPx", "spacing.sectionPaddingX"], "1rem")
  const gridGap = lookupString(spec, ["gridGap", "spacing.gridGap"], "1.5rem")
  const contentAlign = lookupString(spec, ["contentAlign", "spacing.contentAlign"], "center")
  const pageColumns = lookupNumber(spec, ["pageColumns", "layout.pageColumns"], 12)
  const sidebar = lookupString(spec, ["sidebar", "layout.sidebar"], "none")
  const heroEnabled = lookupBoolean(spec, ["heroEnabled", "layout.heroEnabled"], true)
  const headerStyle = lookupString(spec, ["headerStyle", "layout.headerStyle"], "solid")
  const designBalance = lookupString(spec, ["designBalance", "layout.designBalance"], "balanced")
  const marginWidth = lookupString(spec, ["marginWidth", "layout.marginWidth"], "auto")

  return {
    "--container-max": containerMax,
    "--section-py": sectionPy,
    "--section-px": sectionPx,
    "--grid-gap": gridGap,
    "--content-align": contentAlign,
    "--page-columns": String(pageColumns),
    "--sidebar-width": sidebar,
    "--hero-enabled": heroEnabled ? "block" : "none",
    "--header-style": headerStyle,
    "--design-balance": designBalance,
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
  const navBgOpacity = lookupNumber(spec, ["navBgOpacity", "nav.backgroundOpacity"], 0.95)

  vars["--theme-border-radius"] = borderRadius
  vars["--theme-card-radius"] = cardRadius
  vars["--theme-button-radius"] = buttonRadius
  vars["--theme-image-radius"] = imageRadius
  vars["--theme-border-width"] = borderWidth
  vars["--theme-border-style"] = borderStyle
  vars["--theme-shadow-card"] = SHADOW_MAP[cardShadow] ?? SHADOW_MAP["md"]
  vars["--theme-shadow-card-hover"] = SHADOW_MAP[cardHoverShadow] ?? SHADOW_MAP["lg"]
  vars["--nav-height"] = navHeight
  vars["--nav-bg-opacity"] = String(navBgOpacity)

  return vars
}

function compileMotion(spec: DimensionSpec): Record<string, string> {
  const rawSpeed = String(spec.transitionSpeed ?? spec.speed ?? "normal")
  const speedMap: Record<string, string> = { fast: "150ms", normal: "300ms", slow: "500ms" }
  const speed = speedMap[rawSpeed] ?? speedMap["normal"]

  const hover = spec.hover as Record<string, unknown> | undefined
  const scroll = spec.scroll as Record<string, unknown> | undefined
  const hoverLift = spec.hoverLift ?? hover?.lift ?? true
  const hoverLiftTransform = hoverLift ? "translateY(-4px)" : "none"
  const fadeIn = spec.fadeIn ?? scroll?.fadeIn ?? false
  const smoothScroll = spec.smoothScroll ?? scroll?.smooth ?? false
  const staggerEnabled = spec.staggerEnabled ?? false
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
    "--motion-hover-lift": hoverLift ? "1" : "0",
    "--motion-hover-lift-transform": hoverLiftTransform,
    "--motion-fade-in": fadeIn ? "1" : "0",
    "--motion-smooth-scroll": smoothScroll ? "1" : "0",
    "--motion-stagger": staggerEnabled ? "1" : "0",
    "--motion-easing": easing,
  }
}

function compileRhythm(spec: DimensionSpec): Record<string, string> {
  const density = String(spec.density ?? "balanced")
  const densitySpacingMap: Record<string, string> = {
    compact: "2rem",
    balanced: "4rem",
    relaxed: "5rem",
    spacious: "6rem",
  }
  return {
    "--rhythm-density": density,
    "--rhythm-section-py": densitySpacingMap[density] ?? "4rem",
  }
}

function compileImagery(spec: DimensionSpec): Record<string, string> {
  const vars: Record<string, string> = {}

  const aspect = String(spec.defaultAspect ?? spec.aspect ?? "4:3")
  vars["--image-default-aspect"] = aspect

  const treatment = String(spec.treatment ?? "cover")
  vars["--image-treatment"] = treatment

  return vars
}

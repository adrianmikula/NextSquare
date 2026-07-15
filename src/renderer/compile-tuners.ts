export interface TunerValues {
  warmth: number
  density: number
  motion: number
  contrast: number
  narrative: number
}

export const DEFAULT_TUNER_VALUES: TunerValues = {
  warmth: 0.5,
  density: 0.5,
  motion: 0.5,
  contrast: 0.5,
  narrative: 0.5,
}

export function compileTunersToCssVars(tuners: Partial<TunerValues>): Record<string, string> {
  const t = { ...DEFAULT_TUNER_VALUES, ...tuners }

  const warmthHue = Math.round(210 - t.warmth * 90)
  const satPct = Math.round(10 + t.warmth * 50)

  return {
    "--tuner-warmth": String(t.warmth),
    "--tuner-density": String(t.density),
    "--tuner-motion": String(t.motion),
    "--tuner-contrast": String(t.contrast),
    "--tuner-narrative": String(t.narrative),

    "--tuner-spacing-scale": `${0.8 + t.density * 0.4}`,
    "--tuner-padding-compact": t.density > 0.6 ? "1rem" : t.density < 0.3 ? "2.5rem" : "1.5rem",
    "--tuner-gap-size": `${1 + t.density * 1.5}rem`,
    "--tuner-section-py": `${3 + (1 - t.density) * 3}rem`,

    "--tuner-transition-duration": `${200 + t.motion * 600}ms`,
    "--tuner-hover-lift": t.motion > 0.5 ? "translateY(-4px)" : "none",
    "--tuner-scale-factor": `${1 + t.motion * 0.05}`,

    "--tuner-border-opacity": `${0.1 + t.contrast * 0.4}`,
    "--tuner-text-weight-heading": t.contrast > 0.5 ? "700" : "400",
    "--tuner-text-weight-body": t.contrast > 0.5 ? "450" : "350",
    "--tuner-shadow-intensity": `${0.05 + t.contrast * 0.15}`,

    "--tuner-section-min-height": `${40 + t.narrative * 40}vh`,
    "--tuner-hero-scale": `${1 + t.narrative * 0.5}`,
    "--tuner-content-max-width": `${36 + (1 - t.narrative) * 24}rem`,

    "--tuner-accent-hue": String(warmthHue),
    "--tuner-accent-saturation": `${satPct}%`,
    "--tuner-accent-lightness": `${45 + (1 - t.warmth) * 10}%`,
  }
}

export function tunerValuesToTasteEngine(tuners: Partial<TunerValues>): Record<string, number> {
  return {
    abstraction: tuners.warmth ?? DEFAULT_TUNER_VALUES.warmth,
    density: tuners.density ?? DEFAULT_TUNER_VALUES.density,
    motion: tuners.motion ?? DEFAULT_TUNER_VALUES.motion,
    contrast: tuners.contrast ?? DEFAULT_TUNER_VALUES.contrast,
    narrative: tuners.narrative ?? DEFAULT_TUNER_VALUES.narrative,
  }
}

export function compileColorBridge(
  tuners: Partial<TunerValues>,
  relief: string,
): Record<string, string> {
  const t = { ...DEFAULT_TUNER_VALUES, ...tuners }

  const hue = Math.round(210 - t.warmth * 90)
  const sat = Math.round(10 + t.warmth * 50)
  const lightBase = 45 + (1 - t.warmth) * 10
  const warmLight = lightBase + 5

  const contrastScale = 0.3 + t.contrast * 0.7

  const reliefLightOffset: Record<string, { hero: number; section: number; card: number }> = {
    flat: { hero: 15, section: 25, card: 20 },
    glassmorphic: { hero: 5, section: 10, card: 40 },
    skeuomorphic: { hero: 10, section: 18, card: 28 },
    neumorphic: { hero: 2, section: 8, card: 22 },
  }
  const off = reliefLightOffset[relief] ?? reliefLightOffset.flat
  const heroLight = warmLight + off.hero
  const sectionLight = warmLight + off.section
  const altLight = sectionLight - 8
  const cardLight = warmLight + off.card

  const textDark = Math.round(15 + (1 - t.contrast) * 20)
  const bodyDark = Math.round(45 + (1 - t.contrast) * 25)
  const mutedDark = Math.round(65 + (1 - t.contrast) * 20)

  const navLight = Math.round(sectionLight - 2)
  const footerBgLight = Math.round(sectionLight - 4)
  const footerHeadingLight = Math.round(textDark + 5)
  const footerLinkLight = Math.round(bodyDark + 3)
  const footerMutedLight = Math.round(mutedDark + 3)

  return {
    "--color-primary": `hsl(${hue}, ${sat}%, ${lightBase}%)`,
    "--color-primary-hover": `hsl(${hue}, ${sat}%, ${lightBase - 8}%)`,
    "--color-primary-muted": `hsl(${hue}, ${sat * 0.5}%, ${lightBase + 15}%)`,

    "--color-hero-bg": `hsl(${hue}, ${sat * 0.3}%, ${heroLight}%)`,
    "--color-hero-text": `hsl(${hue}, 10%, ${textDark}%)`,
    "--color-hero-muted": `hsl(${hue}, 8%, ${bodyDark + 10}%)`,

    "--color-section-bg": `hsl(${hue}, ${sat * 0.15}%, ${sectionLight}%)`,
    "--color-section-bg-alt": `hsl(${hue}, ${sat * 0.2}%, ${altLight}%)`,
    "--color-section-bg-cta": `hsl(${hue}, ${sat * 0.6}%, ${warmLight + 10}%)`,
    "--color-section-bg-inverse": `hsl(${hue}, ${sat * 0.3}%, ${textDark + 5}%)`,

    "--color-card-bg": `hsl(${hue}, ${sat * 0.1}%, ${cardLight}%)`,
    "--color-card-border": `hsl(${hue}, ${sat * 0.15}%, ${bodyDark}%)`,

    "--color-heading": `hsl(${hue}, ${10 + t.contrast * 5}%, ${textDark}%)`,
    "--color-body": `hsl(${hue}, 8%, ${bodyDark}%)`,
    "--color-muted": `hsl(${hue}, 5%, ${mutedDark}%)`,

    "--color-nav-bg": `hsl(${hue}, ${sat * 0.12}%, ${navLight}%)`,
    "--color-footer-bg": `hsl(${hue}, ${sat * 0.15}%, ${footerBgLight}%)`,
    "--color-footer-heading": `hsl(${hue}, ${10 + t.contrast * 5}%, ${footerHeadingLight}%)`,
    "--color-footer-link": `hsl(${hue}, 8%, ${footerLinkLight}%)`,
    "--color-footer-link-hover": `hsl(${hue}, ${sat}%, ${lightBase}%)`,
    "--color-footer-muted": `hsl(${hue}, 5%, ${footerMutedLight}%)`,

    "--color-cta-text": "#ffffff",

    "--color-background-value": `hsl(${hue}, ${sat * 0.1}%, ${sectionLight}%)`,

    "--border": `hsl(${hue}, ${sat * 0.15}%, ${bodyDark}%)`,
    "--surface": `hsl(${hue}, ${sat * 0.12}%, ${sectionLight}%)`,
    "--card": `hsl(${hue}, ${sat * 0.08}%, ${cardLight}%)`,
    "--bg": `hsl(${hue}, ${sat * 0.1}%, ${sectionLight}%)`,

    "--color-shadow": `hsla(${hue}, 10%, ${textDark}%, ${contrastScale * 0.12})`,
  }
}

export function cssVarsToStyleString(vars: Record<string, string>): string {
  const parts: string[] = []
  for (const key of Object.keys(vars)) {
    const val = vars[key]
    if (val !== undefined && val !== null) {
      parts.push(`${key}:${val}`)
    }
  }
  return parts.join(";")
}

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

export function cssVarsToStyleString(vars: Record<string, string>): string {
  return Object.entries(vars)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")
}

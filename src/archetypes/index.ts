import type { Relief, Finish, DesignLanguage } from "@/src/schema/site-config"

export const RELIEF_OPTIONS: Relief[] = ["flat", "glassmorphic", "skeuomorphic", "neumorphic"]
export const FINISH_OPTIONS: Finish[] = ["matte", "frosted", "tinted", "glossy"]

export interface ArchetypeTokens {
  surfaceBg: string
  surfaceShadow: string
  surfaceBorder: string
  cardBg: string
  cardShadow: string
  buttonShape: string
  inputStyle: string
  navStyle: string
}

const reliefTokens: Record<Relief, Partial<ArchetypeTokens>> = {
  flat: {
    surfaceShadow: "none",
    surfaceBorder: "1px solid var(--border)",
    cardShadow: "none",
  },
  glassmorphic: {
    surfaceBg: "rgba(255, 255, 255, 0.15)",
    surfaceShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    surfaceBorder: "1px solid rgba(255, 255, 255, 0.2)",
    cardBg: "rgba(255, 255, 255, 0.1)",
    cardShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  },
  skeuomorphic: {
    surfaceShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.15)",
    surfaceBorder: "1px solid var(--border)",
    cardShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.12)",
  },
  neumorphic: {
    surfaceBg: "var(--bg)",
    surfaceShadow: "8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.8)",
    surfaceBorder: "none",
    cardBg: "var(--bg)",
    cardShadow: "6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px rgba(255,255,255,0.8)",
  },
}

const finishTokens: Record<Finish, Partial<ArchetypeTokens>> = {
  matte: {
    surfaceBg: "var(--surface)",
  },
  frosted: {
    surfaceBg: "rgba(255, 255, 255, 0.08)",
    surfaceBorder: "1px solid rgba(255, 255, 255, 0.1)",
  },
  tinted: {
    surfaceBg: "color-mix(in srgb, var(--surface) 85%, var(--primary) 15%)",
  },
  glossy: {
    surfaceBg: "linear-gradient(135deg, var(--surface) 0%, color-mix(in srgb, var(--surface) 70%, white 30%) 100%)",
    surfaceShadow: "0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)",
  },
}

export function getArchetypeTokens(lang: DesignLanguage): ArchetypeTokens {
  const base: ArchetypeTokens = {
    surfaceBg: "var(--surface)",
    surfaceShadow: "0 1px 3px rgba(0,0,0,0.1)",
    surfaceBorder: "1px solid var(--border)",
    cardBg: "var(--card)",
    cardShadow: "0 1px 3px rgba(0,0,0,0.08)",
    buttonShape: "rounded",
    inputStyle: "outlined",
    navStyle: "standard",
  }

  const r = reliefTokens[lang.relief] ?? {}
  const f = finishTokens[lang.finish] ?? {}

  return { ...base, ...r, ...f }
}

export function archetypeToDataAttrs(lang: DesignLanguage): Record<string, string> {
  return {
    "data-relief": lang.relief,
    "data-finish": lang.finish,
    "data-shape": lang.shape,
  }
}

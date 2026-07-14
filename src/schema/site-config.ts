export type Relief = "flat" | "glassmorphic" | "skeuomorphic" | "neumorphic"
export type Finish = "matte" | "frosted" | "tinted" | "glossy"
export type ShapeCurve = "arc" | "squircle" | "superellipse" | "clothoid"

export interface DesignLanguage {
  relief: Relief
  finish: Finish
  shape: ShapeCurve
}

export interface SiteMeta {
  name: string
  industry: string
  tone: string
}

export interface SiteConfig {
  meta: SiteMeta
  designLanguage: DesignLanguage
  tuners: Record<string, number>
  spec: Record<string, unknown>
  content: Record<string, string>
}

export interface GeneDefinition {
  name: string
  props: Record<string, { type: string; required?: boolean }>
  tuners: string[]
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  meta: {
    name: "My Site",
    industry: "general",
    tone: "professional",
  },
  designLanguage: {
    relief: "flat",
    finish: "matte",
    shape: "squircle",
  },
  tuners: {
    warmth: 0.5,
    density: 0.5,
    motion: 0.5,
    contrast: 0.5,
    narrative: 0.5,
  },
  spec: {
    root: "page",
    elements: {},
  },
  content: {},
}

import type { ShapeCurve } from "@/src/schema/site-config"
import type { ArchetypeTokens } from "./index"

export interface ShapeTokens {
  cornerRadius: string
  cornerSmoothing: number
  dividerStyle: string
  decorativePattern: string | null
}

const shapeConfigs: Record<ShapeCurve, ShapeTokens> = {
  arc: {
    cornerRadius: "8px",
    cornerSmoothing: 0,
    dividerStyle: "straight",
    decorativePattern: null,
  },
  squircle: {
    cornerRadius: "12px",
    cornerSmoothing: 0.6,
    dividerStyle: "rounded",
    decorativePattern: null,
  },
  superellipse: {
    cornerRadius: "16px",
    cornerSmoothing: 0.8,
    dividerStyle: "curved",
    decorativePattern: null,
  },
  clothoid: {
    cornerRadius: "20px",
    cornerSmoothing: 1,
    dividerStyle: "organic",
    decorativePattern: "blob",
  },
}

export function getShapeTokens(shape: ShapeCurve): ShapeTokens {
  return shapeConfigs[shape] ?? shapeConfigs.squircle
}

export function archetypeTokensToCssVars(
  archetypeTokens: ArchetypeTokens,
  shapeTokens: ShapeTokens,
): Record<string, string> {
  return {
    "--arch-surface-bg": archetypeTokens.surfaceBg,
    "--arch-surface-shadow": archetypeTokens.surfaceShadow,
    "--arch-surface-border": archetypeTokens.surfaceBorder,
    "--arch-card-bg": archetypeTokens.cardBg,
    "--arch-card-shadow": archetypeTokens.cardShadow,
    "--arch-corner-radius": shapeTokens.cornerRadius,
    "--arch-corner-smoothing": String(shapeTokens.cornerSmoothing),
    "--arch-divider-style": shapeTokens.dividerStyle,
  }
}

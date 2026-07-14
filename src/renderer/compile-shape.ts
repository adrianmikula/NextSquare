import type { ShapeCurve } from "@/src/schema/site-config"

export interface ShapeCssVars {
  "--shape-corner-radius": string
  "--shape-corner-smoothing": string
  "--shape-button-radius": string
  "--shape-card-radius": string
  "--shape-image-radius": string
  "--shape-divider-style": string
  "--shape-decorative-pattern": string
  "--shape-surface-blur": string
}

const shapeConfigs: Record<ShapeCurve, Omit<ShapeCssVars, "--shape-decorative-pattern">> = {
  arc: {
    "--shape-corner-radius": "8px",
    "--shape-corner-smoothing": "0",
    "--shape-button-radius": "6px",
    "--shape-card-radius": "8px",
    "--shape-image-radius": "6px",
    "--shape-divider-style": "solid",
    "--shape-surface-blur": "0px",
  },
  squircle: {
    "--shape-corner-radius": "12px",
    "--shape-corner-smoothing": "0.6",
    "--shape-button-radius": "10px",
    "--shape-card-radius": "12px",
    "--shape-image-radius": "10px",
    "--shape-divider-style": "solid",
    "--shape-surface-blur": "0px",
  },
  superellipse: {
    "--shape-corner-radius": "16px",
    "--shape-corner-smoothing": "0.85",
    "--shape-button-radius": "14px",
    "--shape-card-radius": "16px",
    "--shape-image-radius": "14px",
    "--shape-divider-style": "dashed",
    "--shape-surface-blur": "0px",
  },
  clothoid: {
    "--shape-corner-radius": "24px",
    "--shape-corner-smoothing": "1",
    "--shape-button-radius": "20px",
    "--shape-card-radius": "24px",
    "--shape-image-radius": "20px",
    "--shape-divider-style": "dotted",
    "--shape-surface-blur": "2px",
  },
}

const decorativePatterns: Record<ShapeCurve, string> = {
  arc: "none",
  squircle: "none",
  superellipse: "circuit-board",
  clothoid: "blob-scene",
}

export function compileShapeToCssVars(shape: ShapeCurve): Record<string, string> {
  const base = shapeConfigs[shape] ?? shapeConfigs.squircle
  const pattern = decorativePatterns[shape] ?? decorativePatterns.squircle

  const vars: Record<string, string> = {
    ...base,
    "--shape-decorative-pattern": pattern,
  }

  return vars
}

export function getShapeLabel(shape: ShapeCurve): string {
  const labels: Record<ShapeCurve, string> = {
    arc: "Arc — simple rounded corners",
    squircle: "Squircle — smooth continuous curve",
    superellipse: "Superellipse — organic rounded rect",
    clothoid: "Clothoid — fluid, elegant curves",
  }
  return labels[shape] ?? labels.squircle
}

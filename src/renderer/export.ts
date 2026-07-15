import type { SiteConfig } from "@/src/schema/site-config"
import { compileTunersToCssVars, cssVarsToStyleString, DEFAULT_TUNER_VALUES } from "./compile-tuners"
import { compileShapeToCssVars } from "./compile-shape"
import { getArchetypeTokens } from "@/src/archetypes"
import { archetypeTokensToCssVars, getShapeTokens } from "@/src/archetypes/tokens"

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function collectPageCss(): string {
  const parts: string[] = []
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        parts.push(rule.cssText)
      }
    } catch {
      // CORS-blocked or cross-origin stylesheets are silently skipped
    }
  }
  return parts.join("\n")
}

function generateFallbackHtml(config: SiteConfig): string {
  const tunerCssVars = compileTunersToCssVars({
    warmth: (config.tuners.warmth as number) ?? DEFAULT_TUNER_VALUES.warmth,
    density: (config.tuners.density as number) ?? DEFAULT_TUNER_VALUES.density,
    motion: (config.tuners.motion as number) ?? DEFAULT_TUNER_VALUES.motion,
    contrast: (config.tuners.contrast as number) ?? DEFAULT_TUNER_VALUES.contrast,
    narrative: (config.tuners.narrative as number) ?? DEFAULT_TUNER_VALUES.narrative,
  })
  const shapeCssVars = compileShapeToCssVars(config.designLanguage.shape)
  const archetypeTokens = getArchetypeTokens(config.designLanguage)
  const shapeTokens = getShapeTokens(config.designLanguage.shape)
  const archCssVars = archetypeTokensToCssVars(archetypeTokens, shapeTokens)
  const cssVarsString = cssVarsToStyleString({ ...tunerCssVars, ...shapeCssVars })
  const archCssVarsString = cssVarsToStyleString(archCssVars)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(config.meta?.name ?? "Generated Site")}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,sans-serif;font-size:16px;line-height:1.5}
h1,h2,h3,h4{line-height:1.2;letter-spacing:-0.02em}
:root{${cssVarsString}${archCssVarsString}}
[data-site-page]{${cssVarsString}${archCssVarsString}}
</style>
</head>
<body>
<p style="padding:2rem;text-align:center;color:#666">Preview content unavailable — open this page in the live preview and try again.</p>
</body>
</html>`
}

export function generateStandaloneHtml(config: SiteConfig): string {
  const pageContent = document.querySelector("[data-site-page]")
  if (!pageContent) {
    return generateFallbackHtml(config)
  }

  const bodyHtml = pageContent.outerHTML
  const css = collectPageCss()

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(config.meta?.name ?? "Generated Site")}</title>
<style>${css}</style>
</head>
<body>${bodyHtml}</body>
</html>`
}

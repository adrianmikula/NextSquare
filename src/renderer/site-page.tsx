"use client"

import { useEffect } from "react"
import { SoltanaProvider } from "@soltana-ui/react"
import { TasteProvider, useTuners } from "taste-engine/react"
import { Renderer } from "@json-render/react"
import type { Spec } from "@json-render/core"

import { componentRegistry } from "./registry"
import { compileTunersToCssVars, cssVarsToStyleString } from "./compile-tuners"
import { compileShapeToCssVars } from "./compile-shape"
import type { SiteConfig } from "@/src/schema/site-config"

function TunerInjector({ tuners }: { tuners: Record<string, number> }) {
  const { setTuners } = useTuners()

  useEffect(() => {
    setTuners({
      abstraction: (tuners.warmth as number) ?? 0.5,
      density: (tuners.density as number) ?? 0.5,
      motion: (tuners.motion as number) ?? 0.5,
      contrast: (tuners.contrast as number) ?? 0.5,
      narrative: (tuners.narrative as number) ?? 0.5,
    })
  }, [tuners, setTuners])

  return null
}

function CssVarInjector({ cssVars }: { cssVars: Record<string, string> }) {
  const styleString = cssVarsToStyleString(cssVars)

  return (
    <style>
      {`:root{${styleString}}`}
    </style>
  )
}

export interface SitePageProps {
  config: SiteConfig
}

export function SitePage({ config }: SitePageProps) {
  const tunerCssVars = compileTunersToCssVars({
    warmth: (config.tuners.warmth as number) ?? 0.5,
    density: (config.tuners.density as number) ?? 0.5,
    motion: (config.tuners.motion as number) ?? 0.5,
    contrast: (config.tuners.contrast as number) ?? 0.5,
    narrative: (config.tuners.narrative as number) ?? 0.5,
  })

  const shapeCssVars = compileShapeToCssVars(config.designLanguage.shape)

  const allCssVars = { ...tunerCssVars, ...shapeCssVars }

  return (
    <SoltanaProvider
      config={{
        relief: config.designLanguage.relief as any,
        finish: config.designLanguage.finish as any,
      }}
    >
      <TasteProvider defaultTheme="hospitalityWarm">
        <TunerInjector tuners={config.tuners} />
        <CssVarInjector cssVars={allCssVars} />
        <div
          data-relief={config.designLanguage.relief}
          data-finish={config.designLanguage.finish}
          data-shape={config.designLanguage.shape}
        >
          <Renderer
            spec={config.spec as unknown as Spec}
            registry={componentRegistry}
          />
        </div>
      </TasteProvider>
    </SoltanaProvider>
  )
}

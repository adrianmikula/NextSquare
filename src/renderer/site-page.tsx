"use client"

import { useEffect } from "react"
import { SoltanaProvider } from "@soltana-ui/react"
import { TasteProvider, useTuners } from "taste-engine/react"
import { Renderer, StateProvider, ActionProvider, VisibilityProvider } from "@json-render/react"
import type { Spec } from "@json-render/core"
import type { Relief, Finish } from "soltana-ui"

import { componentRegistry } from "./registry"
import { compileTunersToCssVars, compileColorBridge, cssVarsToStyleString } from "./compile-tuners"
import { compileShapeToCssVars } from "./compile-shape"
import { getArchetypeTokens } from "@/src/archetypes"
import { archetypeTokensToCssVars, getShapeTokens } from "@/src/archetypes/tokens"
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

const SITE_PAGE_SCOPE = "data-site-page"

function CssVarInjector({ cssVars }: { cssVars: Record<string, string> }) {
  const styleString = cssVarsToStyleString(cssVars)

  useEffect(() => {
    const root = document.documentElement
    const entries = Object.entries(cssVars)
    entries.forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    return () => {
      entries.forEach(([key]) => root.style.removeProperty(key))
    }
  }, [cssVars])

  return (
    <>
      <style>{`:root{${styleString}}`}</style>
      <style>{`[${SITE_PAGE_SCOPE}]{${styleString}}`}</style>
    </>
  )
}

function mergeContentIntoSpec(
  spec: Record<string, unknown>,
  content: Record<string, string>,
): Record<string, unknown> {
  if (!content || Object.keys(content).length === 0) return spec

  const elements = { ...((spec.elements as Record<string, unknown>) ?? {}) }

  for (const [contentKey, contentValue] of Object.entries(content)) {
    const hyphenIdx = contentKey.indexOf("-")
    if (hyphenIdx === -1) continue
    const typePrefix = contentKey.slice(0, hyphenIdx).toLowerCase()
    const propName = contentKey.slice(hyphenIdx + 1)

    for (const [elemId, elem] of Object.entries(elements)) {
      const elemObj = elem as Record<string, unknown>
      const elemType = ((elemObj.type as string) ?? "").toLowerCase()
      if (!elemType.startsWith(typePrefix)) continue

      const props = { ...((elemObj.props as Record<string, unknown>) ?? {}) }
      if (propName in props) {
        props[propName] = contentValue
        elements[elemId] = { ...elemObj, props }
      }
    }
  }

  return { ...spec, elements }
}

export interface SitePageProps {
  config: SiteConfig
}

export function SitePage({ config }: SitePageProps) {
  const spec = mergeContentIntoSpec(
    config.spec as Record<string, unknown>,
    config.content ?? {},
  ) as unknown as Spec
  const tunerCssVars = compileTunersToCssVars({
    warmth: (config.tuners.warmth as number) ?? 0.5,
    density: (config.tuners.density as number) ?? 0.5,
    motion: (config.tuners.motion as number) ?? 0.5,
    contrast: (config.tuners.contrast as number) ?? 0.5,
    narrative: (config.tuners.narrative as number) ?? 0.5,
  })

  const shapeCssVars = compileShapeToCssVars(config.designLanguage.shape)
  const colorBridge = compileColorBridge(config.tuners, config.designLanguage.relief)
  const archetypeTokens = getArchetypeTokens(config.designLanguage)
  const shapeTokens = getShapeTokens(config.designLanguage.shape)
  const archCssVars = archetypeTokensToCssVars(archetypeTokens, shapeTokens)

  const allCssVars = { ...tunerCssVars, ...shapeCssVars, ...colorBridge, ...archCssVars }

  return (
    <SoltanaProvider
      config={{
        relief: config.designLanguage.relief as Relief,
        finish: config.designLanguage.finish as Finish,
      }}
    >
      <TasteProvider defaultTheme="hospitalityWarm">
        <TunerInjector tuners={config.tuners} />
        <CssVarInjector cssVars={allCssVars} />
        <div
          data-relief={config.designLanguage.relief}
          data-finish={config.designLanguage.finish}
          data-shape={config.designLanguage.shape}
          {...{ [SITE_PAGE_SCOPE]: "" }}
        >
          <StateProvider>
            <ActionProvider>
              <VisibilityProvider>
                <Renderer
                  spec={spec}
                  registry={componentRegistry}
                  fallback={({ children }) => <>{children}</>}
                />
              </VisibilityProvider>
            </ActionProvider>
          </StateProvider>
        </div>
      </TasteProvider>
    </SoltanaProvider>
  )
}

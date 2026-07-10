"use client"

import { useEffect } from "react"
import { useSyncExternalStore } from "react"
import { parseDimensionState, compileSpecsToCssVars, resolveDimensionSpecs } from "@/lib/dimensions/client"
import type { SpecData, BundleDimInfo } from "@/lib/dimensions/resolve"

const FALLBACK_A_VARS: Record<string, string> = {
  "--color-amber-600": "#2A6B7C",
  "--color-amber-700": "#205a68",
  "--color-amber-900": "#163f47",
  "--color-amber-400": "#4e9aad",
  "--color-amber-50": "#E4F0F2",
  "--color-amber-100": "#cce5ea",
  "--color-stone-50": "#F7F9FA",
  "--color-stone-100": "#FFFFFF",
  "--color-stone-900": "#192426",
  "--color-stone-700": "#323b3c",
  "--color-stone-600": "#3f4849",
  "--color-stone-500": "#5a6364",
  "--color-stone-400": "#8c9394",
  "--color-stone-200": "#D0DDE0",
  "--font-heading": "'Inter', sans-serif",
  "--font-body": "'Inter', sans-serif",
  "--text-transform-heading": "none",
  "--letter-spacing": "normal",
  "--line-height": "1.5",
  "--theme-border-radius": "0.75rem",
  "--theme-card-radius": "0.75rem",
  "--theme-button-radius": "9999px",
  "--theme-image-radius": "0.75rem",
  "--theme-border-width": "1px",
  "--theme-shadow-card": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  "--theme-shadow-card-hover": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "--section-py": "4rem",
  "--section-px": "1rem",
  "--container-max": "72rem",
  "--grid-gap": "1.5rem",
  "--nav-height": "5rem",
  "--nav-bg-opacity": "0.95",
  "--transition-speed": "300ms",
  "--content-align": "center",
}

const FALLBACK_DIMENSION_VARS: Record<string, Record<string, string>> = {
  A: FALLBACK_A_VARS,
  B: {
    "--color-amber-600": "#15803d",
    "--color-amber-700": "#166534",
    "--color-amber-900": "#14532d",
    "--color-amber-400": "#4ade80",
    "--color-amber-50": "#f0fdf4",
    "--color-amber-100": "#dcfce7",
    "--color-stone-50": "#f8fafc",
    "--color-stone-100": "#ffffff",
    "--color-stone-900": "#0f172a",
    "--color-stone-700": "#334155",
    "--color-stone-600": "#475569",
    "--color-stone-500": "#64748b",
    "--color-stone-400": "#94a3b8",
    "--color-stone-200": "#e2e8f0",
    "--font-heading": "'Inter', sans-serif",
    "--font-body": "'Inter', sans-serif",
    "--text-transform-heading": "none",
    "--letter-spacing": "normal",
    "--line-height": "1.5",
    "--theme-border-radius": "0.5rem",
    "--theme-card-radius": "0.5rem",
    "--theme-button-radius": "0.5rem",
    "--theme-image-radius": "0.5rem",
    "--theme-border-width": "1px",
    "--theme-shadow-card": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "--theme-shadow-card-hover": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    "--section-py": "4rem",
    "--section-px": "1rem",
    "--container-max": "72rem",
    "--grid-gap": "1.5rem",
    "--nav-height": "4rem",
    "--nav-bg-opacity": "0.95",
    "--transition-speed": "300ms",
    "--content-align": "center",
  },
}

function applyCssVars(vars: Record<string, string>) {
  const root = document.documentElement
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

function clearCssVars(allKeys: string[]) {
  const root = document.documentElement
  allKeys.forEach((key) => {
    root.style.removeProperty(key)
  })
}

function createThemeSubscribe() {
  let origPushState: typeof history.pushState
  let origReplaceState: typeof history.replaceState

  return function subscribe(cb: () => void) {
    window.addEventListener("popstate", cb)
    origPushState = history.pushState
    origReplaceState = history.replaceState
    history.pushState = function (this: History, ...args: Parameters<typeof history.pushState>) {
      origPushState.apply(this, args)
      queueMicrotask(cb)
    }
    history.replaceState = function (this: History, ...args: Parameters<typeof history.replaceState>) {
      origReplaceState.apply(this, args)
      queueMicrotask(cb)
    }
    return () => {
      window.removeEventListener("popstate", cb)
      history.pushState = origPushState
      history.replaceState = origReplaceState
    }
  }
}

const getThemeSubscribe = createThemeSubscribe()

export function ClientThemeSync({ bundles = [], specData }: { bundles?: BundleDimInfo[], specData?: SpecData }) {
  const search = useSyncExternalStore(getThemeSubscribe, () => window.location.search, () => "")
  const searchParams = new URLSearchParams(search)

  const hasDimensionParams = searchParams.has("bundle") || Array.from(searchParams.keys()).some(
    (k) => ["spatial", "color", "typography", "wording", "imagery", "components", "rhythm", "motion"].includes(k)
  )

  const hasOldThemeParam = searchParams.has("theme")

  if (hasDimensionParams) {
    return <DimensionThemeSync search={search} bundles={bundles} specData={specData} />
  }

  if (hasOldThemeParam) {
    return <LegacyThemeSync search={search} />
  }

  return null
}

function LegacyThemeSync({ search }: { search: string }) {
  const searchParams = new URLSearchParams(search)
  const variant = searchParams.get("theme")
  const vars = variant === "B" || variant === "b" ? FALLBACK_DIMENSION_VARS.B : FALLBACK_DIMENSION_VARS.A

  useEffect(() => {
    if (variant) {
      applyCssVars(vars)
    }
    return () => {
      if (variant) {
        clearCssVars(Object.keys(vars))
      }
    }
  }, [variant, vars])

  return null
}

function DimensionThemeSync({ search, bundles = [], specData }: { search: string; bundles?: BundleDimInfo[], specData?: SpecData }) {
  useEffect(() => {
    const searchParams = new URLSearchParams(search)
    try {
      const state = parseDimensionState(searchParams, bundles)
      const specs = resolveDimensionSpecs(state, specData)
      const vars = compileSpecsToCssVars(specs)
      applyCssVars(vars)

      return () => {
        clearCssVars(Object.keys(vars))
      }
    } catch {
      applyCssVars(FALLBACK_DIMENSION_VARS.A)
    }
  }, [search, bundles, specData])

  return null
}

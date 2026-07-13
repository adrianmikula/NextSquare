"use client"

import { useEffect } from "react"
import { useSyncExternalStore } from "react"
import { parseDimensionState, compileSpecsToCssVars, resolveDimensionSpecs } from "@/lib/dimensions/client"
import type { SpecData, BundleDimInfo } from "@/lib/dimensions/resolve"



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

  const hasDimensionParams = new URLSearchParams(search).has("bundle") || Array.from(new URLSearchParams(search).keys()).some(
    (k) => ["spatial", "color", "typography", "wording", "imagery", "components", "rhythm", "motion"].includes(k)
  )

  if (hasDimensionParams) {
    return <DimensionThemeSync search={search} bundles={bundles} specData={specData} />
  }

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
      // globals.css provides sensible defaults
    }
  }, [search, bundles, specData])

  return null
}

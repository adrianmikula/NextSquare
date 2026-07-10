"use client"

import { useEffect, useMemo } from "react"
import type { DimensionName, DimensionSpec } from "@/lib/dimensions/client"
import { compileSpecsToCssVars } from "@/lib/dimensions/client"

export function ThemeProvider({
  cssVars,
  dimensionSpecs,
  children,
}: {
  cssVars?: Record<string, string>
  dimensionSpecs?: Record<DimensionName, DimensionSpec | null>
  children: React.ReactNode
}) {
  const compiled = useMemo(() => {
    if (dimensionSpecs) return compileSpecsToCssVars(dimensionSpecs)
    return cssVars ?? null
  }, [dimensionSpecs, cssVars])

  useEffect(() => {
    if (!compiled) return
    const root = document.documentElement
    const entries = Object.entries(compiled)

    entries.forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    return () => {
      entries.forEach(([key]) => {
        root.style.removeProperty(key)
      })
    }
  }, [compiled])

  return <>{children}</>
}

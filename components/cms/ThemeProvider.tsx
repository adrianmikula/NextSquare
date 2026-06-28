"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export function ThemeProvider({ tenant, children }: { tenant: string; children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const themeVariant = searchParams.get("theme") || "a"

  useEffect(() => {
    const params = new URLSearchParams({ tenant, variant: themeVariant })
    fetch(`/api/cms/theme?${params.toString()}`)
      .then((res) => res.json())
      .then((theme) => {
        if (!theme || !theme.colors) return
        const root = document.documentElement
        const colors = theme.colors as Record<string, string>
        root.style.setProperty("--theme-primary", colors.primary || "#212121")
        root.style.setProperty("--theme-secondary", colors.secondary || "#f5f5f0")
        root.style.setProperty("--theme-background", colors.background || "#ffffff")
        root.style.setProperty("--theme-surface", colors.surface || "#f5f5f0")
        root.style.setProperty("--theme-text", colors.text || "#212121")
        root.style.setProperty("--theme-accent", colors.accent || "#d4a373")
      })
      .catch(() => {})
  }, [tenant, themeVariant])

  return <>{children}</>
}

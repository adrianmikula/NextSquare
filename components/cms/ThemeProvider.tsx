"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import type { ThemeConfig } from "@/lib/cms"

export function ThemeProvider({
  tenant,
  cssVars,
  children,
}: {
  tenant: string
  cssVars?: Record<string, string>
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const themeVariant = searchParams.get("theme") || "a"

  useEffect(() => {
    if (cssVars) {
      const root = document.documentElement
      Object.entries(cssVars).forEach(([key, value]) => {
        root.style.setProperty(key, value)
      })
    }
  }, [cssVars])

  useEffect(() => {
    if (cssVars) return
    const params = new URLSearchParams({ tenant, variant: themeVariant })
    fetch(`/api/cms/theme?${params.toString()}`)
      .then((res) => res.json())
      .then((theme: ThemeConfig) => {
        if (!theme?.colors) return
        const vars: Record<string, string> = {
          "--theme-primary": theme.colors.primary || "#212121",
          "--theme-secondary": theme.colors.secondary || "#f5f5f0",
          "--theme-background": theme.colors.background || "#ffffff",
          "--theme-surface": theme.colors.surface || "#f5f5f0",
          "--theme-text": theme.colors.text || "#212121",
          "--theme-accent": theme.colors.accent || "#d4a373",
        }
        const root = document.documentElement
        Object.entries(vars).forEach(([key, value]) => {
          root.style.setProperty(key, value)
        })
      })
      .catch(() => {})
  }, [tenant, themeVariant, cssVars])

  return <>{children}</>
}

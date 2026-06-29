"use client"

import { useEffect } from "react"
import type { ThemeConfig } from "@/lib/cms"

const MOTION_SPEED: Record<string, string> = {
  fast: "150ms",
  normal: "300ms",
  slow: "500ms",
}

export function ThemeProvider({
  tenant,
  cssVars,
  children,
}: {
  tenant: string
  cssVars?: Record<string, string>
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!cssVars) return
    const root = document.documentElement
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [cssVars])

  return <>{children}</>
}
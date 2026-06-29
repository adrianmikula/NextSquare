import { NextRequest, NextResponse } from "next/server"
import { readTheme, ACTIVE_THEME_VARIANT, listThemeVariants, toCssVars } from "@/lib/cms"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const variant = searchParams.get("variant") || ACTIVE_THEME_VARIANT
  const theme = readTheme(variant)

  if (!theme) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 })
  }

  return NextResponse.json({
    variant,
    theme,
    cssVars: toCssVars(theme, variant),
    availableVariants: listThemeVariants(),
  })
}

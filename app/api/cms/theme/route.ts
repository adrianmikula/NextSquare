import { NextRequest, NextResponse } from "next/server"
import { readTheme, getActiveTenant, getActiveThemeVariant } from "@/lib/cms"

export async function GET(request: NextRequest) {
  const tenant = request.nextUrl.searchParams.get("tenant") || getActiveTenant()
  const variant = request.nextUrl.searchParams.get("variant") || getActiveThemeVariant()

  const theme = readTheme(tenant, variant)
  if (!theme) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 })
  }

  return NextResponse.json(theme)
}
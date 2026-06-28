import { NextRequest, NextResponse } from "next/server"
import { readTheme } from "@/lib/cms"

export async function GET(request: NextRequest) {
  const tenant = request.nextUrl.searchParams.get("tenant") || "aydins-cafe"
  const variant = request.nextUrl.searchParams.get("variant") || "a"

  const theme = readTheme(tenant, variant as "a" | "b")
  if (!theme) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 })
  }

  return NextResponse.json(theme)
}

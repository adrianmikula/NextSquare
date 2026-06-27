import { NextRequest, NextResponse } from "next/server"
import { getCmsAdapter } from "@/lib/cms/adapter"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get("slug")

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 })
  }

  try {
    const adapter = getCmsAdapter()
    const page = await adapter.getPage(slug)
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }
    return NextResponse.json(page)
  } catch {
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 })
  }
}

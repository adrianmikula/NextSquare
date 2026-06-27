import { NextRequest, NextResponse } from "next/server"
import { getCmsAdapter } from "@/lib/cms/adapter"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const preview = searchParams.get("preview")
  const token = searchParams.get("token")
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined

  const isPreview = preview === "true"
  const previewToken = isPreview ? token : undefined

  try {
    const adapter = getCmsAdapter()
    const posts = await adapter.listBlogPosts(limit, previewToken)
    return NextResponse.json(posts)
  } catch {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

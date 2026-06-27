import { NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret")
  const previewSecret = process.env.CMS_PREVIEW_SECRET

  if (previewSecret && secret !== previewSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const paths: string[] = Array.isArray(body.paths) ? body.paths : []

    revalidateTag("cms-pages")
    revalidateTag("cms-blog")

    for (const path of paths) {
      revalidatePath(path)
    }

    return NextResponse.json({ revalidated: true, paths })
  } catch {
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" })
}

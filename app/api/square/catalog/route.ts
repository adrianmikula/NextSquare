import { NextRequest } from "next/server"
import { fetchMenu } from "@/lib/square/catalog"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("id")

    if (itemId) {
      const { fetchItemBySlug } = await import("@/lib/square/catalog")
      const item = await fetchItemBySlug(itemId)
      if (!item) {
        return Response.json({ error: "Item not found" }, { status: 404 })
      }
      return Response.json(item)
    }

    const menu = await fetchMenu()
    return Response.json(menu, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    console.error("Catalog fetch error:", error)
    return Response.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    )
  }
}

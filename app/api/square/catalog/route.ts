import { NextRequest } from "next/server"
import { fetchMenu, fetchItemBySlug } from "@/lib/square/catalog"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("id")

    if (itemId) {
      const item = await fetchItemBySlug(itemId)
      if (!item) {
        return Response.json({ error: "Item not found" }, { status: 404 })
      }
      return new Response(
        JSON.stringify(item, (_key, value) =>
          typeof value === "bigint" ? Number(value) : value
        ),
        { headers: { "Content-Type": "application/json" } }
      )
    }

    const menu = await fetchMenu()
    return new Response(
      JSON.stringify(menu, (_key, value) =>
        typeof value === "bigint" ? Number(value) : value
      ),
      {
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    logger("catalog").error("Menu fetch error", error instanceof Error ? error : new Error(String(error)))
    return Response.json(
      { error: "Failed to fetch menu. Please try again later." },
      { status: 500 }
    )
  }
}

import { NextRequest } from "next/server"
import { Client, Environment } from "square/legacy"
import { getSession } from "@/lib/auth/session"

const { catalogApi } = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment:
    process.env.SQUARE_ENVIRONMENT === "production" ? Environment.Production : Environment.Sandbox,
})

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (id) {
    const { result } = await catalogApi.retrieveCatalogObject(id, true)
    return Response.json(result.object)
  }

  const { result } = await catalogApi.searchCatalogItems({
    productTypes: ["REGULAR"],
    sortOrder: "ASC",
  })

  return Response.json({
    items: result.items ?? [],
    count: result.items?.length ?? 0,
  })
}

import { NextRequest } from "next/server"
import { Client, Environment } from "square/legacy"
import { getSession } from "@/lib/auth/session"
import { requireEnv } from "@/lib/env"

const { catalogApi } = new Client({
  accessToken: requireEnv("SQUARE_ACCESS_TOKEN"),
  environment:
    requireEnv("SQUARE_ENVIRONMENT") === "production" ? Environment.Production : Environment.Sandbox,
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

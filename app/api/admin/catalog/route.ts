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
  return new Response(
    JSON.stringify(result.object, (_key, value) =>
      typeof value === "bigint" ? Number(value) : value
    ),
    { headers: { "Content-Type": "application/json" } }
  )
  }

  const { result } = await catalogApi.searchCatalogItems({
    productTypes: ["REGULAR"],
    sortOrder: "ASC",
  })

  return new Response(
    JSON.stringify(
      {
        items: result.items ?? [],
        count: result.items?.length ?? 0,
      },
      (_key, value) => (typeof value === "bigint" ? Number(value) : value)
    ),
    { headers: { "Content-Type": "application/json" } }
  )
}

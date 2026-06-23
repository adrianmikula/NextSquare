import { NextRequest } from "next/server"
import { Client, Environment } from "square/legacy"
import { getSession } from "@/lib/auth/session"
import { validateCsrfToken } from "@/lib/security/csrf"
import { rateLimit, getRateLimitResponse } from "@/lib/security/rate-limit"
import { canEditCatalog, canEditStock } from "@/lib/auth/rbac"
import crypto from "crypto"
import { requireEnv } from "@/lib/env"

interface UpdatePayload {
  name?: string
  priceMoney?: number
  description?: string
  availableOnline?: boolean
}

const { catalogApi } = new Client({
  accessToken: requireEnv("SQUARE_ACCESS_TOKEN"),
  environment:
    requireEnv("SQUARE_ENVIRONMENT") === "production" ? Environment.Production : Environment.Sandbox,
})

interface UpdatePayload {
  name?: string
  priceMoney?: number
  description?: string
  availableOnline?: boolean
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session?.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!validateCsrfToken(request)) {
    return Response.json({ error: "Invalid CSRF token" }, { status: 403 })
  }

  const isStaff = canEditStock(session.roles)
  const isOwner = canEditCatalog(session.roles)
  if (!isStaff && !isOwner) {
    return Response.json({ error: "Insufficient permissions" }, { status: 403 })
  }

  const rateLimitResult = rateLimit(
    `admin:${session.userId}:${new URL(request.url).pathname}`,
    10,
    60 * 1000
  )
  if (!rateLimitResult.allowed) {
    return getRateLimitResponse(rateLimitResult.retryAfter!)
  }

  const { id } = await params
  const updates: UpdatePayload = await request.json()

  const isStockOnlyUpdate =
    updates.name === undefined &&
    updates.description === undefined &&
    updates.availableOnline !== undefined

  if (isStaff && !isOwner && !isStockOnlyUpdate) {
    return Response.json(
      { error: "Staff can only update stock levels" },
      { status: 403 }
    )
  }

  const { result: current } = await catalogApi.retrieveCatalogObject(id, true)
  const catalogObject = current.object
  if (!catalogObject) {
    return Response.json({ error: "Item not found" }, { status: 404 })
  }

  if (catalogObject.type === "ITEM" && catalogObject.itemData) {
    if (updates.name) catalogObject.itemData.name = updates.name
    if (updates.description !== undefined)
      catalogObject.itemData.description = updates.description
    if (updates.availableOnline !== undefined) {
      catalogObject.itemData.availableOnline = updates.availableOnline
    }
  }

  if (
    catalogObject.type === "ITEM_VARIATION" &&
    catalogObject.itemVariationData
  ) {
    if (updates.name) catalogObject.itemVariationData.name = updates.name
    if (updates.priceMoney !== undefined) {
      catalogObject.itemVariationData.pricingType = "FIXED_PRICING"
      catalogObject.itemVariationData.priceMoney = {
        amount: BigInt(Math.round(updates.priceMoney * 100)),
        currency: "AUD",
      }
    }
    if (updates.availableOnline !== undefined) {
      const parentItemId = catalogObject.itemVariationData.itemId
      if (parentItemId) {
        const { result: parentResult } =
          await catalogApi.retrieveCatalogObject(parentItemId, false)
        const parentItem = parentResult.object
        if (parentItem?.itemData) {
          parentItem.itemData.availableOnline = updates.availableOnline
          const { result: upsertResult } =
            await catalogApi.upsertCatalogObject({
              idempotencyKey: crypto.randomUUID(),
              object: parentItem,
            })
          return Response.json(upsertResult.catalogObject)
        }
      }
    }
  }

  const { result } = await catalogApi.upsertCatalogObject({
    idempotencyKey: crypto.randomUUID(),
    object: catalogObject,
  })

  return new Response(
    JSON.stringify(result.catalogObject, (_key, value) =>
      typeof value === "bigint" ? Number(value) : value
    ),
    { headers: { "Content-Type": "application/json" } }
  )
}

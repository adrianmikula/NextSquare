import { NextRequest } from "next/server"
import { createOrder } from "@/lib/square/orders"
import { rateLimit, getRateLimitResponse } from "@/lib/security/rate-limit"
import { logger } from "@/lib/logger"
import type { CreateOrderPayload } from "@/types/order"

export async function POST(request: NextRequest) {
  const ip =
    request.headers?.get?.("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"

  const rateLimitResult = rateLimit(`api:${ip}`, 30, 60 * 1000)
  if (!rateLimitResult.allowed) {
    return getRateLimitResponse(rateLimitResult.retryAfter!)
  }
  try {
    const body: CreateOrderPayload = await request.json()
    const { lineItems, customerInfo, fulfillmentType, fulfillmentDetails, idempotencyKey } = body

    if (!lineItems?.length || !customerInfo?.name || !customerInfo?.phone) {
      logger("orders").warn("Missing required fields", { name: !!customerInfo?.name, phone: !!customerInfo?.phone, items: lineItems?.length })
      return Response.json({ error: "Missing required fields: lineItems, customer name, and phone" }, { status: 400 })
    }

    const { orderId } = await createOrder({
      lineItems, customerInfo, fulfillmentType,
      fulfillmentDetails: fulfillmentDetails as {
        pickupAt?: string
        address?: { addressLine1?: string; addressLine2?: string; locality?: string; administrativeDistrictLevel1?: string; postalCode?: string }
        deliveryNotes?: string
      },
      idempotencyKey,
    })

    return Response.json({ orderId })
  } catch (error) {
    logger("orders").error("Order creation error", error instanceof Error ? error : new Error(String(error)))
    return Response.json({ error: "Failed to create order. Please try again." }, { status: 500 })
  }
}

import { NextRequest } from "next/server"
import { createOrder } from "@/lib/square/orders"
import type { CreateOrderPayload } from "@/types/order"

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderPayload = await request.json()
    const { lineItems, customerInfo, fulfillmentType, fulfillmentDetails, idempotencyKey } = body

    if (!lineItems?.length || !customerInfo?.name || !customerInfo?.phone) {
      console.warn("[orders] Missing required fields", { name: !!customerInfo?.name, phone: !!customerInfo?.phone, items: lineItems?.length })
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
    console.error("[orders] Order creation error:", error instanceof Error ? error.message : error)
    return Response.json({ error: "Failed to create order. Please try again." }, { status: 500 })
  }
}

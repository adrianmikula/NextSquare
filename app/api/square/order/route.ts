import { NextRequest } from "next/server"
import { createOrder } from "@/lib/square/orders"
import type { CreateOrderPayload } from "@/types/order"

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderPayload = await request.json()
    const { lineItems, customerInfo, fulfillmentType, fulfillmentDetails, idempotencyKey } = body

    if (!lineItems?.length || !customerInfo?.name || !customerInfo?.phone) {
      return Response.json(
        { error: "Missing required fields: lineItems, customer name, and phone" },
        { status: 400 }
      )
    }

    const { orderId } = await createOrder({
      lineItems,
      customerInfo,
      fulfillmentType,
      fulfillmentDetails: fulfillmentDetails as {
        pickupAt?: string
        address?: {
          addressLine1?: string
          addressLine2?: string
          locality?: string
          administrativeDistrictLevel1?: string
          postalCode?: string
        }
        deliveryNotes?: string
      },
      idempotencyKey,
    })

    return Response.json({ orderId })
  } catch (error) {
    console.error("Order creation error:", error)
    return Response.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}

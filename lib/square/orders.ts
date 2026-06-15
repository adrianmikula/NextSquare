import "server-only"
import { Client, Environment } from "square/legacy"
import type { SquareOrder } from "@/types/square"
import type { CartItem } from "@/types/cart"
import type { CustomerInfo } from "@/types/order"

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Sandbox,
})

export async function createOrder(params: {
  lineItems: CartItem[]
  customerInfo: CustomerInfo
  fulfillmentType: "PICKUP" | "DELIVERY"
  fulfillmentDetails: {
    pickupAt?: string
    address?: {
      addressLine1?: string
      addressLine2?: string
      locality?: string
      administrativeDistrictLevel1?: string
      postalCode?: string
    }
    deliveryNotes?: string
  }
  idempotencyKey: string
}): Promise<{ orderId: string }> {
  const locationId = process.env.SQUARE_LOCATION_ID!
  const lineItemsPayload = params.lineItems.map((item) => ({
    catalogObjectId: item.catalogObjectId,
    quantity: item.quantity.toString(),
    modifiers: item.modifiers.map((m) => ({
      catalogObjectId: m.id,
    })),
  }))

  const fulfillment =
    params.fulfillmentType === "PICKUP"
      ? {
          type: "PICKUP" as const,
          state: "PROPOSED" as const,
          pickupDetails: {
            recipient: {
              displayName: params.customerInfo.name,
              phoneNumber: params.customerInfo.phone,
            },
            pickupAt: params.fulfillmentDetails.pickupAt,
          },
        }
      : {
          type: "SHIPMENT" as const,
          state: "PROPOSED" as const,
          shipmentDetails: {
            recipient: {
              displayName: params.customerInfo.name,
              phoneNumber: params.customerInfo.phone,
              address: params.fulfillmentDetails.address,
            },
          },
        }

  const { result } = await client.ordersApi.createOrder({
    idempotencyKey: params.idempotencyKey,
    order: {
      locationId,
      lineItems: lineItemsPayload,
      fulfillments: [fulfillment],
    },
  })

  return { orderId: result.order?.id ?? "" }
}

export async function getOrder(
  orderId: string
): Promise<SquareOrder | null> {
  try {
    const { result } = await client.ordersApi.retrieveOrder(orderId)
    return (result.order as SquareOrder) ?? null
  } catch {
    return null
  }
}

export async function searchOrders(params: {
  locationId: string
  startAt?: string
  endAt?: string
  limit?: number
}): Promise<SquareOrder[]> {
  try {
    const { result } = await client.ordersApi.searchOrders({
      locationIds: [params.locationId],
      query: {
        filter: {
          dateTimeFilter: {
            createdAt: {
              startAt: params.startAt,
              endAt: params.endAt,
            },
          },
        },
      },
      limit: params.limit ?? 50,
    })
    return (result.orders as SquareOrder[]) ?? []
  } catch {
    return []
  }
}

import "server-only"
import { Client, Environment } from "square/legacy"
import type { SquareOrder } from "@/types/square"
import type { CartItem } from "@/types/cart"
import type { CustomerInfo } from "@/types/order"
import { getSquareEnvironment } from "./config"
import { isDemoMode } from "@/lib/demo/config"
import { getDemoOrder, createDemoOrder } from "@/lib/demo/menu-data"
import { requireEnv } from "@/lib/env"

let _client: Client | null = null
function getClient(): Client {
  if (!_client) {
    _client = new Client({
      accessToken: isDemoMode() ? "" : requireEnv("SQUARE_ACCESS_TOKEN"),
      environment: getSquareEnvironment() === "production" ? Environment.Production : Environment.Sandbox,
    })
  }
  return _client
}

export async function createOrder(params: {
  lineItems: CartItem[]
  customerInfo: CustomerInfo
  fulfillmentType: "PICKUP" | "DELIVERY"
  fulfillmentDetails: {
    pickupAt?: string
    address?: { addressLine1?: string; addressLine2?: string; locality?: string; administrativeDistrictLevel1?: string; postalCode?: string }
    deliveryNotes?: string
  }
  idempotencyKey: string
}): Promise<{ orderId: string }> {
  if (isDemoMode()) {
    const order = createDemoOrder()
    return { orderId: order.id ?? `demo-${params.idempotencyKey}` }
  }

  const locationId = requireEnv("SQUARE_LOCATION_ID")
  const lineItemsPayload = params.lineItems.map((item) => ({
    catalogObjectId: item.catalogObjectId,
    quantity: item.quantity.toString(),
    modifiers: item.modifiers.map((m) => ({ catalogObjectId: m.id })),
  }))

  const fulfillment = params.fulfillmentType === "PICKUP"
    ? { type: "PICKUP" as const, state: "PROPOSED" as const, pickupDetails: { recipient: { displayName: params.customerInfo.name, phoneNumber: params.customerInfo.phone }, pickupAt: params.fulfillmentDetails.pickupAt } }
    : { type: "SHIPMENT" as const, state: "PROPOSED" as const, shipmentDetails: { recipient: { displayName: params.customerInfo.name, phoneNumber: params.customerInfo.phone, address: params.fulfillmentDetails.address } } }

  const { result } = await getClient().ordersApi.createOrder({
    idempotencyKey: params.idempotencyKey,
    order: { locationId, lineItems: lineItemsPayload, fulfillments: [fulfillment] },
  })

  return { orderId: result.order?.id ?? "" }
}

export async function getOrder(orderId: string): Promise<SquareOrder | null> {
  if (isDemoMode()) {
    return getDemoOrder(orderId)
  }

  try {
    const { result } = await getClient().ordersApi.retrieveOrder(orderId)
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
  if (isDemoMode()) {
    return []
  }

  try {
    const { result } = await getClient().ordersApi.searchOrders({
      locationIds: [params.locationId],
      query: { filter: { dateTimeFilter: { createdAt: { startAt: params.startAt, endAt: params.endAt } } } },
      limit: params.limit ?? 50,
    })
    return (result.orders as SquareOrder[]) ?? []
  } catch {
    return []
  }
}

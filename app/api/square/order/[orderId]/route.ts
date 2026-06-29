import { NextRequest } from "next/server"
import { getOrder } from "@/lib/square/orders"
import type { SquareOrderFulfillment } from "@/types/square"
import { logger } from "@/lib/logger"

function extractPhoneFromFulfillment(fulfillment: SquareOrderFulfillment | undefined) {
  if (!fulfillment) return undefined
  const recipient = fulfillment.pickupDetails?.recipient ?? fulfillment.shipmentDetails?.recipient
  return recipient?.phoneNumber
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const order = await getOrder(orderId)

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 })
    }

    return Response.json({
      orderId: order.id,
      state: order.state ?? "UNKNOWN",
      ticketName: order.ticketName,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      lineItems: (order.lineItems ?? []).map((item) => ({
        quantity: parseInt(item.quantity),
        name: item.name,
        catalogObjectId: item.catalogObjectId,
        priceMoney: item.basePriceMoney ? { amount: Number(item.basePriceMoney.amount), currency: item.basePriceMoney.currency } : undefined,
        modifiers: (item.modifiers ?? []).map((m) => ({
          id: m.catalogObjectId, name: m.name ?? "",
          priceMoney: m.basePriceMoney ? { amount: Number(m.basePriceMoney.amount), currency: m.basePriceMoney.currency } : undefined,
        })),
      })),
      totalMoney: order.totalMoney ? { amount: Number(order.totalMoney.amount), currency: order.totalMoney.currency } : undefined,
      customerPhone: extractPhoneFromFulfillment(order.fulfillments?.[0]),
    })
  } catch (error) {
    logger("orders").error("Order fetch error", error instanceof Error ? error : new Error(String(error)))
    return Response.json({ error: "Failed to fetch order. Please try again." }, { status: 500 })
  }
}

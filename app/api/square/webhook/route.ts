import { NextRequest } from "next/server"
import { sendSms } from "@/lib/twilio/client"
import { verifySquareWebhook, parseWebhookEvent } from "@/lib/webhooks/square"
import { rateLimit, getRateLimitResponse } from "@/lib/security/rate-limit"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  const ip =
    request.headers?.get?.("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"

  const rateLimitResult = rateLimit(`webhook:${ip}`, 100, 60 * 1000)
  if (!rateLimitResult.allowed) {
    return getRateLimitResponse(rateLimitResult.retryAfter!)
  }
  const body = await request.text()
  const signature = request.headers.get("x-square-hmacsha256-signature") ?? ""

  if (!verifySquareWebhook(body, signature)) {
    logger("webhook").warn("Invalid signature")
    return new Response("Invalid signature", { status: 401 })
  }

  const event = parseWebhookEvent(body)
  if (!event) {
    logger("webhook").warn("Invalid event payload")
    return new Response("Invalid event", { status: 400 })
  }

  if (event.type !== "order.updated") {
    return new Response("OK", { status: 200 })
  }

  const order = event.data.object.order
  const fulfillment = order.fulfillments?.[0]

  const phone =
    fulfillment?.pickupDetails?.recipient?.phoneNumber ??
    fulfillment?.shipmentDetails?.recipient?.phoneNumber

  if (!phone) {
    logger("webhook").warn("No phone number in order fulfillment", { orderId: order.id })
    return new Response("No phone number", { status: 200 })
  }

  const state = fulfillment?.state
  const ticketName = order.ticketName ?? order.id
  const isDelivery = fulfillment?.type === "SHIPMENT"

  let message: string | null = null

  switch (state) {
    case "PROPOSED":
      message = `Order #${ticketName} confirmed! We'll text you when it's ready.`
      break
    case "IN_PROGRESS":
      message = `We're making your order #${ticketName} now! ETA ~10 min`
      break
    case "COMPLETED":
      message = isDelivery
        ? `Your order #${ticketName} has been delivered! Enjoy!`
        : `Your order #${ticketName} is ready for pickup!`
      break
    default:
      logger("webhook").info("Unhandled fulfillment state", { state, orderId: order.id })
  }

  if (message) {
    try {
      await sendSms(phone, message)
      logger("webhook").info("SMS sent", { orderId: order.id, state })
    } catch (error) {
      logger("webhook").error("Failed to send SMS", error instanceof Error ? error : new Error(String(error)))
    }
  }

  return new Response("OK", { status: 200 })
}

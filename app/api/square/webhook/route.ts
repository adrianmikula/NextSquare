import { NextRequest } from "next/server"
import { sendSms } from "@/lib/twilio/client"
import { verifySquareWebhook, parseWebhookEvent } from "@/lib/webhooks/square"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("x-square-hmacsha256-signature") ?? ""

  if (!verifySquareWebhook(body, signature)) {
    return new Response("Invalid signature", { status: 401 })
  }

  const event = parseWebhookEvent(body)
  if (!event) {
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
  }

  if (message) {
    await sendSms(phone, message)
  }

  return new Response("OK", { status: 200 })
}

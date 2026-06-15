import { createHash, timingSafeEqual } from "node:crypto"

export function verifySquareWebhook(
  body: string,
  signature: string
): boolean {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  if (!key) return false

  const hmac = createHash("sha256")
  hmac.update(key)
  hmac.update(body)
  const digest = hmac.digest("hex")

  if (signature.length !== digest.length) return false
  return timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

export interface SquareWebhookEvent {
  type: string
  data: {
    object: {
      order: {
        id: string
        ticketName?: string
        fulfillments?: Array<{
          type?: string
          state?: string
          pickupDetails?: {
            recipient?: { phoneNumber?: string }
          }
          shipmentDetails?: {
            recipient?: { phoneNumber?: string }
          }
        }>
      }
    }
  }
}

export function parseWebhookEvent(
  body: string
): SquareWebhookEvent | null {
  try {
    return JSON.parse(body) as SquareWebhookEvent
  } catch {
    return null
  }
}

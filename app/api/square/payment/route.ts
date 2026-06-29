import { NextRequest } from "next/server"
import { processPayment } from "@/lib/square/payments"
import { rateLimit, getRateLimitResponse } from "@/lib/security/rate-limit"
import { logger } from "@/lib/logger"
import type { CreatePaymentPayload } from "@/types/order"

export async function POST(request: NextRequest) {
  const ip =
    request.headers?.get?.("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"

  const rateLimitResult = rateLimit(`api:${ip}`, 30, 60 * 1000)
  if (!rateLimitResult.allowed) {
    return getRateLimitResponse(rateLimitResult.retryAfter!)
  }
  try {
    const body: CreatePaymentPayload = await request.json()
    const { nonce, orderId, idempotencyKey, amount, currency, verificationToken } = body

    if (!nonce || !orderId || !idempotencyKey || !amount) {
      logger("payments").warn("Missing required fields", { nonce: !!nonce, orderId: !!orderId, idempotencyKey: !!idempotencyKey, amount: !!amount })
      return Response.json({ error: "Missing required fields: nonce, orderId, idempotencyKey, amount" }, { status: 400 })
    }

    const result = await processPayment({ nonce, orderId, idempotencyKey, amount, currency, verificationToken })

    return Response.json(result)
  } catch (error) {
    logger("payments").error("Payment processing error", error instanceof Error ? error : new Error(String(error)))
    return Response.json({ error: "Failed to process payment. Please try again." }, { status: 500 })
  }
}

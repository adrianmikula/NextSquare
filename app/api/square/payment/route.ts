import { NextRequest } from "next/server"
import { processPayment } from "@/lib/square/payments"
import type { CreatePaymentPayload } from "@/types/order"

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentPayload = await request.json()
    const { nonce, orderId, idempotencyKey, amount, currency, verificationToken } = body

    if (!nonce || !orderId || !idempotencyKey || !amount) {
      console.warn("[payments] Missing required fields", { nonce: !!nonce, orderId: !!orderId, idempotencyKey: !!idempotencyKey, amount: !!amount })
      return Response.json({ error: "Missing required fields: nonce, orderId, idempotencyKey, amount" }, { status: 400 })
    }

    const result = await processPayment({ nonce, orderId, idempotencyKey, amount, currency, verificationToken })

    return Response.json(result)
  } catch (error) {
    console.error("[payments] Payment processing error:", error instanceof Error ? error.message : error)
    return Response.json({ error: "Failed to process payment. Please try again." }, { status: 500 })
  }
}

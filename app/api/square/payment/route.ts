import { NextRequest } from "next/server"
import { processPayment } from "@/lib/square/payments"
import type { CreatePaymentPayload } from "@/types/order"

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentPayload = await request.json()
    const { nonce, orderId, idempotencyKey, amount, currency, verificationToken } = body

    if (!nonce || !orderId || !idempotencyKey || !amount) {
      return Response.json(
        { error: "Missing required fields: nonce, orderId, idempotencyKey, amount" },
        { status: 400 }
      )
    }

    const result = await processPayment({
      nonce,
      orderId,
      idempotencyKey,
      amount,
      currency,
      verificationToken,
    })

    return Response.json(result)
  } catch (error) {
    console.error("Payment processing error:", error)
    return Response.json(
      { error: "Failed to process payment" },
      { status: 500 }
    )
  }
}

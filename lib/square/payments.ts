import "server-only"
import { Client, Environment } from "square/legacy"
import { getSquareEnvironment } from "./config"
import { isDemoMode } from "@/lib/demo/config"
import { createDemoPayment } from "@/lib/demo/menu-data"
import { requireEnv } from "@/lib/env"

const client = new Client({
  accessToken: isDemoMode() ? "" : requireEnv("SQUARE_ACCESS_TOKEN"),
  environment: getSquareEnvironment() === "production" ? Environment.Production : Environment.Sandbox,
})

export async function processPayment(params: {
  nonce: string
  orderId: string
  idempotencyKey: string
  amount: number
  currency?: string
  verificationToken?: string
}): Promise<{ paymentId: string; status: string }> {
  if (isDemoMode()) {
    const payment = createDemoPayment()
    payment.orderId = params.orderId
    return { paymentId: payment.id, status: "COMPLETED" }
  }

  const { result } = await client.paymentsApi.createPayment({
    sourceId: params.nonce,
    idempotencyKey: params.idempotencyKey,
    orderId: params.orderId,
    amountMoney: { amount: BigInt(Math.round(params.amount)), currency: params.currency ?? "AUD" },
    ...(params.verificationToken ? { verificationToken: params.verificationToken } : {}),
    autocomplete: true,
  })

  return { paymentId: result.payment?.id ?? "", status: result.payment?.status ?? "FAILED" }
}

export async function getPayment(paymentId: string) {
  if (isDemoMode()) {
    return createDemoPayment()
  }

  try {
    const { result } = await client.paymentsApi.getPayment(paymentId)
    return result.payment ?? null
  } catch {
    return null
  }
}

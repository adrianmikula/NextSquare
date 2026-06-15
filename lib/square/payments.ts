import "server-only"
import { Client, Environment } from "square/legacy"

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Sandbox,
})

export async function processPayment(params: {
  nonce: string
  orderId: string
  idempotencyKey: string
  amount: number
  currency?: string
  verificationToken?: string
}): Promise<{ paymentId: string; status: string }> {
  const { result } = await client.paymentsApi.createPayment({
    sourceId: params.nonce,
    idempotencyKey: params.idempotencyKey,
    orderId: params.orderId,
    amountMoney: {
      amount: BigInt(Math.round(params.amount)),
      currency: params.currency ?? "AUD",
    },
    ...(params.verificationToken
      ? { verificationToken: params.verificationToken }
      : {}),
    autocomplete: true,
  })

  return {
    paymentId: result.payment?.id ?? "",
    status: result.payment?.status ?? "FAILED",
  }
}

export async function getPayment(paymentId: string) {
  try {
    const { result } = await client.paymentsApi.getPayment(paymentId)
    return result.payment ?? null
  } catch {
    return null
  }
}

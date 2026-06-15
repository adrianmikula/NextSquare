import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { mockPaymentsApi } from "../../../__mocks__/square/legacy"

vi.mock("square/legacy")

beforeEach(() => {
  vi.stubEnv("SQUARE_ACCESS_TOKEN", "test-token")
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("processPayment", () => {
  it("processes a payment successfully", async () => {
    mockPaymentsApi.createPayment.mockResolvedValue({
      result: {
        payment: { id: "payment-123", status: "COMPLETED" },
      },
    })

    const { processPayment } = await import("@/lib/square/payments")
    const result = await processPayment({
      nonce: "cnon:test-nonce",
      orderId: "order-123",
      idempotencyKey: "test-key",
      amount: 550,
      currency: "AUD",
    })

    expect(result.paymentId).toBe("payment-123")
    expect(result.status).toBe("COMPLETED")
    expect(mockPaymentsApi.createPayment).toHaveBeenCalledWith({
      sourceId: "cnon:test-nonce",
      idempotencyKey: "test-key",
      orderId: "order-123",
      amountMoney: {
        amount: BigInt(550),
        currency: "AUD",
      },
      autocomplete: true,
    })
  })

  it("returns FAILED status when payment result is missing", async () => {
    mockPaymentsApi.createPayment.mockResolvedValue({
      result: {},
    })

    const { processPayment } = await import("@/lib/square/payments")
    const result = await processPayment({
      nonce: "cnon:test-nonce",
      orderId: "order-123",
      idempotencyKey: "test-key",
      amount: 550,
    })

    expect(result.status).toBe("FAILED")
  })

  it("includes verification token when provided", async () => {
    mockPaymentsApi.createPayment.mockResolvedValue({
      result: {
        payment: { id: "payment-456", status: "COMPLETED" },
      },
    })

    const { processPayment } = await import("@/lib/square/payments")
    await processPayment({
      nonce: "cnon:test-nonce",
      orderId: "order-456",
      idempotencyKey: "test-key-2",
      amount: 1000,
      verificationToken: "verify-token-123",
    })

    expect(mockPaymentsApi.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        verificationToken: "verify-token-123",
      })
    )
  })
})

describe("getPayment", () => {
  it("returns payment when found", async () => {
    mockPaymentsApi.getPayment.mockResolvedValue({
      result: {
        payment: { id: "payment-123", status: "COMPLETED" },
      },
    })

    const { getPayment } = await import("@/lib/square/payments")
    const payment = await getPayment("payment-123")

    expect(payment).toEqual({ id: "payment-123", status: "COMPLETED" })
  })

  it("returns null on error", async () => {
    mockPaymentsApi.getPayment.mockRejectedValue(new Error("Not found"))

    const { getPayment } = await import("@/lib/square/payments")
    const payment = await getPayment("payment-404")

    expect(payment).toBeNull()
  })
})

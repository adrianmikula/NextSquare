import { describe, expect, it, vi, beforeEach } from "vitest"
import { POST } from "@/app/api/square/payment/route"

const { mockProcessPayment } = vi.hoisted(() => ({ mockProcessPayment: vi.fn() }))

vi.mock("@/lib/square/payments", () => ({
  processPayment: mockProcessPayment,
}))

function callPost(body: unknown) {
  const request = {
    json: () => Promise.resolve(body),
    headers: { get: () => null },
  } as any
  return POST(request)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("POST /api/square/payment", () => {
  const validPayload = {
    nonce: "cnon:test-nonce",
    orderId: "order-123",
    idempotencyKey: "test-key",
    amount: 550,
    currency: "AUD",
  }

  it("processes payment successfully", async () => {
    mockProcessPayment.mockResolvedValue({
      paymentId: "payment-123",
      status: "COMPLETED",
    })

    const response = await callPost(validPayload)
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.paymentId).toBe("payment-123")
    expect(json.status).toBe("COMPLETED")
  })

  it("returns 400 when nonce is missing", async () => {
    const payload = { ...validPayload, nonce: "" }
    const response = await callPost(payload)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toContain("Missing required fields")
  })

  it("returns 400 when orderId is missing", async () => {
    const payload = { ...validPayload, orderId: "" }
    const response = await callPost(payload)
    expect(response.status).toBe(400)
  })

  it("returns 400 when idempotencyKey is missing", async () => {
    const payload = { ...validPayload, idempotencyKey: "" }
    const response = await callPost(payload)
    expect(response.status).toBe(400)
  })

  it("returns 400 when amount is missing", async () => {
    const payload = { ...validPayload, amount: 0 }
    const response = await callPost(payload)
    expect(response.status).toBe(400)
  })

  it("returns 500 when payment processing fails", async () => {
    mockProcessPayment.mockRejectedValue(new Error("Card declined"))

    const response = await callPost(validPayload)
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error).toBe("Failed to process payment. Please try again.")
  })

  it("passes verificationToken when provided", async () => {
    mockProcessPayment.mockResolvedValue({ paymentId: "payment-123", status: "COMPLETED" })
    const payload = { ...validPayload, verificationToken: "verify-token" }

    await callPost(payload)
    expect(mockProcessPayment).toHaveBeenCalledWith(
      expect.objectContaining({ verificationToken: "verify-token" }),
    )
  })
})

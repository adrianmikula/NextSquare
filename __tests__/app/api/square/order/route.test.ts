import { describe, expect, it, vi, beforeEach } from "vitest"

const mockCreateOrder = vi.fn()

vi.mock("@/lib/square/orders", () => ({
  createOrder: mockCreateOrder,
}))

async function callPost(body: unknown) {
  const { POST } = await import("@/app/api/square/order/route")
  const request = { json: () => Promise.resolve(body) } as any
  return POST(request)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("POST /api/square/order", () => {
  const validPayload = {
    lineItems: [{ catalogObjectId: "item-1", quantity: 2, name: "Flat White", priceMoney: { amount: 550, currency: "AUD" }, modifiers: [] }],
    customerInfo: { name: "Alice", phone: "+61412345678" },
    fulfillmentType: "PICKUP",
    fulfillmentDetails: { pickupAt: new Date().toISOString() },
    idempotencyKey: "test-key",
  }

  it("creates an order successfully", async () => {
    mockCreateOrder.mockResolvedValue({ orderId: "order-123" })

    const response = await callPost(validPayload)
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.orderId).toBe("order-123")
  })

  it("returns 400 when lineItems is missing", async () => {
    const payload = { ...validPayload, lineItems: [] }
    const response = await callPost(payload)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toContain("Missing required fields")
  })

  it("returns 400 when customer name is missing", async () => {
    const payload = { ...validPayload, customerInfo: { name: "", phone: "+61412345678" } }
    const response = await callPost(payload)
    expect(response.status).toBe(400)
  })

  it("returns 400 when customer phone is missing", async () => {
    const payload = { ...validPayload, customerInfo: { name: "Alice", phone: "" } }
    const response = await callPost(payload)
    expect(response.status).toBe(400)
  })

  it("returns 500 when order creation fails", async () => {
    mockCreateOrder.mockRejectedValue(new Error("Square API error"))

    const response = await callPost(validPayload)
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error).toBe("Failed to create order. Please try again.")
  })

  it("passes payload to createOrder service", async () => {
    mockCreateOrder.mockResolvedValue({ orderId: "order-123" })

    await callPost(validPayload)
    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        lineItems: validPayload.lineItems,
        customerInfo: validPayload.customerInfo,
        fulfillmentType: "PICKUP",
        idempotencyKey: "test-key",
      }),
    )
  })
})

import { describe, expect, it, vi, beforeEach } from "vitest"

const mockGetOrder = vi.fn()

vi.mock("@/lib/square/orders", () => ({
  getOrder: mockGetOrder,
}))

async function callGet(orderId: string) {
  const { GET } = await import("@/app/api/square/order/[orderId]/route")
  const request = {} as any
  const params = Promise.resolve({ orderId })
  return GET(request, { params })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("GET /api/square/order/[orderId]", () => {
  it("returns order with mapped line items", async () => {
    mockGetOrder.mockResolvedValue({
      id: "order-123",
      state: "IN_PROGRESS",
      ticketName: "T-42",
      createdAt: "2026-01-15T10:00:00Z",
      updatedAt: "2026-01-15T10:05:00Z",
      lineItems: [
        {
          quantity: "2",
          name: "Flat White",
          catalogObjectId: "item-1",
          basePriceMoney: { amount: BigInt(550), currency: "AUD" },
          modifiers: [
            { catalogObjectId: "mod-1", name: "Oat Milk", basePriceMoney: { amount: BigInt(100), currency: "AUD" } },
          ],
        },
      ],
      totalMoney: { amount: BigInt(1300), currency: "AUD" },
      fulfillments: [
        { type: "PICKUP", state: "PROPOSED", pickupDetails: { recipient: { phoneNumber: "+61400123456" } } },
      ],
    })
    const response = await callGet("order-123")
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.orderId).toBe("order-123")
    expect(body.state).toBe("IN_PROGRESS")
    expect(body.ticketName).toBe("T-42")
    expect(body.lineItems).toHaveLength(1)
    expect(body.lineItems[0].quantity).toBe(2)
    expect(body.lineItems[0].name).toBe("Flat White")
    expect(body.lineItems[0].modifiers).toHaveLength(1)
    expect(body.lineItems[0].modifiers[0].name).toBe("Oat Milk")
    expect(body.totalMoney.amount).toBe(1300)
    expect(body.customerPhone).toBe("+61400123456")
  })

  it("returns 404 when order not found", async () => {
    mockGetOrder.mockResolvedValue(null)
    const response = await callGet("non-existent")
    expect(response.status).toBe(404)
    expect((await response.json()).error).toContain("not found")
  })

  it("returns 500 when getOrder throws", async () => {
    mockGetOrder.mockRejectedValue(new Error("API error"))
    const response = await callGet("order-123")
    expect(response.status).toBe(500)
  })

  it("handles missing optional fields gracefully", async () => {
    mockGetOrder.mockResolvedValue({ id: "order-456" })
    const response = await callGet("order-456")
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.state).toBe("UNKNOWN")
    expect(body.lineItems).toEqual([])
    expect(body.customerPhone).toBeUndefined()
  })

  it("extracts phone from shipment details if pickup is missing", async () => {
    mockGetOrder.mockResolvedValue({
      id: "order-789",
      fulfillments: [
        {
          type: "SHIPMENT",
          state: "PROPOSED",
          shipmentDetails: { recipient: { phoneNumber: "+61400111111" } },
        },
      ],
    })
    const response = await callGet("order-789")
    const body = await response.json()
    expect(body.customerPhone).toBe("+61400111111")
  })
})

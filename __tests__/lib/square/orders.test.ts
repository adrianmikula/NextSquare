import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { mockOrdersApi } from "../../../__mocks__/square/legacy"

vi.mock("square/legacy")

beforeEach(() => {
  vi.stubEnv("SQUARE_ACCESS_TOKEN", "test-token")
  vi.stubEnv("SQUARE_LOCATION_ID", "loc-123")
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("createOrder", () => {
  it("creates a pickup order successfully", async () => {
    mockOrdersApi.createOrder.mockResolvedValue({
      result: {
        order: { id: "order-123" },
      },
    })

    const { createOrder } = await import("@/lib/square/orders")
    const result = await createOrder({
      lineItems: [
        {
          id: "temp-1",
          catalogObjectId: "item-1",
          name: "Flat White",
          priceMoney: { amount: 550, currency: "AUD" },
          quantity: 2,
          modifiers: [],
        },
      ],
      customerInfo: { name: "Alice", phone: "+61412345678" },
      fulfillmentType: "PICKUP",
      fulfillmentDetails: {
        pickupAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
      idempotencyKey: "test-key-1",
    })

    expect(result.orderId).toBe("order-123")
    expect(mockOrdersApi.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: "test-key-1",
        order: expect.objectContaining({
          locationId: "loc-123",
          lineItems: expect.arrayContaining([
            expect.objectContaining({
              catalogObjectId: "item-1",
              quantity: "2",
            }),
          ]),
          fulfillments: expect.arrayContaining([
            expect.objectContaining({
              type: "PICKUP",
              state: "PROPOSED",
            }),
          ]),
        }),
      })
    )
  })

  it("creates a delivery order successfully", async () => {
    mockOrdersApi.createOrder.mockResolvedValue({
      result: {
        order: { id: "order-456" },
      },
    })

    const { createOrder } = await import("@/lib/square/orders")
    const result = await createOrder({
      lineItems: [
        {
          id: "temp-1",
          catalogObjectId: "item-1",
          name: "Latte",
          priceMoney: { amount: 550, currency: "AUD" },
          quantity: 1,
          modifiers: [
            {
              id: "mod-oat",
              name: "Oat Milk",
              priceMoney: { amount: 100, currency: "AUD" },
            },
          ],
        },
      ],
      customerInfo: { name: "Bob", phone: "+61498765432" },
      fulfillmentType: "DELIVERY",
      fulfillmentDetails: {
        address: {
          addressLine1: "123 Main St",
          locality: "Sydney",
          administrativeDistrictLevel1: "NSW",
          postalCode: "2000",
        },
      },
      idempotencyKey: "test-key-2",
    })

    expect(result.orderId).toBe("order-456")
    expect(mockOrdersApi.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        order: expect.objectContaining({
          fulfillments: expect.arrayContaining([
            expect.objectContaining({
              type: "SHIPMENT",
              state: "PROPOSED",
            }),
          ]),
        }),
      })
    )
  })

  it("includes item modifiers in the order", async () => {
    mockOrdersApi.createOrder.mockResolvedValue({
      result: { order: { id: "order-789" } },
    })

    const { createOrder } = await import("@/lib/square/orders")
    await createOrder({
      lineItems: [
        {
          id: "temp-1",
          catalogObjectId: "item-1",
          name: "Latte",
          priceMoney: { amount: 550, currency: "AUD" },
          quantity: 1,
          modifiers: [
            { id: "mod-oat", name: "Oat Milk" },
            { id: "mod-extra-shot", name: "Extra Shot" },
          ],
        },
      ],
      customerInfo: { name: "Alice", phone: "+61412345678" },
      fulfillmentType: "PICKUP",
      fulfillmentDetails: {},
      idempotencyKey: "test-key-3",
    })

    expect(mockOrdersApi.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        order: expect.objectContaining({
          lineItems: expect.arrayContaining([
            expect.objectContaining({
              modifiers: [
                { catalogObjectId: "mod-oat" },
                { catalogObjectId: "mod-extra-shot" },
              ],
            }),
          ]),
        }),
      })
    )
  })
})

describe("getOrder", () => {
  it("returns order when found", async () => {
    mockOrdersApi.retrieveOrder.mockResolvedValue({
      result: {
        order: { id: "order-123", state: "COMPLETED" },
      },
    })

    const { getOrder } = await import("@/lib/square/orders")
    const order = await getOrder("order-123")

    expect(order).toEqual({ id: "order-123", state: "COMPLETED" })
  })

  it("returns null on error", async () => {
    mockOrdersApi.retrieveOrder.mockRejectedValue(new Error("Not found"))

    const { getOrder } = await import("@/lib/square/orders")
    const order = await getOrder("order-404")

    expect(order).toBeNull()
  })
})

describe("searchOrders", () => {
  it("returns orders list", async () => {
    mockOrdersApi.searchOrders.mockResolvedValue({
      result: {
        orders: [{ id: "order-1" }, { id: "order-2" }],
      },
    })

    const { searchOrders } = await import("@/lib/square/orders")
    const orders = await searchOrders({
      locationId: "loc-123",
      limit: 50,
    })

    expect(orders).toHaveLength(2)
  })

  it("returns empty array on error", async () => {
    mockOrdersApi.searchOrders.mockRejectedValue(new Error("API error"))

    const { searchOrders } = await import("@/lib/square/orders")
    const orders = await searchOrders({ locationId: "loc-123" })

    expect(orders).toEqual([])
  })
})

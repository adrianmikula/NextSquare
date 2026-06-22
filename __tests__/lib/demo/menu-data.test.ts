import { describe, expect, it } from "vitest"

describe("demo menu data", () => {
  it("exports demo categories", async () => {
    const { demoCategories } = await import("@/lib/demo/menu-data")
    expect(demoCategories).toHaveLength(4)
    expect(demoCategories[0].categoryData?.name).toBe("Coffee")
  })

  it("exports demo menu items", async () => {
    const { demoMenuItems } = await import("@/lib/demo/menu-data")
    expect(demoMenuItems).toHaveLength(8)
    expect(demoMenuItems[0].itemData?.name).toBe("Latte")
    expect(demoMenuItems[0].itemData?.availableOnline).toBe(true)
  })

  it("menu items have BigInt price amounts", async () => {
    const { demoMenuItems } = await import("@/lib/demo/menu-data")
    const firstVar = demoMenuItems[0].itemData?.variations?.[0].itemVariationData?.priceMoney?.amount
    expect(typeof firstVar).toBe("bigint")
    expect(firstVar).toBe(BigInt(550))
  })
})

describe("getDemoOrder", () => {
  it("returns a known demo order", async () => {
    const { getDemoOrder } = await import("@/lib/demo/menu-data")
    const order = getDemoOrder("demo-order-001")
    expect(order).not.toBeNull()
    expect(order?.id).toBe("demo-order-001")
    expect(order?.state).toBe("COMPLETED")
    expect(order?.lineItems).toHaveLength(2)
  })

  it("returns null for unknown order id", async () => {
    const { getDemoOrder } = await import("@/lib/demo/menu-data")
    expect(getDemoOrder("nonexistent")).toBeNull()
  })

  it("includes fulfillment details in demo orders", async () => {
    const { getDemoOrder } = await import("@/lib/demo/menu-data")
    const order = getDemoOrder("demo-order-003")
    expect(order?.fulfillments?.[0].type).toBe("SHIPMENT")
    expect(order?.fulfillments?.[0].shipmentDetails?.recipient?.address?.locality).toBe("Melbourne")
  })
})

describe("createDemoOrder", () => {
  it("creates a new demo order with unique id", async () => {
    const { createDemoOrder } = await import("@/lib/demo/menu-data")
    const order = createDemoOrder()
    expect(order.id).toContain("demo-order-")
    expect(order.state).toBe("PROPOSED")
    expect(order.totalMoney.amount).toBe(BigInt(0))
  })
})

describe("createDemoPayment", () => {
  it("creates a demo payment", async () => {
    const { createDemoPayment } = await import("@/lib/demo/menu-data")
    const payment = createDemoPayment()
    expect(payment.id).toContain("demo-payment-")
    expect(payment.status).toBe("COMPLETED")
  })
})

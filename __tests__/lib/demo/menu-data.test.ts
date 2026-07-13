// @vitest-environment node
import { describe, expect, it } from "vitest"
import { demoCategories, demoMenuItems, getDemoOrder, createDemoOrder, createDemoPayment } from "@/lib/demo/menu-data"

describe("demo menu data", () => {
  it("exports demo categories", () => {
    expect(demoCategories).toHaveLength(4)
    expect(demoCategories[0].categoryData?.name).toBe("Coffee")
  })

  it("exports demo menu items", () => {
    expect(demoMenuItems).toHaveLength(8)
    expect(demoMenuItems[0].itemData?.name).toBe("Latte")
    expect(demoMenuItems[0].itemData?.availableOnline).toBe(true)
  })

  it("menu items have BigInt price amounts", () => {
    const firstVar = demoMenuItems[0].itemData?.variations?.[0].itemVariationData?.priceMoney?.amount
    expect(typeof firstVar).toBe("bigint")
    expect(firstVar).toBe(BigInt(550))
  })
})

describe("getDemoOrder", () => {
  it("returns a known demo order", () => {
    const order = getDemoOrder("demo-order-001")
    expect(order).not.toBeNull()
    expect(order?.id).toBe("demo-order-001")
    expect(order?.state).toBe("COMPLETED")
    expect(order?.lineItems).toHaveLength(2)
  })

  it("returns null for unknown order id", () => {
    expect(getDemoOrder("nonexistent")).toBeNull()
  })

  it("includes fulfillment details in demo orders", () => {
    const order = getDemoOrder("demo-order-003")
    expect(order?.fulfillments?.[0].type).toBe("SHIPMENT")
    expect(order?.fulfillments?.[0].shipmentDetails?.recipient?.address?.locality).toBe("Melbourne")
  })
})

describe("createDemoOrder", () => {
  it("creates a new demo order with unique id", () => {
    const order = createDemoOrder()
    expect(order.id).toContain("demo-order-")
    expect(order.state).toBe("PROPOSED")
    expect(order.totalMoney?.amount).toBe(BigInt(0))
  })
})

describe("createDemoPayment", () => {
  it("creates a demo payment", () => {
    const payment = createDemoPayment()
    expect(payment.id).toContain("demo-payment-")
    expect(payment.status).toBe("COMPLETED")
  })
})

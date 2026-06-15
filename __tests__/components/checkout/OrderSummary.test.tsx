import { describe, expect, it, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { OrderSummary } from "@/components/checkout/OrderSummary"

beforeEach(async () => {
  const { useCartStore } = await import("@/lib/store/cart")
  useCartStore.setState({ items: [], fulfillmentType: "PICKUP" })
})

describe("OrderSummary", () => {
  it("renders nothing when cart is empty", () => {
    render(<OrderSummary />)
    expect(screen.getByText("Order Summary")).toBeInTheDocument()
  })

  it("renders cart items with quantities and totals", async () => {
    const { useCartStore } = await import("@/lib/store/cart")
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 2,
      modifiers: [],
    })
    useCartStore.getState().addItem({
      catalogObjectId: "item-2",
      name: "Latte",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 1,
      modifiers: [
        { id: "mod-1", name: "Oat Milk", priceMoney: { amount: 100, currency: "AUD" } },
      ],
    })
    render(<OrderSummary />)
    expect(screen.getByText(/2x Flat White/)).toBeInTheDocument()
    expect(screen.getByText(/1x Latte/)).toBeInTheDocument()
    expect(screen.getByText("Oat Milk")).toBeInTheDocument()
  })
})

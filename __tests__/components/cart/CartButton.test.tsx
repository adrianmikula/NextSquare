import { describe, expect, it, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { CartButton } from "@/components/cart/CartButton"
import { useCartStore } from "@/lib/store/cart"

beforeEach(() => {
  useCartStore.setState({ items: [], fulfillmentType: "PICKUP", drawerOpen: false })
})

describe("CartButton", () => {
  it("renders without badge when cart is empty", () => {
    render(<CartButton />)
    const button = screen.getByRole("button", { name: /cart/i })
    expect(button).toBeInTheDocument()
  })

  it("shows badge with item count", () => {
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 2,
      modifiers: [],
    })
    render(<CartButton />)
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("shows 9+ when count exceeds 9", () => {
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 1,
      modifiers: [],
    })

    for (let i = 0; i < 10; i++) {
      useCartStore.getState().addItem({
        catalogObjectId: `item-${i}`,
        name: `Item ${i}`,
        priceMoney: { amount: 500, currency: "AUD" },
        quantity: 1,
        modifiers: [],
      })
    }

    render(<CartButton />)
    expect(screen.getByText("9+")).toBeInTheDocument()
  })
})

import { describe, expect, it, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useCart } from "@/hooks/useCart"

function TestComponent() {
  const cart = useCart()
  return (
    <div>
      <span data-testid="count">{cart.itemCount}</span>
      <span data-testid="subtotal">{cart.subtotal}</span>
      <span data-testid="type">{cart.fulfillmentType}</span>
      <span data-testid="items-count">{cart.items.length}</span>
      <button onClick={() => cart.addItem({
        catalogObjectId: "item-1",
        name: "Flat White",
        priceMoney: { amount: 550, currency: "AUD" },
        quantity: 1,
        modifiers: [],
      })}>
        Add Item
      </button>
      <button onClick={() => cart.setFulfillmentType("DELIVERY")}>
        Set Delivery
      </button>
      <button onClick={cart.clearCart}>Clear</button>
    </div>
  )
}

beforeEach(async () => {
  const { useCartStore } = await import("@/lib/store/cart")
  useCartStore.setState({ items: [], fulfillmentType: "PICKUP" })
})

describe("useCart", () => {
  it("returns initial empty cart state", () => {
    render(<TestComponent />)
    expect(screen.getByTestId("count").textContent).toBe("0")
    expect(screen.getByTestId("subtotal").textContent).toBe("0")
    expect(screen.getByTestId("type").textContent).toBe("PICKUP")
  })

  it("adds item and updates count", async () => {
    const user = userEvent.setup()
    render(<TestComponent />)
    await user.click(screen.getByText("Add Item"))
    expect(screen.getByTestId("count").textContent).toBe("1")
    expect(screen.getByTestId("items-count").textContent).toBe("1")
  })

  it("updates fulfillment type", async () => {
    const user = userEvent.setup()
    render(<TestComponent />)
    await user.click(screen.getByText("Set Delivery"))
    expect(screen.getByTestId("type").textContent).toBe("DELIVERY")
  })

  it("clears cart", async () => {
    const user = userEvent.setup()
    render(<TestComponent />)
    await user.click(screen.getByText("Add Item"))
    expect(screen.getByTestId("items-count").textContent).toBe("1")
    await user.click(screen.getByText("Clear"))
    expect(screen.getByTestId("items-count").textContent).toBe("0")
  })
})

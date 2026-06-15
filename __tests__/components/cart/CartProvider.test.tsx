import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CartProvider, useCartContext } from "@/components/cart/CartProvider"

function TestConsumer() {
  const { openCart, closeCart } = useCartContext()
  return (
    <div>
      <button onClick={openCart}>Open Cart</button>
      <button onClick={closeCart}>Close Cart</button>
    </div>
  )
}

beforeEach(async () => {
  const { useCartStore } = await import("@/lib/store/cart")
  useCartStore.setState({ items: [], fulfillmentType: "PICKUP" })
})

describe("CartProvider", () => {
  it("provides cart context to children", () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    )
    expect(screen.getByText("Open Cart")).toBeInTheDocument()
  })

  it("shows drawer heading when openCart is called", async () => {
    const user = userEvent.setup()
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    )
    await user.click(screen.getByText("Open Cart"))
    expect(screen.getByRole("heading", { name: /cart/i })).toBeInTheDocument()
  })

  it("closes the cart drawer when closeCart is called", async () => {
    const user = userEvent.setup()
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    )
    await user.click(screen.getByText("Open Cart"))
    expect(screen.getByRole("heading", { name: /cart/i })).toBeInTheDocument()
    await user.click(screen.getByText("Close Cart"))
    expect(screen.queryByRole("heading", { name: /cart/i })).not.toBeInTheDocument()
  })
})

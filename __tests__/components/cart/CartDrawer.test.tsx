import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CartDrawer } from "@/components/cart/CartDrawer"

beforeEach(async () => {
  const { useCartStore } = await import("@/lib/store/cart")
  useCartStore.setState({ items: [], fulfillmentType: "PICKUP" })
})

describe("CartDrawer", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <CartDrawer open={false} onClose={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("shows empty cart message when no items", () => {
    render(<CartDrawer open={true} onClose={vi.fn()} />)
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument()
    expect(screen.getByText("Browse our menu")).toBeInTheDocument()
  })

  it("shows cart items when items exist", async () => {
    const { useCartStore } = await import("@/lib/store/cart")
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 2,
      modifiers: [],
    })
    render(<CartDrawer open={true} onClose={vi.fn()} />)
    expect(screen.getByText("Flat White")).toBeInTheDocument()
    expect(screen.getByText("Proceed to Checkout")).toBeInTheDocument()
  })

  it("shows fulfillment type toggle", () => {
    render(<CartDrawer open={true} onClose={vi.fn()} />)
    expect(screen.getByText("Pickup")).toBeInTheDocument()
    expect(screen.getByText("Delivery")).toBeInTheDocument()
  })

  it("calls onClose when close button clicked", async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<CartDrawer open={true} onClose={onClose} />)
    const closeBtn = screen.getAllByRole("button").find(
      (b) => b.querySelector("svg")
    )
    if (closeBtn) {
      await user.click(closeBtn)
      expect(onClose).toHaveBeenCalled()
    }
  })

  it("displays item count in title", async () => {
    const { useCartStore } = await import("@/lib/store/cart")
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 3,
      modifiers: [],
    })
    render(<CartDrawer open={true} onClose={vi.fn()} />)
    expect(screen.getByText(/Cart/)?.textContent).toContain("3")
  })
})

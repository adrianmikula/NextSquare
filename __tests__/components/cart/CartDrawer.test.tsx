import { describe, expect, it, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { useCartStore } from "@/lib/store/cart"

beforeEach(() => {
  useCartStore.setState({ items: [], fulfillmentType: "PICKUP", drawerOpen: false })
})

describe("CartDrawer", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<CartDrawer />)
    expect(container.firstChild).toBeNull()
  })

  it("shows empty cart message when no items", () => {
    useCartStore.setState({ drawerOpen: true })
    render(<CartDrawer />)
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument()
    expect(screen.getByText("Browse our menu")).toBeInTheDocument()
  })

  it("shows cart items when items exist", () => {
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 2,
      modifiers: [],
    })
    useCartStore.setState({ drawerOpen: true })
    render(<CartDrawer />)
    expect(screen.getByText("Flat White")).toBeInTheDocument()
    expect(screen.getByText("Proceed to Checkout")).toBeInTheDocument()
  })

  it("shows fulfillment type toggle", () => {
    useCartStore.setState({ drawerOpen: true })
    render(<CartDrawer />)
    expect(screen.getByText("Pickup")).toBeInTheDocument()
    expect(screen.getByText("Delivery")).toBeInTheDocument()
  })

  it("closes drawer when close button clicked", async () => {
    useCartStore.setState({ drawerOpen: true })
    render(<CartDrawer />)
    const closeBtn = screen.getAllByRole("button").find(
      (b) => b.querySelector("svg")
    )
    if (closeBtn) {
      await userEvent.click(closeBtn)
      expect(useCartStore.getState().drawerOpen).toBe(false)
    }
  })

  it("displays item count in title", () => {
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 3,
      modifiers: [],
    })
    useCartStore.setState({ drawerOpen: true })
    render(<CartDrawer />)
    expect(screen.getByText(/Cart/)?.textContent).toContain("3")
  })
})

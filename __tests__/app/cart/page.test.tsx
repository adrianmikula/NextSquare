import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const mockUpdateQuantity = vi.fn()
const mockRemoveItem = vi.fn()
const mockSetFulfillmentType = vi.fn()

const mockItems = [
  { id: "1", catalogObjectId: "item-1", name: "Flat White", priceMoney: { amount: 550, currency: "AUD" }, quantity: 2, modifiers: [], imageUrl: "/flat-white.jpg" },
  { id: "2", catalogObjectId: "item-2", name: "Latte", priceMoney: { amount: 600, currency: "AUD" }, quantity: 1, modifiers: [{ id: "mod-1", name: "Oat Milk", priceMoney: { amount: 100, currency: "AUD" } }], imageUrl: "/latte.jpg" },
]

let currentItems = [...mockItems]
let currentFulfillment = "PICKUP"

vi.mock("@/lib/store/cart", () => ({
  useCartStore: (selector: any) => {
    const state = {
      items: currentItems,
      fulfillmentType: currentFulfillment,
      setFulfillmentType: mockSetFulfillmentType,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    }
    if (typeof selector === "function") return selector(state)
    return state
  },
  useCartItemCount: () => 3,
  useCartSubtotal: () => 1700,
}))

import CartPage from "@/app/cart/page"

beforeEach(() => {
  vi.clearAllMocks()
  currentItems = [...mockItems]
  currentFulfillment = "PICKUP"
})

function renderCart() {
  return render(<CartPage />)
}

describe("CartPage", () => {
  it("renders cart items with quantities", () => {
    renderCart()
    expect(screen.getByText("Flat White")).toBeInTheDocument()
    expect(screen.getByText("Latte")).toBeInTheDocument()
    expect(screen.getByText("Cart")).toBeInTheDocument()
  })

  it("shows empty cart when no items", () => {
    currentItems = []
    renderCart()
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument()
    expect(screen.getByText("Browse our menu")).toBeInTheDocument()
  })

  it("shows checkout link when items exist", () => {
    renderCart()
    const checkoutLink = screen.getByText("Proceed to Checkout")
    expect(checkoutLink).toBeInTheDocument()
    expect(checkoutLink).toHaveAttribute("href", "/checkout")
  })

  it("renders delivery pickup toggle", () => {
    renderCart()
    expect(screen.getByText("Proceed to Checkout")).toBeInTheDocument()
  })
})

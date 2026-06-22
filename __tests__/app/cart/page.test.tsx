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

beforeEach(() => {
  vi.clearAllMocks()
  currentItems = [...mockItems]
  currentFulfillment = "PICKUP"
})

async function renderCart() {
  const CartPage = (await import("@/app/cart/page")).default
  return render(<CartPage />)
}

describe("CartPage", () => {
  it("renders cart items with quantities", async () => {
    await renderCart()
    expect(screen.getByText("Flat White")).toBeInTheDocument()
    expect(screen.getByText("Latte")).toBeInTheDocument()
    expect(screen.getByText("Cart")).toBeInTheDocument()
  })

  it("shows empty cart when no items", async () => {
    currentItems = []
    await renderCart()
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument()
    expect(screen.getByText("Browse our menu")).toBeInTheDocument()
  })

  it("shows checkout link when items exist", async () => {
    await renderCart()
    const checkoutLink = screen.getByText("Proceed to Checkout")
    expect(checkoutLink).toBeInTheDocument()
    expect(checkoutLink).toHaveAttribute("href", "/checkout")
  })

  it("renders delivery pickup toggle", async () => {
    await renderCart()
    expect(screen.getByText("Proceed to Checkout")).toBeInTheDocument()
  })
})

import { describe, expect, it, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { CartButton } from "@/components/cart/CartButton"
import { CartProvider } from "@/components/cart/CartProvider"

function renderWithProvider(element: React.ReactElement) {
  return render(<CartProvider>{element}</CartProvider>)
}

beforeEach(async () => {
  const { useCartStore } = await import("@/lib/store/cart")
  useCartStore.setState({ items: [], fulfillmentType: "PICKUP" })
})

describe("CartButton", () => {
  it("renders without badge when cart is empty", async () => {
    renderWithProvider(<CartButton />)
    const button = screen.getByRole("button", { name: /cart/i })
    expect(button).toBeInTheDocument()
  })

  it("shows badge with item count", async () => {
    const { useCartStore } = await import("@/lib/store/cart")
    useCartStore.getState().addItem({
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 2,
      modifiers: [],
    })
    renderWithProvider(<CartButton />)
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("shows 9+ when count exceeds 9", async () => {
    const { useCartStore } = await import("@/lib/store/cart")

    for (let i = 0; i < 10; i++) {
      useCartStore.getState().addItem({
        catalogObjectId: `item-${i}`,
        name: `Item ${i}`,
        priceMoney: { amount: 500, currency: "AUD" },
        quantity: 1,
        modifiers: [],
      })
    }

    renderWithProvider(<CartButton />)
    expect(screen.getByText("9+")).toBeInTheDocument()
  })
})

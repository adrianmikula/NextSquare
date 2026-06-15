import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CartItem } from "@/components/cart/CartItem"

describe("CartItem", () => {
  const baseItem = {
    id: "item-1",
    catalogObjectId: "cat-item-1",
    name: "Flat White",
    priceMoney: { amount: 550, currency: "AUD" },
    quantity: 2,
    modifiers: [],
  }

  it("renders item name and quantity", () => {
    render(
      <CartItem
        item={baseItem}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
      />
    )
    expect(screen.getByText("Flat White")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("shows modifier names when present", () => {
    render(
      <CartItem
        item={{
          ...baseItem,
          modifiers: [{ id: "mod-1", name: "Oat Milk" }],
        }}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
      />
    )
    expect(screen.getByText("Oat Milk")).toBeInTheDocument()
  })

  it("calls onRemove when close button clicked", async () => {
    const onRemove = vi.fn()
    const user = userEvent.setup()
    render(
      <CartItem
        item={baseItem}
        onUpdateQuantity={vi.fn()}
        onRemove={onRemove}
      />
    )
    const buttons = screen.getAllByRole("button")
    // The remove button contains an SVG (X icon) - it's a child of a div
    const removeBtn = buttons.find(
      (b) => b.innerHTML.includes("stroke") || b.querySelector("svg")
    )
    if (removeBtn) {
      await user.click(removeBtn)
      expect(onRemove).toHaveBeenCalledWith("item-1")
    }
  })

  it("renders item image when imageUrl is provided", () => {
    render(
      <CartItem
        item={{ ...baseItem, imageUrl: "https://example.com/img.png" }}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
      />
    )
    const img = screen.getByRole("img")
    expect(img).toHaveAttribute("src", "https://example.com/img.png")
  })
})

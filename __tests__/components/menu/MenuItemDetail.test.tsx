import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MenuItemDetail } from "@/components/menu/MenuItemDetail"

describe("MenuItemDetail", () => {
  const baseItem: any = {
    id: "item-1",
    type: "ITEM",
    itemData: {
      name: "Flat White",
      description: "Smooth espresso drink",
      variations: [
        {
          id: "var-1",
          type: "ITEM_VARIATION",
          itemVariationData: {
            itemId: "item-1",
            name: "Regular",
            pricingType: "FIXED_PRICING",
            priceMoney: { amount: BigInt(550), currency: "AUD" },
          },
        },
      ],
    },
  }

  it("renders item name, description, and price", () => {
    render(
      <MenuItemDetail
        item={baseItem}
        onClose={vi.fn()}
        onAddToCart={vi.fn()}
      />
    )
    expect(screen.getByText("Flat White")).toBeInTheDocument()
    expect(screen.getByText("Smooth espresso drink")).toBeInTheDocument()
    const prices = screen.getAllByText("$5.50")
    expect(prices.length).toBeGreaterThanOrEqual(1)
  })

  it("shows quantity controls", () => {
    render(
      <MenuItemDetail
        item={baseItem}
        onClose={vi.fn()}
        onAddToCart={vi.fn()}
      />
    )
    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("−")).toBeInTheDocument()
    expect(screen.getByText("+")).toBeInTheDocument()
  })

  it("increments quantity when + is clicked", async () => {
    const user = userEvent.setup()
    render(
      <MenuItemDetail
        item={baseItem}
        onClose={vi.fn()}
        onAddToCart={vi.fn()}
      />
    )
    await user.click(screen.getByText("+"))
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("decrements quantity when − is clicked", async () => {
    const user = userEvent.setup()
    render(
      <MenuItemDetail
        item={baseItem}
        onClose={vi.fn()}
        onAddToCart={vi.fn()}
      />
    )
    await user.click(screen.getByText("+"))
    await user.click(screen.getByText("+"))
    expect(screen.getByText("3")).toBeInTheDocument()
    await user.click(screen.getByText("−"))
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("does not decrement below 1", async () => {
    const user = userEvent.setup()
    render(
      <MenuItemDetail
        item={baseItem}
        onClose={vi.fn()}
        onAddToCart={vi.fn()}
      />
    )
    await user.click(screen.getByText("−"))
    expect(screen.getByText("1")).toBeInTheDocument()
  })

  it("calls onAddToCart with modifiers and quantity", async () => {
    const onAddToCart = vi.fn()
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <MenuItemDetail
        item={baseItem}
        onClose={onClose}
        onAddToCart={onAddToCart}
      />
    )
    const addBtn = screen.getByRole("button", { name: /add to cart/i })
    await user.click(addBtn)
    expect(onAddToCart).toHaveBeenCalledWith([], 1)
    expect(onClose).toHaveBeenCalled()
  })

  it("calls onClose when close button clicked", async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <MenuItemDetail
        item={baseItem}
        onClose={onClose}
        onAddToCart={vi.fn()}
      />
    )
    await user.click(screen.getByText("✕"))
    expect(onClose).toHaveBeenCalled()
  })
})

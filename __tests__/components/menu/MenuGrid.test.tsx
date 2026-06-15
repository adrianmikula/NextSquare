import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MenuGrid } from "@/components/menu/MenuGrid"

describe("MenuGrid", () => {
  const items = [
    {
      id: "item-1",
      type: "ITEM" as const,
      itemData: {
        name: "Flat White",
        variations: [
          {
            id: "var-1",
            type: "ITEM_VARIATION" as const,
            itemVariationData: {
              itemId: "item-1",
              name: "Regular",
              pricingType: "FIXED_PRICING" as const,
              priceMoney: { amount: BigInt(550), currency: "AUD" },
            },
          },
        ],
      },
    },
    {
      id: "item-2",
      type: "ITEM" as const,
      itemData: {
        name: "Latte",
        variations: [
          {
            id: "var-2",
            type: "ITEM_VARIATION" as const,
            itemVariationData: {
              itemId: "item-2",
              name: "Regular",
              pricingType: "FIXED_PRICING" as const,
              priceMoney: { amount: BigInt(550), currency: "AUD" },
            },
          },
        ],
      },
    },
  ]

  it("renders all items", () => {
    render(<MenuGrid items={items as any} onAddItem={vi.fn()} />)
    expect(screen.getByText("Flat White")).toBeInTheDocument()
    expect(screen.getByText("Latte")).toBeInTheDocument()
  })

  it("shows empty message when no items", () => {
    render(<MenuGrid items={[]} onAddItem={vi.fn()} />)
    expect(screen.getByText("No menu items available.")).toBeInTheDocument()
  })
})

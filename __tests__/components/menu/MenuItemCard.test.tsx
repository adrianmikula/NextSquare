import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MenuItemCard } from "@/components/menu/MenuItemCard"
import type { SquareCatalogItem } from "@/types/square"

describe("MenuItemCard", () => {
  const baseItem = {
    id: "item-1",
    type: "ITEM" as const,
    itemData: {
      name: "Flat White",
      description: "Smooth espresso drink",
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
  } satisfies Partial<SquareCatalogItem>

  it("renders item name and price", () => {
    const onAdd = vi.fn()
    render(<MenuItemCard item={baseItem as SquareCatalogItem} onAdd={onAdd} />)
    expect(screen.getByText("Flat White")).toBeInTheDocument()
    expect(screen.getByText("$5.50")).toBeInTheDocument()
  })

  it("renders description when provided", () => {
    const onAdd = vi.fn()
    render(<MenuItemCard item={baseItem as SquareCatalogItem} onAdd={onAdd} />)
    expect(screen.getByText("Smooth espresso drink")).toBeInTheDocument()
  })
})

import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const mockAddItem = vi.fn()

vi.mock("@/hooks/useMenu", () => ({
  useMenu: vi.fn(),
}))

vi.mock("@/lib/store/cart", () => ({
  useCartStore: (selector: any) => {
    const state = { addItem: mockAddItem }
    if (typeof selector === "function") return selector(state)
    return state
  },
}))

import { useMenu } from "@/hooks/useMenu"

const baseItems = [
  {
    id: "item-1",
    type: "ITEM",
    itemData: {
      name: "Flat White",
      description: "Smooth espresso with milk",
      categoryId: "cat-coffee",
      variations: [{ id: "var-1", itemVariationData: { name: "Regular", pricingType: "FIXED_PRICING", priceMoney: { amount: BigInt(550), currency: "AUD" } } }],
      modifiers: [],
    },
    imageUrl: "/flat-white.jpg",
  },
  {
    id: "item-2",
    type: "ITEM",
    itemData: {
      name: "Latte",
      description: "Espresso with steamed milk",
      categoryId: "cat-coffee",
      variations: [{ id: "var-2", itemVariationData: { name: "Regular", pricingType: "FIXED_PRICING", priceMoney: { amount: BigInt(600), currency: "AUD" } } }],
      modifiers: [
        {
          id: "mod-list-1",
          modifierListData: { name: "Milk", selectionType: "SINGLE", modifiers: [{ id: "mod-oat", modifierData: { name: "Oat Milk", priceMoney: { amount: BigInt(100), currency: "AUD" } } }] },
        },
      ],
    },
  },
]

const categories = [
  { id: "cat-coffee", categoryData: { name: "Coffee" } },
]

beforeEach(() => {
  vi.clearAllMocks()
  mockAddItem.mockReset()
})

async function renderMenu() {
  const MenuPage = (await import("@/app/menu/page")).default
  return render(<MenuPage />)
}

describe("MenuPage", () => {
  it("shows loading skeleton when isLoading is true", async () => {
    vi.mocked(useMenu).mockReturnValue({ items: [], categories: [], isLoading: true, isError: false })
    const { container } = await renderMenu()
    const skeletons = container.querySelectorAll(".animate-pulse")
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("renders menu items and categories when loaded", async () => {
    vi.mocked(useMenu).mockReturnValue({ items: baseItems, categories, isLoading: false, isError: false })
    await renderMenu()
    expect(screen.getByText("Flat White")).toBeInTheDocument()
    expect(screen.getByText("Latte")).toBeInTheDocument()
    expect(screen.getByText("Coffee")).toBeInTheDocument()
  })

  it("filters items by category when category is selected", async () => {
    vi.mocked(useMenu).mockReturnValue({
      items: [
        ...baseItems,
        {
          id: "item-3",
          type: "ITEM",
          itemData: { name: "Avocado Toast", categoryId: "cat-food", variations: [{ id: "var-3", itemVariationData: { name: "Regular", pricingType: "FIXED_PRICING", priceMoney: { amount: BigInt(1400), currency: "AUD" } } }], modifiers: [] },
        },
      ],
      categories: [...categories, { id: "cat-food", categoryData: { name: "Food" } }],
      isLoading: false,
      isError: false,
    })
    await renderMenu()
    await userEvent.click(screen.getByText("Food"))
    expect(screen.queryByText("Flat White")).not.toBeInTheDocument()
    expect(screen.getByText("Avocado Toast")).toBeInTheDocument()
  })

  it("adds item directly to cart when no modifiers", async () => {
    vi.mocked(useMenu).mockReturnValue({ items: baseItems, categories, isLoading: false, isError: false })
    await renderMenu()
    const addButtons = screen.getAllByText("Add")
    await userEvent.click(addButtons[0])
    expect(mockAddItem).toHaveBeenCalledWith({
      catalogObjectId: "item-1",
      name: "Flat White",
      priceMoney: { amount: 550, currency: "AUD" },
      quantity: 1,
      modifiers: [],
      imageUrl: "/flat-white.jpg",
    })
  })

  it("opens detail dialog for items with modifiers", async () => {
    vi.mocked(useMenu).mockReturnValue({ items: baseItems, categories, isLoading: false, isError: false })
    await renderMenu()
    const addButtons = screen.getAllByText("Add")
    await userEvent.click(addButtons[1])
    expect(screen.getByRole("heading", { name: "Latte", level: 2 })).toBeInTheDocument()
  })
})

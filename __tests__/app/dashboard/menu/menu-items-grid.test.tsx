import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MenuItemsGrid } from "@/app/dashboard/menu/menu-items-grid"

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

const mockItems = [
  {
    id: "item-1",
    name: "Flat White",
    description: "Smooth espresso drink",
    priceMoney: { amount: 550, currency: "AUD" },
    availableForOnline: true,
    categoryName: "Coffee",
  },
  {
    id: "item-2",
    name: "Avocado Toast",
    description: "Sourdough, smashed avo, feta",
    priceMoney: { amount: 1400, currency: "AUD" },
    availableForOnline: true,
    categoryName: "Food",
  },
  {
    id: "item-3",
    name: "Croissant",
    priceMoney: { amount: 500, currency: "AUD" },
    availableForOnline: false,
    categoryName: "Pastries",
  },
]

describe("MenuItemsGrid", () => {
  it("renders all items", () => {
    render(<MenuItemsGrid items={mockItems} categories={["Coffee", "Food", "Pastries"]} />)
    expect(screen.getByText("Flat White")).toBeDefined()
    expect(screen.getByText("Avocado Toast")).toBeDefined()
    expect(screen.getByText("Croissant")).toBeDefined()
  })

  it("shows item count", () => {
    render(<MenuItemsGrid items={mockItems} categories={["Coffee", "Food", "Pastries"]} />)
    expect(screen.getByText("3 items total")).toBeDefined()
  })

  it("shows price formatted correctly", () => {
    render(<MenuItemsGrid items={mockItems} categories={["Coffee", "Food", "Pastries"]} />)
    expect(screen.getByText("$5.50")).toBeDefined()
    expect(screen.getByText("$14.00")).toBeDefined()
    expect(screen.getByText("$5.00")).toBeDefined()
  })

  it("shows unavailable status", () => {
    render(<MenuItemsGrid items={mockItems} categories={["Coffee", "Food", "Pastries"]} />)
    expect(screen.getByText("Unavailable")).toBeDefined()
  })

  it("shows dash for items without price", () => {
    const noPriceItems = [
      { ...mockItems[0], priceMoney: undefined, name: "No Price Item" },
    ]
    render(<MenuItemsGrid items={noPriceItems} categories={[]} />)
    expect(screen.getByText("—")).toBeDefined()
  })

  it("filters items by search", async () => {
    render(<MenuItemsGrid items={mockItems} categories={["Coffee", "Food", "Pastries"]} />)
    const searchInput = screen.getByPlaceholderText("Search menu items...")
    await userEvent.type(searchInput, "flat")
    expect(screen.getByText("Flat White")).toBeDefined()
    expect(screen.queryByText("Avocado Toast")).toBeNull()
    expect(screen.queryByText("Croissant")).toBeNull()
  })

  it("filters items by category", async () => {
    render(<MenuItemsGrid items={mockItems} categories={["Coffee", "Food", "Pastries"]} />)
    await userEvent.click(screen.getByText("Food"))
    expect(screen.getByText("Avocado Toast")).toBeDefined()
    expect(screen.queryByText("Flat White")).toBeNull()
  })

  it("shows empty state when no items match", async () => {
    render(<MenuItemsGrid items={mockItems} categories={["Coffee", "Food", "Pastries"]} />)
    const searchInput = screen.getByPlaceholderText("Search menu items...")
    await userEvent.type(searchInput, "nonexistent")
    expect(screen.getByText("No items match your search")).toBeDefined()
  })

  it("links items to their edit page", () => {
    render(<MenuItemsGrid items={mockItems} categories={["Coffee", "Food", "Pastries"]} />)
    const links = screen.getAllByRole("link")
    expect(links.some((l) => l.getAttribute("href") === "/dashboard/menu/item-1")).toBe(true)
  })

  it("renders item descriptions when present", () => {
    render(<MenuItemsGrid items={mockItems} categories={["Coffee", "Food", "Pastries"]} />)
    expect(screen.getByText("Smooth espresso drink")).toBeDefined()
  })

  it("does not render description for items without one", () => {
    render(<MenuItemsGrid items={mockItems} categories={["Coffee", "Food", "Pastries"]} />)
    expect(screen.queryByText("Buttery, flaky French pastry")).toBeNull()
  })

  it("resets category filter to show all items", async () => {
    render(<MenuItemsGrid items={mockItems} categories={["Coffee", "Food", "Pastries"]} />)
    await userEvent.click(screen.getByText("Food"))
    expect(screen.queryByText("Flat White")).toBeNull()
    await userEvent.click(screen.getByText("All"))
    expect(screen.getByText("Flat White")).toBeDefined()
  })
})

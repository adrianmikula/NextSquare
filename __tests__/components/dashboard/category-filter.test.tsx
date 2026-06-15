import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CategoryFilter } from "@/components/dashboard/category-filter"

describe("CategoryFilter", () => {
  const categories = ["Coffee", "Food", "Pastries"]

  it("renders all categories plus All button", () => {
    render(
      <CategoryFilter
        categories={categories}
        selected={null}
        onSelect={() => {}}
      />
    )
    expect(screen.getByText("All")).toBeDefined()
    expect(screen.getByText("Coffee")).toBeDefined()
    expect(screen.getByText("Food")).toBeDefined()
    expect(screen.getByText("Pastries")).toBeDefined()
  })

  it("highlights selected category", () => {
    render(
      <CategoryFilter
        categories={categories}
        selected="Coffee"
        onSelect={() => {}}
      />
    )
    const coffeeBtn = screen.getByText("Coffee")
    expect(coffeeBtn.className).toContain("bg-amber-600")
  })

  it("calls onSelect when category is clicked", async () => {
    const onSelect = vi.fn()
    render(
      <CategoryFilter
        categories={categories}
        selected={null}
        onSelect={onSelect}
      />
    )
    await userEvent.click(screen.getByText("Food"))
    expect(onSelect).toHaveBeenCalledWith("Food")
  })

  it("calls onSelect with null when All is clicked", async () => {
    const onSelect = vi.fn()
    render(
      <CategoryFilter
        categories={categories}
        selected="Coffee"
        onSelect={onSelect}
      />
    )
    await userEvent.click(screen.getByText("All"))
    expect(onSelect).toHaveBeenCalledWith(null)
  })
})

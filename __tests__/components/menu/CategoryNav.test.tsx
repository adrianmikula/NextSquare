import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CategoryNav } from "@/components/menu/CategoryNav"

describe("CategoryNav", () => {
  const categories = [
    { id: "cat-1", type: "CATEGORY" as const, categoryData: { name: "Coffee" } },
    { id: "cat-2", type: "CATEGORY" as const, categoryData: { name: "Food" } },
    { id: "cat-3", type: "CATEGORY" as const, categoryData: { name: "Pastries" } },
  ]

  it("renders All button and all categories", () => {
    render(
      <CategoryNav
        categories={categories}
        activeCategory={null}
        onSelect={vi.fn()}
      />
    )
    expect(screen.getByText("All")).toBeInTheDocument()
    expect(screen.getByText("Coffee")).toBeInTheDocument()
    expect(screen.getByText("Food")).toBeInTheDocument()
    expect(screen.getByText("Pastries")).toBeInTheDocument()
  })

  it("highlights All when no category is active", () => {
    render(
      <CategoryNav
        categories={categories}
        activeCategory={null}
        onSelect={vi.fn()}
      />
    )
    expect(screen.getByText("All").className).toContain("bg-amber-600")
  })

  it("highlights the active category", () => {
    render(
      <CategoryNav
        categories={categories}
        activeCategory="cat-2"
        onSelect={vi.fn()}
      />
    )
    expect(screen.getByText("Food").className).toContain("bg-amber-600")
    expect(screen.getByText("All").className).not.toContain("bg-amber-600")
  })

  it("calls onSelect with category id when category clicked", async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(
      <CategoryNav
        categories={categories}
        activeCategory={null}
        onSelect={onSelect}
      />
    )
    await user.click(screen.getByText("Coffee"))
    expect(onSelect).toHaveBeenCalledWith("cat-1")
  })

  it("calls onSelect with null when All clicked", async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(
      <CategoryNav
        categories={categories}
        activeCategory="cat-1"
        onSelect={onSelect}
      />
    )
    await user.click(screen.getByText("All"))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it("handles empty categories", () => {
    render(
      <CategoryNav
        categories={[]}
        activeCategory={null}
        onSelect={vi.fn()}
      />
    )
    expect(screen.getByText("All")).toBeInTheDocument()
  })
})

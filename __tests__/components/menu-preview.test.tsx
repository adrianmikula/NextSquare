import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MenuPreview } from "@/components/menu-preview"

vi.mock("@/lib/utils", () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(" "),
}))

describe("MenuPreview", () => {
  function renderMenuPreview() {
    return render(<MenuPreview />)
  }

  it("renders section heading", () => {
    renderMenuPreview()
    expect(screen.getByText("Our Menu")).toBeInTheDocument()
  })

  it("renders all three preview items", () => {
    renderMenuPreview()
    expect(screen.getByText("Flat White")).toBeInTheDocument()
    expect(screen.getByText("Avocado Toast")).toBeInTheDocument()
    expect(screen.getByText("Cold Brew")).toBeInTheDocument()
  })

  it("renders prices for each item", () => {
    renderMenuPreview()
    expect(screen.getByText("$5.50")).toBeInTheDocument()
    expect(screen.getByText("$14.00")).toBeInTheDocument()
    expect(screen.getByText("$6.00")).toBeInTheDocument()
  })

  it("renders descriptions", () => {
    renderMenuPreview()
    expect(screen.getByText(/Double shot espresso/)).toBeInTheDocument()
    expect(screen.getByText(/Sourdough/)).toBeInTheDocument()
    expect(screen.getByText(/Slow-steeped/)).toBeInTheDocument()
  })

  it("renders view full menu link", () => {
    renderMenuPreview()
    const link = screen.getByText("View Full Menu")
    expect(link).toBeInTheDocument()
    expect(link.closest("a")).toHaveAttribute("href", "/menu")
  })
})

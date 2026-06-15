import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

describe("DashboardHeader", () => {
  it("renders title", () => {
    render(<DashboardHeader title="Menu Management" />)
    expect(screen.getByText("Menu Management")).toBeDefined()
  })

  it("renders description when provided", () => {
    render(
      <DashboardHeader title="Menu" description="Manage your menu items" />
    )
    expect(screen.getByText("Manage your menu items")).toBeDefined()
  })

  it("does not render description when not provided", () => {
    const { container } = render(<DashboardHeader title="Menu" />)
    const paragraphs = container.querySelectorAll("p")
    expect(paragraphs.length).toBe(0)
  })

  it("renders children when provided", () => {
    render(
      <DashboardHeader title="Menu">
        <button>Add item</button>
      </DashboardHeader>
    )
    expect(screen.getByRole("button", { name: "Add item" })).toBeDefined()
  })

  it("does not render children wrapper when no children", () => {
    const { container } = render(<DashboardHeader title="Menu" />)
    const flexWrappers = container.querySelectorAll(".flex.items-center.gap-3")
    expect(flexWrappers.length).toBe(0)
  })
})

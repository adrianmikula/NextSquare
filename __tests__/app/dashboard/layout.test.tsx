import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@/components/dashboard/sidebar", () => ({
  Sidebar: () => <nav data-testid="sidebar">Sidebar</nav>,
}))

import DashboardLayout from "@/app/dashboard/layout"

describe("DashboardLayout", () => {
  it("renders the sidebar", () => {
    render(<DashboardLayout><div>Content</div></DashboardLayout>)
    expect(screen.getByTestId("sidebar")).toBeInTheDocument()
  })

  it("renders children in main content area", () => {
    render(<DashboardLayout><p data-testid="child">Child</p></DashboardLayout>)
    expect(screen.getByTestId("child")).toBeInTheDocument()
  })

  it("renders main element with flex-1 class", () => {
    render(<DashboardLayout><p>Content</p></DashboardLayout>)
    const main = document.querySelector("main")
    expect(main).toHaveClass("flex-1")
  })
})

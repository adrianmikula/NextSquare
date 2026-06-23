import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@/components/dashboard/stat-card", () => ({
  StatCard: ({ title, value, icon }: any) => (
    <div data-testid="stat-card">
      <span data-testid="stat-title">{title}</span>
      <span data-testid="stat-value">{value}</span>
      {icon && <span data-testid="stat-icon">icon</span>}
    </div>
  ),
}))

import DashboardPage from "@/app/dashboard/page"

describe("DashboardPage", () => {
  it("renders the overview heading", () => {
    render(<DashboardPage />)
    expect(screen.getByText("Overview")).toBeInTheDocument()
  })

  it("renders welcome subheading", () => {
    render(<DashboardPage />)
    expect(screen.getByText("Welcome to your cafe dashboard")).toBeInTheDocument()
  })

  it("renders four stat cards", () => {
    render(<DashboardPage />)
    const statCards = screen.getAllByTestId("stat-card")
    expect(statCards).toHaveLength(4)
  })

  it("renders the expected stat card titles", () => {
    render(<DashboardPage />)
    const titles = screen.getAllByTestId("stat-title")
    const titleTexts = titles.map((el) => el.textContent)
    expect(titleTexts).toEqual(["Today's Revenue", "Today's Orders", "Menu Items", "Open Now"])
  })

  it("renders stat cards with placeholder values", () => {
    render(<DashboardPage />)
    const values = screen.getAllByTestId("stat-value")
    values.forEach((v) => {
      expect(v.textContent).toBe("—")
    })
  })

  it("renders the Square connection prompt", () => {
    render(<DashboardPage />)
    expect(screen.getByText(/Connect Square to see real-time revenue/)).toBeInTheDocument()
  })
})

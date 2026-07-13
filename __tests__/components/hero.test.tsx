import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { Hero } from "@/components/hero"

vi.mock("@/components/order-button", () => ({
  OrderButton: () => <div data-testid="order-button" />,
}))

describe("Hero", () => {
  function renderHero() {
    return render(<Hero />)
  }

  it("renders headline text", () => {
    renderHero()
    expect(screen.getByText("Fresh Coffee,")).toBeInTheDocument()
    expect(screen.getByText("Great Vibes")).toBeInTheDocument()
  })

  it("renders description text", () => {
    renderHero()
    expect(screen.getByText(/Handcrafted coffee/)).toBeInTheDocument()
  })

  it("renders order button", () => {
    renderHero()
    expect(screen.getByTestId("order-button")).toBeInTheDocument()
  })
})

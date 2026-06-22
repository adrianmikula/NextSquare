import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@/components/order-button", () => ({
  OrderButton: () => <div data-testid="order-button" />,
}))

describe("Hero", () => {
  async function renderHero() {
    const { Hero } = await import("@/components/hero")
    return render(<Hero />)
  }

  it("renders headline text", async () => {
    await renderHero()
    expect(screen.getByText("Fresh Coffee,")).toBeInTheDocument()
    expect(screen.getByText("Great Vibes")).toBeInTheDocument()
  })

  it("renders description text", async () => {
    await renderHero()
    expect(screen.getByText(/Handcrafted coffee/)).toBeInTheDocument()
  })

  it("renders order button", async () => {
    await renderHero()
    expect(screen.getByTestId("order-button")).toBeInTheDocument()
  })
})

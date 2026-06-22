import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@/components/order-button", () => ({
  OrderButton: () => <div data-testid="order-button" />,
}))

vi.mock("@/components/cart/CartButton", () => ({
  CartButton: () => <div data-testid="cart-button" />,
}))

vi.mock("@/components/layout/mobile-menu", () => ({
  MobileMenuClient: () => <div data-testid="mobile-menu-client" />,
}))

async function renderHeader() {
  const { Header } = await import("@/components/layout/header")
  return render(<Header />)
}

describe("Header", () => {
  it("renders the cafe name and logo", async () => {
    await renderHeader()
    expect(screen.getByText("Cafe Template")).toBeInTheDocument()
  })

  it("renders all navigation links", async () => {
    await renderHeader()
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Menu")).toBeInTheDocument()
    expect(screen.getByText("About")).toBeInTheDocument()
    expect(screen.getByText("Contact")).toBeInTheDocument()
  })

  it("renders order and cart buttons", async () => {
    await renderHeader()
    expect(screen.getByTestId("order-button")).toBeInTheDocument()
    expect(screen.getByTestId("cart-button")).toBeInTheDocument()
  })

  it("renders mobile menu", async () => {
    await renderHeader()
    expect(screen.getByTestId("mobile-menu-client")).toBeInTheDocument()
  })

  it("has correct href attributes on nav links", async () => {
    await renderHeader()
    expect(screen.getByText("Home").closest("a")).toHaveAttribute("href", "/")
    expect(screen.getByText("Menu").closest("a")).toHaveAttribute("href", "/menu")
    expect(screen.getByText("About").closest("a")).toHaveAttribute("href", "/about")
    expect(screen.getByText("Contact").closest("a")).toHaveAttribute("href", "/contact")
  })

  it("has a link to home on the logo", async () => {
    await renderHeader()
    expect(screen.getByText("Cafe Template").closest("a")).toHaveAttribute("href", "/")
  })
})

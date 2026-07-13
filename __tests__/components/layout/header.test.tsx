import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { Suspense } from "react"
import { Header } from "@/components/layout/header"

vi.mock("@/components/order-button", () => ({
  OrderButton: () => <div data-testid="order-button" />,
}))

vi.mock("@/components/cart/CartButton", () => ({
  CartButton: () => <div data-testid="cart-button" />,
}))

vi.mock("@/components/layout/mobile-menu", () => ({
  MobileMenuClient: () => <div data-testid="mobile-menu-client">Mobile Menu</div>,
}))

function renderHeader() {
  return render(
    <Suspense fallback={<div>Loading navigation...</div>}>
      <Header />
    </Suspense>
  )
}

describe("Header", () => {
  it("renders the cafe name and logo", () => {
    renderHeader()
    expect(screen.getByText("Cafe Template")).toBeInTheDocument()
  })

  it("renders all navigation links", () => {
    renderHeader()
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Menu")).toBeInTheDocument()
    expect(screen.getByText("About")).toBeInTheDocument()
    expect(screen.getByText("Contact")).toBeInTheDocument()
  })

  it("renders order and cart buttons", () => {
    renderHeader()
    expect(screen.getByTestId("order-button")).toBeInTheDocument()
    const cartButtons = screen.getAllByTestId("cart-button")
    expect(cartButtons.length).toBeGreaterThanOrEqual(1)
  })

  it("renders mobile menu", () => {
    renderHeader()
    expect(screen.getByTestId("mobile-menu-client")).toBeInTheDocument()
  })

  it("has correct href attributes on nav links", () => {
    renderHeader()
    expect(screen.getByText("Home").closest("a")).toHaveAttribute("href", "/")
    expect(screen.getByText("Menu").closest("a")).toHaveAttribute("href", "/menu")
    expect(screen.getByText("About").closest("a")).toHaveAttribute("href", "/about")
    expect(screen.getByText("Contact").closest("a")).toHaveAttribute("href", "/contact")
  })

  it("has a link to home on the logo", () => {
    renderHeader()
    expect(screen.getByText("Cafe Template").closest("a")).toHaveAttribute("href", "/")
  })
})

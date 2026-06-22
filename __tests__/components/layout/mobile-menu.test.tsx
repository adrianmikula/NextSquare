import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

vi.mock("@/components/order-button", () => ({
  OrderButton: () => <div data-testid="order-button" />,
}))

vi.mock("@/components/cart/CartButton", () => ({
  CartButton: () => <div data-testid="cart-button" />,
}))

describe("MobileMenuClient", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.style.overflow = ""
  })

  afterEach(() => {
    document.body.style.overflow = ""
  })

  async function renderMenu() {
    const { MobileMenuClient } = await import("@/components/layout/mobile-menu")
    return render(<MobileMenuClient />)
  }

  it("renders menu toggle button initially", async () => {
    await renderMenu()
    const toggle = screen.getByLabelText("Open menu")
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute("aria-expanded", "false")
  })

  it("renders navigation links when opened", async () => {
    await renderMenu()
    await userEvent.click(screen.getByLabelText("Open menu"))
    expect(screen.getByLabelText("Close menu")).toBeInTheDocument()
    expect(screen.getByLabelText("Close menu")).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Menu")).toBeInTheDocument()
    expect(screen.getByText("About")).toBeInTheDocument()
    expect(screen.getByText("Contact")).toBeInTheDocument()
  })

  it("toggles menu closed when clicking a nav link", async () => {
    await renderMenu()
    await userEvent.click(screen.getByLabelText("Open menu"))
    expect(screen.getByText("Home")).toBeInTheDocument()
    await userEvent.click(screen.getByText("Home"))
    expect(screen.queryByText("About")).not.toBeInTheDocument()
  })

  it("closes menu when clicking backdrop overlay", async () => {
    await renderMenu()
    await userEvent.click(screen.getByLabelText("Open menu"))
    const backdrop = document.querySelector(".fixed.inset-0 > .absolute")
    expect(backdrop).toBeInTheDocument()
    if (backdrop) {
      await userEvent.click(backdrop)
      expect(screen.queryByText("About")).not.toBeInTheDocument()
    }
  })

  it("renders the OrderButton inside the menu", async () => {
    await renderMenu()
    await userEvent.click(screen.getByLabelText("Open menu"))
    expect(screen.getByTestId("order-button")).toBeInTheDocument()
  })

  it("locks body scroll when open", async () => {
    await renderMenu()
    await userEvent.click(screen.getByLabelText("Open menu"))
    expect(document.body.style.overflow).toBe("hidden")
  })

  it("restores body scroll when closed", async () => {
    await renderMenu()
    await userEvent.click(screen.getByLabelText("Open menu"))
    expect(document.body.style.overflow).toBe("hidden")
    await userEvent.click(screen.getByLabelText("Close menu"))
    expect(document.body.style.overflow).toBe("")
  })
})

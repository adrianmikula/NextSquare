import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { CartSummary } from "@/components/cart/CartSummary"

describe("CartSummary", () => {
  it("renders subtotal, service fee, and total", () => {
    render(<CartSummary subtotal={1000} itemCount={2} />)
    expect(screen.getByText("$10.00")).toBeInTheDocument()
    expect(screen.getByText("$0.50")).toBeInTheDocument()
    expect(screen.getByText("$10.50")).toBeInTheDocument()
  })

  it("shows correct item count in label", () => {
    render(<CartSummary subtotal={550} itemCount={1} />)
    expect(screen.getByText(/1 items?/)).toBeInTheDocument()
  })

  it("calculates 5% service fee correctly", () => {
    render(<CartSummary subtotal={2000} itemCount={3} />)
    expect(screen.getByText("$20.00")).toBeInTheDocument()
    expect(screen.getByText("$1.00")).toBeInTheDocument()
    expect(screen.getByText("$21.00")).toBeInTheDocument()
  })
})

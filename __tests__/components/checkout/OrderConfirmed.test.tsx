import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { OrderConfirmed } from "@/components/checkout/OrderConfirmed"

describe("OrderConfirmed", () => {
  it("renders success message with order ID", () => {
    render(<OrderConfirmed orderId="order-123" />)
    expect(screen.getByText("Order Confirmed!")).toBeInTheDocument()
    expect(screen.getByText(/order-123/)).toBeInTheDocument()
  })

  it("renders track order and order again links", () => {
    render(<OrderConfirmed orderId="order-456" />)
    const trackLink = screen.getByText("Track Order")
    expect(trackLink).toHaveAttribute("href", "/order/order-456")
    const againLink = screen.getByText("Order Again")
    expect(againLink).toHaveAttribute("href", "/menu")
  })

  it("shows SMS confirmation message", () => {
    render(<OrderConfirmed orderId="order-123" />)
    expect(
      screen.getByText("You will receive an SMS confirmation shortly.")
    ).toBeInTheDocument()
  })
})

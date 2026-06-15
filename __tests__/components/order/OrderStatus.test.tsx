import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { OrderStatus } from "@/components/order/OrderStatus"
import type { OrderStatus as OrderStatusType } from "@/types/order"

describe("OrderStatus", () => {
  const baseOrder: OrderStatusType = {
    orderId: "order-123",
    state: "PROPOSED",
    ticketName: "T-42",
    createdAt: "2026-06-15T10:00:00Z",
    lineItems: [
      {
        id: "temp-1",
        catalogObjectId: "item-1",
        name: "Flat White",
        priceMoney: { amount: 550, currency: "AUD" },
        quantity: 2,
        modifiers: [],
      },
    ],
    totalMoney: {
      amount: 1100,
      currency: "AUD",
    },
  }

  it("renders order ID and ticket name", () => {
    render(<OrderStatus order={baseOrder} />)
    expect(screen.getByText(/T-42/)).toBeInTheDocument()
  })

  it("renders order items", () => {
    render(<OrderStatus order={baseOrder} />)
    expect(screen.getByText(/2x Flat White/)).toBeInTheDocument()
  })

  it("shows appropriate status message for PROPOSED state", () => {
    render(<OrderStatus order={baseOrder} />)
    expect(
      screen.getByText(
        /Your order has been placed and is awaiting confirmation/
      )
    ).toBeInTheDocument()
  })

  it("shows appropriate message for IN_PROGRESS state", () => {
    render(<OrderStatus order={{ ...baseOrder, state: "IN_PROGRESS" }} />)
    expect(
      screen.getByText(/Your order is being prepared/)
    ).toBeInTheDocument()
  })

  it("shows appropriate message for COMPLETED state", () => {
    render(<OrderStatus order={{ ...baseOrder, state: "COMPLETED" }} />)
    const messages = screen.getAllByText(/ready/)
    expect(messages.length).toBeGreaterThanOrEqual(1)
  })

  it("renders timeline component", () => {
    render(<OrderStatus order={baseOrder} />)
    expect(screen.getByText("Order Placed")).toBeInTheDocument()
    expect(screen.getByText("Preparing")).toBeInTheDocument()
    expect(screen.getByText("Ready")).toBeInTheDocument()
  })
})

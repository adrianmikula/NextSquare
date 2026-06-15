import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { OrderTable } from "@/components/dashboard/order-table"

describe("OrderTable", () => {
  it("renders empty state when no orders", () => {
    render(<OrderTable orders={[]} />)
    expect(screen.getByText("No orders yet")).toBeDefined()
  })

  it("renders orders with state labels", () => {
    const orders = [
      {
        id: "order-1",
        ticketName: "T-42",
        state: "OPEN",
        totalMoney: { amount: BigInt(1500), currency: "AUD" },
        createdAt: "2026-06-01T10:00:00Z",
      },
    ]
    render(<OrderTable orders={orders} />)
    expect(screen.getByText("#T-42")).toBeDefined()
    expect(screen.getByText("Open")).toBeDefined()
    expect(screen.getByText("$15.00")).toBeDefined()
  })

  it("renders COMPLETED state", () => {
    const orders = [
      {
        id: "order-2",
        ticketName: "T-43",
        state: "COMPLETED",
        createdAt: "2026-06-01T10:00:00Z",
      },
    ]
    render(<OrderTable orders={orders} />)
    expect(screen.getByText("Completed")).toBeDefined()
  })

  it("falls back to order id suffix when ticketName missing", () => {
    const orders = [
      {
        id: "abcdef123456",
        state: "OPEN",
      },
    ]
    render(<OrderTable orders={orders} />)
    expect(screen.getByText("#123456")).toBeDefined()
  })
})

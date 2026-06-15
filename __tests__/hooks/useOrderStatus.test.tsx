import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("swr", () => ({
  default: (key: string | null) => {
    if (key === "/api/square/order/order-123") {
      return {
        data: {
          orderId: "order-123",
          state: "IN_PROGRESS",
          ticketName: "T-42",
        },
        error: undefined,
        isLoading: false,
      }
    }
    return { data: undefined, error: undefined, isLoading: true }
  },
}))

import { useOrderStatus } from "@/hooks/useOrderStatus"

function TestComponent({ orderId }: { orderId: string | undefined }) {
  const { order, isLoading, isError } = useOrderStatus(orderId)
  return (
    <div>
      <span data-testid="order-id">{order?.orderId ?? "none"}</span>
      <span data-testid="state">{order?.state ?? "none"}</span>
      <span data-testid="loading">{isLoading ? "true" : "false"}</span>
      <span data-testid="error">{isError ? "true" : "false"}</span>
    </div>
  )
}

describe("useOrderStatus", () => {
  it("returns order data when orderId is provided", () => {
    render(<TestComponent orderId="order-123" />)
    expect(screen.getByTestId("order-id").textContent).toBe("order-123")
    expect(screen.getByTestId("state").textContent).toBe("IN_PROGRESS")
    expect(screen.getByTestId("loading").textContent).toBe("false")
    expect(screen.getByTestId("error").textContent).toBe("false")
  })

  it("does not fetch when orderId is undefined", () => {
    render(<TestComponent orderId={undefined} />)
    expect(screen.getByTestId("order-id").textContent).toBe("none")
  })
})

import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

type SwrMockConfig = {
  data?: any
  error?: any
  isLoading?: boolean
}

let swrConfig: Record<string, SwrMockConfig> = {}

vi.mock("swr", () => ({
  default: (key: string | null) => {
    if (!key) return { data: undefined, error: undefined, isLoading: false }
    const config = swrConfig[key] ?? { data: undefined, error: undefined, isLoading: true }
    return config
  },
}))

import { useOrderStatus } from "@/hooks/useOrderStatus"

function TestComponent({ orderId }: { orderId: string | undefined }) {
  const { order, isLoading, isError } = useOrderStatus(orderId)
  return (
    <div>
      <span data-testid="order-id">{order?.orderId ?? "none"}</span>
      <span data-testid="state">{order?.state ?? "none"}</span>
      <span data-testid="ticket">{order?.ticketName ?? "none"}</span>
      <span data-testid="loading">{isLoading ? "true" : "false"}</span>
      <span data-testid="error">{isError ? "true" : "false"}</span>
      {order?.customerPhone && <span data-testid="phone">{order.customerPhone}</span>}
    </div>
  )
}

beforeEach(() => {
  swrConfig = {}
})

describe("useOrderStatus", () => {
  it("returns order data when orderId is provided", () => {
    swrConfig["/api/square/order/order-123"] = {
      data: { orderId: "order-123", state: "IN_PROGRESS", ticketName: "T-42" },
      isLoading: false,
    }
    render(<TestComponent orderId="order-123" />)
    expect(screen.getByTestId("order-id").textContent).toBe("order-123")
    expect(screen.getByTestId("state").textContent).toBe("IN_PROGRESS")
    expect(screen.getByTestId("ticket").textContent).toBe("T-42")
    expect(screen.getByTestId("loading").textContent).toBe("false")
    expect(screen.getByTestId("error").textContent).toBe("false")
  })

  it("does not fetch when orderId is undefined", () => {
    render(<TestComponent orderId={undefined} />)
    expect(screen.getByTestId("order-id").textContent).toBe("none")
    expect(screen.getByTestId("loading").textContent).toBe("false")
  })

  it("shows loading state when data is being fetched", () => {
    swrConfig["/api/square/order/order-456"] = { isLoading: true }
    render(<TestComponent orderId="order-456" />)
    expect(screen.getByTestId("loading").textContent).toBe("true")
  })

  it("shows error state when fetch fails", () => {
    swrConfig["/api/square/order/order-789"] = { error: new Error("Network error"), isLoading: false }
    render(<TestComponent orderId="order-789" />)
    expect(screen.getByTestId("error").textContent).toBe("true")
  })

  it("includes customerPhone when present", () => {
    swrConfig["/api/square/order/order-111"] = {
      data: { orderId: "order-111", state: "COMPLETED", customerPhone: "+61400123456" },
      isLoading: false,
    }
    render(<TestComponent orderId="order-111" />)
    expect(screen.getByTestId("phone")).toBeInTheDocument()
  })
})

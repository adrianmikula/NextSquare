import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { Suspense } from "react"

const mockUseOrderStatus = vi.hoisted(() => vi.fn())

vi.mock("@/hooks/useOrderStatus", () => ({
  useOrderStatus: mockUseOrderStatus,
}))

vi.mock("@/components/order/OrderStatus", () => ({
  OrderStatus: ({ order }: any) => <div data-testid="order-status">{order.ticketName}</div>,
}))

vi.mock("@/components/loyalty/LoyaltyBadge", () => ({
  LoyaltyBadge: ({ phoneNumber }: any) => <div data-testid="loyalty-badge">{phoneNumber}</div>,
}))

import OrderStatusPage from "@/app/order/[orderId]/page"

async function renderOrderPage(orderId: string) {
  return await act(async () => {
    return render(
      <Suspense fallback={<div>Loading...</div>}>
        <OrderStatusPage params={Promise.resolve({ orderId })} />
      </Suspense>
    )
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("OrderStatusPage", () => {
  it("shows loading skeleton when isLoading", async () => {
    mockUseOrderStatus.mockReturnValue({ order: null, isLoading: true, isError: false })
    const { container } = await renderOrderPage("order-123")
    const skeletons = container.querySelectorAll(".animate-pulse")
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("shows error state when order fails to load", async () => {
    mockUseOrderStatus.mockReturnValue({ order: null, isLoading: false, isError: true })
    await renderOrderPage("order-123")
    expect(screen.getByText("Could not load order. Please check your order ID and try again.")).toBeInTheDocument()
  })

  it("renders order status and loyalty badge when loaded with phone", async () => {
    mockUseOrderStatus.mockReturnValue({
      order: { orderId: "order-123", state: "IN_PROGRESS", ticketName: "T-42", customerPhone: "+61400123456" },
      isLoading: false,
      isError: false,
    })
    await renderOrderPage("order-123")
    expect(screen.getByTestId("order-status")).toBeInTheDocument()
    expect(screen.getByTestId("order-status").textContent).toBe("T-42")
    expect(screen.getByTestId("loyalty-badge")).toBeInTheDocument()
  })

  it("does not render loyalty badge when no customer phone", async () => {
    mockUseOrderStatus.mockReturnValue({
      order: { orderId: "order-456", state: "COMPLETED", ticketName: "T-99" },
      isLoading: false,
      isError: false,
    })
    await renderOrderPage("order-456")
    expect(screen.getByTestId("order-status")).toBeInTheDocument()
    expect(screen.queryByTestId("loyalty-badge")).not.toBeInTheDocument()
  })
})

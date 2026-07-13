import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}))

import { useSearchParams } from "next/navigation"

vi.mock("@/components/checkout/OrderConfirmed", () => ({
  OrderConfirmed: ({ orderId, pointsEarned, totalBalance }: any) => (
    <div data-testid="order-confirmed">
      <span data-testid="confirmed-order-id">{orderId}</span>
      <span data-testid="confirmed-points">{pointsEarned ?? "undefined"}</span>
      <span data-testid="confirmed-balance">{totalBalance ?? "undefined"}</span>
    </div>
  ),
}))

import ConfirmationPage from "@/app/checkout/confirmation/page"

beforeEach(() => {
  vi.clearAllMocks()
})

function renderConfirmation(searchParams: Record<string, string | null>) {
  vi.mocked(useSearchParams).mockReturnValue({
    get: (key: string) => searchParams[key] ?? null,
  } as any)
  return render(<ConfirmationPage />)
}

describe("ConfirmationPage", () => {
  it("renders orderId and points from search params", () => {
    renderConfirmation({ orderId: "order-123", pointsEarned: "50", totalBalance: "200" })
    expect(screen.getByTestId("confirmed-order-id").textContent).toBe("order-123")
    expect(screen.getByTestId("confirmed-points").textContent).toBe("50")
    expect(screen.getByTestId("confirmed-balance").textContent).toBe("200")
  })

  it("renders with empty orderId when param is missing", () => {
    renderConfirmation({})
    expect(screen.getByTestId("confirmed-order-id").textContent).toBe("")
    expect(screen.getByTestId("confirmed-points").textContent).toBe("undefined")
    expect(screen.getByTestId("confirmed-balance").textContent).toBe("undefined")
  })

  it("renders pointsEarned as undefined when params are not numbers", () => {
    renderConfirmation({ orderId: "order-456", pointsEarned: null, totalBalance: null })
    expect(screen.getByTestId("confirmed-order-id").textContent).toBe("order-456")
    expect(screen.getByTestId("confirmed-points").textContent).toBe("undefined")
    expect(screen.getByTestId("confirmed-balance").textContent).toBe("undefined")
  })
})

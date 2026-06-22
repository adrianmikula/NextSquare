import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { LoyaltyBadge } from "@/components/loyalty/LoyaltyBadge"

const mockSwer = vi.fn()

vi.mock("swr", () => ({
  default: (key: unknown) => mockSwer(key),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function mockSwrResponse(overrides: Record<string, unknown>) {
  const defaults = { data: undefined, error: undefined, isLoading: false }
  mockSwer.mockReturnValue({ ...defaults, ...overrides })
}

describe("LoyaltyBadge", () => {
  it("shows loading skeleton while fetching", () => {
    mockSwrResponse({ isLoading: true })
    const { container } = render(<LoyaltyBadge phoneNumber="+61412345678" orderId="order-1" />)
    const skeleton = container.querySelector(".animate-pulse")
    expect(skeleton).toBeInTheDocument()
  })

  it("renders loyalty badge with balance", () => {
    mockSwrResponse({
      data: {
        pointsEarned: 50,
        totalBalance: 200,
        rewardTier: null,
        pointsNeeded: 100,
        progress: 50,
      },
    })
    render(<LoyaltyBadge phoneNumber="+61412345678" orderId="order-1" />)
    expect(screen.getByText("You have 200 points")).toBeInTheDocument()
  })

  it("shows progress toward next reward", () => {
    mockSwrResponse({
      data: {
        pointsEarned: 50,
        totalBalance: 150,
        rewardTier: { id: "tier-1", points: 200, name: "Free Coffee" },
        pointsNeeded: 200,
        progress: 0.75,
      },
    })
    render(<LoyaltyBadge phoneNumber="+61412345678" orderId="order-1" />)
    expect(screen.getByText(/50 points away from a free /)).toBeInTheDocument()
  })

  it("returns null when there is an error", () => {
    mockSwrResponse({ error: new Error("Network error") })
    const { container } = render(<LoyaltyBadge phoneNumber="+61412345678" orderId="order-1" />)
    expect(container.innerHTML).toBe("")
  })

  it("skips fetch when phone number is empty", () => {
    render(<LoyaltyBadge phoneNumber="" orderId="order-1" />)
    expect(mockSwer).toHaveBeenCalledWith(null)
  })

  it("skips fetch when order id is empty", () => {
    render(<LoyaltyBadge phoneNumber="+61412345678" orderId="" />)
    expect(mockSwer).toHaveBeenCalledWith(null)
  })

  it("renders progress bar with correct width", () => {
    mockSwrResponse({
      data: {
        pointsEarned: 50,
        totalBalance: 100,
        rewardTier: { id: "tier-1", points: 200, name: "Free Coffee" },
        pointsNeeded: 200,
        progress: 0.5,
      },
    })
    render(<LoyaltyBadge phoneNumber="+61412345678" orderId="order-1" />)
    const progressBar = screen.getByText("You have 100 points")
      .closest("div")
      ?.querySelector(".bg-amber-500")
    expect(progressBar?.getAttribute("style")).toContain("width: 50%")
  })
})

import { describe, expect, it, vi, beforeEach } from "vitest"
import { POST } from "@/app/api/square/loyalty/route"

const { mockGetOrCreate, mockCalculate, mockGetProgram } = vi.hoisted(() => ({ mockGetOrCreate: vi.fn(), mockCalculate: vi.fn(), mockGetProgram: vi.fn() }))

vi.mock("@/lib/square/loyalty", () => ({
  getOrCreateLoyaltyAccount: mockGetOrCreate,
  calculateLoyaltyPoints: mockCalculate,
  getLoyaltyProgram: mockGetProgram,
}))

function callPost(body: unknown) {
  const request = {
    json: () => Promise.resolve(body),
    headers: { get: () => null },
  } as any
  return POST(request)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("POST /api/square/loyalty", () => {
  it("returns 400 when phone number is missing", async () => {
    const response = await callPost({ orderId: "order-1" })
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toBe("Phone number is required")
  })

  it("returns loyalty data when only phone is provided", async () => {
    mockGetOrCreate.mockResolvedValue({ accountId: "loyalty-1", balance: 100 })
    mockGetProgram.mockResolvedValue({
      id: "prog-1",
      rewardTiers: [{ id: "tier-1", points: 200, name: "Free Coffee" }],
    })

    const response = await callPost({ phoneNumber: "+61412345678" })
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.totalBalance).toBe(100)
    expect(json.pointsEarned).toBe(0)
    expect(json.accountId).toBe("loyalty-1")
  })

  it("calculates points when orderId is provided", async () => {
    mockGetOrCreate.mockResolvedValue({ accountId: "loyalty-1", balance: 100 })
    mockCalculate.mockResolvedValue({ points: 50 })
    mockGetProgram.mockResolvedValue({
      id: "prog-1",
      rewardTiers: [{ id: "tier-1", points: 200, name: "Free Coffee" }],
    })

    const response = await callPost({ phoneNumber: "+61412345678", orderId: "order-1" })
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.pointsEarned).toBe(50)
    expect(json.balanceAfterEarning).toBe(150)
  })

  it("includes reward tier progress", async () => {
    mockGetOrCreate.mockResolvedValue({ accountId: "loyalty-1", balance: 100 })
    mockCalculate.mockResolvedValue({ points: 50 })
    mockGetProgram.mockResolvedValue({
      id: "prog-1",
      rewardTiers: [{ id: "tier-1", points: 200, name: "Free Coffee" }],
    })

    const response = await callPost({ phoneNumber: "+61412345678", orderId: "order-1" })
    const json = await response.json()
    expect(json.rewardTier).toBeDefined()
    expect(json.pointsNeeded).toBe(200)
    expect(json.progress).toBe(0.5)
  })

  it("returns 500 when loyalty service throws", async () => {
    mockGetOrCreate.mockRejectedValue(new Error("Square API error"))

    const response = await callPost({ phoneNumber: "+61412345678" })
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error).toBe("Square API error")
  })
})

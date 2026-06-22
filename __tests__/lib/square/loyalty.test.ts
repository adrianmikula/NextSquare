import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { mockLoyaltyApi } from "../../../__mocks__/square/legacy"

vi.mock("square/legacy")

const mockIsDemoMode = vi.fn()
const mockRequireEnv = vi.fn()

vi.mock("@/lib/demo/config", () => ({
  isDemoMode: () => mockIsDemoMode(),
}))

vi.mock("@/lib/env", () => ({
  requireEnv: (name: string) => mockRequireEnv(name),
}))

vi.mock("@/lib/square/config", () => ({
  getSquareEnvironment: () => "sandbox",
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockIsDemoMode.mockReturnValue(false)
  mockRequireEnv.mockImplementation((name: string) => {
    const vars: Record<string, string> = {
      SQUARE_ACCESS_TOKEN: "test-token",
      SQUARE_LOYALTY_PROGRAM_ID: "prog-123",
    }
    const val = vars[name]
    if (!val) throw new Error(`Missing required env: ${name}`)
    return val
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("getOrCreateLoyaltyAccount", () => {
  it("returns demo account when in demo mode", async () => {
    mockIsDemoMode.mockReturnValue(true)
    const { getOrCreateLoyaltyAccount } = await import("@/lib/square/loyalty")
    const result = await getOrCreateLoyaltyAccount("+61400000000")
    expect(result.accountId).toBe("demo-loyalty-+61400000000")
    expect(result.balance).toBe(120)
  })

  it("creates a new demo account for unknown phone numbers", async () => {
    mockIsDemoMode.mockReturnValue(true)
    const { getOrCreateLoyaltyAccount } = await import("@/lib/square/loyalty")
    const result = await getOrCreateLoyaltyAccount("+61499999999")
    expect(result.balance).toBe(0)
    expect(result.accountId).toContain("demo-loyalty-")
  })

  it("searches for an existing loyalty account", async () => {
    mockLoyaltyApi.searchLoyaltyAccounts.mockResolvedValue({
      result: {
        loyaltyAccounts: [
          { id: "loyalty-456", balance: 250 },
        ],
      },
    })

    const { getOrCreateLoyaltyAccount } = await import("@/lib/square/loyalty")
    const result = await getOrCreateLoyaltyAccount("+61412345678")

    expect(result.accountId).toBe("loyalty-456")
    expect(result.balance).toBe(250)
    expect(mockLoyaltyApi.searchLoyaltyAccounts).toHaveBeenCalledWith({
      query: { mappings: [{ phoneNumber: "+61412345678" }] },
      limit: 1,
    })
  })

  it("creates a new account when no existing account is found", async () => {
    mockLoyaltyApi.searchLoyaltyAccounts.mockResolvedValue({
      result: { loyaltyAccounts: [] },
    })
    mockLoyaltyApi.createLoyaltyAccount.mockResolvedValue({
      result: {
        loyaltyAccount: { id: "loyalty-new", balance: 0 },
      },
    })

    const { getOrCreateLoyaltyAccount } = await import("@/lib/square/loyalty")
    const result = await getOrCreateLoyaltyAccount("+61412345678")

    expect(result.accountId).toBe("loyalty-new")
    expect(mockLoyaltyApi.createLoyaltyAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        loyaltyAccount: expect.objectContaining({
          programId: "prog-123",
          mapping: { phoneNumber: "+61412345678" },
        }),
      }),
    )
  })
})

describe("calculateLoyaltyPoints", () => {
  it("returns demo points in demo mode", async () => {
    mockIsDemoMode.mockReturnValue(true)
    const { calculateLoyaltyPoints } = await import("@/lib/square/loyalty")
    const result = await calculateLoyaltyPoints("order-001")
    expect(result.points).toBe(15)
  })

  it("calculates points via Square API", async () => {
    mockLoyaltyApi.calculateLoyaltyPoints.mockResolvedValue({
      result: { points: 42 },
    })

    const { calculateLoyaltyPoints } = await import("@/lib/square/loyalty")
    const result = await calculateLoyaltyPoints("order-001")
    expect(result.points).toBe(42)
    expect(mockLoyaltyApi.calculateLoyaltyPoints).toHaveBeenCalledWith(
      "prog-123",
      { orderId: "order-001" },
    )
  })
})

describe("getLoyaltyProgram", () => {
  it("returns demo program in demo mode", async () => {
    mockIsDemoMode.mockReturnValue(true)
    const { getLoyaltyProgram } = await import("@/lib/square/loyalty")
    const program = await getLoyaltyProgram()
    expect(program.id).toBe("demo-program")
    expect(program.rewardTiers).toHaveLength(1)
    expect(program.rewardTiers[0].name).toBe("Free Coffee")
  })

  it("retrieves program from Square API", async () => {
    mockLoyaltyApi.retrieveLoyaltyProgram.mockResolvedValue({
      result: {
        program: {
          id: "prog-real",
          rewardTiers: [
            { id: "tier-1", points: 300, name: "Free Cold Brew" },
          ],
        },
      },
    })

    const { getLoyaltyProgram } = await import("@/lib/square/loyalty")
    const program = await getLoyaltyProgram()
    expect(program.id).toBe("prog-real")
    expect(program.rewardTiers).toHaveLength(1)
    expect(program.rewardTiers[0].points).toBe(300)
  })
})

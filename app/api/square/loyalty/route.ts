import { NextRequest } from "next/server"
import { getOrCreateLoyaltyAccount, calculateLoyaltyPoints, getLoyaltyProgram } from "@/lib/square/loyalty"
import { rateLimit, getRateLimitResponse } from "@/lib/security/rate-limit"

export async function POST(request: NextRequest) {
  const ip =
    request.headers?.get?.("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"

  const rateLimitResult = rateLimit(`api:${ip}`, 30, 60 * 1000)
  if (!rateLimitResult.allowed) {
    return getRateLimitResponse(rateLimitResult.retryAfter!)
  }
  try {
    const { phoneNumber, orderId } = await request.json()

    if (!phoneNumber) {
      return Response.json({ error: "Phone number is required" }, { status: 400 })
    }

    const account = await getOrCreateLoyaltyAccount(phoneNumber)
    const program = await getLoyaltyProgram()

    let pointsEarned = 0
    if (orderId) {
      const calc = await calculateLoyaltyPoints(orderId)
      pointsEarned = calc.points
    }

    const rewardTier = program.rewardTiers[0] ?? null
    const pointsNeeded = rewardTier?.points ?? 100
    const progress = pointsNeeded > 0 ? account.balance / pointsNeeded : 0

    return Response.json({
      pointsEarned,
      totalBalance: account.balance,
      balanceAfterEarning: account.balance + pointsEarned,
      accountId: account.accountId,
      rewardTier,
      pointsNeeded,
      progress: Math.min(progress, 1),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process loyalty request"
    console.error("Loyalty API error:", message)
    return Response.json({ error: message }, { status: 500 })
  }
}

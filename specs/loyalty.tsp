/**
 * Loyalty program domain models.
 */

model LoyaltyAccount {
  accountId: string
  balance: integer
  phoneNumber: string
}

model LoyaltyProgram {
  id: string
  rewardTiers: RewardTier[]
}

model RewardTier {
  id: string
  points: integer
  name: string
}

model CalculateLoyaltyPointsResponse {
  points: integer
}

model LoyaltyPayload {
  phoneNumber: string
  orderId?: string
}

model LoyaltyResponse {
  accountId: string
  balance: integer
  pointsEarned: integer
  balanceAfterEarning: integer
  totalBalance: integer
  progress: float
  pointsNeeded: integer
  nextReward: string
}

@route("/api/square/loyalty")
namespace LoyaltyApi {
  @post op getOrCreateLoyalty(body: LoyaltyPayload): LoyaltyResponse | { error: string }
}

@route("/api/square/loyalty")
namespace LoyaltyService {
  op getOrCreateAccount(phoneNumber: string): LoyaltyAccount
  op calculatePoints(orderId: string): integer
  op getProgram(): LoyaltyProgram
}

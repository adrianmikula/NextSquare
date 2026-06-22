import "server-only"
import { Client, Environment } from "square/legacy"
import { getSquareEnvironment } from "./config"
import { isDemoMode } from "@/lib/demo/config"
import { requireEnv } from "@/lib/env"

const DEMO_LOYALTY_ACCOUNTS: Record<string, { balance: number }> = {
  "+61400000000": { balance: 120 },
  "+61411111111": { balance: 45 },
  "+61422222222": { balance: 200 },
}

const DEMO_PROGRAM = {
  id: "demo-program",
  rewardTiers: [
    { id: "tier-coffee", points: 200, name: "Free Coffee" },
  ],
}

let clientInstance: Client | null = null

function getClient(): Client {
  if (clientInstance) return clientInstance
  clientInstance = new Client({
    accessToken: isDemoMode() ? "" : requireEnv("SQUARE_ACCESS_TOKEN"),
    environment: getSquareEnvironment() === "production" ? Environment.Production : Environment.Sandbox,
  })
  return clientInstance
}

export interface LoyaltyAccountResult {
  accountId: string
  balance: number
}

export interface RewardTier {
  id: string
  points: number
  name: string
}

export async function getOrCreateLoyaltyAccount(phoneNumber: string): Promise<LoyaltyAccountResult> {
  if (isDemoMode()) {
    const account = DEMO_LOYALTY_ACCOUNTS[phoneNumber] ?? { balance: 0 }
    if (!DEMO_LOYALTY_ACCOUNTS[phoneNumber]) {
      DEMO_LOYALTY_ACCOUNTS[phoneNumber] = account
    }
    return { accountId: `demo-loyalty-${phoneNumber}`, balance: account.balance }
  }

  const client = getClient()

  const searchRes = await client.loyaltyApi.searchLoyaltyAccounts({
    query: {
      mappings: [{ phoneNumber }],
    },
    limit: 1,
  })

  if (searchRes.result.loyaltyAccounts?.length) {
    const account = searchRes.result.loyaltyAccounts[0]
    return {
      accountId: account.id ?? "",
      balance: account.balance ?? 0,
    }
  }

  const programId = requireEnv("SQUARE_LOYALTY_PROGRAM_ID")
  const createRes = await client.loyaltyApi.createLoyaltyAccount({
    idempotencyKey: crypto.randomUUID(),
    loyaltyAccount: {
      programId,
      mapping: { phoneNumber },
    },
  })

  const created = createRes.result.loyaltyAccount
  return {
    accountId: created?.id ?? "",
    balance: created?.balance ?? 0,
  }
}

export async function calculateLoyaltyPoints(orderId: string): Promise<{ points: number }> {
  if (isDemoMode()) {
    return { points: 15 }
  }

  const client = getClient()
  const programId = requireEnv("SQUARE_LOYALTY_PROGRAM_ID")

  const { result } = await client.loyaltyApi.calculateLoyaltyPoints(programId, {
    orderId,
  })

  return { points: result.points ?? 0 }
}

export async function getLoyaltyProgram(): Promise<{ id: string; rewardTiers: RewardTier[] }> {
  if (isDemoMode()) {
    return DEMO_PROGRAM
  }

  const client = getClient()
  const programId = requireEnv("SQUARE_LOYALTY_PROGRAM_ID")

  const { result } = await client.loyaltyApi.retrieveLoyaltyProgram(programId)

  const rewardTiers: RewardTier[] = (result.program?.rewardTiers ?? []).map((tier) => ({
    id: String(tier.id ?? ""),
    points: Number(tier.points ?? 0),
    name: String(tier.name ?? "Reward"),
  }))

  return {
    id: result.program?.id ?? "",
    rewardTiers,
  }
}

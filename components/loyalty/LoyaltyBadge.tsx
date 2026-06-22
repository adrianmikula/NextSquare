"use client"

import useSWR from "swr"
import type { RewardTier } from "@/lib/square/loyalty"

interface LoyaltyBadgeProps {
  phoneNumber: string
  orderId: string
}

interface LoyaltyData {
  pointsEarned: number
  totalBalance: number
  rewardTier: RewardTier | null
  pointsNeeded: number
  progress: number
}

function fetcher(url: string, body: object) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json())
}

export function LoyaltyBadge({ phoneNumber, orderId }: LoyaltyBadgeProps) {
  const { data, error, isLoading } = useSWR<LoyaltyData>(
    phoneNumber && orderId
      ? ["/api/square/loyalty", { phoneNumber, orderId }]
      : null,
    ([url, body]: [string, object]) => fetcher(url, body),
    { revalidateOnFocus: false },
  )

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-lg border border-stone-200 bg-white p-4">
        <div className="h-5 w-40 rounded bg-stone-200" />
        <div className="mt-3 h-2 w-full rounded-full bg-stone-100" />
      </div>
    )
  }

  if (error || !data) return null

  const pointsNeeded = data.pointsNeeded
  const balance = data.totalBalance
  const progress = Math.min(data.progress, 1)

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-lg font-semibold text-stone-900">
        You have {balance} points
      </p>
      {data.rewardTier && (
        <p className="text-sm text-stone-500">
          {pointsNeeded - balance} points away from a free{" "}
          {data.rewardTier.name.toLowerCase()}
        </p>
      )}
      <div className="mt-3 h-2 w-full rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-amber-500 transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}

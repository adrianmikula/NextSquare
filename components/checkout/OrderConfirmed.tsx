"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PointsEarned } from "@/components/loyalty/PointsEarned"

interface OrderConfirmedProps {
  orderId: string
  pointsEarned?: number
  totalBalance?: number
}

export function OrderConfirmed({ orderId, pointsEarned, totalBalance }: OrderConfirmedProps) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success-subtle">
        <svg
          className="h-8 w-8 text-success"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-heading">Order Confirmed!</h2>
      <p className="mt-2 text-body">
        Your order <span className="font-semibold">#{orderId}</span> has been
        placed successfully.
      </p>
      <p className="mt-1 text-sm text-muted">
        You will receive an SMS confirmation shortly.
      </p>

      {pointsEarned !== undefined && totalBalance !== undefined && totalBalance > 0 && (
        <div className="mt-6 text-left">
          <PointsEarned pointsEarned={pointsEarned} totalBalance={totalBalance} />
        </div>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <Link href={`/order/${orderId}`} className="btn btn-primary">
          Track Order
        </Link>
        <Link href="/menu" className="btn btn-outline">
          Order Again
        </Link>
      </div>
    </div>
  )
}

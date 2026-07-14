"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { OrderConfirmed } from "@/components/checkout/OrderConfirmed"

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId") ?? ""
  const pointsEarned = searchParams.get("pointsEarned")
  const totalBalance = searchParams.get("totalBalance")

  return (
    <OrderConfirmed
      orderId={orderId}
      pointsEarned={pointsEarned ? parseInt(pointsEarned) : undefined}
      totalBalance={totalBalance ? parseInt(totalBalance) : undefined}
    />
  )
}

export default function ConfirmationPage() {
  return (
    <div className="bg-section section-py">
      <div className="mx-auto container-max px-4 sm:px-6">
        <Suspense
          fallback={
            <div className="animate-pulse text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-placeholder" />
              <div className="mt-4 h-6 w-48 rounded bg-placeholder" />
            </div>
          }
        >
          <ConfirmationContent />
        </Suspense>
      </div>
    </div>
  )
}

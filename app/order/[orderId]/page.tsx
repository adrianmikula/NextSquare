"use client"

import { use } from "react"
import { useOrderStatus } from "@/hooks/useOrderStatus"
import { OrderStatus } from "@/components/order/OrderStatus"
import { LoyaltyBadge } from "@/components/loyalty/LoyaltyBadge"

export default function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = use(params)
  const { order, isLoading, isError } = useOrderStatus(orderId)

  return (
    <div className="bg-stone-50 py-12">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-stone-900">
          Order Status
        </h1>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 rounded bg-stone-200" />
            <div className="h-64 rounded-xl bg-stone-100" />
            <div className="h-20 rounded-xl bg-stone-100" />
          </div>
        ) : isError || !order ? (
          <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
            <p className="text-stone-500">
              Could not load order. Please check your order ID and try again.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <OrderStatus order={order} />
            {order.customerPhone && (
              <LoyaltyBadge phoneNumber={order.customerPhone} orderId={order.orderId} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

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
    <div className="bg-section section-py">
      <div className="mx-auto container-max px-4 sm:px-6">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-heading">
          Order Status
        </h1>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 rounded bg-placeholder" />
            <div className="h-64 rounded-xl bg-section-alt" />
            <div className="h-20 rounded-xl bg-section-alt" />
          </div>
        ) : isError || !order ? (
          <div className="card bg-base-100 p-8 text-center" style={{ boxShadow: "var(--card-shadow, var(--theme-shadow-card))", border: "var(--card-border-toggle, var(--theme-border-width, 1px)) var(--theme-border-style, solid) var(--color-card-border)", transition: "box-shadow var(--transition-speed, 300ms) var(--motion-easing, ease), transform var(--transition-speed, 300ms) var(--motion-easing, ease)" }}>
            <p className="text-muted">
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

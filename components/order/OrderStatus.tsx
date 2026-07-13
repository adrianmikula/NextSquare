"use client"

import type { OrderStatus as OrderStatusType } from "@/types/order"
import { OrderTimeline } from "./OrderTimeline"
import { formatCurrency } from "@/lib/utils"

interface OrderStatusProps {
  order: OrderStatusType
}

export function OrderStatus({ order }: OrderStatusProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-heading">
          Order #{order.ticketName ?? order.orderId}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {order.createdAt
            ? new Date(order.createdAt).toLocaleString("en-AU")
            : ""}
        </p>
      </div>

      <div className="card bg-base-100 p-6">
        <OrderTimeline currentState={order.state} />
      </div>

      {order.lineItems && order.lineItems.length > 0 && (
        <div className="card bg-base-100 p-6">
          <h3 className="mb-4 font-semibold text-heading">Items</h3>
          <div className="space-y-3">
            {order.lineItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-heading">
                  {item.quantity}x {item.name}
                </span>
                {item.priceMoney && (
                  <span className="text-body">
                    {formatCurrency(item.priceMoney.amount * item.quantity)}
                  </span>
                )}
              </div>
            ))}
          </div>
          {order.totalMoney && (
            <div className="mt-4 flex justify-between pt-4 font-semibold text-heading" style={{ borderTopWidth: "var(--theme-border-width)", borderColor: "var(--color-card-border)" }}>
              <span>Total</span>
              <span>{formatCurrency(order.totalMoney.amount)}</span>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl bg-section-alt p-4 text-sm text-price">
        {order.state === "COMPLETED"
          ? "Your order is ready! Please come to the cafe to pick it up."
          : order.state === "IN_PROGRESS"
            ? "Your order is being prepared. We'll update you when it's ready."
            : "Your order has been placed and is awaiting confirmation."}
      </div>
    </div>
  )
}

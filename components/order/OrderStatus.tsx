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
        <h2 className="text-xl font-bold text-stone-900">
          Order #{order.ticketName ?? order.orderId}
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          {order.createdAt
            ? new Date(order.createdAt).toLocaleString("en-AU")
            : ""}
        </p>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <OrderTimeline currentState={order.state} />
      </div>

      {order.lineItems && order.lineItems.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-stone-900">Items</h3>
          <div className="space-y-3">
            {order.lineItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-stone-900">
                  {item.quantity}x {item.name}
                </span>
                {item.priceMoney && (
                  <span className="text-stone-600">
                    {formatCurrency(item.priceMoney.amount * item.quantity)}
                  </span>
                )}
              </div>
            ))}
          </div>
          {order.totalMoney && (
            <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 font-semibold text-stone-900">
              <span>Total</span>
              <span>{formatCurrency(order.totalMoney.amount)}</span>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
        {order.state === "COMPLETED"
          ? "Your order is ready! Please come to the cafe to pick it up."
          : order.state === "IN_PROGRESS"
            ? "Your order is being prepared. We'll update you when it's ready."
            : "Your order has been placed and is awaiting confirmation."}
      </div>
    </div>
  )
}

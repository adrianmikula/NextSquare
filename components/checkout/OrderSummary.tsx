"use client"

import { useCartStore, useCartSubtotal, useCartFee } from "@/lib/store/cart"
import { formatCurrency } from "@/lib/utils"

export function OrderSummary() {
  const items = useCartStore((s) => s.items)
  const subtotal = useCartSubtotal()
  const fee = useCartFee()

  return (
    <div className="card bg-base-100">
      <h3 className="mb-4 text-lg font-semibold text-heading">Order Summary</h3>
      <div className="space-y-3">
        {items.map((item) => {
          const itemTotal =
            (item.priceMoney.amount +
              item.modifiers.reduce(
                (sum, m) => sum + (m.priceMoney?.amount ?? 0),
                0
              )) *
            item.quantity

          return (
            <div key={item.id} className="flex justify-between text-sm">
              <div className="flex-1">
                <span className="text-heading">
                  {item.quantity}x {item.name}
                </span>
                {item.modifiers.length > 0 && (
                  <p className="text-xs text-muted">
                    {item.modifiers.map((m) => m.name).join(", ")}
                  </p>
                )}
              </div>
              <span className="ml-4 font-medium text-heading">
                {formatCurrency(itemTotal)}
              </span>
            </div>
          )
        })}
      </div>
      <div className="mt-4 space-y-2 pt-4 text-sm" style={{ borderTopWidth: "var(--theme-border-width)" }}>
        <div className="flex justify-between text-body">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-body">
          <span>Service fee (5%)</span>
          <span>{formatCurrency(fee)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold text-heading">
          <span>Total</span>
          <span>{formatCurrency(subtotal + fee)}</span>
        </div>
      </div>
    </div>
  )
}

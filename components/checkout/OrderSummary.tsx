"use client"

import { useCartStore } from "@/lib/store/cart"
import { formatCurrency } from "@/lib/utils"

export function OrderSummary() {
  const items = useCartStore((s) => s.items)

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-stone-900">Order Summary</h3>
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
                <span className="text-stone-900">
                  {item.quantity}x {item.name}
                </span>
                {item.modifiers.length > 0 && (
                  <p className="text-xs text-stone-500">
                    {item.modifiers.map((m) => m.name).join(", ")}
                  </p>
                )}
              </div>
              <span className="ml-4 font-medium text-stone-900">
                {formatCurrency(itemTotal)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

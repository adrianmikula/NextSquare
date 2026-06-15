"use client"

import { formatCurrency } from "@/lib/utils"

interface CartSummaryProps {
  subtotal: number
  itemCount: number
}

export function CartSummary({ subtotal, itemCount }: CartSummaryProps) {
  const serviceFee = Math.round(subtotal * 0.05)
  const total = subtotal + serviceFee

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
      <div className="flex justify-between text-sm text-stone-600">
        <span>Subtotal ({itemCount} items)</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm text-stone-600">
        <span>Service fee (5%)</span>
        <span>{formatCurrency(serviceFee)}</span>
      </div>
      <div className="border-t border-stone-200 pt-3">
        <div className="flex justify-between text-base font-semibold text-stone-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}

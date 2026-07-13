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
    <div className="space-y-3 card bg-base-100 p-4" style={{ boxShadow: "var(--card-shadow, var(--theme-shadow-card))", border: "var(--card-border-toggle, var(--theme-border-width, 1px)) var(--theme-border-style, solid) var(--color-card-border)", transition: "box-shadow var(--transition-speed, 300ms) var(--motion-easing, ease), transform var(--transition-speed, 300ms) var(--motion-easing, ease)" }}>
      <div className="flex justify-between text-sm text-body">
        <span>Subtotal ({itemCount} items)</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm text-body">
        <span>Service fee (5%)</span>
        <span>{formatCurrency(serviceFee)}</span>
      </div>
      <div className="border-card pt-3" style={{ borderTopWidth: "var(--theme-border-width)" }}>
        <div className="flex justify-between text-base font-semibold text-heading">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}

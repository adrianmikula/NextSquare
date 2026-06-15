"use client"

import type { CartItem as CartItemType } from "@/types/cart"
import { formatCurrency } from "@/lib/utils"

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (id: string, qty: number) => void
  onRemove: (id: string) => void
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const itemTotal =
    (item.priceMoney.amount +
      item.modifiers.reduce(
        (sum, m) => sum + (m.priceMoney?.amount ?? 0),
        0
      )) *
    item.quantity

  return (
    <div className="flex gap-4 border-b border-stone-100 py-4">
      {item.imageUrl && (
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-stone-900">{item.name}</h4>
            <button
              onClick={() => onRemove(item.id)}
              className="ml-2 text-stone-400 hover:text-red-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {item.modifiers.length > 0 && (
            <p className="mt-1 text-xs text-stone-500">
              {item.modifiers.map((m) => m.name).join(", ")}
            </p>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-300 text-xs text-stone-600 hover:bg-stone-50"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-300 text-xs text-stone-600 hover:bg-stone-50"
            >
              +
            </button>
          </div>
          <span className="text-sm font-semibold text-stone-900">
            {formatCurrency(itemTotal)}
          </span>
        </div>
      </div>
    </div>
  )
}

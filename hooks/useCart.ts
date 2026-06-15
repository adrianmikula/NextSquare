"use client"

import { useCartStore, useCartItemCount, useCartSubtotal } from "@/lib/store/cart"
import type { CartItem, FulfillmentType } from "@/types/cart"

export function useCart() {
  const store = useCartStore()
  const itemCount = useCartItemCount()
  const subtotal = useCartSubtotal()

  return {
    items: store.items,
    itemCount,
    subtotal,
    fulfillmentType: store.fulfillmentType,
    addItem: (item: Omit<CartItem, "id">) => store.addItem(item),
    removeItem: (id: string) => store.removeItem(id),
    updateQuantity: (id: string, qty: number) => store.updateQuantity(id, qty),
    setFulfillmentType: (type: FulfillmentType) => store.setFulfillmentType(type),
    clearCart: () => store.clearCart(),
  }
}

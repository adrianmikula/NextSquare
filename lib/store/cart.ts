"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, FulfillmentType } from "@/types/cart"
import { logger } from "@/lib/logger"

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

interface CartActions {
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  setFulfillmentType: (type: FulfillmentType) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}

interface CartState {
  items: CartItem[]
  fulfillmentType: FulfillmentType
  drawerOpen: boolean
}

type CartStore = CartState & CartActions

function computeSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => {
    const itemTotal = i.priceMoney.amount * i.quantity
    const modifierTotal = i.modifiers.reduce(
      (mSum, m) => mSum + (m.priceMoney?.amount ?? 0) * i.quantity,
      0
    )
    return sum + itemTotal + modifierTotal
  }, 0)
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      fulfillmentType: "PICKUP",
      drawerOpen: false,

      addItem: (item) =>
        set((state) => {
          logger("cart").debug("Add item", {
            item,
            currentItemsCount: state.items.length,
            currentItems: state.items.map(i => ({ id: i.id, catalogObjectId: i.catalogObjectId, modifiers: i.modifiers })),
            existingIndex: state.items.findIndex(
              (i) =>
                i.catalogObjectId === item.catalogObjectId &&
                JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers)
            ),
          })
          const existingIndex = state.items.findIndex(
            (i) =>
              i.catalogObjectId === item.catalogObjectId &&
              JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers)
          )

          if (existingIndex >= 0) {
            const updated = [...state.items]
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + item.quantity,
            }
            return { items: updated }
          }

          return {
            items: [...state.items, { ...item, id: generateId() }],
          }
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, qty) =>
        set((state) => {
          if (qty <= 0) {
            return { items: state.items.filter((i) => i.id !== id) }
          }
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: qty } : i
            ),
          }
        }),

      setFulfillmentType: (type) => set({ fulfillmentType: type }),

      clearCart: () => set({ items: [] }),

      openCart: () => set({ drawerOpen: true }),
      closeCart: () => set({ drawerOpen: false }),
    }),
    { name: "cafe-cart" }
  )
)

export function useCartItemCount(): number {
  return useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0))
}

export function useCartSubtotal(): number {
  return useCartStore((state) => computeSubtotal(state.items))
}

export function useCartFee(): number {
  return useCartStore((state) => Math.round(computeSubtotal(state.items) * 0.05))
}

export function useCartTotalWithFee(): number {
  return useCartStore((state) => {
    const subtotal = computeSubtotal(state.items)
    return subtotal + Math.round(subtotal * 0.05)
  })
}

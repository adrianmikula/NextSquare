"use client"

import Link from "next/link"
import { useCartStore, useCartItemCount, useCartSubtotal } from "@/lib/store/cart"
import { CartItem } from "./CartItem"
import { CartSummary } from "./CartSummary"
import { DeliveryPickupToggle } from "./DeliveryPickupToggle"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items)
  const fulfillmentType = useCartStore((s) => s.fulfillmentType)
  const setFulfillmentType = useCartStore((s) => s.setFulfillmentType)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const itemCount = useCartItemCount()
  const subtotal = useCartSubtotal()

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-stone-900">
            Cart ({itemCount})
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3">
          <DeliveryPickupToggle
            value={fulfillmentType}
            onChange={setFulfillmentType}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="py-16 text-center text-stone-500">
              <svg className="mx-auto h-12 w-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="mt-4 text-sm">Your cart is empty</p>
              <Link
                href="/menu"
                onClick={onClose}
                className="mt-2 inline-block text-sm font-medium text-amber-700 hover:underline"
              >
                Browse our menu
              </Link>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-stone-200 px-4 py-4">
            <CartSummary subtotal={subtotal} itemCount={itemCount} />
            <Link
              href="/checkout"
              onClick={onClose}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

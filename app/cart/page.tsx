"use client"

import Link from "next/link"
import { useCartStore, useCartItemCount, useCartSubtotal } from "@/lib/store/cart"
import { CartItem } from "@/components/cart/CartItem"
import { CartSummary } from "@/components/cart/CartSummary"
import { DeliveryPickupToggle } from "@/components/cart/DeliveryPickupToggle"
export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const fulfillmentType = useCartStore((s) => s.fulfillmentType)
  const setFulfillmentType = useCartStore((s) => s.setFulfillmentType)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const itemCount = useCartItemCount()
  const subtotal = useCartSubtotal()

  return (
    <div className="bg-stone-50 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Cart
          </h1>
          <DeliveryPickupToggle
            value={fulfillmentType}
            onChange={setFulfillmentType}
          />
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white py-20 text-center">
            <svg
              className="mx-auto h-16 w-16 text-stone-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="mt-4 text-lg text-stone-500">Your cart is empty</p>
            <Link
              href="/menu"
              className="mt-4 inline-block text-sm font-medium text-amber-700 hover:underline"
            >
              Browse our menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <CartSummary subtotal={subtotal} itemCount={itemCount} />

            <Link
              href="/checkout"
              className="flex w-full items-center justify-center rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

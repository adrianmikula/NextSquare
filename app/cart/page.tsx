"use client"

import Link from "next/link"
import { useCartStore, useCartItemCount, useCartSubtotal } from "@/lib/store/cart"
import { CartItem } from "@/components/cart/CartItem"
import { CartSummary } from "@/components/cart/CartSummary"
import { DeliveryPickupToggle } from "@/components/cart/DeliveryPickupToggle"
import { EmptyCart } from "@/components/cart/EmptyCart"

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
          <EmptyCart />
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

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
    <div className="bg-section section-py">
      <div className="mx-auto container-max px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-heading">
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
            <div className="card bg-base-100 p-4" style={{ boxShadow: "var(--card-shadow, var(--theme-shadow-card))", border: "var(--card-border-toggle, var(--theme-border-width, 1px)) var(--theme-border-style, solid) var(--color-card-border)", transition: "box-shadow var(--transition-speed, 300ms) var(--motion-easing, ease), transform var(--transition-speed, 300ms) var(--motion-easing, ease)" }}>
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

            <Link href="/checkout" className="btn btn-primary w-full">
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

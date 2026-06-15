"use client"

import { ShoppingBag } from "lucide-react"
import { useCartItemCount } from "@/lib/store/cart"
import { useCartContext } from "./CartProvider"

export function CartButton() {
  const count = useCartItemCount()
  const { openCart } = useCartContext()

  return (
    <button
      onClick={openCart}
      className="relative flex items-center text-stone-600 transition-colors hover:text-amber-700"
      aria-label={`Cart with ${count} items`}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  )
}

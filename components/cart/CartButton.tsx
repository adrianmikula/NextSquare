"use client"

import { ShoppingBag } from "lucide-react"
import { useCartItemCount, useCartStore } from "@/lib/store/cart"
import { useState, useEffect, useRef } from "react"

export function CartButton() {
  const count = useCartItemCount()
  const openCart = useCartStore((s) => s.openCart)
  const [pulse, setPulse] = useState(false)
  const prevCount = useRef(count)

  useEffect(() => {
    if (count !== prevCount.current) {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 300)
      prevCount.current = count
      return () => clearTimeout(t)
    }
  }, [count])

  return (
    <button
      data-cart-button
      onClick={openCart}
      className="relative flex items-center text-link transition-colors hover-text-link-hover"
      aria-label={`Cart with ${count} items`}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className={`absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-[var(--color-background)] ${pulse ? "animate-cart-pulse" : ""}`}>
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  )
}

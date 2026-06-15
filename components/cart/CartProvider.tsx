"use client"

import { useState, createContext, useContext, useCallback } from "react"
import { CartDrawer } from "./CartDrawer"

interface CartContextValue {
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue>({
  openCart: () => {},
  closeCart: () => {},
})

export function useCartContext() {
  return useContext(CartContext)
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const openCart = useCallback(() => setOpen(true), [])
  const closeCart = useCallback(() => setOpen(false), [])

  return (
    <CartContext.Provider value={{ openCart, closeCart }}>
      {children}
      <CartDrawer open={open} onClose={closeCart} />
    </CartContext.Provider>
  )
}

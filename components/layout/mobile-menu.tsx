"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { OrderButton } from "@/components/order-button"
import { CartButton } from "@/components/cart/CartButton"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function MobileMenuClient() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      <div className="flex items-center gap-3 md:hidden">
        <CartButton />
        <button
          className="flex items-center"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 top-16 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav className="relative flex animate-slide-down flex-col gap-1 border-b border-stone-200 bg-white px-4 pb-6 pt-4 shadow-xl">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-amber-700"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-stone-100 pt-3">
              <OrderButton />
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

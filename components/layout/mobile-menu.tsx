"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { OrderButton } from "@/components/order-button"
import { CartButton } from "@/components/cart/CartButton"
import { DEFAULT_LINKS } from "@/lib/constants"

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
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: "color-mix(in srgb, var(--color-overlay, rgba(0,0,0,0.5)) 60%, transparent)" }}
            onClick={() => setOpen(false)}
          />
          <nav className="relative flex animate-slide-down flex-col gap-1 border-b border-card bg-card px-4 pb-6 pt-4" style={{ boxShadow: "var(--theme-shadow-card-hover)" }}>
            {DEFAULT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-link transition-colors hover:bg-[var(--color-button-ghost-hover-bg)] hover-text-link-hover"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-[var(--color-card-border)] pt-3">
              <OrderButton />
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

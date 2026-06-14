"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { OrderButton } from "@/components/order-button"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function MobileMenuClient() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="flex items-center md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 border-b border-stone-200 bg-white p-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-stone-600 transition-colors hover:text-amber-700"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <OrderButton />
          </nav>
        </div>
      )}
    </>
  )
}

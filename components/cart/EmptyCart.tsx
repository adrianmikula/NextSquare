"use client"

import Link from "next/link"

export function EmptyCart() {
  return (
    <div className="py-16 text-center text-stone-500">
      <svg className="mx-auto h-12 w-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <p className="mt-4 text-sm">Your cart is empty</p>
      <Link
        href="/menu"
        className="mt-2 inline-block text-sm font-medium text-amber-700 hover:underline"
      >
        Browse our menu
      </Link>
    </div>
  )
}

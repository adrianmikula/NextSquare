"use client"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SquareFallback() {
  const url = process.env.NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL

  if (!url) return null

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
      <h3 className="text-lg font-semibold text-amber-900">
        Having trouble with checkout?
      </h3>
      <p className="mt-2 text-sm text-amber-700">
        You can also place your order through our secure Square-hosted checkout.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "mt-4 inline-flex no-underline"
        )}
      >
        Continue on Square Checkout
      </a>
    </div>
  )
}

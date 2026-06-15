"use client"

import type { FulfillmentType } from "@/types/cart"

interface DeliveryPickupToggleProps {
  value: FulfillmentType
  onChange: (type: FulfillmentType) => void
}

export function DeliveryPickupToggle({
  value,
  onChange,
}: DeliveryPickupToggleProps) {
  return (
    <div className="inline-flex rounded-xl border border-stone-200 bg-stone-50 p-1">
      <button
        onClick={() => onChange("PICKUP")}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          value === "PICKUP"
            ? "bg-white text-amber-700 shadow-sm"
            : "text-stone-500 hover:text-stone-700"
        }`}
      >
        Pickup
      </button>
      <button
        onClick={() => onChange("DELIVERY")}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          value === "DELIVERY"
            ? "bg-white text-amber-700 shadow-sm"
            : "text-stone-500 hover:text-stone-700"
        }`}
      >
        Delivery
      </button>
    </div>
  )
}

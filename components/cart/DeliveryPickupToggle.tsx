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
    <div className="inline-flex rounded-xl border border-card bg-section p-1">
      <button
        onClick={() => onChange("PICKUP")}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          value === "PICKUP"
            ? "bg-card text-price"
            : "text-muted hover:text-label"
        }`}
        style={value === "PICKUP" ? { boxShadow: "var(--theme-shadow-card)" } : undefined}
      >
        Pickup
      </button>
      <button
        onClick={() => onChange("DELIVERY")}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          value === "DELIVERY"
            ? "bg-card text-price"
            : "text-muted hover:text-label"
        }`}
        style={value === "DELIVERY" ? { boxShadow: "var(--theme-shadow-card)" } : undefined}
      >
        Delivery
      </button>
    </div>
  )
}

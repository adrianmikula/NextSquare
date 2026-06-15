"use client"

import type { DeliveryAddress } from "@/types/order"

interface DeliveryInfoProps {
  name: string
  phone: string
  address: DeliveryAddress
  deliveryNotes: string
  onNameChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onAddressChange: (field: keyof DeliveryAddress, value: string) => void
  onNotesChange: (value: string) => void
}

const AU_STATES = [
  "NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT",
]

export function DeliveryInfo({
  name,
  phone,
  address,
  deliveryNotes,
  onNameChange,
  onPhoneChange,
  onAddressChange,
  onNotesChange,
}: DeliveryInfoProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-stone-900">Delivery Details</h3>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="delivery-name"
            className="block text-sm font-medium text-stone-700"
          >
            Name
          </label>
          <input
            id="delivery-name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Your name"
            className="mt-1 block w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="delivery-phone"
            className="block text-sm font-medium text-stone-700"
          >
            Phone
          </label>
          <input
            id="delivery-phone"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="0412 345 678"
            className="mt-1 block w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="delivery-address"
            className="block text-sm font-medium text-stone-700"
          >
            Street Address
          </label>
          <input
            id="delivery-address"
            type="text"
            value={address.addressLine1}
            onChange={(e) => onAddressChange("addressLine1", e.target.value)}
            placeholder="123 Example St"
            className="mt-1 block w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            required
          />
        </div>
        <div>
          <input
            type="text"
            value={address.addressLine2 ?? ""}
            onChange={(e) => onAddressChange("addressLine2", e.target.value)}
            placeholder="Unit / Apartment (optional)"
            className="mt-1 block w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="delivery-suburb"
              className="block text-sm font-medium text-stone-700"
            >
              Suburb
            </label>
            <input
              id="delivery-suburb"
              type="text"
              value={address.locality}
              onChange={(e) => onAddressChange("locality", e.target.value)}
              placeholder="Suburb"
              className="mt-1 block w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="delivery-state"
              className="block text-sm font-medium text-stone-700"
            >
              State
            </label>
            <select
              id="delivery-state"
              value={address.administrativeDistrictLevel1}
              onChange={(e) =>
                onAddressChange("administrativeDistrictLevel1", e.target.value)
              }
              className="mt-1 block w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              required
            >
              <option value="">Select</option>
              {AU_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor="delivery-postcode"
            className="block text-sm font-medium text-stone-700"
          >
            Postcode
          </label>
          <input
            id="delivery-postcode"
            type="text"
            value={address.postalCode}
            onChange={(e) => onAddressChange("postalCode", e.target.value)}
            placeholder="2000"
            className="mt-1 block w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="delivery-notes"
            className="block text-sm font-medium text-stone-700"
          >
            Delivery Notes
          </label>
          <textarea
            id="delivery-notes"
            value={deliveryNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Gate code, instructions, etc."
            rows={2}
            className="mt-1 block w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>
    </div>
  )
}

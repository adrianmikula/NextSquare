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
    <div className="card bg-base-100" style={{ boxShadow: "var(--card-shadow, var(--theme-shadow-card))", border: "var(--card-border-toggle, var(--theme-border-width, 1px)) var(--theme-border-style, solid) var(--color-card-border)", transition: "box-shadow var(--transition-speed, 300ms) var(--motion-easing, ease), transform var(--transition-speed, 300ms) var(--motion-easing, ease)" }}>
      <h3 className="mb-4 text-lg font-semibold text-heading">Delivery Details</h3>
      <div className="space-y-4">
        <fieldset className="fieldset">
          <label htmlFor="delivery-name" className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            id="delivery-name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Your name"
            className="input input-bordered w-full"
            required
          />
        </fieldset>
        <fieldset className="fieldset">
          <label htmlFor="delivery-phone" className="label">
            <span className="label-text">Phone</span>
          </label>
          <input
            id="delivery-phone"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="0412 345 678"
            className="input input-bordered w-full"
            required
          />
        </fieldset>
        <fieldset className="fieldset">
          <label htmlFor="delivery-address" className="label">
            <span className="label-text">Street Address</span>
          </label>
          <input
            id="delivery-address"
            type="text"
            value={address.addressLine1}
            onChange={(e) => onAddressChange("addressLine1", e.target.value)}
            placeholder="123 Example St"
            className="input input-bordered w-full"
            required
          />
        </fieldset>
        <fieldset className="fieldset">
          <input
            type="text"
            value={address.addressLine2 ?? ""}
            onChange={(e) => onAddressChange("addressLine2", e.target.value)}
            placeholder="Unit / Apartment (optional)"
            className="input input-bordered w-full"
          />
        </fieldset>
        <div className="grid grid-cols-2 gap-4">
          <fieldset className="fieldset">
            <label htmlFor="delivery-suburb" className="label">
              <span className="label-text">Suburb</span>
            </label>
            <input
              id="delivery-suburb"
              type="text"
              value={address.locality}
              onChange={(e) => onAddressChange("locality", e.target.value)}
              placeholder="Suburb"
              className="input input-bordered w-full"
              required
            />
          </fieldset>
          <fieldset className="fieldset">
            <label htmlFor="delivery-state" className="label">
              <span className="label-text">State</span>
            </label>
            <select
              id="delivery-state"
              value={address.administrativeDistrictLevel1}
              onChange={(e) =>
                onAddressChange("administrativeDistrictLevel1", e.target.value)
              }
              className="select select-bordered w-full"
              required
            >
              <option value="">Select</option>
              {AU_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </fieldset>
        </div>
        <fieldset className="fieldset">
          <label htmlFor="delivery-postcode" className="label">
            <span className="label-text">Postcode</span>
          </label>
          <input
              id="delivery-postcode"
              type="text"
              value={address.postalCode}
              onChange={(e) => onAddressChange("postalCode", e.target.value)}
              placeholder="2000"
              className="input input-bordered w-full"
              required
          />
        </fieldset>
        <fieldset className="fieldset">
          <label htmlFor="delivery-notes" className="label">
            <span className="label-text">Delivery Notes</span>
          </label>
          <textarea
              id="delivery-notes"
              value={deliveryNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Gate code, instructions, etc."
              rows={2}
              className="textarea textarea-bordered w-full"
          />
        </fieldset>
      </div>
    </div>
  )
}

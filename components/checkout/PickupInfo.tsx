"use client"

interface PickupInfoProps {
  name: string
  phone: string
  onNameChange: (value: string) => void
  onPhoneChange: (value: string) => void
}

export function PickupInfo({
  name,
  phone,
  onNameChange,
  onPhoneChange,
}: PickupInfoProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-stone-900">Pickup Details</h3>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="pickup-name"
            className="block text-sm font-medium text-stone-700"
          >
            Name
          </label>
          <input
            id="pickup-name"
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
            htmlFor="pickup-phone"
            className="block text-sm font-medium text-stone-700"
          >
            Phone
          </label>
          <input
            id="pickup-phone"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="0412 345 678"
            className="mt-1 block w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            required
          />
        </div>
      </div>
    </div>
  )
}

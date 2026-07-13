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
    <div className="card bg-base-100" style={{ boxShadow: "var(--card-shadow, var(--theme-shadow-card))", border: "var(--card-border-toggle, var(--theme-border-width, 1px)) var(--theme-border-style, solid) var(--color-card-border)", transition: "box-shadow var(--transition-speed, 300ms) var(--motion-easing, ease), transform var(--transition-speed, 300ms) var(--motion-easing, ease)" }}>
      <h3 className="mb-4 text-lg font-semibold text-heading">Pickup Details</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="pickup-name" className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            id="pickup-name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Your name"
            className="input input-bordered w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="pickup-phone" className="label">
            <span className="label-text">Phone</span>
          </label>
          <input
            id="pickup-phone"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="0412 345 678"
            className="input input-bordered w-full"
            required
          />
        </div>
      </div>
    </div>
  )
}

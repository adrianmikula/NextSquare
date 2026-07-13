"use client"

interface AvailabilityToggleProps {
  available: boolean
  onChange: (available: boolean) => void
  disabled?: boolean
}

export function AvailabilityToggle({
  available,
  onChange,
  disabled,
}: AvailabilityToggleProps) {
  return (
    <label className="label cursor-pointer gap-3">
      <span className="label-text">{available ? "Available online" : "Unavailable"}</span>
      <input
        type="checkbox"
        checked={available}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="toggle"
      />
    </label>
  )
}

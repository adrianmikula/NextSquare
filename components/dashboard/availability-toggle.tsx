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
    <label className="inline-flex cursor-pointer items-center gap-3">
      <div className="relative">
        <input
          type="checkbox"
          checked={available}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="peer sr-only"
        />
        <div className="h-6 w-11 rounded-full bg-stone-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-600 peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-600 peer-focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
      </div>
      <span className="text-sm font-medium text-stone-700">
        {available ? "Available online" : "Unavailable"}
      </span>
    </label>
  )
}

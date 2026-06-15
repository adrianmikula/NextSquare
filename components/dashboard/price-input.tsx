"use client"

interface PriceInputProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function PriceInput({ value, onChange, disabled }: PriceInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-500">
        $
      </span>
      <input
        type="number"
        step="0.01"
        min="0"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        disabled={disabled}
        className="block w-full rounded-lg border border-stone-300 py-2 pl-7 pr-3 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400"
      />
    </div>
  )
}

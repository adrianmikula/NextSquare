"use client"

interface PriceInputProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function PriceInput({ value, onChange, disabled }: PriceInputProps) {
  return (
    <label className="input input-bordered flex items-center gap-2">
      <span>$</span>
      <input
        type="number"
        step="0.01"
        min="0"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        disabled={disabled}
        className="grow"
      />
    </label>
  )
}

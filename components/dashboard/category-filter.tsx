"use client"

import { cn } from "@/lib/utils"

interface CategoryFilterProps {
  categories: string[]
  selected: string | null
  onSelect: (category: string | null) => void
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "badge px-3 py-2 text-xs font-medium",
          selected === null ? "badge-primary" : "badge-outline"
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={cn(
            "badge px-3 py-2 text-xs font-medium",
            selected === category ? "badge-primary" : "badge-outline"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  )
}

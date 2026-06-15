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
          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
          selected === null
            ? "bg-amber-600 text-white"
            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            selected === category
              ? "bg-amber-600 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  )
}

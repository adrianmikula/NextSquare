"use client"

import type { SquareCatalogCategory } from "@/types/square"

interface CategoryNavProps {
  categories: SquareCatalogCategory[]
  activeCategory: string | null
  onSelect: (categoryId: string | null) => void
}

export function CategoryNav({
  categories,
  activeCategory,
  onSelect,
}: CategoryNavProps) {
  return (
    <div className="sticky top-16 z-30 -mx-4 overflow-x-auto border-b border-stone-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex gap-2 py-3">
        <button
          onClick={() => onSelect(null)}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === null
              ? "bg-amber-600 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? "bg-amber-600 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {cat.categoryData?.name ?? "Unnamed"}
          </button>
        ))}
      </div>
    </div>
  )
}

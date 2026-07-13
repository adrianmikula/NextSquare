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
    <div className="sticky top-[var(--nav-height)] z-30 -mx-4 overflow-x-auto border-b border-card px-4 backdrop-blur supports-[backdrop-filter]:bg-nav" style={{ backgroundColor: "var(--color-nav-bg)" }}>
      <div className="flex gap-2 py-3">
        <button
          onClick={() => onSelect(null)}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === null
              ? "bg-[var(--color-primary)] text-[var(--color-background)]"
              : "bg-[var(--color-button-secondary-bg)] text-link hover:bg-[var(--color-button-secondary-hover-bg)]"
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
                ? "bg-[var(--color-primary)] text-[var(--color-background)]"
                : "bg-[var(--color-button-secondary-bg)] text-link hover:bg-[var(--color-button-secondary-hover-bg)]"
            }`}
          >
            {cat.categoryData?.name ?? "Unnamed"}
          </button>
        ))}
      </div>
    </div>
  )
}

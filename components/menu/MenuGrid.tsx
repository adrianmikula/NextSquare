"use client"

import type { SquareCatalogItem } from "@/types/square"
import { MenuItemCard } from "./MenuItemCard"

interface MenuGridProps {
  items: SquareCatalogItem[]
  onAddItem: (item: SquareCatalogItem, e: React.MouseEvent) => void
}

export function MenuGrid({ items, onAddItem }: MenuGridProps) {
  if (items.length === 0) {
    return (
      <div className="py-20 text-center text-stone-500">
        No menu items available.
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          onAdd={(e) => onAddItem(item, e)}
        />
      ))}
    </div>
  )
}

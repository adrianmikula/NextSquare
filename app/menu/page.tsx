"use client"

import { useState, useCallback } from "react"
import { useMenu } from "@/hooks/useMenu"
import { useCartStore } from "@/lib/store/cart"
import type { SquareCatalogItem } from "@/types/square"
import type { ModifierSelection, CartItem } from "@/types/cart"
import { CategoryNav } from "@/components/menu/CategoryNav"
import { MenuGrid } from "@/components/menu/MenuGrid"
import { MenuItemDetail } from "@/components/menu/MenuItemDetail"
import { toPrice } from "@/lib/utils"

function buildCartItem(
  item: SquareCatalogItem,
  modifiers: ModifierSelection[],
  quantity: number
): Omit<CartItem, "id"> {
  const variation = item.itemData?.variations?.[0]?.itemVariationData
  const priceMoney = toPrice(variation?.priceMoney)
  return {
    catalogObjectId: item.id,
    name: item.itemData?.name ?? "Untitled",
    priceMoney,
    quantity,
    modifiers,
    imageUrl: item.imageUrl,
  }
}

export default function MenuPage() {
  const { items, categories, isLoading } = useMenu()
  const addItem = useCartStore((s) => s.addItem)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<SquareCatalogItem | null>(null)

  const filteredItems = activeCategory
    ? items.filter((item) => item.itemData?.categoryId === activeCategory)
    : items

  const handleAddItem = useCallback((item: SquareCatalogItem, e: React.MouseEvent) => {
    const modifiers = (item.itemData?.modifiers ?? [])

    const hasModifiers = modifiers.length > 0

    if (hasModifiers) {
      setSelectedItem(item)
    } else {
      const card = (e.currentTarget as HTMLElement).closest("[data-menu-item]") as HTMLElement
      if (card) {
        const cardRect = card.getBoundingClientRect()
        const dy = -cardRect.top - cardRect.height / 2
        const dx = window.innerWidth - cardRect.left - cardRect.width / 2
        if (typeof card.animate === "function") {
          card.animate(
            [
              { transform: "translate(0, 0) scale(1)", opacity: 1 },
              { transform: `translate(${dx}px, ${dy}px) scale(0.05)`, opacity: 0 },
            ],
            { duration: 450, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
          )
        }
      }
      addItem(buildCartItem(item, [], 1))
    }
  }, [addItem])

  const handleAddToCart = useCallback(
    (modifiers: ModifierSelection[], quantity: number) => {
      if (!selectedItem) return
      addItem(buildCartItem(selectedItem, modifiers, quantity))
    },
    [selectedItem, addItem]
  )

  return (
    <div className="bg-section">
      <div className="mx-auto container-max px-4 sm:px-6">
        <div className="section-py text-center">
          <h1 className="text-4xl font-bold tracking-tight text-heading">
            Our Menu
          </h1>
          <p className="mt-4 text-lg text-body">
            Freshly prepared every day with locally sourced ingredients.
          </p>
        </div>
      </div>

      <CategoryNav
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      <div className="mx-auto container-max px-4 section-py sm:px-6">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "var(--grid-gap)" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="card bg-base-100 border border-card"
              >
                <div className="skeleton h-48 w-full rounded-none rounded-t-xl" />
                <div className="space-y-3 p-4">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <MenuGrid items={filteredItems} onAddItem={handleAddItem} />
        )}
      </div>

      {selectedItem && (
        <MenuItemDetail
          key={selectedItem.id}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  )
}

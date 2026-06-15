"use client"

import { useState, useCallback } from "react"
import { useMenu } from "@/hooks/useMenu"
import { useCartStore } from "@/lib/store/cart"
import type { SquareCatalogItem } from "@/types/square"
import type { ModifierSelection } from "@/types/cart"
import { CategoryNav } from "@/components/menu/CategoryNav"
import { MenuGrid } from "@/components/menu/MenuGrid"
import { MenuItemDetail } from "@/components/menu/MenuItemDetail"

export default function MenuPage() {
  const { items, categories, isLoading } = useMenu()
  const addItem = useCartStore((s) => s.addItem)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<SquareCatalogItem | null>(null)

  const filteredItems = activeCategory
    ? items.filter((item) => item.itemData?.categoryId === activeCategory)
    : items

  const handleAddItem = useCallback((item: SquareCatalogItem) => {
    const variation = item.itemData?.variations?.[0]?.itemVariationData
    if (!variation) return

    const priceMoney = variation.priceMoney
      ? {
          amount: Number(variation.priceMoney.amount),
          currency: variation.priceMoney.currency,
        }
      : { amount: 0, currency: "AUD" }

    const hasModifiers =
      (item.itemData?.modifiers ?? []).length > 0

    if (hasModifiers) {
      setSelectedItem(item)
    } else {
      addItem({
        catalogObjectId: item.id,
        name: item.itemData?.name ?? "Untitled",
        priceMoney: priceMoney,
        quantity: 1,
        modifiers: [],
        imageUrl: item.imageUrl,
      })
    }
  }, [addItem])

  const handleAddToCart = useCallback(
    (modifiers: ModifierSelection[], quantity: number) => {
      if (!selectedItem) return

      const variation = selectedItem.itemData?.variations?.[0]?.itemVariationData
      const priceMoney = variation?.priceMoney
        ? {
            amount: Number(variation.priceMoney.amount),
            currency: variation.priceMoney.currency,
          }
        : { amount: 0, currency: "AUD" }

      addItem({
        catalogObjectId: selectedItem.id,
        name: selectedItem.itemData?.name ?? "Untitled",
        priceMoney,
        quantity,
        modifiers,
        imageUrl: selectedItem.imageUrl,
      })
    },
    [selectedItem, addItem]
  )

  return (
    <div className="bg-stone-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">
            Our Menu
          </h1>
          <p className="mt-4 text-lg text-stone-600">
            Freshly prepared every day with locally sourced ingredients.
          </p>
        </div>
      </div>

      <CategoryNav
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-stone-200 bg-white"
              >
                <div className="aspect-[4/3] rounded-t-xl bg-stone-100" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-2/3 rounded bg-stone-100" />
                  <div className="h-3 w-full rounded bg-stone-100" />
                  <div className="h-3 w-1/2 rounded bg-stone-100" />
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
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  )
}

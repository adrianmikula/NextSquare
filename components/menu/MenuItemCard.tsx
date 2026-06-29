"use client"

import type { SquareCatalogItem } from "@/types/square"
import { formatCurrency, toPrice } from "@/lib/utils"

interface MenuItemCardProps {
  item: SquareCatalogItem
  onAdd: (e: React.MouseEvent) => void
}

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  const { amount: price, currency } = toPrice(
    item.itemData?.variations?.[0]?.itemVariationData?.priceMoney
  )
  const name = item.itemData?.name ?? "Untitled"
  const description = item.itemData?.description

  return (
    <div
      data-menu-item={item.id}
      className="card-themed group relative overflow-hidden bg-white p-4 transition-all"
    >
      <div
        className="aspect-[4/3] overflow-hidden bg-stone-100"
        style={{ borderRadius: `var(--theme-image-radius) var(--theme-image-radius) 0 0` }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-300">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-stone-900">{name}</h3>
        {description && (
          <p className="mt-1 text-sm text-stone-500 line-clamp-2">{description}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-amber-700">
            {formatCurrency(price, currency)}
          </span>
          <button
            onClick={onAdd}
            className="button-themed rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
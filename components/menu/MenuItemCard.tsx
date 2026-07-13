"use client"

import type { SquareCatalogItem } from "@/types/square"
import { formatCurrency, toPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
      className="card bg-base-100 group relative overflow-hidden p-4"
      style={{ boxShadow: "var(--card-shadow, var(--theme-shadow-card))", border: "var(--card-border-toggle, var(--theme-border-width, 1px)) var(--theme-border-style, solid) var(--color-card-border)", transition: "box-shadow var(--transition-speed, 300ms) var(--motion-easing, ease), transform var(--transition-speed, 300ms) var(--motion-easing, ease)" }}
    >
      <div
        className="overflow-hidden bg-section-alt rounded-box"
        style={{ borderRadius: `var(--theme-image-radius) var(--theme-image-radius) 0 0` }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={name}
            className="h-full w-full transition-transform group-hover:scale-105 rounded-box" style={{ objectFit: "var(--image-treatment, cover)" as React.CSSProperties["objectFit"], aspectRatio: "var(--image-default-aspect, auto)" }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-heading">{name}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted line-clamp-2">{description}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-price">
            {formatCurrency(price, currency)}
          </span>
          <Button
            onClick={onAdd}
            variant="default"
            size="sm"
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
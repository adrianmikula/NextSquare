"use client"

import { useState, useMemo } from "react"
import type { SquareCatalogItem, SquareModifierList } from "@/types/square"
import { formatCurrency, toPrice } from "@/lib/utils"
import { ModifierDialog } from "./ModifierDialog"
import type { ModifierSelection } from "@/types/cart"
import { logger } from "@/lib/logger"
import { Button } from "@/components/ui/button"

interface MenuItemDetailProps {
  item: SquareCatalogItem
  onClose: () => void
  onAddToCart: (modifiers: ModifierSelection[], quantity: number) => void
}

export function MenuItemDetail({
  item,
  onClose,
  onAddToCart,
}: MenuItemDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const modifierLists = useMemo(
    () => (item.itemData?.modifiers ?? []) as SquareModifierList[],
    [item]
  )

  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, ModifierSelection[]>>({})

  const variation = item.itemData?.variations?.[0]?.itemVariationData
  const price = toPrice(variation?.priceMoney).amount
  const currency = toPrice(variation?.priceMoney).currency
  const name = item.itemData?.name ?? "Untitled"

  const modifierPriceMap = useMemo(() => {
    const map: Record<string, number> = {}
    modifierLists.forEach((list) => {
      list.modifierListData?.modifiers?.forEach((mod) => {
        map[mod.id] = toPrice(mod.modifierData?.priceMoney).amount
      })
    })
    return map
  }, [modifierLists])

  const modifierTotal = Object.values(selectedModifiers).reduce(
    (sum, mods) =>
      sum + mods.reduce((mSum, m) => mSum + (modifierPriceMap[m.id] ?? 0), 0),
    0
  )

  const totalPrice = (price + modifierTotal) * quantity

  const handleAdd = () => {
    const allModifiers = Object.values(selectedModifiers).flat()
    const modifiersWithPrices: ModifierSelection[] = allModifiers.map((m) => ({
      id: m.id,
      name: m.name,
      priceMoney: modifierPriceMap[m.id] !== undefined ? { amount: modifierPriceMap[m.id], currency } : undefined,
    }))
    logger("menu-detail").debug("Dialog add cart", {
      itemId: item.id,
      itemName: name,
      selectedModifiersCount: allModifiers.length,
      selectedModifiers: allModifiers.map(m => ({ id: m.id, name: m.name })),
      modifiersWithPrices,
      quantity,
    })
    onAddToCart(modifiersWithPrices, quantity)
    onClose()
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-h-[90vh] w-full container-max overflow-y-auto p-0">
        <div className="relative">
          {item.imageUrl && (
            <div className="overflow-hidden rounded-t-box">
              <img
                src={item.imageUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 text-body backdrop-blur hover:bg-card"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold text-heading">{name}</h2>
          {item.itemData?.description && (
            <p className="mt-2 text-body">{item.itemData.description}</p>
          )}
          <p className="mt-2 text-lg font-bold text-price">
            {formatCurrency(price, currency)}
          </p>

          {modifierLists.length > 0 && (
            <div className="mt-6 space-y-4">
              {modifierLists.map((modList) => (
                <ModifierDialog
                  key={modList.id}
                  modifierList={modList}
                  selected={selectedModifiers[modList.id] ?? []}
                  onSelect={(mods) =>
                    setSelectedModifiers((prev) => ({
                      ...prev,
                      [modList.id]: mods,
                    }))
                  }
                />
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-input-border)] text-body hover:bg-section"
              >
                −
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-input-border)] text-body hover:bg-section"
              >
                +
              </button>
            </div>
            <span className="font-semibold text-heading">
              {formatCurrency(totalPrice, currency)}
            </span>
          </div>

          <Button
            onClick={handleAdd}
            variant="default"
            className="w-full mt-6"
          >
            Add to Cart · {formatCurrency(totalPrice, currency)}
          </Button>
        </div>
      </div>
    </div>
  )
}

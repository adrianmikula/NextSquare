"use client"

import type { SquareModifierList, SquareModifier } from "@/types/square"
import type { ModifierSelection } from "@/types/cart"
import { formatCurrency } from "@/lib/utils"

interface ModifierDialogProps {
  modifierList: SquareModifierList
  selected: ModifierSelection[]
  onSelect: (modifiers: ModifierSelection[]) => void
}

export function ModifierDialog({
  modifierList,
  selected,
  onSelect,
}: ModifierDialogProps) {
  const isSingle = modifierList.modifierListData?.selectionType === "SINGLE"

  const handleToggle = (modifier: SquareModifier) => {
    const price = modifier.modifierData?.priceMoney
      ? {
          amount: Number(modifier.modifierData.priceMoney.amount),
          currency: modifier.modifierData.priceMoney.currency,
        }
      : undefined

    if (isSingle) {
      onSelect([{ id: modifier.id, name: modifier.modifierData?.name ?? "", priceMoney: price }])
    } else {
      const exists = selected.find((m) => m.id === modifier.id)
      if (exists) {
        onSelect(selected.filter((m) => m.id !== modifier.id))
      } else {
        onSelect([
          ...selected,
          { id: modifier.id, name: modifier.modifierData?.name ?? "", priceMoney: price },
        ])
      }
    }
  }

  const modifiers = modifierList.modifierListData?.modifiers ?? []

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-stone-700">
        {modifierList.modifierListData?.name ?? "Options"}
      </p>
      <div className="space-y-1">
        {modifiers.map((modifier) => {
          const isSelected = selected.some((m) => m.id === modifier.id)
          const price = modifier.modifierData?.priceMoney
            ? Number(modifier.modifierData.priceMoney.amount)
            : 0

          return (
            <button
              key={modifier.id}
              onClick={() => handleToggle(modifier)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                isSelected
                  ? "bg-amber-50 text-amber-900 ring-1 ring-amber-300"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              <span>{modifier.modifierData?.name}</span>
              {price > 0 && (
                <span className="text-stone-500">
                  +{formatCurrency(price)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

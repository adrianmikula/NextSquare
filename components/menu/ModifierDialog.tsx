"use client"

import type { SquareModifierList, SquareModifier } from "@/types/square"
import type { ModifierSelection } from "@/types/cart"
import { formatCurrency, toPrice } from "@/lib/utils"

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
    if (isSingle) {
      onSelect([{ id: modifier.id, name: modifier.modifierData?.name ?? "" }])
    } else {
      const exists = selected.find((m) => m.id === modifier.id)
      if (exists) {
        onSelect(selected.filter((m) => m.id !== modifier.id))
      } else {
        onSelect([...selected, { id: modifier.id, name: modifier.modifierData?.name ?? "" }])
      }
    }
  }

  const modifiers = modifierList.modifierListData?.modifiers ?? []

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-label">
        {modifierList.modifierListData?.name ?? "Options"}
      </p>
      <div className="space-y-1">
        {modifiers.map((modifier) => {
          const isSelected = selected.some((m) => m.id === modifier.id)
          const price = toPrice(modifier.modifierData?.priceMoney).amount

          return (
            <button
              key={modifier.id}
              onClick={() => handleToggle(modifier)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                isSelected
                  ? "bg-section-alt text-price ring-1 ring-[var(--color-primary)]"
                  : "text-body hover:bg-section"
              }`}
            >
              <span>{modifier.modifierData?.name}</span>
              {price > 0 && (
                <span className="text-muted">
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

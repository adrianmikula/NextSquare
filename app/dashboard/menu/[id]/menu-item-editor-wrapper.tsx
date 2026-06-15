"use client"

import { useRouter } from "next/navigation"
import { MenuItemEditor } from "@/components/dashboard/menu-item-editor"

interface ItemData {
  id: string
  name: string
  description?: string
  priceMoney?: { amount: number; currency: string }
  availableForOnline: boolean
  type: string
}

interface MenuItemEditorWrapperProps {
  item: ItemData
}

export function MenuItemEditorWrapper({
  item,
}: MenuItemEditorWrapperProps) {
  const router = useRouter()

  return (
    <MenuItemEditor
      item={item}
      onSaved={() => {
        router.push("/dashboard/menu")
        router.refresh()
      }}
      onCancel={() => router.push("/dashboard/menu")}
    />
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PriceInput } from "./price-input"
import { AvailabilityToggle } from "./availability-toggle"
import { Save, Loader2 } from "lucide-react"

interface MenuItemData {
  id: string
  name: string
  description?: string
  priceMoney?: { amount: number; currency: string }
  availableForOnline?: boolean
  categoryName?: string
}

interface MenuItemEditorProps {
  item: MenuItemData
  onSaved: () => void
  onCancel: () => void
}

export function MenuItemEditor({
  item,
  onSaved,
  onCancel,
}: MenuItemEditorProps) {
  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description ?? "")
  const [price, setPrice] = useState(
    item.priceMoney ? Number(item.priceMoney.amount) / 100 : 0
  )
  const [available, setAvailable] = useState(
    item.availableForOnline ?? true
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSave() {
    setSaving(true)
    setError("")

    try {
      const body: Record<string, unknown> = {}
      if (name !== item.name) body.name = name
      if (description !== (item.description ?? ""))
        body.description = description
      if (price !== (item.priceMoney ? Number(item.priceMoney.amount) / 100 : 0))
        body.priceMoney = price
      if (available !== (item.availableForOnline ?? true))
        body.availableOnline = available

      if (Object.keys(body).length === 0) {
        onCancel()
        return
      }

      const res = await fetch(`/api/admin/catalog/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to save")
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-stone-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-stone-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">
            Price (AUD)
          </label>
          <PriceInput value={price} onChange={setPrice} />
        </div>

        <div className="flex items-end pb-2">
          <AvailabilityToggle
            available={available}
            onChange={setAvailable}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save changes
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

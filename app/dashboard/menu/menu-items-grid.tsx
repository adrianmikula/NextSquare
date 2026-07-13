"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Edit3, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryFilter } from "@/components/dashboard/category-filter"

interface MenuItem {
  id: string
  name: string
  description?: string
  priceMoney?: { amount: number; currency: string }
  availableForOnline: boolean
  categoryName?: string
}

interface MenuItemsGridProps {
  items: MenuItem[]
  categories: string[]
}

export function MenuItemsGrid({ items, categories }: MenuItemsGridProps) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description ?? "")
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesCategory =
        !selectedCategory || item.categoryName === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [items, search, selectedCategory])

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">Menu Items</h1>
          <p className="mt-1 text-sm text-muted">
            {items.length} items total
          </p>
        </div>
        <Button disabled title="Coming soon">
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-lg border border-[var(--color-input-border)] py-2 pl-10 pr-3 text-sm text-heading placeholder:text-muted focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "var(--grid-gap)" }}>
        {filtered.map((item) => (
          <Link key={item.id} href={`/dashboard/menu/${item.id}`}>
            <Card className="cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <Edit3 className="h-4 w-4 text-muted" />
                </div>
              </CardHeader>
              <CardContent>
                {item.description && (
                  <p className="mb-2 text-xs text-muted line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-price">
                    {item.priceMoney
                      ? `$${(item.priceMoney.amount / 100).toFixed(2)}`
                      : "—"}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      item.availableForOnline
                        ? "text-success"
                        : "text-error"
                    }`}
                  >
                    {item.availableForOnline ? "Available" : "Unavailable"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-sm text-muted">No items match your search</p>
        </div>
      )}
    </div>
  )
}

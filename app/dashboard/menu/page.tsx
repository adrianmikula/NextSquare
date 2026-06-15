import type { Metadata } from "next"
import { Client, Environment } from "square/legacy"
import { MenuItemsGrid } from "./menu-items-grid"
import { requireEnv } from "@/lib/env"

export const metadata: Metadata = {
  title: "Menu Management",
  robots: { index: false, follow: false },
}

const { catalogApi } = new Client({
  accessToken: requireEnv("SQUARE_ACCESS_TOKEN"),
  environment:
    requireEnv("SQUARE_ENVIRONMENT") === "production" ? Environment.Production : Environment.Sandbox,
})

export default async function MenuPage() {
  const { result } = await catalogApi.searchCatalogItems({
    productTypes: ["REGULAR"],
    sortOrder: "ASC",
  })

  const items = (result.items ?? []).map((item) => {
    const variation = item.itemData?.variations?.[0]?.itemVariationData
    return {
      id: item.id,
      name: item.itemData?.name ?? "Untitled",
      description: item.itemData?.description ?? undefined,
      priceMoney: variation?.priceMoney
        ? {
            amount: Number(variation.priceMoney.amount),
            currency: variation.priceMoney.currency ?? "AUD",
          }
        : undefined,
      availableForOnline: item.itemData?.availableOnline ?? true,
      categoryName: item.itemData?.categoryId ?? undefined,
    }
  })

  const categories = [
    ...new Set(
      items
        .map((i) => i.categoryName)
        .filter((c): c is string => c !== undefined)
    ),
  ]

  return <MenuItemsGrid items={items} categories={categories} />
}

import { getSquareApiBase, getSquareHeaders } from "./config"
import { isDemoMode } from "@/lib/demo/config"
import { demoMenuItems } from "@/lib/demo/menu-data"

export interface SquareCatalogItem {
  id: string
  name: string
  description?: string
  priceMoney?: { amount: bigint; currency: string }
  imageUrl?: string
  categoryName?: string
}

export async function fetchCatalog(): Promise<SquareCatalogItem[]> {
  if (isDemoMode()) {
    return demoMenuItems.map((item) => {
      const variation = item.itemData?.variations?.[0]?.itemVariationData
      return {
        id: item.id,
        name: item.itemData?.name ?? "Untitled",
        description: item.itemData?.description,
        priceMoney: variation?.priceMoney
          ? { amount: BigInt(variation.priceMoney.amount), currency: variation.priceMoney.currency }
          : undefined,
        imageUrl: item.imageUrl,
        categoryName: item.categoryName,
      }
    })
  }

  const url = `${getSquareApiBase()}/v2/catalog/list?types=ITEM`
  const response = await fetch(url, { headers: getSquareHeaders(), next: { revalidate: 300 } })

  if (!response.ok) {
    throw new Error(`Square API error: ${response.status}`)
  }

  const data = await response.json()
  const items: SquareCatalogItem[] = []

  for (const obj of data.objects ?? []) {
    if (obj.type !== "ITEM") continue
    const itemData = obj.itemData
    if (!itemData) continue

    const variation = itemData.variations?.[0]?.itemVariationData
    const priceMoney = variation?.priceMoney
      ? { amount: BigInt(variation.priceMoney.amount), currency: variation.priceMoney.currency }
      : undefined

    items.push({
      id: obj.id,
      name: itemData.name ?? "Untitled",
      description: itemData.description,
      priceMoney,
      categoryName: itemData.categoryId,
      imageUrl: itemData.ecomImageIds?.[0],
    })
  }

  return items
}

export async function fetchLocation(): Promise<{
  address?: { addressLine1?: string; city?: string; state?: string; postalCode?: string }
  timezone?: string
}> {
  if (isDemoMode()) {
    return {
      address: { addressLine1: "123 Demo St", city: "Melbourne", state: "VIC", postalCode: "3000" },
      timezone: "Australia/Melbourne",
    }
  }

  const locationId = process.env.SQUARE_LOCATION_ID
  if (!locationId) return {}

  const response = await fetch(
    `${getSquareApiBase()}/v2/locations/${locationId}`,
    { headers: getSquareHeaders(), next: { revalidate: 3600 } }
  )

  if (!response.ok) return {}

  return response.json()
}

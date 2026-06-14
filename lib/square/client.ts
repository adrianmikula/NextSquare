const SQUARE_API_BASE =
  process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com"

const headers = {
  "Square-Version": "2025-01-23",
  Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
  "Content-Type": "application/json",
}

export interface SquareCatalogItem {
  id: string
  name: string
  description?: string
  priceMoney?: { amount: bigint; currency: string }
  imageUrl?: string
  categoryName?: string
}

export async function fetchCatalog(): Promise<SquareCatalogItem[]> {
  const url = `${SQUARE_API_BASE}/v2/catalog/list?types=ITEM`

  const response = await fetch(url, { headers, next: { revalidate: 300 } })

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
      ? {
          amount: BigInt(variation.priceMoney.amount),
          currency: variation.priceMoney.currency,
        }
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
  const locationId = process.env.SQUARE_LOCATION_ID
  if (!locationId) return {}

  const response = await fetch(
    `${SQUARE_API_BASE}/v2/locations/${locationId}`,
    { headers, next: { revalidate: 3600 } }
  )

  if (!response.ok) return {}

  return response.json()
}

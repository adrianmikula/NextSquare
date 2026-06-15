import "server-only"
import type { SquareCatalogItem, SquareCatalogCategory, SquareImage } from "@/types/square"

type CatalogObject = SquareCatalogItem | SquareImage

const SQUARE_API_BASE =
  process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com"

const headers = {
  "Square-Version": "2025-01-23",
  Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
  "Content-Type": "application/json",
}

async function squareFetch<T>(path: string, body?: unknown): Promise<T> {
  const url = `${SQUARE_API_BASE}${path}`
  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`Square API error (${response.status}): ${await response.text()}`)
  }

  return response.json()
}

export async function fetchMenu(): Promise<{
  items: SquareCatalogItem[]
  categories: SquareCatalogCategory[]
}> {
  const [catalogResult, categoryResult] = await Promise.all([
    squareFetch<{
      objects?: CatalogObject[]
      cursor?: string
    }>("/v2/catalog/list?types=ITEM,IMAGE&cursor="),
    squareFetch<{
      objects?: SquareCatalogCategory[]
    }>("/v2/catalog/list?types=CATEGORY"),
  ])

  const items = (catalogResult.objects ?? []).filter(
    (obj): obj is SquareCatalogItem => obj.type === "ITEM"
  )
  const images = (catalogResult.objects ?? []).filter(
    (obj): obj is SquareImage => obj.type === "IMAGE"
  )
  const categories = (categoryResult.objects ?? []).filter(
    (obj): obj is SquareCatalogCategory => obj.type === "CATEGORY"
  )

  const imageMap = new Map<string, string>()
  for (const img of images) {
    if (img.url) {
      imageMap.set(img.id, img.url)
    }
  }

  const categoryMap = new Map<string, string>()
  for (const cat of categories) {
    if (cat.categoryData?.name) {
      categoryMap.set(cat.id, cat.categoryData.name)
    }
  }

  const enrichedItems = items
    .filter((item) => {
      if (item.itemData?.availableOnline === false) return false
      const variations = item.itemData?.variations ?? []
      const hasAvailableVariation = variations.some(
        (v) => v.itemVariationData?.availableForOnline !== false
      )
      return variations.length === 0 || hasAvailableVariation
    })
    .map((item) => {
      const imageId =
        item.itemData?.ecomImageIds?.[0] ?? item.itemData?.imageIds?.[0]
      return {
        ...item,
        imageUrl: imageId ? imageMap.get(imageId) : undefined,
        categoryName: item.itemData?.categoryId
          ? categoryMap.get(item.itemData.categoryId)
          : undefined,
      }
    })

  return { items: enrichedItems, categories }
}

export async function fetchItemBySlug(
  itemId: string
): Promise<SquareCatalogItem | null> {
  try {
    const result = await squareFetch<{ object: SquareCatalogItem }>(
      `/v2/catalog/object/${itemId}`
    )
    return result.object ?? null
  } catch {
    return null
  }
}

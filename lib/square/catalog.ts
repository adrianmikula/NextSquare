import "server-only"
import type { SquareCatalogItem, SquareCatalogCategory, SquareImage } from "@/types/square"
import { getSquareApiBase, getSquareHeaders } from "./config"
import { isDemoMode } from "@/lib/demo/config"
import { demoMenuItems, demoCategories } from "@/lib/demo/menu-data"

type CatalogObject = SquareCatalogItem | SquareImage

async function squareFetch<T>(path: string, body?: unknown): Promise<T> {
  const url = `${getSquareApiBase()}${path}`
  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: getSquareHeaders(),
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
  if (isDemoMode()) {
    return { items: demoMenuItems, categories: demoCategories }
  }

  const allObjects: CatalogObject[] = []
  let cursor: string | undefined

  do {
    const path = `/v2/catalog/list?types=ITEM,IMAGE${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`
    const result = await squareFetch<{ objects?: CatalogObject[]; cursor?: string }>(path)
    allObjects.push(...(result.objects ?? []))
    cursor = result.cursor
  } while (cursor)

  const items = allObjects.filter((obj): obj is SquareCatalogItem => obj.type === "ITEM")
  const images = allObjects.filter((obj): obj is SquareImage => obj.type === "IMAGE")

  let categoryCursor: string | undefined
  const allCategories: SquareCatalogCategory[] = []

  do {
    const path = `/v2/catalog/list?types=CATEGORY${categoryCursor ? `&cursor=${encodeURIComponent(categoryCursor)}` : ""}`
    const result = await squareFetch<{ objects?: SquareCatalogCategory[]; cursor?: string }>(path)
    allCategories.push(...(result.objects ?? []))
    categoryCursor = result.cursor
  } while (categoryCursor)

  const categories = allCategories.filter((obj): obj is SquareCatalogCategory => obj.type === "CATEGORY")

  const imageMap = new Map<string, string>()
  for (const img of images) {
    if (img.url) imageMap.set(img.id, img.url)
  }

  const categoryMap = new Map<string, string>()
  for (const cat of categories) {
    if (cat.categoryData?.name) categoryMap.set(cat.id, cat.categoryData.name)
  }

  const enrichedItems = items
    .filter((item) => {
      if (item.itemData?.availableOnline === false) return false
      const variations = item.itemData?.variations ?? []
      const hasAvailable = variations.some((v) => v.itemVariationData?.availableForOnline !== false)
      return variations.length === 0 || hasAvailable
    })
    .map((item) => {
      const imageId = item.itemData?.ecomImageIds?.[0] ?? item.itemData?.imageIds?.[0]
      return {
        ...item,
        imageUrl: imageId ? imageMap.get(imageId) : undefined,
        categoryName: item.itemData?.categoryId ? categoryMap.get(item.itemData.categoryId) : undefined,
      }
    })

  return { items: enrichedItems, categories }
}

export async function fetchItemBySlug(itemId: string): Promise<SquareCatalogItem | null> {
  if (isDemoMode()) {
    return demoMenuItems.find((i) => i.id === itemId) ?? null
  }

  try {
    const result = await squareFetch<{ object: SquareCatalogItem }>(`/v2/catalog/object/${itemId}`)
    return result.object ?? null
  } catch {
    return null
  }
}

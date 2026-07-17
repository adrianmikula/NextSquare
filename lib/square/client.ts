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

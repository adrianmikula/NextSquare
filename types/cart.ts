export interface ModifierSelection {
  id: string
  name: string
  priceMoney?: {
    amount: number
    currency: string
  }
}

export interface CartItem {
  id: string
  catalogObjectId: string
  name: string
  priceMoney: {
    amount: number
    currency: string
  }
  quantity: number
  modifiers: ModifierSelection[]
  imageUrl?: string
}

export type FulfillmentType = "PICKUP" | "DELIVERY"

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

export interface CartState {
  items: CartItem[]
  fulfillmentType: FulfillmentType
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  setFulfillmentType: (type: FulfillmentType) => void
  clearCart: () => void
  itemCount: () => number
  subtotal: () => number
}

/**
 * Cart domain models for the cafe ordering system.
 */

model ModifierSelection {
  id: string
  name: string
  priceMoney?: Money
}

model CartItem {
  id: string
  catalogObjectId: string
  name: string
  priceMoney: Money
  quantity: integer
  modifiers: ModifierSelection[]
  imageUrl?: string
}

model Money {
  amount: integer
  currency: string
}

union FulfillmentType {
  string,
  PICKUP,
  DELIVERY,
}

model CartState {
  items: CartItem[]
  fulfillmentType: FulfillmentType
  addItem(item: CartItem): void
  removeItem(id: string): void
  updateQuantity(id: string, qty: integer): void
  setFulfillmentType(type: FulfillmentType): void
  clearCart(): void
  itemCount(): integer
  subtotal(): integer
}

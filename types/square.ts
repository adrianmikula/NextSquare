export interface SquareImage {
  id: string
  type: "IMAGE"
  url?: string
  name?: string
}

export interface SquareMoney {
  amount: bigint
  currency: string
}

export interface SquareItemVariation {
  id: string
  type: "ITEM_VARIATION"
  itemVariationData?: {
    itemId: string
    name: string
    pricingType: "FIXED_PRICING" | "VARIABLE_PRICING"
    priceMoney?: SquareMoney
    availableForOnline?: boolean
  }
  version?: bigint
}

export interface SquareModifier {
  id: string
  type: "MODIFIER"
  modifierData?: {
    name: string
    priceMoney?: SquareMoney
    ordinal?: number
  }
  version?: bigint
}

export interface SquareModifierList {
  id: string
  type: "MODIFIER_LIST"
  modifierListData?: {
    name: string
    modifiers?: SquareModifier[]
    selectionType?: "SINGLE" | "MULTIPLE"
  }
  version?: bigint
}

export interface SquareCatalogCategory {
  id: string
  type: "CATEGORY"
  categoryData?: {
    name: string
  }
  version?: bigint
}

export interface SquareCatalogItem {
  id: string
  type: "ITEM"
  itemData?: {
    name: string
    description?: string
    abbreviation?: string
    labelColor?: string
    availableOnline?: boolean
    categoryId?: string
    modifiers?: SquareModifierList[]
    variations?: SquareItemVariation[]
    imageIds?: string[]
    ecomImageIds?: string[]
  }
  imageUrl?: string
  categoryName?: string
  version?: bigint
}

export interface SquareCatalogResponse {
  objects?: SquareCatalogItem[]
  cursor?: string
}

export interface SquareLocation {
  id: string
  name?: string
  address?: {
    addressLine1?: string
    addressLine2?: string
    locality?: string
    administrativeDistrictLevel1?: string
    postalCode?: string
    country?: string
  }
  timezone?: string
  capabilities?: string[]
  status?: string
}

export interface SquareOrderFulfillmentPickupDetails {
  recipient?: {
    displayName?: string
    emailAddress?: string
    phoneNumber?: string
  }
  pickupAt?: string
  autoComplete?: boolean
}

export interface SquareOrderFulfillmentShipmentDetails {
  recipient?: {
    displayName?: string
    emailAddress?: string
    phoneNumber?: string
    address?: {
      addressLine1?: string
      addressLine2?: string
      locality?: string
      administrativeDistrictLevel1?: string
      postalCode?: string
      country?: string
    }
  }
}

export interface SquareOrderFulfillment {
  type: "PICKUP" | "SHIPMENT"
  state: string
  pickupDetails?: SquareOrderFulfillmentPickupDetails
  shipmentDetails?: SquareOrderFulfillmentShipmentDetails
}

export interface SquareOrderLineItem {
  uid?: string
  catalogObjectId?: string
  quantity: string
  name?: string
  basePriceMoney?: SquareMoney
  modifiers?: Array<{
    catalogObjectId: string
    name?: string
    basePriceMoney?: SquareMoney
  }>
  totalMoney?: SquareMoney
}

export interface SquareOrder {
  id?: string
  locationId?: string
  lineItems?: SquareOrderLineItem[]
  fulfillments?: SquareOrderFulfillment[]
  totalMoney?: SquareMoney
  ticketName?: string
  state?: string
  createdAt?: string
  updatedAt?: string
}

export interface SquareOrderResponse {
  order?: SquareOrder
}

export interface SquarePayment {
  id: string
  orderId?: string
  status?: string
  totalMoney?: SquareMoney
  cardDetails?: {
    card?: {
      brand?: string
      last4?: string
      expMonth?: number
      expYear?: number
    }
  }
  createdAt?: string
}

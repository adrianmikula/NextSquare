/**
 * Square API integration models for the cafe ordering system.
 */

model SquareMoney {
  amount: integer
  currency: string
}

model SquareImage {
  id: string
  url?: string
  name?: string
}

model SquareItemVariation {
  id: string
  itemVariationData?: {
    itemId: string
    name: string
    pricingType: "FIXED_PRICING" | "VARIABLE_PRICING"
    priceMoney?: SquareMoney
    availableForOnline?: boolean
  }
}

model SquareModifier {
  id: string
  modifierData?: {
    name: string
    priceMoney?: SquareMoney
    ordinal?: integer
  }
}

model SquareModifierList {
  id: string
  modifierListData?: {
    name: string
    modifiers?: SquareModifier[]
    selectionType?: "SINGLE" | "MULTIPLE"
  }
}

model SquareCatalogCategory {
  id: string
  categoryData?: {
    name: string
  }
}

model SquareCatalogItem {
  id: string
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
}

model SquareCatalogResponse {
  objects?: SquareCatalogItem[]
  cursor?: string
}

model SquareLocation {
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

model SquareOrderFulfillmentPickupDetails {
  recipient?: {
    displayName?: string
    emailAddress?: string
    phoneNumber?: string
  }
  pickupAt?: string
}

model SquareOrderFulfillmentShipmentDetails {
  recipient?: {
    displayName?: string
    emailAddress?: string
    phoneNumber?: string
    address?: DeliveryAddress
  }
}

model SquareOrderFulfillment {
  type: "PICKUP" | "SHIPMENT"
  state: string
  pickupDetails?: SquareOrderFulfillmentPickupDetails
  shipmentDetails?: SquareOrderFulfillmentShipmentDetails
}

model SquareOrderLineItem {
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

model SquareOrder {
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

model SquarePayment {
  id: string
  orderId?: string
  status?: string
  totalMoney?: SquareMoney
  cardDetails?: {
    card?: {
      brand?: string
      last4?: string
      expMonth?: integer
      expYear?: integer
    }
  }
  createdAt?: string
}

@route("/api/square/catalog")
namespace CatalogApi {
  @get op fetchMenu(@query id?: string): SquareCatalogItem[] | SquareCatalogItem | { error: string }
}

@route("/api/square/webhook")
namespace WebhookApi {
  @post op handleWebhook(): void
}

@route("/api/admin/catalog")
namespace AdminCatalogApi {
  @get op listCatalog(@query id?: string): any
}

@route("/api/admin/catalog/{id}")
namespace AdminCatalogItemApi {
  @patch op updateCatalogItem(id: string, body: UpdatePayload): any
}

model UpdatePayload {
  name?: string
  priceMoney?: integer
  description?: string
  availableOnline?: boolean
}

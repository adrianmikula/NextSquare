import type { CartItem } from "./cart"

export interface CustomerInfo {
  name: string
  phone: string
  email?: string
}

export interface DeliveryAddress {
  addressLine1: string
  addressLine2?: string
  locality: string
  administrativeDistrictLevel1: string
  postalCode: string
  country?: string
}

export interface PickupDetails {
  customer: CustomerInfo
  pickupAt?: string
}

export interface DeliveryDetails {
  customer: CustomerInfo
  address: DeliveryAddress
  deliveryNotes?: string
}

export type OrderState =
  | "PROPOSED"
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED"
  | "FAILED"

export interface OrderStatus {
  orderId: string
  state: OrderState
  ticketName?: string
  createdAt?: string
  updatedAt?: string
  lineItems?: CartItem[]
  totalMoney?: {
    amount: number
    currency: string
  }
  customerPhone?: string
}

export interface CreateOrderPayload {
  lineItems: CartItem[]
  customerInfo: CustomerInfo
  fulfillmentType: "PICKUP" | "DELIVERY"
  fulfillmentDetails: PickupDetails | DeliveryDetails
  idempotencyKey: string
}

export interface CreatePaymentPayload {
  nonce: string
  orderId: string
  idempotencyKey: string
  amount: number
  currency?: string
  verificationToken?: string
}

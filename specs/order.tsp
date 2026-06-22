/**
 * Order domain models for the cafe ordering system.
 */

import "./cart.tsp"

model CustomerInfo {
  name: string
  phone: string
  email?: string
}

model DeliveryAddress {
  addressLine1: string
  addressLine2?: string
  locality: string
  administrativeDistrictLevel1: string
  postalCode: string
  country?: string
}

model PickupDetails {
  customer: CustomerInfo
  pickupAt?: string
}

model DeliveryDetails {
  customer: CustomerInfo
  address: DeliveryAddress
  deliveryNotes?: string
}

union OrderState {
  string,
  PROPOSED,
  PENDING,
  IN_PROGRESS,
  COMPLETED,
  CANCELED,
  FAILED,
}

model OrderStatus {
  orderId: string
  state: OrderState
  ticketName?: string
  createdAt?: string
  updatedAt?: string
  lineItems?: CartItem[]
  totalMoney?: Money
  customerPhone?: string
}

model CreateOrderPayload {
  lineItems: CartItem[]
  customerInfo: CustomerInfo
  fulfillmentType: FulfillmentType
  fulfillmentDetails: PickupDetails | DeliveryDetails
  idempotencyKey: string
}

model CreatePaymentPayload {
  nonce: string
  orderId: string
  idempotencyKey: string
  amount: integer
  currency?: string
  verificationToken?: string
}

@route("/api/square/order")
namespace OrderApi {
  @post op createOrder(body: CreateOrderPayload): { orderId: string }
  @get op getOrder(@query orderId: string): OrderStatus | NotFoundError
}

@route("/api/square/payment")
namespace PaymentApi {
  @post op processPayment(body: CreatePaymentPayload): { paymentId: string; status: string }
}

model NotFoundError {
  error: string
}

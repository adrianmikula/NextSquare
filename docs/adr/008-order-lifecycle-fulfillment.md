# ADR-008: Order Lifecycle & Fulfillment Types

**Date:** 2026-06-15  
**Status:** Accepted

## Context

The checkout flow must support two fulfillment types (pickup and delivery) and track orders through their lifecycle from creation to completion. Square Orders API uses a state machine for fulfillment states, and webhooks notify the system of state transitions.

## Decision

### Fulfillment Mapping

| UI Selection | Square `fulfillment.type` | Details |
|---|---|---|
| Pickup | `PICKUP` | `pickupDetails.recipient` with name, phone, `pickupAt` timestamp |
| Delivery | `SHIPMENT` | `shipmentDetails.recipient` with name, phone, address |

### Order Lifecycle

```
Cart → createOrder() → PROPOSED (Square)
                           │
                    [webhook: order.updated]
                           │
                           ▼
                        OPEN (kitchen preparing)
                           │
                    [webhook: order.updated]
                           │
                           ▼
                      COMPLETED (ready)
                           │
                    [webhook: order.updated]
                           │
                           ▼
                     Twilio SMS to customer
```

- `PROPOSED` — order created, pending acceptance
- `OPEN` — kitchen accepted, preparing
- `COMPLETED` — ready for pickup/delivery
- `CANCELED` — order canceled

### Twilio SMS Triggers

Each webhook event sends a different message depending on fulfillment type:

| State | Pickup SMS | Delivery SMS |
|---|---|---|
| `OPEN` | "We're preparing your order" | "We're preparing your delivery" |
| `COMPLETED` | "Ready for pickup" | "Out for delivery" |

## Consequences

- Delivery uses `SHIPMENT` type (Square convention) rather than `DELIVERY`
- Order status is polled client-side via `useOrderStatus` hook — webhooks update Square, client polls the order
- No database — order state lives entirely in Square
- Square webhooks must be configured in Square Developer Dashboard pointing to `/api/square/webhook`

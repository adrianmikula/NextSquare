# Phase 7: Uber Direct + DoorDash Drive Delivery

## Goal

Add delivery fulfillment to the library (`@templatecafe/square-core`) using Uber Direct and DoorDash Drive APIs. When staff marks an order ready in Square POS, a driver is dispatched via the configured provider. Customers receive a tracking link and live delivery status.

Per-drop fee (~$8-12 AUD) vs marketplace commission (25-30%). Saves significant margin on larger orders.

---

## Architecture

```
1. Cafe prepares order → staff marks "Ready" on Square POS
2. Square webhook order.updated fires (fulfillment.state=IN_PROGRESS)
3. Next.js receives webhook, checks: fulfillment.type=DELIVERY?
4. → Uber Direct API: createDelivery({
      pickup: { cafe address },
      dropoff: { customer address },
      items: [{ name, quantity }],
      references: { orderId: "42" }
    })
5. Uber Direct returns: deliveryId, driver ETA, tracking URL
6. → Twilio SMS to customer: "Your driver is on the way!" + tracking URL
7. Uber Direct webhook → delivery status updates (picked up, en route, delivered)
8. On "delivered" → Twilio SMS: "Delivered! Enjoy!"
```

---

## What's Built

### 1. Uber Direct Integration

```typescript
// @templatecafe/square-core/lib/uber/direct.ts
const UBER_API_BASE = 'https://api.uber.com/v1';

export async function createDelivery(params: {
  pickup: { address: string; name: string; lat: number; lng: number };
  dropoff: { address: string; name: string; phone: string };
  items: { name: string; quantity: number }[];
  orderId: string;
}) {
  const response = await fetch(`${UBER_API_BASE}/deliveries`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UBER_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pickup: {
        pickup_latitude: params.pickup.lat,
        pickup_longitude: params.pickup.lng,
        pickup_address: params.pickup.address,
        pickup_contact: { name: params.pickup.name },
        pickup_notes: `Order #${params.orderId}`,
      },
      dropoff: {
        dropoff_address: params.dropoff.address,
        dropoff_contact: {
          name: params.dropoff.name,
          phone: params.dropoff.phone,
        },
      },
      items: params.items,
      external_reference: params.orderId,
    }),
  });

  return response.json();
  // Returns: { id, status, eta_seconds, tracking_url }
}
```

### 2. DoorDash Drive Integration

```typescript
// @templatecafe/square-core/lib/doordash/drive.ts
const DOORDASH_API_BASE = 'https://api.doordash.com/v2';

export async function createDelivery(params: {
  pickup: { address: string; businessName: string };
  dropoff: { address: string; name: string; phone: string };
  orderValue: number; // cents
  orderId: string;
}) {
  const response = await fetch(`${DOORDASH_API_BASE}/deliveries`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.DOORDASH_DEVELOPER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pickup_address: params.pickup.address,
      pickup_business_name: params.pickup.businessName,
      dropoff_address: params.dropoff.address,
      dropoff_contact: {
        name: params.dropoff.name,
        phone: params.dropoff.phone,
      },
      order_value: params.orderValue,
      external_delivery_id: params.orderId,
    }),
  });

  return response.json();
  // Returns: { id, status, estimated_delivery_time, tracking_url }
}
```

### 3. Cross-Provider Fallback

```typescript
// @templatecafe/square-core/lib/expedite/orchestrator.ts
type DeliveryProvider = 'uber' | 'doordash';

const config = {
  defaultProvider: process.env.DEFAULT_DELIVERY_PROVIDER as DeliveryProvider,
};

export async function dispatchDelivery(params: {
  orderId: string;
  orderNum: string;
  customer: { name: string; phone: string; address: Address };
  items: { name: string; quantity: number }[];
  totalMoney: number;
}) {
  const provider = config.defaultProvider;
  let delivery;

  try {
    if (provider === 'uber') {
      delivery = await createUberDelivery(params);
    } else {
      delivery = await createDoorDashDelivery(params);
    }
  } catch (error) {
    // Fallback to secondary provider
    const fallback = provider === 'uber' ? 'doordash' : 'uber';
    delivery = fallback === 'uber'
      ? await createUberDelivery(params)
      : await createDoorDashDelivery(params);
  }

  await sendSms(
    params.customer.phone,
    `Cafe: Your driver is on the way with order #${params.orderNum}! Track live: ${delivery.tracking_url}`
  );

  return delivery;
}
```

### 4. Delivery Webhook Handler

Uber Direct and DoorDash Drive send webhooks for status changes:

| Event | Action |
|---|---|
| `delivery.picked_up` | Twilio SMS: "Your order has been picked up!" |
| `delivery.en_route` | Twilio SMS: "Your driver is on the way!" |
| `delivery.delivered` | Twilio SMS: "Your order has been delivered! Enjoy!" – Square: mark fulfillment COMPLETED |
| `delivery.cancelled` | Twilio SMS: "Delivery cancelled. We'll contact you." – Staff notification |

### 5. Live Driver Tracking

The order status page (`/order/[orderId]`) includes a tracking component that shows:

- Driver ETA (from Uber/DoorDash API response)
- Tracking URL link (opens Uber/DoorDash native tracking page)
- Current status: Picked up → En route → Delivered

---

## Certification Requirements

### DoorDash Drive
- Screen recordings of all features
- Team demo with DoorDash
- 5-10 day review after demo
- Ongoing quality standard compliance
- API access can be revoked if quality standards aren't maintained

### Uber Direct
- OAuth 2.0 setup (Client ID + Client Secret exchange, token refresh logic)
- Sandbox testing of all edge cases
- No formal certification demo (easier than DoorDash)

### Shared Testing Requirements
- No drivers available scenario
- Driver reassignment
- Delivery cancellation
- Address errors
- Payment failures
- Cross-provider fallback end-to-end

---

## Post-Webhook Order Lifecycle (with Delivery)

```
1. Square webhook order.updated fires → Next.js /api/webhooks/square
2. Event types handled:

   state=COMPLETED → payment confirmed
     → Twilio: "Order #42 confirmed!"

   fulfillment.state=IN_PROGRESS → staff started preparing
     → Twilio: "We're making your order!"

   fulfillment.state=DELIVERED (pickup) → staff marked ready
     → Twilio: "Your order is ready for pickup!"

   fulfillment.state=DELIVERED (delivery) → staff marked ready
     → dispatchDelivery() → Uber/DoorDash dispatched
     → Twilio: "Your driver is on the way!" + tracking link

   fulfillment.state=COMPLETED (delivery) → driver delivered
     → Twilio: "Your order has been delivered! Enjoy!"
```

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Primary provider** | Configurable via env var | Cafe chooses Uber or DoorDash as default. |
| **Fallback provider** | The other one | Coverage areas differ by suburb. Both common in practice. |
| **Dispatch trigger** | Square webhook (fulfillment IN_PROGRESS) | Staff marks ready → driver dispatched automatically. |
| **Tracking** | External tracking URL | Uber/DoorDash provide the tracking page. |
| **Testing** | Square sandbox + Uber/DoorDash sandbox | Free test environments for each provider. |
| **Delivery fee** | Calculated client-side | Based on distance or flat rate configured by cafe. |

---

## Environment Variables (Additional to Phase 6)

```env
# Uber Direct
UBER_API_TOKEN=
UBER_CLIENT_ID=                   # For OAuth 2.0 token refresh
UBER_CLIENT_SECRET=
UBER_DIRECT_DELIVERY_WEBHOOK_URL= # https://yourdomain.com/api/uber/webhook

# DoorDash Drive
DOORDASH_DEVELOPER_TOKEN=
DOORDASH_DELIVERY_WEBHOOK_URL=    # https://yourdomain.com/api/doordash/webhook

# Delivery
DEFAULT_DELIVERY_PROVIDER=uber      # uber | doordash
```

---

## Deliverable

- Uber Direct integration in `@templatecafe/square-core` — dispatch driver, handle webhooks, send SMS
- DoorDash Drive integration — same interface, alternate provider
- Cross-provider fallback — if Uber fails, try DoorDash (and vice versa)
- Live driver tracking link on order status page
- Delivery webhook handling for status updates (picked up, en route, delivered)
- Twilio SMS with tracking link when driver is dispatched
- Full test coverage in Square sandbox + Uber/DoorDash sandbox environments

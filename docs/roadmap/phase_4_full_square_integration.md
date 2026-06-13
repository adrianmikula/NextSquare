# Phase 4: Full Custom Ordering (Zustand + Square APIs)

## Goal

Replace Square's hosted ordering profile with a fully custom, branded checkout experience built directly on Square's APIs. Zustand handles cart state, Square Web Payments SDK processes payments, and Square Orders API creates orders that flow into Square POS.

Same Square backend, same Twilio SMS pipeline, no external database.

---

## Architecture

```
                               ┌──────────────────────────────┐
                               │     Next.js 16 Frontend      │
                               │  (Full custom ordering UI)   │
                               └──────┬───────────┬───────────┘
                                      │           │
                                      ▼           ▼
                      ┌──────────────────┐  ┌──────────────────┐
                      │ Happy Path        │  │ Fallback Path    │
                      │ Custom checkout   │  │ Square's hosted  │
                      │ Web Payments SDK  │  │ ordering profile │
                      │ Orders API        │  │ (configurable)   │
                      └────────┬─────────┘  └────────┬─────────┘
                               │                     │
                               ▼                     ▼
                      ┌──────────────────────────────────────────────┐
                      │            Square (single source of truth)    │
                      │                                                │
                      │  · Catalog API   — menu items, modifiers      │
                      │  · Orders API    — order lifecycle            │
                      │  · Payments API  — process card nonces        │
                      │  · Inventory API — auto-decrement stock       │
                      │  · Webhooks      — order.updated, etc.        │
                      └──────┬──────────────────┬─────────────────────┘
                             │                  │
                             ▼                  ▼
                      ┌──────────┐    ┌──────────────────────┐
                      │Square POS│    │  Twilio SMS          │
                      │(in cafe) │    │  (via webhooks)      │
                      └──────────┘    └──────────────────────┘
```

---

## Data Flow

### Loading the Menu

```
1. Page request → Next.js Server Component
2. → Square Catalog API: searchCatalogItems() with REGULAR type
3. → Returns: menu categories + items + modifiers + images + prices
4. → Rendered server-side (ISR, revalidate every 5 min)
5. → Client gets HTML — zero JS for the static menu content
```

### Adding to Cart (entirely client-side)

```
1. User clicks "Add Latte + Oat Milk"
2. → Zustand store: { catalogObjectId, modifiers: [{ oatMilkId }], qty: 1 }
3. → localStorage: cart persisted across page refreshes
4. → Cart drawer updates optimistically
```

### Checkout — Pickup Order

```
1. User fills: name, phone, pickup time
2. Client creates order preview from Zustand cart (items + modifiers + totals)
3. Square Web Payments SDK:
   a. Render card form + Apple Pay / Google Pay buttons (react-square-web-payments-sdk)
   b. Card tokenizes → nonce returned to browser
4. Server Action (parallel):
   a. Order: Square Orders API → CreateOrder with fulfillment.type=PICKUP
   b. Payment: Square Payments API → CreatePayment with nonce + orderId
5. Square sets order to COMPLETED → appears in Square POS
6. Server Action: → Twilio SMS "Order #42 confirmed!"
7. Order status page: /order/[orderId] (poll Square API or use webhook)
```

### Checkout — Delivery Order

```
1. User fills: name, phone, delivery address
2. Same Web Payments SDK flow
3. Server Action (parallel):
   a. Order: CreateOrder with fulfillment.type=DELIVERY
   b. Payment: CreatePayment with nonce + orderId
4. Square confirms payment → order routed to Square POS
5. Staff prepares order
6. Twilio SMS → "Your order is on the way!"
```

---

## What's Built

### 1. Zustand Cart (Client-Side Only)

No server needed. Cart persists across page refreshes via localStorage.

```typescript
// lib/store/cart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  items: CartItem[];
  fulfillmentType: 'PICKUP' | 'DELIVERY';
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  setFulfillmentType: (type: 'PICKUP' | 'DELIVERY') => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      fulfillmentType: 'PICKUP',
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),
      updateQuantity: (id, qty) => set((state) => ({
        items: state.items.map((i) => i.id === id ? { ...i, quantity: qty } : i),
      })),
      setFulfillmentType: (type) => set({ fulfillmentType: type }),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'cafe-cart' }
  )
);
```

### 2. Menu Display with ISR

Server-rendered menu with Incremental Static Regeneration. Menu rarely changes — revalidates every 5 minutes. Zero client JS for content.

```typescript
// app/api/square/catalog/route.ts
import { Client } from 'square';

const { catalogApi } = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT as 'sandbox' | 'production',
});

export async function GET() {
  const { result } = await catalogApi.searchCatalogItems({
    productTypes: ['REGULAR'],
    sortOrder: 'ASC',
  });
  return Response.json(result.items);
}
```

### 3. Web Payments SDK Checkout

Embedded card form with Apple Pay and Google Pay auto-detected.

```typescript
// components/checkout/SquarePaymentForm.tsx
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';

export function SquarePaymentForm({ orderId, amount, onSubmit }: Props) {
  return (
    <PaymentForm
      applicationId={process.env.NEXT_PUBLIC_SQUARE_APP_ID!}
      locationId={process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!}
      cardTokenizeResponseReceived={async (token, verifiedBuyer) => {
        await onSubmit(token.token, verifiedBuyer);
      }}
    >
      <CreditCard />
    </PaymentForm>
  );
}
```

### 4. Square Orders API

```typescript
// app/api/square/order/route.ts
export async function POST(request: Request) {
  const { lineItems, customerInfo, fulfillmentType, fulfillmentDetails } =
    await request.json();

  const { result } = await ordersApi.createOrder({
    order: {
      locationId: process.env.SQUARE_LOCATION_ID,
      lineItems: lineItems.map((item: any) => ({
        catalogObjectId: item.catalogId,
        quantity: item.quantity.toString(),
        modifiers: item.modifiers?.map((m: any) => ({
          catalogObjectId: m.id,
        })),
      })),
      fulfillments: [
        fulfillmentType === 'PICKUP'
          ? {
              type: 'PICKUP',
              state: 'PROPOSED',
              pickupDetails: {
                recipient: { displayName: customerInfo.name },
              },
            }
          : {
              type: 'SHIPMENT',
              state: 'PROPOSED',
              shipmentDetails: {
                recipient: {
                  displayName: customerInfo.name,
                  address: customerInfo.address,
                  phoneNumber: customerInfo.phone,
                },
              },
            },
      ],
    },
  });

  return Response.json({ orderId: result.order.id });
}
```

### 5. Twilio SMS Lifecycle (Webhook-Driven)

Square webhooks route order events to Twilio:

| Event | SMS to customer |
|---|---|
| Order placed | "Cafe: Order #42 confirmed! We'll text you when it's ready." |
| Preparing | "Cafe: We're making your order #42 now! ETA ~10 min" |
| Ready for pickup | "Cafe: Your order #42 is ready for pickup!" |
| Delivered | "Cafe: Your order #42 has been delivered! Enjoy!" |

### 6. Inventory — 86'd Items

Staff taps "Out of Stock" on Square POS → Square Inventory API updates → next Catalog fetch excludes the item. Auto-hidden from website menu.

### 7. Fallback to Square Profile

If the custom checkout encounters an error, fall back to Square's hosted ordering profile (if `NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL` is set). Both can coexist.

---

## Component Tree

```
app/
├── (storefront)/
│   ├── page.tsx                    # Hero, featured items, hours, location
│   ├── menu/page.tsx               # Full menu with CategoryNav + MenuGrid
│   ├── cart/page.tsx               # Full cart view + delivery/pickup toggle
│   ├── checkout/
│   │   ├── page.tsx                # Checkout with SquarePaymentForm
│   │   └── confirmation/page.tsx   # "Order placed!" + order ID
│   └── order/[orderId]/page.tsx    # Live order status (poll Square Orders API)
├── api/
│   ├── square/
│   │   ├── catalog/route.ts        # GET → Square Catalog API (cached)
│   │   ├── order/route.ts          # POST → Square CreateOrder
│   │   ├── payment/route.ts        # POST → Square CreatePayment
│   │   └── webhook/route.ts        # POST ← order.updated, payment.updated
│   └── twilio/
│       └── sms/route.ts            # POST → Twilio Messages API

components/
├── menu/
│   ├── MenuGrid.tsx                # Responsive grid of MenuItemCards
│   ├── MenuItemCard.tsx            # Image, name, price, "Add" button
│   ├── CategoryNav.tsx             # Sticky category tabs (scroll-linked)
│   ├── ModifierDialog.tsx          # "Choose milk: Oat / Soy / Full Cream"
│   └── MenuItemDetail.tsx          # Dialog with description, modifiers, add-to-cart
├── cart/
│   ├── CartDrawer.tsx              # Slide-out panel (sticky, accessible everywhere)
│   ├── CartItem.tsx                # Item + modifiers + quantity controls
│   ├── CartSummary.tsx             # Subtotal, fees, total
│   └── DeliveryPickupToggle.tsx    # Switch between pickup / delivery modes
├── checkout/
│   ├── SquarePaymentForm.tsx       # react-square-web-payments-sdk wrapper
│   ├── OrderSummary.tsx            # Review items, modifiers, totals
│   ├── PickupInfo.tsx              # Name + phone + pickup time selector
│   ├── DeliveryInfo.tsx            # Name + phone + address + notes
│   └── OrderConfirmed.tsx          # Success state with order ID
├── order/
│   ├── OrderStatus.tsx             # Timeline: Confirmed → Preparing → Ready
│   └── OrderTimeline.tsx           # Visual timeline with timestamps
└── ui/                             # shadcn/ui components (button, card, dialog, etc.)

lib/
├── square/
│   ├── client.ts                   # Square Client singleton (server-side only)
│   ├── catalog.ts                  # fetchMenu(), fetchItemBySlug()
│   ├── orders.ts                   # createOrder(), getOrder(), searchOrders()
│   ├── payments.ts                 # processPayment(), getPayment()
│   └── webhook.ts                  # verifySignature(), parseEvent()
├── twilio/
│   └── client.ts                   # Twilio Client singleton, sendSMS()
├── store/
│   └── cart.ts                     # Zustand store + localStorage persist
└── utils.ts                        # formatCurrency(), cn(), formatPhone()

hooks/
├── useMenu.ts                      # SWR/React Query for catalog data
├── useCart.ts                      # Zustand hook (selector-based, memoized)
└── useOrderStatus.ts               # Poll Square API for order state

types/
├── square.ts                       # Square CatalogItem, Order, etc.
├── cart.ts                         # CartItem, CartState, ModifierSelection
└── order.ts                        # PickupOrder, DeliveryOrder, OrderState
```

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Cart state** | Zustand + localStorage | No server needed. Cart survives page refresh. Sub-1KB. |
| **Menu rendering** | ISR (revalidate: 300) | Menu rarely changes. Server-rendered for SEO. Zero client JS. |
| **Payment UX** | Web Payments SDK (embedded) | Branded experience. Apple Pay + Google Pay included. PCI-compliant. |
| **Payment fallback** | Checkout API (CreatePaymentLink) | If Web Payments fails, fall back to Square-hosted checkout. |
| **Customer accounts** | None (guest checkout) | Name + phone collected. No login wall. |
| **SMS provider** | Twilio | AU phone numbers. Simple REST API. $0.0079/SMS AUD. |
| **Order status page** | Order ID in URL | No auth. Customer bookmarks or receives link via SMS. |
| **Deployment** | Vercel | Next.js-native. Edge caching for menu pages. ISR. |
| **Square SDK** | Official `square` npm package | Mature, actively maintained, type-safe. |

---

## Environment Variables (Additional to Phase 2)

```env
# Inherited from Phase 2:
# SQUARE_ACCESS_TOKEN, SQUARE_ENVIRONMENT, SQUARE_LOCATION_ID
# NEXT_PUBLIC_SQUARE_APP_ID, NEXT_PUBLIC_SQUARE_LOCATION_ID
# TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
# SQUARE_WEBHOOK_SIGNATURE_KEY, NEXT_PUBLIC_SITE_URL

# Optional fallback
NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL=  # https://mycafe.square.site
```

---

## Deliverable

A fully custom, branded ordering experience:
- Menu items loaded from Square Catalog API with ISR caching
- Zustand cart with modifier support persisted to localStorage
- Square Web Payments SDK for credit card + Apple Pay + Google Pay
- Order creation via Square Orders API — appears in Square POS
- Twilio SMS notifications at every order lifecycle event
- Pickup and delivery mode support
- 86'd items auto-hidden from menu
- Configurable fallback to Square's hosted ordering profile
- Order status page for live tracking

Same Square backend. Same Twilio pipeline. No external database.

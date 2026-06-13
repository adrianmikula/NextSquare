# Phase 2: Basic Square Integration

## Goal

Get a cafe online with a beautiful Next.js marketing site, Square's free branded ordering profile for checkout, Twilio SMS notifications, and content management via Outstatic.

Zero custom checkout code. Zero database. Launch in hours.

---

## Architecture

```
                              ┌──────────────────────────────┐
                              │     Next.js 16 Frontend      │
                              │  (Marketing site + CTA)      │
                              └────────────┬─────────────────┘
                                           │
                                           ▼
                              ┌──────────────────────────────┐
                              │ Square's Free Ordering       │
                              │ Profile (hosted page)        │
                              │                              │
                              │ Menu syncs from Square POS   │
                              │ Orders flow to Square POS    │
                              │ Built-in delivery partners   │
                              │ Custom domain supported      │
                              └────────────┬─────────────────┘
                                           │
                                           ▼
                              ┌──────────────────────────────┐
                              │        Square (hub)           │
                              │  POS  │  Payments  │  Data    │
                              └────────────┬─────────────────┘
                                           │
                               ┌────────────┴─────────────────┐
                               │  Twilio SMS (via webhooks)   │
                               │  Outstatic CMS (content)     │
                               └──────────────────────────────┘
```

## What's Built

### 1. Next.js 16 Marketing Site

- Hero section with cafe branding
- Menu preview (static or from Outstatic)
- Hours, location, contact page
- Google Maps embed
- SEO-optimized (metadata, sitemap, structured data)
- Responsive design (Tailwind v4 + shadcn/ui)
- Instagram feed / social proof section
- Deploy to Vercel with one click

### 2. Square's Free Branded Ordering Profile

Square's hosted ordering page handles the entire checkout flow:

- Menu syncs automatically from Square POS (no manual entry)
- Customer places order on Square's page ("order.mycafe.com")
- Payment processed by Square at 2.2% online rate
- Order appears in Square POS immediately
- Built-in delivery fulfillment via Square's delivery partners
- No monthly fee, no contracts

**Template setup:**
- Configurable `NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL` env var
- Prominent "Order Now" CTA button linking to the profile
- Optional: embed the ordering profile in an iframe for a unified site experience

### 3. Twilio SMS Notifications

Square webhooks route order events to Twilio for customer SMS alerts.

**Lifecycle:**

| Event | SMS to customer |
|---|---|
| Order placed | "Order #42 confirmed! We'll text you when it's ready." |
| Preparing | "We're making your order #42 now! ETA ~10 min" |
| Ready for pickup | "Your order #42 is ready for pickup!" |
| Out for delivery | "Your driver is on the way! Track: [link]" |
| Delivered | "Your order #42 has been delivered! Enjoy!" |

**Implementation:**
```typescript
// lib/twilio/client.ts
import { Twilio } from 'twilio';

const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSms(to: string, body: string) {
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
}
```

```typescript
// app/api/square/webhook/route.ts
import { handleSquareWebhook } from '@/lib/webhooks/square';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-square-hmacsha256-signature')!;
  const event = handleSquareWebhook(body, signature);

  switch (event.type) {
    case 'order.updated': {
      const order = event.data.object.order;
      const phone = order.fulfillments[0]
        ?.pickupDetails?.recipient?.phoneNumber
        ?? order.fulfillments[0]?.shipmentDetails?.recipient?.phoneNumber;

      if (!phone) break;

      switch (order.fulfillments?.[0]?.state) {
        case 'PROPOSED':
          await sendSms(phone, `Order #${order.ticketName} confirmed!`);
          break;
        case 'IN_PROGRESS':
          await sendSms(phone, `We're making your order #${order.ticketName}!`);
          break;
        case 'COMPLETED':
          await sendSms(phone, `Your order #${order.ticketName} is ready!`);
          break;
      }
      break;
    }
  }

  return new Response('OK', { status: 200 });
}
```

### 4. Outstatic CMS for Content Pages

Outstatic stores content as Markdown/MDX in your GitHub repo. No external database needed.

- **Hero text, about page, specials, blog posts** — editable via Outstatic admin UI at `/outstatic`
- **No DB required** — content lives in GitHub, commits trigger Vercel rebuilds
- **AI completions** built in for faster writing
- **Cafe owner edits content** without touching code

**Setup:**
```bash
npm install outstatic
# Add Outstatic to your Next.js app at /outstatic route
```

**Alternative:** Velite (build-time content from markdown files, no admin UI) — good if the developer manages all content.

---

## Menu Management

Menu items and prices are managed through **Square's existing Dashboard**:
- Update item names, descriptions, prices, images
- Toggle item availability
- Manage modifiers and categories
- Changes propagate automatically — the template fetches the latest catalog data via ISR

No custom admin dashboard needed in this phase.

---

## Environment Variables

```env
# Square
SQUARE_ACCESS_TOKEN=
SQUARE_ENVIRONMENT=sandbox
SQUARE_LOCATION_ID=
NEXT_PUBLIC_SQUARE_APP_ID=
NEXT_PUBLIC_SQUARE_LOCATION_ID=
NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL=  # https://mycafe.square.site

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=                      # AU: +614XXXXXXXX

# Square Webhooks
SQUARE_WEBHOOK_SIGNATURE_KEY=

# Outstatic
OUTSTATIC_API_KEY=

# App
NEXT_PUBLIC_SITE_URL=
```

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Checkout** | Square's hosted profile | Zero custom checkout code. Free. Orders flow to Square POS. |
| **Menu rendering** | ISR (revalidate: 300) | Menu rarely changes. SEO-friendly. Zero client JS. |
| **SMS provider** | Twilio | AU numbers, $0.0079/SMS, delivery receipts |
| **Content CMS** | Outstatic | No DB required. Admin UI for cafe owner. GitHub-backed. |
| **Menu editing** | Square Dashboard | Free, built-in, changes propagate automatically |
| **Deployment** | Vercel | Next.js-native, edge caching, ISR support |
| **Customer accounts** | None (guest checkout) | No login wall. Name + phone collected at Square checkout. |

---

## Deliverable

A live cafe website at `cafename.vercel.app` (or custom domain) with:
- Beautiful marketing site with menu, hours, location, social proof
- "Order Now" CTA → Square's hosted ordering profile
- Customers receive SMS notifications for every order event
- Cafe owner edits content via Outstatic admin UI
- Cafe owner manages menu/prices via Square Dashboard
- All orders flow into Square POS automatically

**Time to launch:** Hours (no custom checkout code to write or test).

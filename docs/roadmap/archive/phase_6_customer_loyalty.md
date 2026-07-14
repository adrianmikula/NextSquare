# Phase 5: Customer Loyalty (Square Loyalty API)

## Goal

Integrate Square Loyalty API to display loyalty balances, earn points on online orders, and show progress toward rewards — all tied to phone number lookup. No separate loyalty app or database needed.

Square loyalty customers visit 53% more and spend 40% more.

---

## Architecture

```
                        ┌──────────────────────────────┐
                        │     Order Status Page         │
                        │  /order/[orderId]             │
                        │                              │
                        │  "You have 120 points —       │
                        │   that's 2 coffees away       │
                        │   from a free one!"           │
                        │                              │
                        │  "You earned 15 points         │
                        │   on this order!"             │
                        └────────────┬─────────────────┘
                                     │
                                     ▼
                        ┌──────────────────────────────┐
                        │     Square Loyalty API        │
                        │                              │
                        │  · Retrieve loyalty account   │
                        │    by phone number            │
                        │  · Get points balance          │
                        │  · Get reward tiers            │
                        │  · Calculate points earned     │
                        │    on order                    │
                        │  · (Future) Redeem reward      │
                        └────────────┬─────────────────┘
                                     │
                                     ▼
                        ┌──────────────────────────────┐
                        │  Square POS + Square Loyalty  │
                        │  ($45/mo per location)        │
                        │                              │
                        │  Points earned in-store and   │
                        │  online under one account     │
                        │  Phone-based enrollment       │
                        └──────────────────────────────┘
```

---

## What's Built

### 1. Phone Number Enrollment at Checkout

When a customer enters their phone number during checkout, the system checks Square Loyalty for an existing account. If none exists, one is created automatically.

```typescript
// lib/square/loyalty.ts
import { Client } from 'square';

const { loyaltyApi, customersApi } = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT as 'sandbox' | 'production',
});

export async function getOrCreateLoyaltyAccount(phoneNumber: string) {
  // Search for existing loyalty account by phone
  const { result } = await loyaltyApi.searchLoyaltyAccounts({
    query: {
      mappings: [{ phoneNumber }],
    },
  });

  if (result.loyaltyAccounts?.length) {
    return result.loyaltyAccounts[0];
  }

  // Create new loyalty account
  const { result: created } = await loyaltyApi.createLoyaltyAccount({
    loyaltyAccount: {
      programId: process.env.SQUARE_LOYALTY_PROGRAM_ID!,
      mapping: { phoneNumber },
    },
  });

  return created.loyaltyAccount;
}
```

### 2. Loyalty Balance on Order Status Page

After the customer places an order, the order status page fetches and displays the loyalty account balance.

```typescript
// components/loyalty/LoyaltyBadge.tsx
interface Props {
  phoneNumber: string;
  orderId: string;
}

export async function LoyaltyBadge({ phoneNumber, orderId }: Props) {
  const account = await getOrCreateLoyaltyAccount(phoneNumber);
  const balance = account.balance ?? 0;

  // Fetch reward tiers to calculate progress
  const { result } = await loyaltyApi.listLoyaltyPrograms(
    process.env.SQUARE_LOYALTY_PROGRAM_ID!
  );
  const rewardTier = result.programs?.[0]?.rewardTiers?.[0];
  const pointsNeeded = rewardTier?.points ?? 100;
  const progress = balance / pointsNeeded;

  return (
    <div className="rounded-lg border p-4">
      <p className="text-lg font-semibold">
        You have {balance} points
      </p>
      {rewardTier && (
        <p className="text-sm text-muted-foreground">
          {pointsNeeded - balance} points away from a free {rewardTier.name?.toLowerCase()}
        </p>
      )}
      <div className="mt-2 h-2 w-full rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
```

### 3. Points Earned Notification

After an order is completed, show how many points were earned.

```
┌──────────────────────────────────────────┐
│  Order #42 Placed! ✓                     │
│                                          │
│  🎉 You earned 15 points on this order!  │
│  You now have 120 points.                │
│  ─────────────────────────────────       │
│  120 / 200 points                        │
│  ████████████░░░░░░░░  (60%)             │
│  ─────────────────────────────────       │
│  80 points away from a free coffee       │
└──────────────────────────────────────────┘
```

### 4. Points Calculation

Points are calculated based on the order total using the loyalty program's accrual rules. Display on the order confirmation page immediately.

```typescript
// app/api/square/loyalty/route.ts
export async function POST(request: Request) {
  const { phoneNumber, orderId } = await request.json();

  const account = await getOrCreateLoyaltyAccount(phoneNumber);

  // Calculate points earned on this order
  const { result } = await loyaltyApi.calculateLoyaltyPoints({
    programId: process.env.SQUARE_LOYALTY_PROGRAM_ID!,
    orderId,
  });

  return Response.json({
    pointsEarned: result.points ?? 0,
    totalBalance: account.balance,
  });
}
```

---

### 5. Square Marketing for Email Campaigns

- **$15/mo minimum** — natively integrates with Square Customer Directory
- Customers who order through the platform are automatically in the directory
- Send campaigns (specials, new menu items, holiday hours) directly from Square Dashboard
- No data export, no import, no Zapier needed
- Combine with loyalty data: target customers by points balance, visit frequency, or spend level

---

## Future Scope: Reward Redemption

Allow customers to redeem rewards during checkout:

1. Customer opts to redeem available reward
2. Server validates reward is still valid and applicable
3. Square Loyalty API: `RedeemLoyaltyReward`
4. Reward discount applied to order total
5. Remaining balance paid via Web Payments SDK

This requires the checkout flow to know the loyalty balance before payment. Implement as an optional enhancement after the core loyalty display is stable.

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Loyalty enrollment** | Phone number | No login. Same as in-store enrollment. |
| **Balance display** | On order status page | Customer sees it post-purchase. |
| **Points notification** | On order confirmation | Immediate gratification. |
| **Reward redemption** | Future scope | Adds complexity to checkout flow. |
| **Program ID** | Environment variable | Supports sandbox vs production. |
| **Email marketing** | Square Marketing | Native Square integration. No data export needed. |

---

## Environment Variables (Additional to Phase 4)

```env
# Square Loyalty
SQUARE_LOYALTY_PROGRAM_ID=       # From Square Developer Dashboard
```

---

## Deliverable

- Customers automatically enrolled in Square Loyalty via phone number at checkout
- Loyalty balance shown on order status page with progress bar toward next reward
- Points earned notification on order confirmation
- Unified loyalty account — points earned online and in-store under the same phone number
- No separate database. All data lives in Square Loyalty.

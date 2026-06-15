# ADR-001: Square Hosted Ordering Profile for Checkout

**Date:** 2026-04-15  
**Status:** Superseded by ADR-006 (Phase 4)

## Context

Phase 2 needed a checkout solution for a cafe ordering site with minimal custom code. Requirements:

- Customers can browse the menu and place orders
- Payments processed securely
- Orders appear in Square POS automatically
- No monthly fees or contracts
- Launch in hours, not weeks

Options considered: Square's free hosted ordering profile, building a custom checkout with Square Web Payments SDK, or a third-party checkout provider.

## Decision

Use **Square's free hosted ordering profile** (`order.mycafe.com`) as the sole checkout mechanism. The marketing site links to it via an "Order Now" CTA button.

## Rationale

- **Zero custom checkout code** — Square's profile handles menu display, cart, payment, and order routing
- **Free** — no additional cost beyond Square's 2.2% transaction fee
- **Automatic POS integration** — orders appear in Square POS instantly
- **Built-in delivery** — Square's delivery partner integration included
- **Custom domain** — supports `order.mycafe.com` branding
- **Fastest path to launch** — a single env var (`NEXT_PUBLIC_SQUARE_ORDERING_PROFILE_URL`) and one button

## Consequences

- No control over checkout UX — Square's branding, layout, and flow are fixed
- Cannot collect email/sms before checkout for marketing
- No custom upsells or modifications at checkout
- Customers leave the marketing site to complete the order
- Iframe embedding is possible but has UX and security limitations
- Superseded in Phase 4 by a fully custom Zustand + Square Web Payments SDK checkout

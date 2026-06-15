# ADR-003: Twilio SMS + Outstatic CMS + Guest Checkout

**Date:** 2026-04-15  
**Status:** Accepted

## Context

Phase 2 required three supporting services: SMS notifications for order updates, a content management system for the marketing site pages, and a customer identity model for checkout.

## Decisions

### SMS Provider — Twilio

- **Twilio** is used for order lifecycle SMS (confirmed → preparing → ready)
- Singleton client at module scope in `lib/twilio/client.ts`
- Fire-and-forget pattern — no retry, no queuing, no delivery status tracking
- Phone numbers normalized via `formatPhone()` in `lib/utils.ts` (adds `+61` prefix for AU numbers)
- Webhook handler in `app/api/square/webhook/route.ts` uses a `switch` on fulfillment state + `switch` on fulfillment type to generate different message content for pickup vs delivery

### Content CMS — Outstatic

- **Outstatic** stores content as Markdown/MDX in the GitHub repo
- Admin UI at `/outstatic` — cafe owner edits pages without touching code
- No database required — content lives in GitHub, commits trigger Vercel rebuilds
- Alternative considered: Velite (build-time MDX, no admin UI) — rejected because the cafe owner needs a UI

### Customer Identity — Guest Checkout (No Accounts)

- No customer accounts, no login wall
- Name + phone number collected at checkout (via Square's hosted profile or Phase 4's custom form)
- Session-less — all state lives in Square order objects
- Rationale: reduces friction (higher conversion), eliminates password management, no user database

## Consequences

- Twilio costs $0.0079/SMS for AU numbers — viable at cafe scale
- No retry mechanism means a failed SMS is silently dropped (acceptable for order notifications)
- Outstatic requires GitHub write access configured in the deployment
- Guest checkout means no order history for returning customers — they must reference their order ID
- SMS is the only notification channel — no email fallback

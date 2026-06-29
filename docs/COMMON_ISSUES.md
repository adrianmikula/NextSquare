# Common Issues

## [ERR-001] Square API authentication failure
- **Symptom:** `[rbac] Square team lookup failed` or `[payments] Payment processing error`
- **Cause:** `SQUARE_ACCESS_TOKEN` missing or invalid, or `SQUARE_ENVIRONMENT` mismatch (sandbox vs production)
- **Fix:** Verify `.env.local` has valid `SQUARE_ACCESS_TOKEN` and correct `SQUARE_ENVIRONMENT` (`sandbox` or `production`)
- **Diagnosis command:** `grep SQUARE .env.local`

## [ERR-002] Twilio SMS sending failure
- **Symptom:** `[mfa] Failed to send SMS` or `[webhook] Failed to send SMS`
- **Cause:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, or `TWILIO_PHONE_NUMBER` missing/invalid
- **Fix:** Check Twilio credentials in `.env.local`; verify phone number format (E.164)
- **Diagnosis command:** `grep TWILIO .env.local`

## [ERR-003] Webhook signature verification failure
- **Symptom:** `[webhook] Invalid signature` (401 response)
- **Cause:** `SQUARE_WEBHOOK_SIGNATURE_KEY` missing or webhook payload altered in transit
- **Fix:** Set `SQUARE_WEBHOOK_SIGNATURE_KEY` to the exact signature key from Square Developer Dashboard
- **Diagnosis command:** `grep SQUARE_WEBHOOK .env.local`

## [ERR-004] MFA challenge not completing
- **Symptom:** Login returns 503 after MFA challenge
- **Cause:** `DASHBOARD_ADMIN_PHONE` missing or Twilio SMS delivery failed
- **Fix:** Ensure `DASHBOARD_ADMIN_PHONE` is set in E.164 format and Twilio credentials are valid
- **Diagnosis command:** `grep DASHBOARD_ADMIN .env.local`

## [ERR-005] Missing required env var at startup
- **Symptom:** Build fails or app crashes with `Missing required environment variable: X`
- **Cause:** Required env var not set in `.env.local`
- **Fix:** Copy `.env.local.example` to `.env.local` and fill in required values
- **Diagnosis command:** `diff .env.local.example .env.local`

## [ERR-006] TypeScript build failure
- **Symptom:** `Cannot find module 'x'` or type errors during `npm run typecheck`
- **Cause:** Missing `@types/x` package or type mismatch after dependency update
- **Fix:** `npm install -D @types/x` or adjust code to match installed types
- **Diagnosis command:** `npm run typecheck`

## [ERR-007] ESLint errors blocking commit
- **Symptom:** Pre-commit hook fails with lint errors
- **Cause:** Code violates ESLint rules (unused vars, implicit any, etc.)
- **Fix:** Run `npm run lint:quiet` to identify issues, fix code, do not add `// eslint-disable`
- **Diagnosis command:** `npm run lint:quiet`

## [ERR-008] Dev server port already in use
- **Symptom:** `Error: listen EADDRINUSE: address already in use :::3000`
- **Cause:** Another process (or previous dev server) is using port 3000
- **Fix:** Kill the existing process or set `PORT=3001 npm run dev`
- **Diagnosis command:** `lsof -ti:3000 | xargs kill -9`

## [ERR-009] Cart state not persisting across reloads
- **Symptom:** Cart items disappear after page refresh
- **Cause:** `zustand/middleware` persist failing due to localStorage quota or SSR mismatch
- **Fix:** Check browser console for localStorage errors; ensure `useCartStore` is only used in client components
- **Diagnosis command:** Open browser DevTools > Application > Local Storage

## [ERR-010] Next.js image not loading from remote host
- **Symptom:** Remote images show broken or are blocked by Next.js
- **Cause:** Image hostname not in `next.config.ts` `images.remotePatterns`
- **Fix:** Add the hostname to `next.config.ts` and restart dev server
- **Diagnosis command:** `grep remotePatterns next.config.ts`

# Source API Hints

This file documents endpoints, request shapes, and scraping notes for each input source. Use these hints when implementing fetchers — do not guess endpoints. Prefer official APIs; fall back to public HTML scraping only when necessary.

## Facebook Page

**Prefer:** Graph API (requires `facebookPageId` + user access token)

```
GET https://graph.facebook.com/v19.0/<PAGE_ID>
  ?fields=name,about,category,location,hours,phone,cover,emails,website
  &access_token=<TOKEN>
```

**Fallback:** Public HTML scrape at `https://www.facebook.com/<page-username>`
- Extract Open Graph meta tags (`og:title`, `og:description`, `og:image`).
- Look for structured `ld+json` blocks containing `Organization` or `LocalBusiness`.
- Note: Facebook aggressively blocks scrapers; Graph API is preferred.

**Fields to extract:**
- `name`, `about`, `category`, `location`, `hours`, `phone`, `cover.source`, `website`

---

## Instagram Feed

**Prefer:** Instagram Graph API (requires Business Account linked to Facebook Page)

```
GET https://graph.facebook.com/v19.0/<IG_BUSINESS_ID>/media
  ?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count
  &access_token=<TOKEN>
```

**Fallback:** Public profile scrape at `https://www.instagram.com/<username>/`
- Extract `og:image` and `og:title` from meta tags.
- Note: Instagram login wall is common; API is necessary for production.

**Fields to extract:**
- `media_url` array (images)
- `caption` (tone, products mentioned, vibe cues)
- `like_count` (popularity signals)

---

## Google Business Profile

**Prefer:** Places API (requires `GOOGLE_PLACES_API_KEY`)

```
# Text search to find Place ID
GET https://maps.googleapis.com/maps/api/place/findplacefromtext/json
  ?input=<BUSINESS_NAME> <CITY>
  &inputtype=textquery
  &fields=place_id
  &key=<API_KEY>

# Place details (reviews, photos, hours, address, phone)
GET https://maps.googleapis.com/maps/api/place/details/json
  ?place_id=<PLACE_ID>
  &fields=name,formatted_address,geometry,formatted_phone_number,opening_hours,reviews,photos,types
  &key=<API_KEY>

# Photo reference → actual URL
GET https://maps.googleapis.com/maps/api/place/photo
  ?photo_reference=<PHOTO_REF>
  &maxwidth=800
  &key=<API_KEY>
```

**Fields to extract:**
- `reviews` (text, rating, time — keep 3–5 strongest)
- `opening_hours.weekday_text`
- `formatted_address`, `formatted_phone_number`
- `photos` (array of photo references)

---

## Uber Eats

**Prefer:** Public storefront scrape (no official open API for menu/prices)

```
GET https://www.ubereats.com/<COUNTRY>/store/<STORE_SLUG>
```

**Scraping notes:**
- Use Puppeteer / Playwright (dynamic JS rendering).
- Look for JSON-LD `script[type="application/ld+json"]` containing `Menu` or `Restaurant`.
- Also parse `window.__NEXT_DATA__` or equivalent state hydration.
- Extract: item names, descriptions, prices, option groups (size, extras), image URLs.
- Note: Uber Eats may block headless browsers. Use stealth plugins.

**Fallback:** Ask user to paste menu text if scraping fails.

---

## DoorDash

**Prefer:** Public storefront scrape (no official open API for menu details)

```
GET https://www.doordash.com/store/<STORE_ID>/
```

**Scraping notes:**
- React-based app; needs Puppeteer / Playwright.
- Inspect `__NEXT_DATA__` or Network tab for `store-menu-item` API calls.
- Extract: item names, descriptions, prices, modifiers, images.
- Note: DoorDash aggressively rate-limits scrapers. Cache aggressively.

**Fallback:** Ask user to paste menu text if scraping fails.

---

## TripAdvisor

**Prefer:** Public listing scrape (API restricted to partners)

```
GET https://www.tripadvisor.com.au/Restaurant_Review-<ID>-<NAME>.html
```

**Scraping notes:**
- Use HTTP GET with realistic user-agent; avoid `curl`-style agents.
- Parse Open Graph tags for title, description, images.
- Extract reviews from structured widgets or visible review text.
- Note: TripAdvisor may show region-specific content. Match locale to business.

**Fallback:** Google Business reviews can substitute if TripAdvisor fails.

---

## WordPress

**Prefer:** REST API (if XML-RPC enabled and creds supplied)

```
GET <SITE_URL>/wp-json/wp/v2/pages?per_page=100
GET <SITE_URL>/wp-json/wp/v2/posts?per_page=100
GET <SITE_URL>/wp-json/wp/v2/media?per_page=100
```

If JSON returns REST API disabled or login required, fall back to HTML scrape.

**Fallback:** Puppeteer / Playwright HTML scrape at `<SITE_URL>`
- Extract `<h1>`…`<h6>` for headings.
- Extract `<p>` blocks for body text.
- Extract `<img src>` and `srcset` for images.
- Extract meta tags (`description`, `keywords`, `og:image`).
- Preserve WordPress content structure where sensible.

**Credentials:**
- If using Application Password, encode as base64:
  ```
  Authorization: Basic base64(APP_USER:APP_PASSWORD)
  ```

---

## Uploaded Photos

**Client-side classification (fast heuristics):**

1. EXIF orientation: use `piexifjs` or native `createImageBitmap` + `orientation` to rotate correctly.
2. Resize: max dimension 2048px; JPEG quality 0.85.
3. Classify by aspect ratio and filename:
   - Square / 1:1 → menu item or logo
   - Wide / 16:9 → hero or interior
   - Tall / 9:16 → mobile story candidate, likely not for web
4. Colour extraction:
   - Sample 5×5 grid of pixels
   - K-means or median-cut to 5 dominant colours
   - Return top 3 hex values for `vibe.palette`
5. Optional vision pass: if available, send to a vision model for object detection (menu board, dish, interior, logo). Heuristic-only is acceptable.

**Storage:**
- Save original under `content/scratch/<tenant>/images/originals/`
- Save processed under `content/scratch/<tenant>/images/processed/`
- Store relative paths in `BusinessProfile.media`

---

## Rate Limits & Etiquette

- Respect API rate limits (Google Places: 150 req/day free tier; Facebook: app review required for higher limits).
- Cache scratchpad data; do not re-fetch during a single build session.
- Do not hammer endpoints with retries on 429; back off exponentially.
- For scrapers, add 2–3s delay between page loads; use passive waiting (networkidle) over fixed timeouts.

---

## Credential Handling

- Fetch credentials from `lib/env.ts` using `requireEnv()` where available.
- Never log secrets, tokens, or API keys.
- Scrapers must not send cookies from other sessions; clear cookies between domains.

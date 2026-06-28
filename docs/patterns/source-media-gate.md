# Source Fetching & Media Gate

## Principle

**Never declare a source missing until you have run the exhaustive search protocol.**

Blank content, silent fallbacks, and placeholder-only media produce broken or incomplete demos. The media gate enforces that at least one real image exists before any page/theme/catalogue work begins.

## Exhaustive Search Protocol

For each source type, run a targeted search before skipping it:

| Source | Search Query |
|--------|-------------|
| TripAdvisor | `site:tripadvisor.com "<business name>" <city>` |
| Facebook | `site:facebook.com "<business name>" <city>` |
| Instagram | `site:instagram.com "<business name>" <city>` |
| Google Business | `"<business name>" <city> Google Business Profile` |
| DoorDash | `site:doordash.com "<business name>" <city>` |
| Menulog | `site:menulog.com "<business name>" <city>` |

TripAdvisor is a **priority** source: it often provides both high-res images and review content. Do not silently skip it even if another platform is found.

If a search reveals a candidate URL, attempt the fetch/scrape. Log success or failure in `content/scratch/<tenant>/analysis.md`.

## Media Gate (Mandatory)

After source extraction, check `media.hero` and `media.gallery` in the `BusinessProfile`.

If **both** are empty:

1. Write the profile with empty `media` for now.
2. **STOP.** Do not proceed to page generation, themes, or catalogue.
3. Report:
   > No images were found for this business. Please upload at least 3–5 photos (hero/menu items, interior, logo) to `content/scratch/<tenant>/images/` before I continue.
4. Wait for the user to provide or confirm uploads, then re-run extraction.

This prevents generating a shell website with no visuals, which is the most common stakeholder complaint.

## Placeholder Rules

When images are missing but the user explicitly proceeds past the media gate:

- Set `theme.images.hero` and `theme.images.logo` to `"placeholder"`.
- Use a neutral gradient or labelled placeholder in theme rendering (not a broken image link).
- Do not use empty strings or `null` for image fields in CMS pages; use a consistent `"placeholder"` sentinel.

## Rationale

A website without images looks broken to users. The media gate converts a silent failure (launching with no photos) into an explicit decision. Combined with the exhaustive search protocol, it maximises the chance of finding real assets before resorting to uploads.

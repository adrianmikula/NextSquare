# Aydin's Cafe — Build Analysis

## Sources Found
- **Uber Eats**: https://www.ubereats.com/au/store/aydins-cafe/IJbz4BeDWlqHKtlczc8EXg
- **RestaurantGuru**: https://restaurantguru.com/Aydins-Cafe-Joondalup
- **Zest Events**: https://www.zestapp.com.au/venues/aydin's-cafe/a35f7878-33d4-45e0-a630-af529b851412

## Sources Missing
- **TripAdvisor**: no dedicated listing found after `site:tripadvisor.com "Aydin's Cafe" "Joondalup"` search.
- **DoorDash**: no listing found.
- **Menulog**: mentioned on Zest but no direct URL found; `site:menulog.com "Aydin's Cafe" Joondalup` returned no matching storefront.
- **Google Business Profile**: not fetched via Places API (no key available); RestaurantGuru shows Google aggregate rating.
- **Instagram / Facebook**: no public URLs provided and search did not surface accounts.

## Media
- **Hero / Gallery**: images present via RestaurantGuru (21 photos). Extracted image URLs:
  - Interior: https://img3.restaurantguru.com/w550/h367/rf19-Aydins-Cafe-interior-2025-05.jpg
  - Food gallery: https://img02.restaurantguru.com/c871-Restaurant-Aydins-Cafe-food.jpg
  - Fries: https://img02.restaurantguru.com/c385-Aydins-Cafe-Joondalup-french-fries.jpg
  - Pulled pork: https://img02.restaurantguru.com/c010-Restaurant-Aydins-Cafe-pulled-pork-sandwich.jpg
  - Meals: https://img02.restaurantguru.com/cf7f-Restaurant-Aydins-Cafe-meals.jpg
  - Interior 2: https://img02.restaurantguru.com/cf5c-Aydins-Cafe-Joondalup-interior.jpg
  - Fries 2: https://img02.restaurantguru.com/c538-Restaurant-Aydins-Cafe-french-fries.jpg
- `media.hero` and `media.gallery` are NOT empty. Media gate passes.

## Business Profile Summary
- **Name**: Aydin's Cafe
- **Type**: Cafe (Breakfast & Brunch)
- **Price**: $ (A$1–20 per person)
- **Address**: 5/1 Winton Road, Joondalup WA 6027
- **Phone**: +61 8 9403 3709
- **Hours**: Mon–Fri 7:00–15:00, Sat 8:00–14:00, Sun Closed (Uber Eats; RestaurantGuru shows 08:00–16:00 Mon–Fri — need to reconcile)
- **Delivery**: Uber Eats (storefront linked)
- **Rating**: ~4.6–4.7 across sources
- **Tone**: Casual, friendly, fresh
- **Audience**: Local regulars, breakfast/brunch crowd

## Catalogue (from Uber Eats)
Categories: Breakfast, Lunch, Sweet Treats, Extras, Kids, Drinks

## Page Selection Rationale
- **home**: Always present. Hero + Popular products + Testimonials + Delivery CTA.
- **menu**: Catalogue has multiple categories.
- **about**: Substantive description + testimonials available.
- **contact**: Hours + address + delivery info present.
- Gallery omitted (no dedicated gallery page needed; images serve as menu/hero assets).

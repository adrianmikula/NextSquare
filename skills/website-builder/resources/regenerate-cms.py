#!/usr/bin/env python3
"""
regenerate-cms.py
Regenerates content/cms/site/pages.json with properly populated A/B variants.
This is a Python reimplementation of rebuild-demo.ts for environments without node_modules.
"""

import json
import os
from datetime import datetime

CMS_DIR = os.path.join(os.getcwd(), "content", "cms", "site")
PAGES_PATH = os.path.join(CMS_DIR, "pages.json")
SITE_PROFILE_PATH = os.path.join(os.getcwd(), "content", "cms", "demo", "profile.json")
CATALOG_PATH = os.path.join(os.getcwd(), "content", "archetypes", "catalog.json")

def read_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def write_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")

def make_variant(value_a, value_b):
    return {"a": value_a, "b": value_b}

def build_hero(profile):
    base = {
        "headline": make_variant(profile["name"], profile["name"]),
        "subheadline": make_variant(
            profile.get("tagline", ""),
            f"Discover {profile['name']} — great food, great coffee, great vibes."
        ),
        "image": profile.get("media", {}).get("hero"),
        "ctaLabel": make_variant("View Menu", "Order Online"),
        "ctaLink": "/menu",
    }
    if profile.get("media", {}).get("hero"):
        return {
            **base,
            "variant": {
                "backgroundStyle": "image",
                "overlayOpacity": 0.4,
                "textAlign": "center",
                "headingSize": "4xl",
            }
        }
    return base

def build_text(profile):
    return {
        "heading": make_variant("Welcome", "Our Story"),
        "body": make_variant(
            profile.get("description", ""),
            f"At {profile['name']}, we believe in fresh, local ingredients and a warm atmosphere. Come for the coffee, stay for the community."
        ),
    }

def build_products(profile):
    catalogue = profile.get("catalogue", {})
    items = catalogue.get("items", [])[:4]
    product_items = []
    for item in items:
        product_items.append({
            "name": item.get("name", ""),
            "description": item.get("description", ""),
            "price": item.get("priceHint"),
            "image": None,
        })
    return {
        "title": make_variant("Popular Right Now", "What We're Serving"),
        "items": product_items,
    }

def build_cta(profile):
    return {
        "heading": make_variant(f"Visit {profile['name']}", f"Ready to experience {profile['name']}?"),
        "subtext": make_variant(
            profile.get("tagline", ""),
            "Walk in, order online, or give us a call."
        ),
        "buttonLabel": make_variant("Get in Touch", "Order Now"),
        "buttonLink": "/contact",
    }

def build_gallery(profile):
    return {
        "images": profile.get("media", {}).get("gallery", []),
        "caption": make_variant(
            " ".join(profile.get("vibe", {}).get("adjectives", [])) or "Our gallery",
            f"See inside {profile['name']}"
        ),
    }

def build_services(profile):
    services = profile.get("services", [])[:4]
    return {
        "title": make_variant("Our Services", "What We Offer"),
        "items": [
            {
                "name": s.get("name", ""),
                "description": s.get("description", ""),
                "priceHint": s.get("priceHint"),
                "duration": s.get("duration"),
            }
            for s in services
        ],
    }

def build_testimonials(profile):
    testimonials = profile.get("testimonials", [])[:3]
    return {
        "items": [
            {
                "author": t.get("author", ""),
                "text": make_variant(t.get("text", ""), f'"{t.get("text", "")[:60]}"'),
                "source": t.get("source", ""),
            }
            for t in testimonials
        ],
    }

def get_block_data(symbol, profile):
    builders = {
        "hero": build_hero,
        "text": build_text,
        "products": build_products,
        "cta": build_cta,
        "gallery": build_gallery,
        "services": build_services,
        "testimonials": build_testimonials,
    }
    builder = builders.get(symbol)
    if builder:
        return builder(profile)
    return {}

def get_archetype_blocks(catalog, archetype_name):
    return catalog.get("archetypes", {}).get(archetype_name, {}).get("blocks", [])

def build_page_variants(archetype_name, blocks, page_slug, profile):
    # Get canonical order from archetype
    canonical = list(blocks)

    # Build feature-forward variant
    feature_forward = list(blocks)

    # Hero always first
    if "hero" in feature_forward and feature_forward[0] != "hero":
        feature_forward.remove("hero")
        feature_forward.insert(0, "hero")

    # Lift feature blocks
    feature_blocks = ["gallery", "testimonials", "services", "products"]
    lifted = []
    for block in feature_blocks:
        if block in feature_forward:
            lifted.append(block)

    # Reorder: hero + lifted + rest
    non_hero = [b for b in feature_forward if b != "hero"]
    remaining = [b for b in non_hero if b not in lifted]
    feature_forward = ["hero"] + lifted + remaining

    # CTA must be last
    if "cta" in feature_forward:
        feature_forward.remove("cta")
        feature_forward.append("cta")

    # Avoid duplicate cta
    if feature_forward.count("cta") > 1:
        feature_forward = [b for b in feature_forward if b != "cta"]
        feature_forward.append("cta")

    variants = [
        {
            "id": "A",
            "reasoning": f"Feature-forward ordering for {archetype_name}.",
            "order": feature_forward,
            "blocks": [
                {
                    "type": symbol,
                    "data": get_block_data(symbol, profile),
                }
                for symbol in feature_forward
            ],
        },
        {
            "id": "B",
            "reasoning": f"Conservative canonical ordering for {archetype_name}.",
            "order": canonical,
            "blocks": [
                {
                    "type": symbol,
                    "data": get_block_data(symbol, profile),
                }
                for symbol in canonical
            ],
        },
    ]

    return variants

def build_layout_variants():
    return [
        {
            "id": "A",
            "reasoning": "STANDARD_CONTAINER for maximum content width and modern brand presence.",
            "order": ["page-layout"],
            "blocks": [
                {
                    "type": "page-layout",
                    "data": {
                        "maxWidth": "standard",
                        "contentAlign": "center",
                        "sectionSpacing": "standard",
                        "sidebarPosition": "none",
                    },
                }
            ],
        },
        {
            "id": "B",
            "reasoning": "NARROW_PROSE for improved readability and focused dining content experience.",
            "order": ["page-layout"],
            "blocks": [
                {
                    "type": "page-layout",
                    "data": {
                        "maxWidth": "narrow",
                        "contentAlign": "center",
                        "sectionSpacing": "standard",
                        "sidebarPosition": "none",
                    },
                }
            ],
        },
    ]

def build_header_variants(profile):
    return [
        {
            "id": "A",
            "reasoning": "STANDARD_HEADER with announcement bar and sticky nav for maximum conversion visibility.",
            "order": ["announcement", "nav", "logo"],
            "blocks": [
                {
                    "type": "announcement",
                    "data": {
                        "text": "Welcome! Order online for pickup or delivery.",
                        "link": "/menu",
                        "linkLabel": "Order Now",
                    },
                },
                {
                    "type": "nav",
                    "data": {
                        "links": [
                            {"href": "/", "label": "Home"},
                            {"href": "/menu", "label": "Menu"},
                            {"href": "/about", "label": "About"},
                            {"href": "/contact", "label": "Contact"},
                        ],
                        "sticky": True,
                        "variant": "home",
                    },
                },
                {
                    "type": "logo",
                    "data": {
                        "text": profile["name"],
                        "link": "/",
                    },
                },
            ],
        },
        {
            "id": "B",
            "reasoning": "MINIMAL_HEADER without announcement bar for cleaner brand-first presentation and more hero space.",
            "order": ["logo", "nav"],
            "blocks": [
                {
                    "type": "logo",
                    "data": {
                        "text": profile["name"],
                        "link": "/",
                    },
                },
                {
                    "type": "nav",
                    "data": {
                        "links": [
                            {"href": "/", "label": "Home"},
                            {"href": "/menu", "label": "Menu"},
                            {"href": "/about", "label": "About"},
                            {"href": "/contact", "label": "Contact"},
                        ],
                        "sticky": True,
                        "variant": "page",
                    },
                },
            ],
        },
    ]

def build_footer_variants(profile):
    return [
        {
            "id": "A",
            "reasoning": "STANDARD_FOOTER with full sitemap and social proof for exploration and SEO.",
            "order": ["sitemap", "social-icons", "phone", "copyright"],
            "blocks": [
                {
                    "type": "sitemap",
                    "data": {
                        "columns": [
                            {
                                "title": "Explore",
                                "links": [
                                    {"href": "/", "label": "Home"},
                                    {"href": "/menu", "label": "Menu"},
                                    {"href": "/about", "label": "About"},
                                ],
                            },
                            {
                                "title": "Connect",
                                "links": [
                                    {"href": "/contact", "label": "Contact"},
                                    {"href": "/cart", "label": "Cart"},
                                ],
                            },
                        ],
                    },
                },
                {
                    "type": "social-icons",
                    "data": {
                        "platforms": [
                            {
                                "name": "Uber Eats",
                                "url": "https://www.ubereats.com/au/store/aydins-cafe/IJbz4BeDWlqHKtlczc8EXg",
                                "icon": "🛵",
                            }
                        ],
                    },
                },
                {
                    "type": "phone",
                    "data": {
                        "number": profile.get("phone", ""),
                        "display": profile.get("phone", ""),
                        "label": "Call us",
                    },
                },
                {
                    "type": "copyright",
                    "data": {
                        "text": f"© {datetime.now().year} {profile['name']}. All rights reserved.",
                        "name": profile["name"],
                        "year": datetime.now().year,
                    },
                },
            ],
        },
        {
            "id": "B",
            "reasoning": "LOCAL_FOOTER emphasizing direct contact and local presence over broad navigation.",
            "order": ["phone", "business-name", "social-icons", "copyright"],
            "blocks": [
                {
                    "type": "phone",
                    "data": {
                        "number": profile.get("phone", ""),
                        "display": profile.get("phone", ""),
                        "label": "Call us",
                    },
                },
                {
                    "type": "business-name",
                    "data": {
                        "text": profile["name"],
                        "link": "/",
                    },
                },
                {
                    "type": "social-icons",
                    "data": {
                        "platforms": [
                            {
                                "name": "Uber Eats",
                                "url": "https://www.ubereats.com/au/store/aydins-cafe/IJbz4BeDWlqHKtlczc8EXg",
                                "icon": "🛵",
                            }
                        ],
                    },
                },
                {
                    "type": "copyright",
                    "data": {
                        "text": f"© {datetime.now().year} {profile['name']}. All rights reserved.",
                        "name": profile["name"],
                        "year": datetime.now().year,
                    },
                },
            ],
        },
    ]

def main():
    profile = read_json(SITE_PROFILE_PATH)
    catalog = read_json(CATALOG_PATH)

    pages = []

    # Home page
    home_archetype = "DEFAULT_HOME"
    home_blocks = get_archetype_blocks(catalog, home_archetype)
    home_variants = build_page_variants(home_archetype, home_blocks, "home", profile)

    pages.append({
        "slug": "home",
        "label": "Home",
        "archetype": home_archetype,
        "variants": home_variants,
        "seo": {
            "title": profile["name"],
            "description": profile.get("description", ""),
        },
    })

    # Header
    pages.append({
        "slug": "header",
        "label": "Header",
        "archetype": "STANDARD_HEADER",
        "variants": build_header_variants(profile),
    })

    # Footer
    pages.append({
        "slug": "footer",
        "label": "Footer",
        "archetype": "STANDARD_FOOTER",
        "variants": build_footer_variants(profile),
    })

    # Page Layout
    pages.append({
        "slug": "page-layout",
        "label": "Page Layout",
        "archetype": "STANDARD_CONTAINER",
        "variants": build_layout_variants(),
    })

    output = {"pages": pages}
    write_json(PAGES_PATH, output)
    print(f"Wrote {PAGES_PATH}")

if __name__ == "__main__":
    main()

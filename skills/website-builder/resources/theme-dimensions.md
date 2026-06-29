# Theme Styling Dimensions

This file catalogs every visual dimension that can vary between theme variants.
The website-builder skill requires themes to differ across **at least 5 dimensions**
(including colour) so that each variant produces a genuinely distinct visual identity.

---

## 1. Colour Palette

| Property | Type | Description |
|----------|------|-------------|
| `colors.primary` | hex | Main brand colour. Used for CTAs, icons, key headings. |
| `colors.secondary` | hex | Background wash for tinted sections. |
| `colors.background` | hex | Page-level background. |
| `colors.surface` | hex | Card, modal, and elevated surface background. |
| `colors.text` | hex | Primary text colour. |
| `colors.accent` | hex | Highlight, callout, and decorative colour. |
| `colors.border` | hex | Default border colour (if not derived from text at opacity). |

**Distinctness rule:** Primary hue must differ by ≥30° OR luminance by ≥20% between any two variants.

---

## 2. Typography

| Property | Type | Options / Examples |
|----------|------|-------------------|
| `typography.headingFont` | string | Inter, Playfair Display, DM Sans, Lora, Oswald, Nunito |
| `typography.bodyFont` | string | Inter, Source Sans 3, DM Sans, Lora |
| `typography.headingWeight` | number | 400, 500, 600, 700 |
| `typography.bodyWeight` | number | 300, 400, 500 |
| `typography.headingCase` | enum | `normal`, `uppercase`, `small-caps` |
| `typography.letterSpacing` | string | CSS value: `-0.02em`, `0`, `0.05em` |
| `typography.lineHeight` | string | CSS value: `1.2`, `1.5`, `1.8` |

---

## 3. Spacing & Layout

| Property | Type | Description |
|----------|------|-------------|
| `spacing.sectionPaddingY` | string | Vertical padding for sections. e.g. `4rem`, `6rem`, `8rem` |
| `spacing.sectionPaddingX` | string | Horizontal padding. e.g. `1rem`, `2rem` |
| `spacing.containerMax` | string | Max content width. e.g. `72rem`, `80rem`, `56rem` |
| `spacing.gridGap` | string | Gap between grid/card children. e.g. `1.5rem`, `2rem` |
| `spacing.contentAlign` | enum | `left`, `center`, `right` — text block alignment |

---

## 4. Border Radius & Shape

| Property | Type | Options |
|----------|------|---------|
| `shape.borderRadius` | string | Base radius. e.g. `0`, `0.25rem`, `0.5rem`, `1rem`, `9999px` |
| `shape.cardRadius` | string | Override for cards. |
| `shape.buttonRadius` | string | Override for buttons. |
| `shape.imageRadius` | string | Override for images/gallery. |

---

## 5. Borders

| Property | Type | Options |
|----------|------|---------|
| `borders.width` | string | `0`, `1px`, `2px` |
| `borders.style` | enum | `solid`, `dashed`, `none` |
| `borders.cardBorder` | boolean | Whether cards get an explicit border. |
| `borders.divider` | boolean | Use divider lines between sections. |

---

## 6. Shadows & Depth

| Property | Type | Options / Examples |
|----------|------|-------------------|
| `shadows.card` | enum | `none`, `sm`, `md`, `lg`, `xl`, `2xl` |
| `shadows.cardHover` | enum | Same scale. Applied on card hover. |
| `shadows.elevation` | string | Custom box-shadow value for elevated elements. |
| `shadows.tint` | boolean | `true` = shadow tinted with primary colour; `false` = neutral black. |

---

## 7. Hero Section

| Property | Type | Options |
|----------|------|---------|
| `hero.style` | enum | `image`, `gradient`, `split`, `minimal` |
| `hero.overlayOpacity` | number | 0–1. Darkness of image overlay. |
| `hero.overlayColor` | hex | Colour of gradient overlay. |
| `hero.textAlign` | enum | `left`, `center`, `right` |
| `hero.paddingY` | string | Hero vertical padding. e.g. `5rem`, `10rem` |
| `hero.gradientDirection` | string | CSS gradient direction. e.g. `to bottom`, `135deg` |
| `hero.imageTreatment` | enum | `cover`, `contain`, `blur`, `parallax` |

---

## 8. Cards & Containers

| Property | Type | Options |
|----------|------|---------|
| `cards.style` | enum | `elevated`, `flat`, `bordered`, `glass` |
| `cards.hover` | enum | `lift`, `glow`, `border-accent`, `none` |
| `cards.imageAspect` | enum | `square`, `landscape`, `portrait`, `auto` |
| `cards.imageRadius` | string | Top-corner radius override. |
| `cards.innerPadding` | string | e.g. `1.5rem`, `2rem` |

---

## 9. Buttons

| Property | Type | Options |
|----------|------|---------|
| `buttons.style` | enum | `filled`, `outlined`, `ghost`, `underline` |
| `buttons.radius` | string | `0`, `0.25rem`, `0.5rem`, `9999px` |
| `buttons.paddingX` | string | e.g. `1.5rem` |
| `buttons.fontWeight` | number | 500, 600, 700 |
| `buttons.hover` | enum | `darken`, `lift`, `glow`, `none` |
| `buttons.fullWidth` | boolean | Mobile-only full-width CTAs. |

---

## 10. Navigation

| Property | Type | Options |
|----------|------|---------|
| `nav.style` | enum | `solid`, `transparent`, `sticky`, `floating` |
| `nav.backgroundOpacity` | number | 0–1 for transparent/floating styles. |
| `nav.logoSize` | enum | `sm`, `md`, `lg` |
| `nav.linkStyle` | enum | `underline`, `pill`, `minimal`, `bold` |
| `nav.height` | string | e.g. `3.5rem`, `4rem`, `5rem` |
| `nav.shadow` | boolean | Drop shadow on nav. |

---

## 11. Menu / Catalogue Items

| Property | Type | Options |
|----------|------|---------|
| `menu.layout` | enum | `list`, `grid`, `cards` |
| `menu.priceAlign` | enum | `left`, `right`, `center` |
| `menu.priceStyle` | enum | `inline`, `badge`, `large` |
| `menu.divider` | boolean | Horizontal rule between items. |
| `menu.hover` | enum | `highlight`, `slide`, `none` |
| `menu.imagePosition` | enum | `left`, `top`, `none` |

---

## 12. Testimonials

| Property | Type | Options |
|----------|------|---------|
| `testimonials.layout` | enum | `grid`, `carousel`, `stacked` |
| `testimonials.quoteStyle` | enum | `border-left`, `italics`, `large` |
| `testimonials.avatar` | boolean | Show author avatar. |

---

## 13. Forms

| Property | Type | Options |
|----------|------|---------|
| `forms.inputRadius` | string | `0`, `0.25rem`, `0.5rem`, `9999px` |
| `forms.inputBorder` | enum | `full`, `bottom-only`, `none` |
| `forms.focusRing` | enum | `primary`, `ring`, `none` |
| `forms.labelWeight` | number | 400, 500, 600 |

---

## 14. Footer

| Property | Type | Options |
|----------|------|---------|
| `footer.background` | enum | `light`, `dark`, `primary`, `transparent` |
| `footer.layout` | enum | `centered`, `multi-column`, `minimal` |
| `footer.borderTop` | boolean | Show top border. |
| `footer.socialStyle` | enum | `icons`, `text`, `none` |

---

## 15. Section Dividers

| Property | Type | Options |
|----------|------|---------|
| `dividers.style` | enum | `none`, `line`, `wave`, `angled`, `dots` |
| `dividers.color` | hex | Colour of divider element. |
| `dividers.height` | string | e.g. `2rem`, `4rem` |

---

## 16. Animations & Transitions

| Property | Type | Options |
|----------|------|---------|
| `motion.transitionSpeed` | enum | `fast` (150ms), `normal` (300ms), `slow` (500ms) |
| `motion.hoverLift` | boolean | Cards/buttons lift on hover. |
| `motion.fadeIn` | boolean | Sections fade in on scroll. |
| `motion.smoothScroll` | boolean | CSS smooth scrolling. |

---

## Required Variance Checklist

When generating N theme variants for a tenant, every variant must differ from **every
other variant** in at least **8 of the 16 dimension categories above**.

The 5 previously-required dimensions are now mandatory minimums within that 8:
- **Colour palette** (always)
- **Typography** (font family or weight)
- **Card style** (elevated / flat / bordered / glass)
- **Hero style** (image / gradient / split / minimal)
- **One additional dimension** (nav, spacing, shape, buttons, menu, or motion)

Plus any 3 more dimensions to reach the 8-dimension minimum total.

Failing this check means the themes are too similar — regenerate the weaker variant
with a contrasting direction keyword.

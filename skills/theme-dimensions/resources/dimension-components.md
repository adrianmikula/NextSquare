# Dimension: Components

## Purpose

Controls per-component morphology — border radii, shadows, border styles, card styles, button styles, hero styles, navigation personality, and footer/divider/forms/testimonials character.

## Spec Schema

| Field | Type | Description |
|-------|------|-------------|
| `borderRadius` | string (CSS length) | Base border radius |
| `cardRadius` | string | Override for card border radius |
| `buttonRadius` | string | Override for button border radius |
| `imageRadius` | string | Override for image border radius |
| `borderWidth` | string | Default border width |
| `borderStyle` | enum | `solid`, `dashed`, `none` |
| `cardBorder` | boolean | Cards get explicit border |
| `divider` | boolean | Divider lines between sections |
| `cardShadow` | enum | `none`, `sm`, `md`, `lg`, `xl`, `2xl` |
| `cardHoverShadow` | enum | Same scale, applied on hover |
| `heroStyle` | enum | `image`, `gradient`, `split`, `minimal` |
| `cardStyle` | enum | `flat`, `elevated`, `bordered`, `glass` |
| `buttonStyle` | enum | `filled`, `outlined`, `ghost`, `underline` |
| `navStyle` | enum | `solid`, `transparent`, `sticky`, `floating` |
| `navHeight` | string | Navigation bar height |
| `navBgOpacity` | number | 0–1 nav background opacity |
| `navLinkStyle` | enum | `underline`, `pill`, `minimal`, `bold` |

## Variant Differences

| Field | Variant A | Variant B |
|-------|-----------|-----------|
| `borderRadius` | `0.75rem` | `0.5rem` |
| `cardRadius` | `0.75rem` | `0.5rem` |
| `buttonRadius` | `9999px` (pill) | `0.25rem` (slight) |
| `imageRadius` | `0.75rem` | `0.5rem` |
| `borderWidth` | `1px` | `1px` |
| `borderStyle` | `solid` | `solid` |
| `cardBorder` | `false` | `true` |
| `divider` | `false` | `true` |
| `cardShadow` | `lg` | `md` |
| `cardHoverShadow` | `xl` | `lg` |
| `heroStyle` | `gradient` | `image` |
| `cardStyle` | `flat` | `elevated` |
| `buttonStyle` | `filled` | `filled` |
| `navStyle` | `sticky` | `solid` |
| `navHeight` | `5rem` | `5rem` |
| `navBgOpacity` | `0.95` | `1` |
| `navLinkStyle` | `minimal` | `pill` |

## CSS Custom Properties Compiled

| Property | Source field | Example value |
|----------|-------------|---------------|
| `--theme-border-radius` | `borderRadius` | `0.75rem` |
| `--theme-card-radius` | `cardRadius` | `0.75rem` |
| `--theme-button-radius` | `buttonRadius` | `9999px` |
| `--theme-image-radius` | `imageRadius` | `0.75rem` |
| `--theme-border-width` | `borderWidth` | `1px` |
| `--theme-border-style` | `borderStyle` | `solid` |
| `--theme-shadow-card` | `cardShadow` (via shadow map) | `0 10px 15px -3px rgb(0 0 0 / 0.1)` |
| `--theme-shadow-card-hover` | `cardHoverShadow` (via shadow map) | `0 20px 25px -5px rgb(0 0 0 / 0.1)` |
| `--nav-height` | `navHeight` | `5rem` |
| `--nav-bg-opacity` | `navBgOpacity` | `0.95` |

## Allowed Values

- Border radii: any CSS length or `9999px` (pill)
- `borderWidth`: `0`, `1px`, `2px`
- `borderStyle`: `solid`, `dashed`, `none`
- Shadow enums: `none`, `sm`, `md`, `lg`, `xl`, `2xl`
- `heroStyle`: `image`, `gradient`, `split`, `minimal`
- `cardStyle`: `flat`, `elevated`, `bordered`, `glass`
- `buttonStyle`: `filled`, `outlined`, `ghost`, `underline`
- `navStyle`: `solid`, `transparent`, `sticky`, `floating`
- `navLinkStyle`: `underline`, `pill`, `minimal`, `bold`
- `navBgOpacity`: number 0–1

## Implementation

**File:** `lib/dimensions/compile.ts — compileComponents()`

Resolves shadow names through `SHADOW_MAP` constant. Field access with fallback:
- `borderRadius`: `spec.borderRadius ?? spec.shape.borderRadius ?? "0.5rem"`
- `cardShadow`: resolved via `SHADOW_MAP[spec.cardShadow] ?? SHADOW_MAP["md"]`
- `navBgOpacity`: `lookupNumber(spec, ['navBgOpacity', 'nav.backgroundOpacity'], 0.95)`

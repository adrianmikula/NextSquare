# Uniqueness Detection Layers

Full grep commands and fix instructions for all 12 audit layers.
Run from project root. Source dirs: `components/`, `app/`, `lib/`. Exclude `node_modules/`, `.next/`, `content/`, `docs/`, `skills/`.

`rg` (ripgrep) is preferred; fall back to `grep -rn` if not installed.

---

## Layer A: Hardcoded Status Colors

**What it catches:** Tailwind green/red/blue scale colors used directly instead of semantic status classes.

```bash
# Search
rg -n 'bg-green-\d+|text-green-\d+|bg-red-\d+|text-red-\d+|bg-blue-\d+|text-blue-\d+' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'

# Alternative (grep)
grep -rn 'bg-green-\|text-green-\|bg-red-\|text-red-\|bg-blue-\|text-blue-' components/ app/ --include='*.tsx' 2>/dev/null
```

**Fix:** Replace with `bg-success` / `text-success` / `bg-success-subtle` / `bg-error` / `text-error` / `bg-error-subtle` / `bg-info` / `text-info` / `bg-info-subtle`. If the CSS var doesn't exist yet, add it to `compile.ts` and `globals.css` first.

---

## Layer B: Hardcoded Flat Tailwind Scale Colors

**What it catches:** `text-stone-*`, `bg-amber-*`, `fill-amber-*`, `border-stone-*` classes that hardcode specific Tailwind palette values.

```bash
# Search
rg -n 'text-stone-\d+|bg-amber-\d+|fill-amber-\d+|border-stone-\d+' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'

# Alternative (grep)
grep -rn 'text-stone-\|bg-amber-\|fill-amber-\|border-stone-' components/ app/ --include='*.tsx' 2>/dev/null
```

**Fix:**
- `text-stone-900` → `text-heading`
- `text-stone-700`/`text-stone-600` → `text-body`
- `text-stone-500`/`text-stone-400` → `text-muted`
- `bg-amber-600`/`bg-amber-700` → `bg-section-cta` or `bg-[var(--color-primary)]`
- `bg-amber-100`/`bg-amber-50` → `bg-section-alt`
- `fill-amber-400` → `fill-star`
- `border-stone-300`/`border-stone-200` → `border-card`

---

## Layer C: Hardcoded White/Black

**What it catches:** `bg-white`, `text-white`, `bg-black/*` — values that bypass the theme color system.

```bash
# Search
rg -n 'bg-white|text-white|bg-black/\d+' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next' | grep -v '//.*exempt'

# Alternative (grep)
grep -rn 'class.*bg-white\|class.*text-white\|bg-black/' components/ app/ --include='*.tsx' 2>/dev/null | grep -v '//.*exempt'
```

**Fix:**
- `bg-white` on cards → `bg-card`
- `bg-white` on sections → `bg-section`
- `text-white` on buttons → `text-[var(--color-background)]`
- `bg-black/50` overlays → add `--color-overlay` CSS var + utility class

---

## Layer D: Hardcoded Non-Color Dimension Values

**What it catches:** Container widths, section padding, grid gaps, shadows, transitions — values that should be theme-controlled CSS vars.

```bash
# Container widths (should use container-max)
rg -n 'max-w-6xl|max-w-7xl' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'

# Section padding (should use section-py)
rg -n 'py-20|py-24' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'

# Hardcoded card patterns
rg -n 'rounded-xl border.*bg' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'

# Grid gaps (should use --grid-gap via style={})
rg -n 'gap-6|gap-8|gap-12' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next' | grep -v 'style='

# Shadows (should use theme shadow vars)
rg -n 'shadow-lg|shadow-xl' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next' | grep -v 'style='

# Transition durations (should use --transition-speed)
rg -n 'duration-200|duration-300|duration-500' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next' | grep -v 'style='
```

**Fix:**
- `max-w-7xl` → `container-max`
- `py-20` → `section-py`
- `rounded-xl border bg-white` → use daisyUI `card` component
- `gap-6` → `style={{ gap: "var(--grid-gap)" }}`
- `shadow-lg` → `style={{ boxShadow: "var(--theme-shadow-card)" }}`
- `duration-300` → `style={{ transitionDuration: "var(--transition-speed)" }}`

---

## Layer E: Silent Fallbacks & Defaults

**What it catches:** `|| "default"` patterns that silently fall back to hardcoded values, duplicated constants, hardcoded business info.

```bash
# Silent "A" fallback in layout files
rg -n 'NEXT_PUBLIC_THEME_BUNDLE.*\|\|.*"A"' --include='*.tsx' --include='*.ts' app/

# Palette color fallback defaults (warm-amber bias)
rg -n 'resolveColor.*#b45309|resolveColor.*#fef3c7|resolveColor.*#fffbeb|resolveColor.*#1c1917|resolveColor.*#d4a373' --include='*.ts' lib/

# Duplicated FALLBACK_NAME
rg -n 'FALLBACK_NAME' --include='*.tsx' --include='*.ts' components/ app/ lib/

# Hardcoded business info
rg -n '"7:00 AM|"123 Coffee|"@cafetemplate|"hello@cafetemplate"' --include='*.tsx' components/

# Hardcoded CTA links
rg -n '"/menu"' --include='*.tsx' --include='*.ts' components/ lib/ | grep -v 'node_modules'
```

**Fix:**
- Every `|| "default"` → add `console.warn("[theme] ...")` before the fallback
- Warm-amber palette defaults → neutral CSS variable defaults (e.g. `#cccccc`)
- Extract shared constants → `lib/constants.ts` and import
- Business string literals → `siteProfile?.field || ""` with console warning when empty

---

## Layer F: Custom CSS Not Using daisyUI

**What it catches:** Custom semantic utility classes that should be replaced with daisyUI component classes.

```bash
# Custom card/button/image utilities
rg -n 'card-themed|button-themed|image-themed' --include='*.tsx' components/ app/ | grep -v node_modules

# Custom semantic backgrounds
rg -n 'bg-section|bg-card|bg-nav|bg-footer' --include='*.tsx' components/ app/ | grep -v node_modules

# Custom semantic text colors
rg -n 'text-heading|text-body|text-muted' --include='*.tsx' components/ app/ | grep -v node_modules

# Old-style CVA Button component
rg -n 'buttonVariants' --include='*.tsx' components/ app/ | grep -v node_modules

# Custom toast
rg -n 'variantStyles|ToastContainer' --include='*.tsx' components/ app/ | grep -v node_modules
```

**Fix replace table:**

| Custom class | daisyUI replacement |
|---|---|
| `card-themed bg-card` | `card` + `card-body` + `card-title` |
| `button-themed` | `btn` + `btn-primary` / `btn-outline` / `btn-ghost` / `btn-error` |
| `image-themed` | `card` figure + `image-full` |
| `bg-section` | `bg-base-200` |
| `bg-section-alt` | `bg-base-200` (via component hierarchy) |
| `bg-section-inverse` | `bg-neutral` |
| `bg-section-cta` | `bg-primary` |
| `bg-card` | `bg-base-100` (cards inherit from `card`) |
| `bg-nav` | `navbar` handles its own bg |
| `bg-footer` | `footer` handles its own bg |
| `text-heading` / `text-body` / `text-muted` | daisyUI components set these automatically via `--color-base-content` |

**For each migration:**
1. Replace the HTML structure with daisyUI component pattern (e.g. `<div class="card">` → `<div class="card-body">` → content)
2. Remove the custom class from the component
3. After all consumers migrated, delete the corresponding CSS rule from `globals.css`
4. Verify the migrated component renders correctly across all theme variants

---

## Layer G: Hardcoded Typography Values

**What it catches:** `text-[*px]`, `leading-[*]`, `font-[*]`, `tracking-[*]` — arbitrary typography values that bypass the heading/body font size system.

```bash
# Hardcoded font-size arbitrary values
rg -n 'text-\[[0-9.]+(px|rem)\]' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'

# Hardcoded line heights
rg -n 'leading-\[[0-9.]+(px|rem)\]' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'

# Hardcoded font weights
rg -n 'font-\[[0-9]+\]' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'

# Hardcoded tracking/letter-spacing
rg -n 'tracking-\[[^\]]+\]' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'
```

**Fix:**
- `text-[*px]` → use `text-sm` / `text-base` / `text-lg` / `text-xl` / `headingClass()` for semantic sizing
- `leading-[*]` → use `--line-height` CSS var via `style={{ lineHeight: "var(--line-height)" }}`
- `font-[*]` → use theme-controlled `font-normal` / `font-medium` / `font-semibold` / `font-bold`
- `tracking-[*]` → use `--letter-spacing` CSS var via `style={{ letterSpacing: "var(--letter-spacing)" }}`

---

## Layer H: Hardcoded Spacing & Sizing

**What it catches:** `m-[*]`, `p-[*]`, `w-[*]`, `h-[*]`, `gap-[*]` arbitrary values that should be theme-controlled.

```bash
# Hardcoded margin arbitrary values
rg -n 'm[trbxl]?-\[[0-9.]+(px|rem)\]' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next' | grep -v '//.*exempt'

# Hardcoded padding arbitrary values
rg -n 'p[trbxl]?-\[[0-9.]+(px|rem)\]' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next' | grep -v '//.*exempt'

# Hardcoded width/height arbitrary values
rg -n '(w-|h-)\[[0-9.]+(px|rem|vh|vw)\]' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next' | grep -v '//.*exempt'

# Hardcoded gap arbitrary values
rg -n 'gap-\[[0-9.]+(px|rem)\]' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'
```

**Fix:**
- `margin-[*]` → use Tailwind spacing scale or `style={{ margin: "var(--theme-spacing)" }}`
- `padding-[*]` → use `section-py` / `section-px` utility classes
- `width-[*]` / `height-[*]` → use `container-max` / `max-w-*` / CSS var
- `gap-[*]` → use `style={{ gap: "var(--grid-gap)" }}`

---

## Layer I: Hardcoded Positioning & Layout

**What it catches:** `top-[*]`, `bottom-[*]`, `z-[*]`, `translate-[*]`, `scale-[*]`, `min-h-[*]` — positional values that should be theme-relative.

```bash
# Hardcoded inset values (top, right, bottom, left)
rg -n '(top-|bottom-|left-|right-)\[[0-9.]+(px|rem|%)' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next' | grep -v '//.*exempt'

# Hardcoded z-index
rg -n 'z-\[[0-9]+\]' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'

# Hardcoded transform values
rg -n 'translate-\[|scale-\[|rotate-\[' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'

# Hardcoded min-height arbitrary values
rg -n 'min-h-\[[0-9.]+(px|rem|vh)' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'
```

**Fix:**
- `top-[*]` / `bottom-[*]` → reference theme CSS vars where possible
- `z-[*]` → use z-index scale constant (`z-10`, `z-50`, `z-modal`)
- `translate-[*]` / `scale-[*]` → use `--motion-*` CSS vars
- `min-h-[*]` for hero sections → `--hero-min-height` CSS var
- `min-h-[*]` for other sections → extract to a new dimension spec field if theme-dependent

---

## Layer J: Hardcoded Border & Divide Colors

**What it catches:** `border-gray-*`, `border-slate-*`, `divide-*`, `ring-*` — non-theme Tailwind scale colors for borders.

```bash
# Hardcoded border colors (non-theme Tailwind scales)
rg -n 'border-(gray|slate|zinc|neutral)-\d+' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'

# Hardcoded divide colors
rg -n 'divide-(gray|slate|zinc|neutral|stone)-\d+' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'

# Hardcoded ring colors
rg -n 'ring-(gray|slate|stone|amber)-\d+' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'

# Hardcoded border widths via arbitrary values
rg -n 'border-\[[0-9.]+(px|rem)\]' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'
```

**Fix:**
- `border-gray-*` / `border-slate-*` → `border-card` or `border-[var(--color-border)]`
- `divide-*` → theme border color via `var(--color-border)`
- `ring-*` → `--color-primary` or focus ring CSS var
- `border-[*]` → `--border-width` CSS var via `style={{ borderWidth: "var(--border-width)" }}`

---

## Layer K: Hardcoded Tailwind Arbitrary Values (Non-Color)

**What it catches:** Any `[*px]`, `[*rem]`, `[*%]` arbitrary values that aren't already using CSS vars or exempted.

```bash
# All arbitrary values that are px/rem (potential hardcodings)
# Exclude known-good: style=, backgroundImage, var(, exempt comments
rg -n '\[-?[0-9.]+(px|rem|%)\]' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next' | grep -v 'style=' | grep -v 'backgroundImage' | grep -v 'var(' | grep -v '//.*exempt'

# Alternative (grep) — more limited regex
grep -rn '\[-?[0-9]\{1,4\}\(px\|rem\|%\)\]' components/ app/ --include='*.tsx' 2>/dev/null | grep -v 'style=' | grep -v 'backgroundImage' | grep -v 'var(' | grep -v '//.*exempt'
```

**Fix:** Each arbitrary value should be evaluated:
- Does it need to vary by theme? → Add a new CSS var + dimension spec field
- Is it a fixed layout constraint (e.g. nav height)? → Reference existing CSS var
- Is it truly static and not theme-dependent? → Leave as-is, add `// exempt` comment

Common mappings:
- `min-h-[400px]` → `min-h-[var(--hero-min-height)]`
- `w-[80vw]` → verify fixed or make theme-variable
- `max-h-[90vh]` → use `max-h-screen` or CSS var

---

## Layer L: Hardcoded Inline Styles (Non-var Values)

**What it catches:** `style={{}}` objects with static hex colors, numeric px values, or other values that should be CSS var references.

```bash
# Inline style values that aren't CSS var references
rg -n 'style=\{\{[^}]*"[^"]*":\s*"[^v]' --include='*.tsx' components/ app/ | grep -v node_modules | grep -v '.next' | grep -v 'var(--'

# Inline styles with hardcoded hex color values
rg -n 'style=\{\{[^}]*"#[0-9a-fA-F]{3,6}' --include='*.tsx' components/ app/ | grep -v node_modules | grep -v '.next' | grep -v '//.*exempt'

# Inline styles with hardcoded numeric px values
rg -n 'style=\{\{[^}]*:[^}]+px' --include='*.tsx' components/ app/ | grep -v node_modules | grep -v '.next' | grep -v 'var(--'

# Alternative (grep)
grep -rn 'style={[^}]*"[^"]*":\s*"#' components/ app/ --include='*.tsx' 2>/dev/null
```

**Fix:** Replace hardcoded inline style values with CSS var references:
- `"#D4845A"` → `"var(--color-primary)"`
- `"100px"` → `"var(--nav-height)"`
- `"300ms"` → `"var(--transition-speed)"`
- `"2rem"` → `"var(--section-py)"` or `style={{ padding: "var(--section-py) var(--section-px)" }}`

---

## Running All Layers At Once

```bash
# Quick audit — prints any layer with violations
for layer in A B C D E F G H I J K L; do
  echo "--- Layer $layer ---"
  case $layer in
    A) rg -n 'bg-green-\d+|text-green-\d+|bg-red-\d+' --include='*.tsx' --include='*.ts' components/ app/ 2>/dev/null | grep -v node_modules ;;
    B) rg -n 'text-stone-\d+|bg-amber-\d+|border-stone-\d+' --include='*.tsx' --include='*.ts' components/ app/ 2>/dev/null | grep -v node_modules ;;
    C) rg -n 'bg-white|text-white' --include='*.tsx' --include='*.ts' components/ app/ 2>/dev/null | grep -v node_modules | grep -v 'var(' ;;
    D) rg -n 'max-w-6xl|max-w-7xl|py-20|py-24|gap-6|gap-8|gap-12' --include='*.tsx' --include='*.ts' components/ app/ 2>/dev/null | grep -v node_modules | grep -v 'style=' ;;
    E) rg -n 'NEXT_PUBLIC_THEME_BUNDLE.*\|\|' --include='*.tsx' --include='*.ts' app/ 2>/dev/null ;;
    F) rg -n 'bg-section|text-heading|text-body|text-muted' --include='*.tsx' components/ app/ 2>/dev/null | grep -v node_modules | head -10 ;;
    G) rg -n 'text-\[[0-9.]+px' --include='*.tsx' --include='*.ts' components/ app/ 2>/dev/null | grep -v node_modules ;;
    H) rg -n 'min-h-\[[0-9.]+(px|rem|vh)' --include='*.tsx' --include='*.ts' components/ app/ 2>/dev/null | grep -v node_modules ;;
    I) rg -n 'z-\[[0-9]+\]' --include='*.tsx' --include='*.ts' components/ app/ 2>/dev/null | grep -v node_modules ;;
    J) rg -n 'border-(gray|slate|zinc|neutral)-\d+' --include='*.tsx' --include='*.ts' components/ app/ 2>/dev/null | grep -v node_modules ;;
    K) rg -n '\[-?[0-9.]+(px|rem|%)\]' --include='*.tsx' --include='*.ts' components/ app/ 2>/dev/null | grep -v node_modules | grep -v 'style=' | grep -v 'var(' | head -5 ;;
    L) rg -n 'style=\{\{[^}]*"#[0-9a-fA-F]{3,6}' --include='*.tsx' components/ app/ 2>/dev/null | grep -v node_modules ;;
  esac
  echo ""
done
```

---
name: theme-uniqueness
description: >
  Audit the entire codebase for hardcoded, defaulted, or deterministic theme values that bypass
  the CSS variable system, and fix them so any 2 generated themes are truly unique and distinct
  in all dimensions. Run after dimension spec generation or whenever theme integrity is suspect.
---

# Theme Uniqueness Skill

> **v0.2.0** — Added Step 6: Market Spectrum Positioning

## Mission

Every theme value in the codebase must flow through a CSS custom property controlled by the
dimension spec system. Any hardcoded Tailwind class, silent fallback, default palette value, or
unconsumed CSS var represents a gap where generated themes will look identical.

Run this skill to:

1. **Audit** the entire codebase for violations across 5 detection layers
2. **Fix** every violation by converting to CSS vars / semantic utility classes / explicit config
3. **Verify** that all generated variant pairs differ in ALL controllable dimensions
4. **Validate** no silent fallbacks or dead CSS vars remain

## Prerequisites

- The dimension system (`lib/dimensions/`) is installed and functional
- Dimension spec files exist under `content/dimensions/specs/` (at minimum color-a.json, color-b.json)
- `app/globals.css` defines `:root` fallbacks and `@layer components` utility classes
- The project compiles (`npm run typecheck` passes)

## Non-Negotiable Rules

1. **No hardcoded colors.** Every color class must be a semantic utility class (`.text-heading`, `.bg-card`, `.text-success`, etc.) or reference a CSS var directly. Tailwind scales (`text-stone-*`, `bg-amber-*`, `bg-green-*`) are violations.
2. **No silent fallbacks.** Every `|| "default"` or `?? "default"` must log a warning or throw.
3. **Themes must differ.** Any pair of generated themes must differ in ALL 8 dimensions and ALL 5 component properties. If they don't, regenerate the weaker variant.
4. **Every emitted CSS var must be consumed.** No dead code in `:root`.
5. **No `FALLBACK_NAME` duplication.** Shared fallback constants live in `lib/constants.ts`.
6. **No hardcoded business info.** Address, hours, social handles, CTA links must come from `siteProfile` or throw when missing.
7. **Prefer daisyUI as the standard component library over custom CSS solutions.** Custom utility classes (`.card-themed`, `.button-themed`, `.image-themed`, `.bg-section`, `.text-heading`) should be migrated to equivalent daisyUI component classes (`.card`, `.btn`, `.badge`, `.alert`, `.navbar`, `.footer`, `.hero`, `.input`, `.select`, `.table`, `.toast`, `.modal`) wherever a direct mapping exists. Custom CSS in `globals.css` that duplicates daisyUI component styles should be removed after migration. New components should use daisyUI classes by default, not custom ones.

---

## Workflow

```
Audit Codebase  →  Categorize Violations  →  Fix Layer by Layer  →  Verify Distinctness  →  Re-test  →  Market Spectrum
```

### Step 1: Auditing the Codebase

Run each of these 5 detection layers. Use **grep over source directories only** (`components/`, `app/`, `lib/`; exclude `node_modules/`, `.next/`, `content/`, `docs/`, `skills/`).

#### Layer A: Hardcoded Color Classes — Status Colors

```bash
# Success/error/info (should use text-success, bg-success-subtle, etc.)
rg -n 'bg-green-\d+|text-green-\d+|bg-red-\d+|text-red-\d+|bg-blue-\d+|text-blue-\d+' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'
```

**Fix:** Replace with `bg-success` / `text-success` / `bg-success-subtle` / `bg-error` / `text-error` / `bg-error-subtle` / `bg-info` / `text-info` / `bg-info-subtle` semantic classes. If the CSS var doesn't exist yet, add it to `compile.ts` and `globals.css` first.

#### Layer B: Hardcoded Color Classes — Flat Tailwind Scale

```bash
# text-stone-* / bg-amber-* / fill-amber-* / border-stone-*
rg -n 'text-stone-\d+|bg-amber-\d+|fill-amber-\d+|border-stone-\d+' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'
```

**Fix:** Replace with semantic utility classes:
- `text-stone-900` → `text-heading`
- `text-stone-700`/`text-stone-600` → `text-body`
- `text-stone-500`/`text-stone-400` → `text-muted`
- `bg-amber-600`/`bg-amber-700` → `bg-section-cta` or `bg-[var(--color-primary)]`
- `bg-amber-100`/`bg-amber-50` → `bg-section-alt`
- `fill-amber-400` → `fill-star`
- `border-stone-300`/`border-stone-200` → `border-card`

#### Layer C: bg-white / text-white / bg-black

```bash
# bg-white / text-white / bg-black (not theme-controlled)
rg -n 'bg-white|text-white|bg-black/\d+' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next' | grep -v '//.*exempt'
```

**Fix:** 
- `bg-white` on cards → `bg-card`
- `bg-white` on sections → `bg-section`
- `text-white` on buttons → `text-[var(--color-background)]`
- `bg-black/50` overlays → `--color-overlay` (add CSS var + utility class)

#### Layer D: Hardcoded Non-Color Dimension Values

```bash
# Container widths (should use container-max)
rg -n 'max-w-6xl|max-w-7xl' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'

# Section padding (should use section-py)
rg -n 'py-20|py-24' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'

# Hardcoded card patterns (should use card-themed)
rg -n 'rounded-xl border.*bg' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next'

# Grid gaps (should use --grid-gap via style={})
rg -n 'gap-6|gap-8|gap-12' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next' | grep -v 'style='

# Shadows (should use theme shadow vars)
rg -n 'shadow-lg|shadow-xl' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next' | grep -v 'style='

# Transition durations (should use --transition-speed)
rg -n 'duration-200|duration-300|duration-500' --include='*.tsx' --include='*.ts' components/ app/ | grep -v node_modules | grep -v '.next' | grep -v 'style='
```

**Fix:** Replace with CSS var utility classes or inline `style={{}}` references:
- `max-w-7xl` → `container-max`
- `py-20` → `section-py`
- `rounded-xl border bg-white` → `card-themed bg-card`
- `gap-6` → `style={{ gap: "var(--grid-gap)" }}`
- `shadow-lg` → `style={{ boxShadow: "var(--theme-shadow-card)" }}`
- `duration-300` → `style={{ transitionDuration: "var(--transition-speed)" }}`

#### Layer F: Custom CSS Not Using daisyUI

```bash
# Custom card utility (should use daisyUI card)
rg -n 'card-themed' --include='*.tsx' components/ app/ | grep -v node_modules

# Custom button utility (should use daisyUI btn)
rg -n 'button-themed' --include='*.tsx' components/ app/ | grep -v node_modules

# Custom semantic backgrounds (should use daisyUI bg-base-* / bg-primary / etc.)
rg -n 'bg-section|bg-card|bg-nav|bg-footer' --include='*.tsx' components/ app/ | grep -v node_modules

# Custom semantic text colors (daisyUI components inherit text from base-content)
rg -n 'text-heading|text-body|text-muted' --include='*.tsx' components/ app/ | grep -v node_modules

# Old-style CVA Button component (should use daisyUI btn)
rg -n 'buttonVariants' --include='*.tsx' components/ app/ | grep -v node_modules

# Custom toast (should use daisyUI toast + alert)
rg -n 'variantStyles|ToastContainer' --include='*.tsx' components/ app/ | grep -v node_modules
```

**Fix:** Replace with daisyUI component classes:

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
1. Replace the HTML structure with daisyUI component pattern (e.g. `<div class="card">` -> `<div class="card-body">` -> content)
2. Remove the custom class from the component
3. After all consumers are migrated, delete the corresponding CSS rule from `globals.css`
4. Verify the migrated component renders correctly across all theme variants

#### Layer E: Silent Fallbacks & Defaults

```bash
# Silent "A" fallback in layout files
rg -n 'NEXT_PUBLIC_THEME_BUNDLE.*\|\|.*"A"' --include='*.tsx' --include='*.ts' app/

# Palette color fallback defaults (hardcoded warm-amber bias)
rg -n 'resolveColor.*#b45309\|resolveColor.*#fef3c7\|resolveColor.*#fffbeb\|resolveColor.*#1c1917\|resolveColor.*#d4a373' --include='*.ts' lib/

# Duplicated FALLBACK_NAME
rg -n 'FALLBACK_NAME' --include='*.tsx' --include='*.ts' components/ app/ lib/

# Hardcoded business info in section components
rg -n '"7:00 AM\|"123 Coffee\|"@cafetemplate\|"hello@cafetemplate"' --include='*.tsx' components/

# Hardcoded CTA links
rg -n '"/menu"' --include='*.tsx' --include='*.ts' components/ lib/ | grep -v 'node_modules'
```

**Fix:**
- Add `console.warn("[theme] ...")` before any `|| "default"` fallback
- Replace warm-amber palette defaults with neutral CSS variable defaults (e.g. `#cccccc` or leave as last-resort CSS var reference)
- Extract shared constants to `lib/constants.ts` and import
- Fallback business string literals → `siteProfile?.field || ""` with console warning when empty

### Step 2: Fix by Category

For each violation found in Step 1, fix it before moving to the next category.
Priority order (most impactful first):

1. **Status colors** (Layer A) — most visible when wrong
2. **daisyUI migration** (Layer F) — replaces entire categories of custom CSS with standard library
3. **Silent fallbacks** (Layer E) — cause silent theme collapse
4. **Semantic utility migration** (Layer B, C) — bulk of remaining work
5. **Dimension values** (Layer D) — mechanical replacements
6. **Unconsumed CSS vars** — cleanup dead code

#### Adding New CSS Variables

When a hardcoded value has no corresponding CSS var:

1. Add the var to `lib/dimensions/compile.ts` in `compileColor()` or the appropriate compiler
2. Add the var + fallback value to `app/globals.css` under `:root`
3. Add a utility class in `@layer components` of `globals.css` if it will be used repeatedly
4. If the var should be theme-specific, add it to both `color-a.json` and `color-b.json` spec files
5. Verify the dimension distinctness check still passes (Step 3)

#### Extracting Shared Constants

When `FALLBACK_NAME` or similar constants are duplicated across files:

1. Create `lib/constants.ts` if it doesn't exist (see template below)
2. Export the constant from there
3. Import in each consumer file
4. Remove the local definition

```typescript
// lib/constants.ts
export const FALLBACK_NAME = "Cafe Template"
export const DEFAULT_CTA_LINK = "/menu"
export const DEFAULT_INSTAGRAM_HANDLE = "@cafetemplate"
export const DEFAULT_EMAIL = "hello@cafetemplate.com"
```

### Step 3: Verify Dimension Distinctness

After all fixes, verify that every pair of generated themes is truly distinct.
This must pass for A/B, and for any additional variant (C, D, etc.):

```bash
# Read color spec files and compare palette hues
node -e "
const a = require('./content/dimensions/specs/color-a.json');
const b = require('./content/dimensions/specs/color-b.json');
const pa = a.palette || a.colors || {};
const pb = b.palette || b.colors || {};
// Hue extraction from hex
function hue(hex) {
  const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  if (max === min) return 0;
  let h;
  if (max === r) h = (g - b) / (max - min) + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / (max - min) + 2;
  else h = (r - g) / (max - min) + 4;
  return h * 60;
}
const hA = hue(pa.primary), hB = hue(pb.primary);
const sep = Math.abs(hA - hB);
console.log('Hue A:', hA.toFixed(1), 'Hue B:', hB.toFixed(1), 'Separation:', sep.toFixed(1));
if (sep < 30) { console.error('FAIL: Hue separation < 30 degrees'); process.exit(1); }
else console.log('PASS: Hue separation >= 30 degrees');
"
```

```bash
# Verify all 9 dimensions differ between A and B
for dim in color typography spatial components rhythm motion imagery wording page-layout; do
  if diff -q "content/dimensions/specs/${dim}-a.json" "content/dimensions/specs/${dim}-b.json" > /dev/null 2>&1; then
    echo "FAIL: dimension ${dim} is identical between A and B"
    exit 1
  fi
done
echo "PASS: All 9 dimensions differ between A and B"
```

```bash
# Verify all 5 component properties differ
for prop in borderRadius cardRadius buttonRadius navHeight cardShadow; do
  VA=$(node -e "const s=require('./content/dimensions/specs/components-a.json'); console.log(s['${prop}'] ?? '')")
  VB=$(node -e "const s=require('./content/dimensions/specs/components-b.json'); console.log(s['${prop}'] ?? '')")
  if [ "$VA" = "$VB" ]; then
    echo "FAIL: component property ${prop} is identical between A and B (${VA})"
    exit 1
  fi
done
echo "PASS: All 5 component properties differ between A and B"
```

If any check fails, regenerate the weaker variant's spec file with contrasting values.

### Step 4: Validate No Silent Fallbacks or Dead CSS Vars

```bash
# Check no silent theme bundle fallbacks remain (should warn or use requireEnv)
rg -n 'NEXT_PUBLIC_THEME_BUNDLE.*\|\|' --include='*.tsx' --include='*.ts' app/ | grep -v 'console.warn'

# Check no unresolvable palette fallbacks (warm-amber specifics)
rg -n 'resolveColor.*#b45309\|resolveColor.*#fef3c7\|resolveColor.*#fffbeb' --include='*.ts' lib/dimensions/

# Check all CSS vars emitted by compile.ts are consumed somewhere
node -e "
// Read the compile.ts source and list all --color-* and --*-* vars emitted
// Then grep for var(--xxx) references in globals.css and component files
const fs = require('fs');
const src = fs.readFileSync('lib/dimensions/compile.ts', 'utf-8');
const emitted = [...src.matchAll(/['\"](-{2}[a-z][a-z0-9-]+)['\"]/g)].map(m => m[1]);
const globals = fs.readFileSync('app/globals.css', 'utf-8');
const components = fs.readdirSync('components/', {recursive: true}).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
let allConsumerContent = globals;
for (const f of components) {
  try { allConsumerContent += fs.readFileSync('components/'+f, 'utf-8'); } catch {}
}
let foundIssue = false;
for (const v of emitted) {
  if (!allConsumerContent.includes(v)) {
    console.log('UNCONSUMED:', v);
    foundIssue = true;
  }
}
if (foundIssue) { console.log('FAIL: Unconsumed CSS vars found'); process.exit(1); }
else console.log('PASS: All emitted CSS vars are consumed');
"
```

### Step 5: Run Tests

```bash
npm run typecheck && npm run test:fast
```

Verify 100% pass rate before concluding.

### Step 6: Market Spectrum Positioning

After all audits pass, assess where the current theme setup sits on the determinism→freedom spectrum compared to the 2026 AI-driven website builder market. This contextualizes the tradeoffs inherent in the dimension architecture.

**Run the spectrum calculator:**

```bash
node -e "
const fs = require('fs');
const path = require('path');
const SPECS_DIR = 'content/dimensions/specs';

// === Counters ===
let rigid = 0, free = 0;

// 1. Fixed dimensions and variants (rigid)
rigid += 9; // exactly 9 dimensions
rigid += 3; // exactly 3 variants

// 2. Font library size (free per unique font used)
const fonts = new Set();
for (const f of fs.readdirSync(SPECS_DIR).filter(f => f.startsWith('typography-'))) {
  const spec = JSON.parse(fs.readFileSync(path.join(SPECS_DIR, f), 'utf-8'));
  if (spec.headingFont) fonts.add(spec.headingFont);
  if (spec.bodyFont) fonts.add(spec.bodyFont);
}
// Library of 8 available; credit 0.5 per distinct font pair used
free += Math.min(fonts.size, 8); // each unique font adds freedom

// 3. Palette hue spread across color specs (free: wider spread = more freedom)
const hues = [];
for (const f of fs.readdirSync(SPECS_DIR).filter(f => f.startsWith('color-'))) {
  const spec = JSON.parse(fs.readFileSync(path.join(SPECS_DIR, f), 'utf-8'));
  const p = spec.palette || spec.colors || {};
  const hex = p.primary;
  if (hex && typeof hex === 'string') {
    const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    if (max === min) hues.push(0);
    else {
      let h; if (max===r) h=(g-b)/(max-min)+(g<b?6:0); else if (max===g) h=(b-r)/(max-min)+2; else h=(r-g)/(max-min)+4;
      hues.push(h*60);
    }
  }
}
if (hues.length > 1) {
  const spread = Math.max(...hues) - Math.min(...hues);
  free += Math.min(spread / 60, 5); // up to +5 for wide spread
} else {
  rigid += 2; // limited palette range
}

// 4. Layout variant diversity (free per distinct variant value used across page-layout specs)
const layoutProps = ['heroVariant','navVariant','sectionContainer','cardVariant','footerVariant'];
const layoutValues = {};
for (const f of fs.readdirSync(SPECS_DIR).filter(f => f.startsWith('page-layout-'))) {
  const spec = JSON.parse(fs.readFileSync(path.join(SPECS_DIR, f), 'utf-8'));
  for (const prop of layoutProps) {
    if (spec[prop]) {
      if (!layoutValues[prop]) layoutValues[prop] = new Set();
      layoutValues[prop].add(spec[prop]);
    }
  }
}
for (const prop of layoutProps) {
  const count = (layoutValues[prop] || new Set()).size;
  free += count * 0.5; // each distinct variant value adds freedom
}
// If any layout dimension has only 1 value across all specs, that's rigid
for (const prop of layoutProps) {
  if ((layoutValues[prop] || new Set()).size <= 1) rigid += 1;
}

// 5. Spatial diversity (free per distinct value)
const spatialValues = {};
for (const f of fs.readdirSync(SPECS_DIR).filter(f => f.startsWith('spatial-'))) {
  const spec = JSON.parse(fs.readFileSync(path.join(SPECS_DIR, f), 'utf-8'));
  for (const k of ['containerMax','sectionPaddingY','contentAlign','heroEnabled']) {
    if (spec[k] !== undefined) {
      if (!spatialValues[k]) spatialValues[k] = new Set();
      spatialValues[k].add(String(spec[k]));
    }
  }
}
for (const k of Object.keys(spatialValues)) {
  free += Math.min((spatialValues[k] || new Set()).size, 3);
}

// 6. DaisyUI baseline (rigid: shared component library)
rigid += 4; // all components go through daisyUI

// 7. ThemeProvider + compile.ts constraints (rigid)
rigid += 3; // fixed compilation path, fixed CSS var names, fixed data flow

// 8. Spec-based architecture vs arbitrary generation (rigid)
rigid += 2; // spec files constrain possible output to predefined dimension schemas

// 9. Custom CSS / injected styles (free: grep for style={} with non-var values)
// This is approximate — counts inline styles that aren't using CSS vars as 'custom expression'
rigid += 1; // default penalty; overridden if free-form CSS is detected

// === Compute score ===
const total = rigid + free;
const pct = Math.round((free / total) * 100);

console.log('');
console.log('=== MARKET SPECTRUM POSITIONING ===');
console.log('');
console.log('Rigidity score:  ' + rigid);
console.log('Freedom score:   ' + free);
console.log('Position:        ' + pct + '% toward freedom/originality');
console.log('');

let bucket;
if (pct < 30) bucket = 'Template-based AI (Durable, Hostinger, GoDaddy)';
else if (pct < 50) bucket = 'Visual AI builders (Wix AI, 10Web, Squarespace AI)';
else if (pct < 70) bucket = 'Design-system AI (Framer AI, Webflow AI, TemplateCafe)';
else if (pct < 85) bucket = 'Hybrid code-gen (v0, Replit Agent)';
else bucket = 'Unconstrained code-gen (Lovable, Bolt.new, Base44)';

console.log('Market peer group: ' + bucket);
console.log('');

// Spectrum bar
const barWidth = 50;
const fill = Math.round((pct / 100) * barWidth);
const bar = '█'.repeat(fill) + '░'.repeat(barWidth - fill);
console.log('  0% ' + bar + ' 100%');
console.log('  Determinism' + ' '.repeat(barWidth - 18) + 'Freedom/Originality');
console.log('');

console.log('Comparison with 2026 AI website builders:');
console.log('  Durable / Hostinger AI     ' + (pct < 35 ? '<-- YOU ARE HERE' : ''));
console.log('  Wix AI / 10Web            ' + (pct >= 35 && pct < 50 ? '<-- YOU ARE HERE' : ''));
console.log('  Framer AI / Webflow AI    ' + (pct >= 50 && pct < 70 ? '<-- YOU ARE HERE' : ''));
console.log('  v0 / Replit Agent         ' + (pct >= 70 && pct < 85 ? '<-- YOU ARE HERE' : ''));
console.log('  Lovable / Bolt / Base44   ' + (pct >= 85 ? '<-- YOU ARE HERE' : ''));
console.log('');
console.log('Key tradeoff:');
if (pct < 50) {
  console.log('  Current setup prioritizes coherence and speed over originality.');
  console.log('  Sites will feel reliable but may share a \"house style.\"');
  console.log('  To move right on the spectrum: add more variant values per dimension,');
  console.log('  expand the font library, reduce daisyUI dependency, or add new dimensions.');
} else if (pct < 70) {
  console.log('  Current setup balances originality with systematic coherence.');
  console.log('  Sites will feel distinct but recognizably related (family-resemblant diversity).');
  console.log('  This is the design intent of the dimension architecture.');
} else {
  console.log('  Current setup prioritizes originality over consistency.');
  console.log('  Sites will feel independent but may lack a unified design system feel.');
  console.log('  To move left: add more shared utility classes, tighten the font library,');
  console.log('  or reduce the per-dimension variant count.');
}
"
```

**Interpret the output:**

- **<35%** — Your themes sit alongside Durable and Hostinger: fast to produce, but noticeable template DNA. Consider expanding per-dimension variant values and adding new specs.
- **35–50%** — Comparable to Wix AI and 10Web: solid AI-generated variety with some platform signature. Healthy middle ground for marketing sites.
- **50–70%** — Alongside Framer AI and Webflow AI: the sweet spot for the dimension architecture. Sites are distinct but coherently related. This is the intended operating range.
- **70–85%** — Approaching code-gen territory (v0, Replit): high originality, but may sacrifice the systematic coherence the dimension system provides.
- **85%+** — Full code-gen territory (Lovable, Bolt.new, Base44): maximum originality, minimum shared DNA. If you're here, the dimension system may be overly constraining for your use case.

**When to re-run this step:**
- After adding/modifying any dimension spec files
- After adding a new dimension to the system
- After expanding the font library
- After adding a new bundle config
- Before a production release, as a design-review checkpoint

---

## Audit Checklist

Run this after every theme generation or spec regeneration:

- [ ] Layer A: 0 hardcoded status colors (green/red/blue)
- [ ] Layer B: 0 hardcoded `text-stone-*` / `bg-amber-*` / `fill-amber-*` classes
- [ ] Layer C: 0 `bg-white` / `text-white` / `bg-black/*` outside exempted locations
- [ ] Layer D: 0 hardcoded non-color dimension values
- [ ] Layer E: 0 silent fallbacks (every `||` has a warning; no warm-amber bias; no duplicated constants)
- [ ] Layer F: 0 `card-themed` / `button-themed` / `image-themed` usages (all migrated to daisyUI)
- [ ] Layer F: CVA `Button` component replaced with daisyUI `btn`
- [ ] Layer F: Custom toast replaced with daisyUI `toast` + `alert`
- [ ] All 9 dimensions differ between every variant pair
- [ ] All 5 component properties differ between every variant pair
- [ ] Every emitted CSS var is consumed by at least one file
- [ ] `text-footer-link` class has a CSS definition
- [ ] TypeScript compiles, all tests pass
- [ ] Market spectrum position calculated and reviewed (Step 6)
- [ ] Position is in the intended operating range (50-70% for dimension architecture)

---

## Constraints

- **Do not** modify `node_modules/`, `.next/`, `content/`, `docs/`, or `skills/` files (except this skill)
- **Do not** add `// eslint-disable` comments
- **Do not** use `!important` declarations
- **Do not** change component logic or behavior — only color/styling classes, HTML structure, and component library usage
- **Do not** convert inline styles that already reference CSS vars (they are correct by design)
- **Do not** commit or push unless asked
- **Prefer daisyUI component classes** over custom CSS utility classes for all new or modified components
- **Expected false positives:** Some `gap-*`, `shadow-*`, `duration-*` may be in `className` alongside `style={{}}` that already references CSS vars — those are intentionally dual-path and should be skipped

## Related Documents

- `docs/techdebt/theme-rigidity.md` — comprehensive catalogue of remaining issues
- `lib/dimensions/compile.ts` — CSS variable compilation (emits daisyUI theme vars)
- `app/globals.css` — semantic utility class definitions (to be reduced as daisyUI migration progresses)
- `skills/theme-dimensions/SKILL.md` — dimension spec generation
- `skills/website-builder/SKILL.md` (Step 8b removed; use this skill instead)
- `node_modules/daisyui/components/` — daisyUI v5 component CSS (reference for available classes)

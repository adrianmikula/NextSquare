---
name: theme-uniqueness
description: >
  Audit the entire codebase for hardcoded, defaulted, or deterministic theme values that bypass
  the CSS variable system, and fix them so any 2 generated themes are truly unique and distinct
  in all dimensions. Run after dimension spec generation or whenever theme integrity is suspect.
  Includes a visual uniqueness reality check (Step 7 v2) that detects when spec-level uniqueness
  does not translate to visible thematic difference, with deep root cause detection: color-mix
  evaluation, component alias detection, dead dimension detection, and block-type identity audit.
---

# Theme Uniqueness Skill

> **v0.4.0** — Upgraded Step 7 to v2: color-mix evaluation, alias detection, dead dimension detection, block-type identity audit, page-layout diversity check, skeleton rigidity check

## Mission

Every theme value in the codebase must flow through a CSS custom property controlled by the
dimension spec system. Any hardcoded Tailwind class, silent fallback, default palette value, or
unconsumed CSS var represents a gap where generated themes will look identical.

Run this skill to:

1. **Audit** the entire codebase for violations across 12 detection layers
2. **Fix** every violation by converting to CSS vars / semantic utility classes / explicit config
3. **Verify** that all generated variant pairs differ in ALL controllable dimensions
4. **Validate** no silent fallbacks or dead CSS vars remain
5. **Reality-check** that spec-level uniqueness translates to visible visual difference (Step 7)

## Prerequisites

- The dimension system (`lib/dimensions/`) is installed and functional
- Dimension spec files exist under `content/dimensions/specs/` (at minimum color-a.json, color-b.json)
- `app/globals.css` defines `:root` fallbacks and `@layer components` utility classes
- The project compiles (`npm run typecheck` passes)

## Non-Negotiable Rules

1. **No hardcoded colors.** Every color class must be a semantic utility class (`.text-heading`, `.bg-card`, `.text-success`, etc.) or reference a CSS var directly. Tailwind scales (`text-stone-*`, `bg-amber-*`, `bg-green-*`) are violations.
2. **No silent fallbacks.** Every `|| "default"` or `?? "default"` must log a warning or throw.
3. **Themes must differ.** Any pair of generated themes must differ in ALL 9 dimensions and ALL 5 component properties. If they don't, regenerate the weaker variant.
4. **Every emitted CSS var must be consumed.** No dead code in `:root`.
5. **No `FALLBACK_NAME` duplication.** Shared fallback constants live in `lib/constants.ts`.
6. **No hardcoded business info.** Address, hours, social handles, CTA links must come from `siteProfile` or throw when missing.
7. **Prefer daisyUI as the standard component library over custom CSS solutions.** Custom utility classes (`.card-themed`, `.button-themed`, `.image-themed`, `.bg-section`, `.text-heading`) should be migrated to equivalent daisyUI component classes (`.card`, `.btn`, `.badge`, `.alert`, `.navbar`, `.footer`, `.hero`, `.input`, `.select`, `.table`, `.toast`, `.modal`) wherever a direct mapping exists. Custom CSS in `globals.css` that duplicates daisyUI component styles should be removed after migration. New components should use daisyUI classes by default, not custom ones.

---

## Workflow

```
Audit Codebase  →  Categorize Violations  →  Fix Layer by Layer  →  Verify Distinctness  →  Re-test  →  Market Spectrum  →  Visual Reality Check
```

### Step 1: Auditing the Codebase

Run the 12 detection layers below. Each layer catches a different category of hardcoding.
All grep commands with fix instructions live in `resources/uniqueness-layers.md`.

| Layer | Category | What it catches | Typical fix |
|-------|----------|-----------------|-------------|
| **A** | Status colours | `bg-green-*`, `text-red-*`, `bg-blue-*` etc. | Replace with `bg-success`, `text-error`, `bg-info` |
| **B** | Flat Tailwind scale | `text-stone-*`, `bg-amber-*`, `border-stone-*` | Replace with `text-heading`, `bg-section-cta`, `border-card` |
| **C** | White/black | `bg-white`, `text-white`, `bg-black/*` | Replace with `bg-card`, `bg-section`, `--color-overlay` |
| **D** | Dimension values | `max-w-7xl`, `py-24`, `gap-8`, `shadow-lg`, `duration-300` | Replace with `container-max`, `section-py`, `--grid-gap`, `--theme-shadow-card`, `--transition-speed` |
| **E** | Silent fallbacks | `\|\| "A"`, `\|\| "#b45309"`, duplicated `FALLBACK_NAME`, hardcoded business info | Add `console.warn` before fallback, extract constants to `lib/constants.ts` |
| **F** | Non-daisyUI CSS | `bg-section`, `text-heading`, `card-themed`, `button-themed`, `ToastContainer` | Migrate to daisyUI `card`, `btn`, `bg-base-*`, `toast` |
| **G** | Typography | `text-[*px]`, `leading-[*]`, `font-[*]`, `tracking-[*]` replace | Use `headingClass()`, `--line-height`, theme font weights, `--letter-spacing` |
| **H** | Spacing & sizing | `m-[*]`, `p-[*]`, `w-[*]`, `h-[*]`, `gap-[*]` arbitrary values | Use `section-py`/`section-px`, `--grid-gap`, theme spacing |
| **I** | Positioning & layout | `top-[*]`, `z-[*]`, `translate-[*]`, `min-h-[*]` | Use `--hero-min-height`, z-index scale, `--motion-*` vars |
| **J** | Border & divide colours | `border-gray-*`, `divide-stone-*`, `ring-amber-*` | Replace with `--color-border`, `border-card`, `--color-primary` |
| **K** | Arbitrary values | Any `[*px]`, `[*rem]`, `[*%]` not in exempted list | Evaluate each — add CSS var + spec field if theme-dependent |
| **L** | Inline styles | `style={{"#hex"}}`, `style={{"100px"}}` non-var values | Replace with `var(--color-*)`, `var(--nav-height)` etc. |

**All grep commands and full fix instructions:** `resources/uniqueness-layers.md`

To run a quick scan across all layers:
```bash
# Source only, exclude noise
SRC="components/ app/ lib/"
for layer in A B C D E F G H I J K L; do
  echo "=== Layer $layer ==="
  case $layer in
    A) grep -rn 'bg-green-\|text-green-\|bg-red-\|text-red-\|bg-blue-\|text-blue-' $SRC --include='*.tsx' 2>/dev/null ;;
    B) grep -rn 'text-stone-\|bg-amber-\|fill-amber-\|border-stone-' $SRC --include='*.tsx' 2>/dev/null ;;
    C) grep -rn 'class.*bg-white\|class.*text-white\|bg-black/' $SRC --include='*.tsx' 2>/dev/null ;;
    D) grep -rn 'max-w-6xl\|max-w-7xl\|py-20\|py-24\|gap-6\|gap-8\|gap-12' $SRC --include='*.tsx' 2>/dev/null | grep -v 'style=' ;;
    E) grep -rn 'NEXT_PUBLIC_THEME_BUNDLE.*||' $SRC --include='*.tsx' --include='*.ts' 2>/dev/null ;;
    F) grep -rn 'bg-section\|text-heading\|text-body\|text-muted\|card-themed\|button-themed' $SRC --include='*.tsx' 2>/dev/null | head -10 ;;
    G) grep -rn 'text-\[[0-9.]*px\|leading-\[[0-9.]*px\|font-\[[0-9]*\]\|tracking-\[' $SRC --include='*.tsx' 2>/dev/null ;;
    H) grep -rn 'min-h-\[[0-9.]*\(px\|rem\|vh\)' $SRC --include='*.tsx' 2>/dev/null ;;
    I) grep -rn 'z-\[[0-9]*\]' $SRC --include='*.tsx' 2>/dev/null ;;
    J) grep -rn 'border-\(gray\|slate\|zinc\|neutral\)-[0-9]' $SRC --include='*.tsx' 2>/dev/null ;;
    K) grep -rn '\[-?[0-9]\{1,4\}\(px\|rem\|%\)\]' $SRC --include='*.tsx' 2>/dev/null | grep -v 'style=' | grep -v 'var(' | head -5 ;;
    L) grep -rn 'style={[^}]*"#[0-9a-fA-F]\{3,6\}' $SRC --include='*.tsx' 2>/dev/null ;;
  esac
  echo ""
done
```

### Step 2: Fix by Category

For each violation found in Step 1, fix it before moving to the next category.
Priority order (most impactful first):

1. **Status colors** (Layer A) — most visible when wrong
2. **daisyUI migration** (Layer F) — replaces entire categories of custom CSS with standard library
3. **Silent fallbacks** (Layer E) — cause silent theme collapse
4. **Semantic utility migration** (Layer B, C) — bulk of remaining work
5. **Dimension values** (Layer D) — mechanical replacements
6. **Typography values** (Layer G) — affects readability consistency
7. **Spacing & sizing** (Layer H) — affects layout consistency
8. **Positioning & layout** (Layer I) — affects structural integrity
9. **Border & divide colors** (Layer J) — affects card/divider theming
10. **Arbitrary Tailwind values** (Layer K) — catch-all for uncategorized
11. **Inline style hardcodings** (Layer L) — catch-all for inline values
12. **Unconsumed CSS vars** — cleanup dead code

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

// 6. Component registry + block layouts (free: themes can pick different components & layouts per page slot)
// Blocker 2 (component registry) + Blocker 3 (block layout) from docs/techdebt/theme-freedom-spectrum.md
free += 8; // +5-8 for component overrides, +3-5 for block layouts (conservative combined estimate)

// 7. DaisyUI baseline (rigid: shared component library)
rigid += 4; // all components go through daisyUI

// 8. ThemeProvider + compile.ts constraints (rigid)
rigid += 3; // fixed compilation path, fixed CSS var names, fixed data flow

// 9. Spec-based architecture vs arbitrary generation (rigid)
rigid += 2; // spec files constrain possible output to predefined dimension schemas

// 10. Custom CSS / injected styles (free: grep for style={} with non-var values)
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

### Step 7: Visual Uniqueness Reality Check (v2 — Deep Root Cause Detection)

**Why this step exists:** The 12-layer audit (Steps 1-3) only verifies that spec-file values *differ on paper*. It does not compute what the compiled CSS variables actually *resolve to visually*. The compiler's `color-mix()` derivations, dead dimensions (wording/rhythm that produce zero CSS output), component aliases (overrides that point to the same function), and block-type identity (18 of 20+ block types sharing the same component) can all cause spec-level uniqueness to not translate to human-perceived uniqueness.

This step detects that gap and identifies the **root cause** (compiler collapse, dead dimension, alias, or block-type identity).

Run this check after every spec regeneration to catch cases where the analysis says "unique" but the human eye says "same."

```bash
node --input-type=module -e "
import { readFileSync, readdirSync } from 'fs';
import { createRequire } from 'module';

const DIMS = ['color','typography','spatial','components','motion','imagery','rhythm','wording','page-layout'];
const VARIANTS = readdirSync('content/dimensions/specs')
  .filter(f => f.endsWith('.json'))
  .map(f => f.match(/-(a|b|c)\.json$/)?.[1])
  .filter(Boolean)
  .filter((v,i,a) => a.indexOf(v) === i)
  .sort();

const NAMES = {a:'Theme A', b:'Theme B', c:'Theme C'};

// --- Helpers ---

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)];
}

function colorMix(fgHex, pct, bgHex) {
  // Replicate CSS color-mix(in srgb, fg pct%, bg)
  const fg = hexToRgb(fgHex), bg = hexToRgb(bgHex);
  if (!fg || !bg) return fgHex || bgHex || '#000';
  const t = pct / 100;
  const r = Math.round(fg[0]*t + bg[0]*(1-t));
  const g = Math.round(fg[1]*t + bg[1]*(1-t));
  const b = Math.round(fg[2]*t + bg[2]*(1-t));
  return '#'+[r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
}

function luminance(hex) {
  if (!hex || typeof hex !== 'string') return 0;
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r,g,b] = rgb.map(x => x/255).map(c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4));
  return 0.2126*r + 0.7152*g + 0.0722*b;
}

function fontCategory(font) {
  const serifs = ['fraunces','playfair','lora','merriweather','garamond','times','palatino'];
  const sans = ['inter','nunito','dm sans','space grotesk','helvetica','arial','roboto','open sans','montserrat','poppins','instrument sans'];
  const display = ['caveat','pacifico','alex brush','great vibes','lobster','bebas','anton','oswald'];
  const f = (font || '').toLowerCase();
  if (serifs.some(s => f.includes(s))) return 'serif';
  if (display.some(d => f.includes(d))) return 'display';
  if (sans.some(s => f.includes(s))) return 'sans-serif';
  return 'other';
}

function loadSpecs(v) {
  const specs = {};
  for (const d of DIMS) {
    try { specs[d] = JSON.parse(readFileSync('content/dimensions/specs/'+d+'-'+v+'.json','utf8')); }
    catch { specs[d] = {}; }
  }
  return specs;
}

// --- Step 7a: Compiled CSS Variable Values (with color-mix evaluation) ---
console.log('=== Step 7a: Compiled CSS Variable Values (color-mix evaluated) ===\n');

let totalCollapseWarnings = 0;
for (const v of VARIANTS) {
  const specs = loadSpecs(v);
  const c = specs.color;
  const p = c.palette ?? c.colors ?? {};

  const bg = typeof p.background === 'string' ? p.background : '#ffffff';
  const text = typeof p.text === 'string' ? p.text : '#111827';
  const surface = typeof p.surface === 'string' ? p.surface : '#f9fafb';
  const secondary = typeof p.secondary === 'string' ? p.secondary : '#f3f4f6';
  const border = typeof p.border === 'string' ? p.border : text;
  const primary = typeof p.primary === 'string' ? p.primary : '#6b7280';
  const accent = typeof p.accent === 'string' ? p.accent : '#6b7280';

  // Replicate compile.ts color-mix derivations
  const compiled = {
    '--color-section-bg': bg,
    '--color-section-bg-alt': secondary,
    '--color-section-bg-inverse': text,
    '--color-section-bg-cta': primary,
    '--color-heading': text,
    '--color-body': text,
    '--color-muted': colorMix(text, 55, bg),
    '--color-label': colorMix(text, 75, bg),
    '--color-link': colorMix(text, 85, bg),
    '--color-hero-bg': text,
    '--color-hero-text': bg,
    '--color-hero-muted': colorMix(bg, 65, text),
    '--color-card-bg': surface,
    '--color-card-border': border,
    '--color-nav-bg': colorMix(bg, 96, text),
    '--color-nav-link': colorMix(text, 85, bg),
    '--color-footer-bg': colorMix(bg, 90, text),
    '--color-footer-heading': colorMix(text, 80, bg),
    '--color-footer-muted': colorMix(text, 55, bg),
    '--color-cta-text': bg,
    '--color-primary': primary,
    '--color-accent': accent,
    '--color-price': primary,
    '--color-star': accent,
    '--color-link-hover': primary,
  };

  const uniqueValues = new Set(Object.values(compiled));
  const totalSlots = Object.keys(compiled).length;
  const collapsedCount = totalSlots - uniqueValues.size;

  console.log(NAMES[v] + ' (' + v.toUpperCase() + '):');
  console.log('  Distinct compiled values: ' + uniqueValues.size + ' / ' + totalSlots);
  console.log('  Collapsed via palette:    ' + collapsedCount + ' slots');

  // Show which slots collapse (value === another slot)
  if (collapsedCount > 0) {
    const seen = {};
    for (const [key, val] of Object.entries(compiled)) {
      if (seen[val] !== undefined) {
        console.log('    ' + key + ' = same as ' + seen[val] + ' (' + val + ')');
      } else {
        seen[val] = key;
      }
    }
  }

  if (collapsedCount > 8) {
    console.log('  ⚠️  High collapse: >8 slots resolve to the same value.');
    console.log('      Still dominated by too few unique color levels.');
    totalCollapseWarnings++;
  } else if (collapsedCount > 5) {
    console.log('  ⚠️  Moderate collapse: >5 slots share a value.');
    totalCollapseWarnings++;
  }
  console.log('');

  // Store for cross-theme comparison
  if (!globalThis._compiled) globalThis._compiled = {};
  globalThis._compiled[v] = compiled;
}

// --- Step 7b: Cross-theme compiled value similarity ---
console.log('=== Step 7b: Cross-Theme Compiled Value Comparison ===\n');

const pairs = [];
for (let i = 0; i < VARIANTS.length; i++) {
  for (let j = i + 1; j < VARIANTS.length; j++) {
    pairs.push([VARIANTS[i], VARIANTS[j]]);
  }
}

let realityScore = 100;

for (const [a, b] of pairs) {
  const ca = globalThis._compiled[a], cb = globalThis._compiled[b];
  console.log(NAMES[a] + ' vs ' + NAMES[b] + ' (compiled values):');

  let sameCount = 0;
  const totalSlots = Object.keys(ca).length;

  for (const slot of Object.keys(ca)) {
    const va = ca[slot].toLowerCase(), vb = cb[slot].toLowerCase();
    if (va === vb) {
      console.log('  IDENTICAL ' + slot + ': ' + va);
      sameCount++;
    }
  }

  const visualPct = Math.round(((totalSlots - sameCount) / totalSlots) * 100);
  realityScore = Math.min(realityScore, visualPct);
  console.log('  Distinct compiled slots: ' + (totalSlots - sameCount) + '/' + totalSlots + ' = ' + visualPct + '%');
  console.log('');
}

// --- Step 7c: Luminance diversity ---
console.log('=== Step 7c: Luminance & Contrast Pattern Diversity ===\n');

const bgLums = {}, textLums = {}, surfaceLums = {};
let allLightBg = true, allDarkText = true, allWhiteSurface = true;

for (const v of VARIANTS) {
  const c = globalThis._compiled[v];
  bgLums[v] = luminance(c['--color-section-bg']);
  textLums[v] = luminance(c['--color-heading']);
  surfaceLums[v] = luminance(c['--color-card-bg']);
  if (bgLums[v] < 0.5) allLightBg = false;
  if (textLums[v] > 0.1) allDarkText = false;
  if (surfaceLums[v] < 0.95) allWhiteSurface = false;
  console.log(NAMES[v] + ':');
  console.log('  Background luminance: ' + bgLums[v].toFixed(3) + ' (' + c['--color-section-bg'] + ')');
  console.log('  Card surface luminance: ' + surfaceLums[v].toFixed(3) + ' (' + c['--color-card-bg'] + ')');
  console.log('  Text luminance: ' + textLums[v].toFixed(3) + ' (' + c['--color-heading'] + ')');
  console.log('');
}

const maxBgDiff = Math.max(...Object.values(bgLums)) - Math.min(...Object.values(bgLums));
const maxTextDiff = Math.max(...Object.values(textLums)) - Math.min(...Object.values(textLums));
const maxSurfaceDiff = Math.max(...Object.values(surfaceLums)) - Math.min(...Object.values(surfaceLums));

console.log('Background luminance range: ' + (maxBgDiff * 100).toFixed(0) + '%');
console.log('Surface luminance range:    ' + (maxSurfaceDiff * 100).toFixed(0) + '%');
console.log('Text luminance range:       ' + (maxTextDiff * 100).toFixed(0) + '%');

let lumIssues = 0;
if (allLightBg) { console.log('⚠️  ALL light backgrounds — no dark/medium-bg variant'); lumIssues++; }
if (allDarkText) { console.log('⚠️  ALL dark text — no light/medium-text variant'); lumIssues++; }
if (allWhiteSurface) { console.log('⚠️  ALL surfaces near-white — cards look the same across themes'); lumIssues++; }
if (maxBgDiff < 0.2) { console.log('⚠️  Background spread < 20% — all backgrounds look like off-white'); lumIssues++; }
if (maxSurfaceDiff < 0.15) { console.log('⚠️  Surface spread < 15% — cards look the same'); lumIssues++; }
if (maxTextDiff < 0.15) { console.log('⚠️  Text spread < 15% — all text looks equally dark'); lumIssues++; }

// --- Step 7d: Font category overlap ---
console.log('\n=== Step 7d: Font Category Overlap ===\n');

const cats = {};
let fontOverlap = false;
for (const v of VARIANTS) {
  const spec = JSON.parse(readFileSync('content/dimensions/specs/typography-'+v+'.json','utf8'));
  const cat = fontCategory(spec.headingFont || 'Inter');
  if (!cats[cat]) cats[cat] = [];
  cats[cat].push(v);
  console.log(NAMES[v] + ': ' + spec.headingFont + ' → ' + cat);
}
console.log('');
for (const [cat, themes] of Object.entries(cats)) {
  if (themes.length > 1) {
    console.log('⚠️  Font category \"' + cat + '\" shared by: ' + themes.map(t => NAMES[t]).join(', '));
    fontOverlap = true;
  }
}
if (!fontOverlap) console.log('All heading font categories unique. ✓');

// Check if all 4 categories are used
const usedCats = Object.keys(cats);
const allCats = ['serif','sans-serif','display','monospace'];
const missingCats = allCats.filter(c => !usedCats.includes(c));
if (missingCats.length > 0) {
  console.log('ℹ️  Unused font categories: ' + missingCats.join(', ') + ' (consider adding for more diversity)');
}

// --- Step 7e: Component override map audit ---
console.log('\n=== Step 7e: Component Override Map Audit ===\n');

// Known component map from CmsRenderer.tsx
const COMPONENT_MAP = {
  'hero': 'CmsHero',
  'overlay-hero': 'CmsHero',
  'split-hero': 'CmsSplitHero',
  'text': 'CmsText',
  'products': 'CmsProducts',
  'testimonials': 'CmsTestimonials',
  'compact-testimonials': 'CmsCompactTestimonials',
  'carousel-testimonials': 'CmsCarouselTestimonials',
  'delivery': 'CmsDelivery',
  'hours': 'CmsHours',
  'gallery': 'CmsGallery',
  'cta': 'CmsCta',
  'services': 'CmsServices',
  'form': 'CmsForm',
  'faq': 'CmsFaq',
  'promo': 'CmsPromo',
  'slideshow': 'CmsSlideshow',
  'social-icons': 'CmsSocialIcons',
  'callout': 'CmsCallout',
  'hr': 'CmsHR',
  'image-text': 'CmsImageText',
  'comparison': 'CmsComparison',
  'logo': 'CmsLogo',
  'business-name': 'CmsBusinessName',
  'slogan': 'CmsSlogan',
  'nav': 'CmsNav',
  'sitemap': 'CmsSitemap',
  'announcement': 'CmsAnnouncement',
  'copyright': 'CmsCopyright',
  'phone': 'CmsPhone',
  'page-layout': '() => null',
};

// Find aliases (different names, same function)
const fnToNames = {};
for (const [name, fn] of Object.entries(COMPONENT_MAP)) {
  if (!fnToNames[fn]) fnToNames[fn] = [];
  fnToNames[fn].push(name);
}
console.log('Alias check:');
let aliasFound = false;
for (const [fn, names] of Object.entries(fnToNames)) {
  if (names.length > 1) {
    console.log('  ⚠️  \"' + names.join('\" / \"') + '\" all map to ' + fn);
    aliasFound = true;
  }
}
if (!aliasFound) console.log('  No aliases detected. ✓');

// Per-theme override block type count
console.log('');
const allBlockTypes = Object.keys(COMPONENT_MAP).filter(k => k !== 'page-layout');
const defaultTypes = ['hero','text','products','testimonials','delivery','hours','gallery','cta','services','form','faq','promo','slideshow','social-icons','callout','hr','image-text','comparison','logo','business-name','slogan','nav','sitemap','announcement','copyright','phone'];

let maxOverrideCount = 0;
for (const v of VARIANTS) {
  const spec = JSON.parse(readFileSync('content/dimensions/specs/page-layout-'+v+'.json','utf8'));
  const overrides = spec.componentOverrides || {};
  const overrideKeys = Object.keys(overrides);
  const overrideCount = overrideKeys.length;
  if (overrideCount > maxOverrideCount) maxOverrideCount = overrideCount;
  console.log(NAMES[v] + ': ' + overrideCount + ' block types overridden (of ' + defaultTypes.length + ' total)');
  if (overrideCount === 0) {
    console.log('  ⚠️  No component overrides — all blocks use default components');
  }
  for (const [blockType, overrideName] of Object.entries(overrides)) {
    const componentFn = COMPONENT_MAP[overrideName] || '(missing from COMPONENT_MAP!)';
    const defaultFn = COMPONENT_MAP[blockType] || '(default missing)';
    const isAlias = componentFn === defaultFn;
    if (isAlias) {
      console.log('  ⚠️  ' + blockType + ' → \"' + overrideName + '\" is alias for ' + defaultFn + ' (no visual difference)');
    } else {
      console.log('  ✓  ' + blockType + ' → \"' + overrideName + '\" (' + componentFn + ')');
    }
  }
}

const sharedTypeCount = defaultTypes.length - maxOverrideCount;
console.log('');
if (sharedTypeCount > 15) {
  console.log('⚠️  ' + sharedTypeCount + '/' + defaultTypes.length + ' block types use the default component across ALL themes.');
  console.log('  These blocks will look identical regardless of theme.');
  console.log('  Root cause: componentOverrides only covers hero and testimonials.');
  console.log('  Fix: Add override variants for text, cta, gallery, services blocks.');
}

// --- Step 7f: Dead dimension detection ---
console.log('\n=== Step 7f: Dead Dimension Detection ===\n');

// Wording dimension: compileWording returns {} in compile.ts
console.log('Wording dimension:');
const wordingSpecs = {};
for (const v of VARIANTS) {
  const spec = JSON.parse(readFileSync('content/dimensions/specs/wording-'+v+'.json','utf8'));
  wordingSpecs[v] = spec;
  console.log('  ' + NAMES[v] + ' tone: ' + (spec.tone || '(none)'));
}
console.log('  compileWording() returns {} — no CSS output');
console.log('  ⚠️  Wording dimension produces ZERO visible output.');
console.log('  Root cause: compile.ts line 65 returns {} for wording dimension.');
console.log('  Fix: Either emit CSS that affects text rendering, or remove the dimension.\n');

// Rhythm dimension: compileRhythm returns {} in compile.ts
console.log('Rhythm dimension:');
for (const v of VARIANTS) {
  const spec = JSON.parse(readFileSync('content/dimensions/specs/rhythm-'+v+'.json','utf8'));
  console.log('  ' + NAMES[v] + ': ' + JSON.stringify(spec).substring(0, 100));
}
console.log('  compileRhythm() returns {} — no CSS output');
console.log('  ⚠️  Rhythm dimension produces ZERO visible output.');
console.log('  Root cause: compile.ts line 329 returns {} for rhythm dimension.');
console.log('  Fix: Either emit spacing/rhythm CSS vars, or remove the dimension.\n');

// --- Step 7g: Page-layout variant diversity ---
console.log('=== Step 7g: Page-Layout Variant Diversity ===\n');

const layoutProps = ['heroVariant','navVariant','sectionContainer','cardVariant','footerVariant'];
const layoutValues = {};
for (const v of VARIANTS) {
  const spec = JSON.parse(readFileSync('content/dimensions/specs/page-layout-'+v+'.json','utf8'));
  console.log(NAMES[v] + ':');
  for (const prop of layoutProps) {
    const val = String(spec[prop] || '(not set)');
    if (!layoutValues[prop]) layoutValues[prop] = new Set();
    layoutValues[prop].add(val);
    console.log('  ' + prop + ': ' + val);
  }
  console.log('');
}

let layoutDiversityIssue = false;
console.log('Layout variant uniqueness:');
for (const prop of layoutProps) {
  const count = layoutValues[prop].size;
  if (count === 1) {
    console.log('  ⚠️  ' + prop + ': only 1 unique value across all themes (no variation)');
    layoutDiversityIssue = true;
  } else {
    console.log('  ✓  ' + prop + ': ' + count + ' unique values');
  }
}

// --- Step 7h: Page skeleton rigidity ---
console.log('\n=== Step 7h: Page Skeleton Rigidity ===\n');

console.log('All themes use the fixed skeleton: Header → blocks.map(render) → Footer');
console.log('No theme can reorder sections, inject decorative elements, or change page architecture.');
console.log('⚠️  Page skeleton is hardcoded in layout.tsx and identical across all themes.');
console.log('  Root cause: The layout component does not consume page-layout CSS vars');
console.log('  for structural changes (nav position is emitted as CSS but layout.tsx');
console.log('  HTML structure is fixed).');
console.log('  Fix: Make layout.tsx consume --nav-position, --nav-layout, --nav-width vars');
console.log('  to restructure the HTML skeleton per-theme.');

// --- Summary ---
console.log('\n═══════════════════════════════════════════════');
console.log('  VISUAL UNIQUENESS REALITY CHECK SUMMARY');
console.log('═══════════════════════════════════════════════\n');

console.log('  Lowest pair-wise compiled distinctness: ' + realityScore + '%');
console.log('  (12-layer audit typically reports:       70-80%)');
console.log('');

const gap = 75 - realityScore;
if (gap > 30) {
  console.log('  ⚠️  CRITICAL: Spec-level uniqueness (~75%) vs compiled visual uniqueness');
  console.log('      (' + realityScore + '%) differs by ' + gap + ' percentage points.');
  console.log('  Root cause: Compiler collapses semantic slots to too-few palette values.');
  console.log('  See docs/techdebt/visual-uniqueness-gap.md for fixes.');
} else if (gap > 15) {
  console.log('  ⚠️  MODERATE GAP: Visual uniqueness (' + realityScore + '%) notably lower.');
} else {
  console.log('  ✓  Compiled distinctness (' + realityScore + '%) aligns with spec-level analysis.');
}

// Overall health summary
console.log('');
console.log('  DIMENSION HEALTH:');
if (totalCollapseWarnings > 0) console.log('  ❌ Color collapse: ' + totalCollapseWarnings + ' theme(s) with >5 collapsed slots');
else console.log('  ✓  Color collapse: none');
if (lumIssues > 0) console.log('  ❌ Luminance: ' + lumIssues + ' issue(s)');
else console.log('  ✓  Luminance: diverse');
if (fontOverlap) console.log('  ❌ Font categories: overlap detected');
else console.log('  ✓  Font categories: all unique');
if (maxOverrideCount < 2) console.log('  ❌ Component overrides: <2 block types overridden');
else console.log('  ✓  Component overrides: ' + maxOverrideCount + ' block types overridden');
console.log('  ❌ Dead dimensions: wording, rhythm (both return {} from compiler)');
console.log('  ❌ Page skeleton: fixed across all themes');
console.log('');
console.log('  See docs/techdebt/visual-uniqueness-gap.md for full root cause analysis.');
console.log('');
"
```

**Interpret the output:**

- **Step 7a (Compiled values):** Shows the actual rendered color values including `color-mix()` derivations. Fewer collapsed slots than raw palette check. Each collapsed slot is named so you can see which pairs are identical.
- **Step 7b (Cross-theme):** Percentage of compiled CSS var values that differ between each theme pair. >80% is good; <60% means themes look very similar.
- **Step 7c (Luminance):** Background, surface, and text luminance across themes. Flags if all themes are light-bg dark-text or have narrow spread.
- **Step 7d (Font categories):** Detects when 2+ themes share a font category (serif/sans/display/mono). Also flags unused categories.
- **Step 7e (Component overrides):** Detects aliases in COMPONENT_MAP (different names → same function). Counts how many block types each theme overrides vs default. Flags when >15/25 block types are shared defaults.
- **Step 7f (Dead dimensions):** Detects wording and rhythm dimensions that produce zero CSS output from `compile.ts`. These are spec dimensions that exist on paper but do nothing visually.
- **Step 7g (Layout diversity):** Checks how many unique values each page-layout property (heroVariant, navVariant, etc.) has across themes. Singletons mean no variation in that layout dimension.
- **Step 7h (Skeleton rigidity):** Documents that all themes share the same fixed HTML skeleton.

**When to investigate:**
- Compiled distinctness < 80% (themes share too many resolved CSS values)
- Any theme has >8 collapsed compiled slots
- Background luminance spread < 20%
- Any font category shared by 2+ themes
- <2 block types overridden per theme (component identity issue)
- wording or rhythm dimensions are dead (zinc output)
- Any page-layout property has only 1 unique value
- Gap between audit score (~75%) and compiled score > 15pp

---

## Audit Checklist

Run this after every theme generation or spec regeneration:

- [ ] **Layer A** — 0 hardcoded status colours (green/red/blue Tailwind scale)
- [ ] **Layer B** — 0 hardcoded flat Tailwind scale colours (`text-stone-*`, `bg-amber-*`, etc.)
- [ ] **Layer C** — 0 `bg-white` / `text-white` / `bg-black/*` outside exempted locations
- [ ] **Layer D** — 0 hardcoded dimension values (`max-w-*`, `py-*`, `gap-*`, `shadow-*`, `duration-*`)
- [ ] **Layer E** — 0 silent fallbacks (every `||` has a warning; no warm-amber bias; no duplicated constants)
- [ ] **Layer F** — 0 custom daisyUI violations (no `card-themed`, `button-themed`; use daisyUI components)
- [ ] **Layer G** — 0 hardcoded typography arbitrary values (`text-[*]`, `leading-[*]`, `font-[*]`)
- [ ] **Layer H** — 0 hardcoded spacing/sizing arbitrary values (`m-[*]`, `p-[*]`, `w-[*]`, `h-[*]`, `gap-[*]`)
- [ ] **Layer I** — 0 hardcoded positioning/layout arbitrary values (`z-[*]`, `min-h-[*]`, `translate-[*]`)
- [ ] **Layer J** — 0 hardcoded border/divide/ring Tailwind scale colours (`border-gray-*`, `divide-stone-*`)
- [ ] **Layer K** — 0 hardcoded arbitrary values (`[*px]`, `[*rem]`, `[*%]`) — each evaluated
- [ ] **Layer L** — 0 hardcoded inline style non-var values (hex colours, numeric px)
- [ ] All 9 dimensions differ between every variant pair
- [ ] All 5 component properties differ between every variant pair
- [ ] Every emitted CSS var is consumed by at least one file
- [ ] `text-footer-link` class has a CSS definition
- [ ] TypeScript compiles, all tests pass
- [ ] Market spectrum position calculated and reviewed (Step 6)
- [ ] Position is in the intended operating range (50-70% for dimension architecture)
- [ ] Visual uniqueness reality check (Step 7) shows < 30pp gap from spec-level analysis
- [ ] No font category overlap across themes
- [ ] At least one theme has a non-white surface or non-light background
- [ ] Component overrides reference genuinely different components (no aliases)

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
- `docs/techdebt/visual-uniqueness-gap.md` — root causes of the gap between spec-level and rendered visual uniqueness
- `docs/techdebt/alternative-architecture.md` — research on open-source highest-uniqueness generators and proposed Next.js architecture for 60-80% spectrum position
- `lib/dimensions/compile.ts` — CSS variable compilation (emits daisyUI theme vars)
- `app/globals.css` — semantic utility class definitions (to be reduced as daisyUI migration progresses)
- `skills/theme-dimensions/SKILL.md` — dimension spec generation
- `skills/website-builder/SKILL.md` (Step 8b removed; use this skill instead)
- `node_modules/daisyui/components/` — daisyUI v5 component CSS (reference for available classes)

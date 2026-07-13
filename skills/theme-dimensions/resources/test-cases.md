# Test Cases — theme-dimensions

Example invocations with expected outputs for all 4 capabilities.

---

## Capability: Define Dimension Spec

### TC-1: Load existing color-a spec

**Input:**
```
dimension: "color"
variant: "A"
```

**Expected output:**
```json
{
  "harmony": "analogous",
  "chroma": "warm",
  "backgroundType": "gradient",
  "backgroundValue": "linear-gradient(180deg, #FFFAF5 0%, #F5E6D3 100%)",
  "palette": {
    "primary": "#D4845A",
    "secondary": "#FFF0E0",
    "background": "#FFFAF5",
    "surface": "#FFFFFF",
    "text": "#2C1810",
    "accent": "#E8A87C",
    "border": "#E8D5C4"
  }
}
```

### TC-2: Load non-existent spec

**Input:**
```
dimension: "color"
variant: "C"
```

**Expected output:** `null`

### TC-3: Load spec with invalid JSON (corrupt file)

**Expected output:** `null`
**Handling:** Return null, no exception thrown.

---

## Capability: Resolve Dimension State

### TC-4: Default state (no params)

**Input:**
```
searchParams: {}
bundles: []
```

**Expected output:**
```json
{
  "spatial": "A", "color": "A", "typography": "A", "wording": "A",
  "imagery": "A", "components": "A", "rhythm": "A", "motion": "A"
}
```

### TC-5: Bundle A

**Input:**
```
searchParams: { bundle: "a" }
bundles: [
  { id: "A", dimensions: { spatial: "A", color: "A", typography: "A", wording: "A", imagery: "A", components: "A", rhythm: "A", motion: "A" } },
  { id: "B", dimensions: { spatial: "B", color: "B", typography: "B", wording: "B", imagery: "B", components: "B", rhythm: "B", motion: "B" } }
]
```

**Expected output:**
```json
{
  "spatial": "A", "color": "A", "typography": "A", "wording": "A",
  "imagery": "A", "components": "A", "rhythm": "A", "motion": "A"
}
```

### TC-6: Bundle B with color override

**Input:**
```
searchParams: { bundle: "b", color: "a" }
bundles: [ ... same as TC-5 ... ]
```

**Expected output:**
```json
{
  "spatial": "B", "color": "A", "typography": "B", "wording": "B",
  "imagery": "B", "components": "B", "rhythm": "B", "motion": "B"
}
```

### TC-7: Per-dimension only (no bundle)

**Input:**
```
searchParams: { spatial: "b", components: "b" }
bundles: [ ... ]
```

**Expected output:**
```json
{
  "spatial": "B", "color": "A", "typography": "A", "wording": "A",
  "imagery": "A", "components": "B", "rhythm": "A", "motion": "A"
}
```

### TC-8: Unknown bundle ID falls back to first bundle

**Input:**
```
searchParams: { bundle: "z" }
bundles: [ { id: "A", dimensions: { ... all A ... } } ]
```

**Expected output:** All dimensions = "A" (first bundle, or all-A default)

### TC-9: Invalid variant value is ignored

**Input:**
```
searchParams: { color: "z" }
bundles: []
```

**Expected output:** All dimensions = "A" (bad override ignored)

---

## Capability: Compile Dimensions to CSS

### TC-10: Compile color spec only

**Input:**
```json
{
  "color": {
    "harmony": "analogous",
    "chroma": "warm",
    "backgroundType": "gradient",
    "backgroundValue": "linear-gradient(180deg, #FFFAF5 0%, #F5E6D3 100%)",
    "palette": {
      "primary": "#D4845A",
      "secondary": "#FFF0E0",
      "background": "#FFFAF5",
      "surface": "#FFFFFF",
      "text": "#2C1810",
      "accent": "#E8A87C",
      "border": "#E8D5C4"
    }
  }
}
```

**Expected output (key vars):**
```json
{
  "--color-primary": "#D4845A",
  "--color-secondary": "#FFF0E0",
  "--color-background": "#FFFAF5",
  "--color-harmony": "analogous",
  "--color-chroma": "warm",
  "--color-background-type": "gradient",
  "--color-background-value": "linear-gradient(180deg, #FFFAF5 0%, #F5E6D3 100%)"
}
```

### TC-11: All null specs

**Input:** `{ spatial: null, color: null, ... }`

**Expected output:** `{}` (empty map)

### TC-12: Partial spec with missing fields

**Input:** `{ "typography": { "headingFont": "Playfair Display" } }`

**Expected output:** Heading font overridden, all other typography fields use config defaults (bodyFont = "Inter", headingWeight = 600, etc.)

### TC-13: Unknown shadow key

**Input:** `{ "components": { "cardShadow": "super" } }`

**Expected output:** `--theme-shadow-card` falls back to "md" shadow value

---

## Capability: Manage Bundle Configs

### TC-14: Load bundle A

**Input:** `bundle: "a"`

**Expected output:**
```json
{
  "name": "Coastal Mornings",
  "description": "Warm coastal tones, friendly tone, standard layout",
  "dimensions": {
    "spatial": "A", "color": "A", "typography": "A", "wording": "A",
    "imagery": "A", "components": "A", "rhythm": "A", "motion": "A"
  }
}
```

### TC-15: List available bundles

**Expected output:** `["A", "B", "C"]` (based on current content/dimensions/bundles/)

### TC-16: Load non-existent bundle

**Input:** `bundle: "z"`

**Expected output:** `null`

---

## Capability: Verify Dimension Delta

### TC-17: Typography delta passes — 100% (current specs)

**Input:**
```json
{
  "specA": { "headingFont": "Nunito", "bodyFont": "Inter", "headingWeight": 700, "bodyWeight": 400, "headingCase": "uppercase", "letterSpacing": "normal", "lineHeight": 1.6, "scale": 1.25 },
  "specB": { "headingFont": "Playfair Display", "bodyFont": "Lora", "headingWeight": 600, "bodyWeight": 300, "headingCase": "normal", "letterSpacing": "0.02em", "lineHeight": 1.5, "scale": 1.2 },
  "dimension": "typography"
}
```

**Expected output:**
```json
{ "passes": true, "deltaPercent": 100, "totalFields": 8, "differingFields": 8 }
```

**Reasoning:** All 8 fields differ between A and B variants. 100% >= 80% ✓.

### TC-18: Color delta passes — 100% (current specs)

**Input:**
```json
{
  "specA": { "harmony": "analogous", "chroma": "warm", "backgroundType": "gradient", "backgroundValue": "linear-gradient(180deg, #FFFAF5 0%, #F5E6D3 100%)", "palette": { "primary": "#D4845A", "secondary": "#FFF0E0", "background": "#FFFAF5", "surface": "#FFFFFF", "text": "#2C1810", "accent": "#E8A87C", "border": "#E8D5C4" } },
  "specB": { "harmony": "monochromatic", "chroma": "muted", "backgroundType": "color", "backgroundValue": "#FAFAFA", "palette": { "primary": "#5D4037", "secondary": "#EFEBE9", "background": "#FAFAFA", "surface": "#FFFFFF", "text": "#212121", "accent": "#A1887F", "border": "#D7CCC8" } },
  "dimension": "color"
}
```

**Expected output:**
```json
{ "passes": true, "deltaPercent": 100, "totalFields": 5, "differingFields": 5 }
```

**Reasoning:** 5 of 5 shared top-level fields differ (harmony, chroma, backgroundType, backgroundValue, palette). Note: `palette` is treated as a single nested value — the whole palette object must differ for `palette` to count as differing. 100% >= 80% ✓.

### TC-19: Motion delta passes — 83.3% (current specs)

**Input:**
```json
{
  "specA": { "transitionSpeed": "fast", "transitionEasing": "ease-out", "hoverLift": true, "fadeIn": true, "smoothScroll": true, "staggerEnabled": true },
  "specB": { "transitionSpeed": "slow", "transitionEasing": "ease", "hoverLift": false, "fadeIn": false, "smoothScroll": false, "staggerEnabled": false },
  "dimension": "motion"
}
```

**Expected output:**
```json
{ "passes": true, "deltaPercent": 83.3, "totalFields": 6, "differingFields": 5 }
```

**Reasoning:** 5 of 6 fields differ (transitionSpeed, transitionEasing, hoverLift, fadeIn, smoothScroll). staggerEnabled is same (true in both). 83.3% >= 80% ✓.

### TC-20: Delta skipped when user requests similarity

**Input:**
```
mode: "copy-and-tweak"
dimension: "color"
```

**Expected output:**
```json
{ "passes": true, "deltaPercent": null, "totalFields": null, "differingFields": null, "skipped": true }
```

**Reasoning:** When mode is "copy-and-tweak" or "similar", the delta check is skipped entirely regardless of similarity. Response includes `skipped: true`.

### TC-21: Null spec is skipped gracefully

**Input:**
```json
{
  "specA": null,
  "specB": { "headingFont": "Playfair Display", "bodyFont": "Inter" },
  "dimension": "typography"
}
```

**Expected output:**
```json
{ "passes": true, "deltaPercent": null, "totalFields": null, "differingFields": null, "skipped": true }
```

**Reasoning:** Cannot compute delta with missing spec. Return pass with skipped flag.

### TC-22: Components delta passes — 76.5% (current specs, just under 80%)

**Input:** components-a.json vs components-b.json (from project)

**Expected output:**
```json
{ "passes": false, "deltaPercent": 76.5, "totalFields": 17, "differingFields": 13 }
```

**Reasoning:** 13 of 17 fields differ. borderWidth, borderStyle, buttonStyle, navHeight are identical across all variants. 76.5% < 80% — 1 more differing field needed. If `navHeight` or `borderWidth` were changed to vary, or if a new component field were added that differs, it would pass.

### TC-23: Verification disabled via config

**Input:**
```
config: { verification: { delta: { enabled: false } } }
```

**Expected output:** The verification capability returns `{ "passes": true, "skipped": true }` for any dimension without inspecting specs. The caller should not report delta failures when verification is disabled.

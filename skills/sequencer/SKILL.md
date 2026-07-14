# Sequencer Skill — Industry-Aware Page Assembly

Build the algorithm that selects, orders, and paces sections for a given industry and tone.

## Architecture

```
industry + tone → profile lookup → template selection → slot filling → pacing check → SiteConfig
```

## Industry Profiles (`src/generator/sequencer/industry-profiles.ts`)

```typescript
interface IndustryProfile {
  industry: string
  preferredGenes: { category: string; variants: string[] }[]
  template: string
  defaultTuners: Record<string, number>
  defaultArchetype: { relief: string; finish: string }
  toneGuidance: string
}
```

## Section Templates (`src/generator/sequencer/section-templates.ts`)

12 rhythm patterns defining 5-8 section slots:

- Storyteller: hero → features → testimonials → cta → footer
- Showcase: hero → gallery → features → pricing → cta → footer
- Minimal: hero → features → cta → footer
- Data-heavy: hero → stats → features → pricing → testimonials → cta → footer

## Pacing Rules

1. No same-category sections adjacent
2. At least 3 different layout patterns on page
3. CTA above the fold
4. Break up text-heavy sections with visual sections

## Testing

```bash
# Verify sequencer output (Phase 4+):
npm run dev -- --sequence cafe
npm run dev -- --sequence saas
npm run dev -- --sequence portfolio
```

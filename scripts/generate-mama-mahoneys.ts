import { assemble, VALID_INDUSTRIES, VALID_TEMPLATE_IDS, VALID_RELIEFS, VALID_FINISHES, VALID_SHAPES } from "@/src/generator/sequencer/assemble"
import { writeFileSync } from "fs"

const industry = "restaurant"
const templateId = "storyteller"
const designLanguage = { relief: "skeuomorphic" as const, finish: "glossy" as const, shape: "clothoid" as const }
const tuners = { warmth: 0.8, density: 0.2, motion: 0.3, contrast: 0.4, narrative: 0.7 }

if (!VALID_INDUSTRIES.includes(industry)) {
  throw new Error(`Invalid industry: ${industry}`)
}
if (!VALID_TEMPLATE_IDS.includes(templateId)) {
  throw new Error(`Invalid templateId: ${templateId}`)
}
if (!VALID_RELIEFS.includes(designLanguage.relief)) {
  throw new Error(`Invalid relief: ${designLanguage.relief}`)
}
if (!VALID_FINISHES.includes(designLanguage.finish)) {
  throw new Error(`Invalid finish: ${designLanguage.finish}`)
}
if (!VALID_SHAPES.includes(designLanguage.shape)) {
  throw new Error(`Invalid shape: ${designLanguage.shape}`)
}

const result = assemble({
  industry,
  tone: "classic american diner, bold reds and whites, retro 50s feel",
  name: "Mama Mahoney's",
  designLanguage,
  templateId,
  tuners,
})

const config = result.config

config.meta.name = "Mama Mahoney's"
config.meta.tone = "classic american diner, bold reds and whites, retro 50s feel"

const elements = config.spec.elements as Record<string, { type: string; props: Record<string, unknown>; children: string[] }>

const hero = elements.hero
hero.props.headline = "Mama Mahoney's"
hero.props.subheadline = "Classic American burgers, hand-cut fries, and thick shakes — just like Mama used to make. Serving the neighborhood since 1952."
hero.props.ctaLabel = "View Our Menu"
hero.props.ctaLink = "#menu"

const features1 = elements["features-1"]
features1.props.headline = "The Mahoney's Classics"
features1.props.items = [
  { title: "Hand-Pressed Burgers", description: "Fresh never frozen — 100% American beef, ground daily, smashed to order on a seasoned flat-top. Served on a toasted brioche bun." },
  { title: "Hand-Cut Fries", description: "Russet potatoes cut fresh every morning, double-fried to golden perfection. Served with our secret seasoning blend." },
  { title: "Thick Shakes & Floats", description: "Real ice cream, whole milk, and house-made syrups blended thick enough to stand a straw in. Ten rotating flavours weekly." },
]

const features2 = elements["features-2"]
features2.props.headline = "The Diner Experience"
features2.props.items = [
  { title: "Red Leather Booths", description: "Sink into a classic red vinyl booth beneath gleaming chrome trim. Each table has its own jukebox selector with hits from the 50s through today." },
  { title: "Open Kitchen Counter", description: "Watch the short-order crew work their magic on the flat-top grill. Sizzle, smoke, and showmanship — breakfast served all day." },
]

const cta = elements.cta
cta.props.headline = "Pull up a stool. The coffee's always on."
cta.props.ctaLabel = "Find Your Nearest Location"
cta.props.ctaLink = "#locations"

config.content = {
  "hero-headline": "Mama Mahoney's",
  "hero-subheadline": "Classic American burgers, hand-cut fries, and thick shakes — just like Mama used to make. Serving the neighborhood since 1952.",
  "features-1-headline": "The Mahoney's Classics",
  "features-1-items": JSON.stringify(features1.props.items),
  "features-2-headline": "The Diner Experience",
  "features-2-items": JSON.stringify(features2.props.items),
  "cta-headline": "Pull up a stool. The coffee's always on.",
  "cta-subheadline": "",
  "cta-label": "Find Your Nearest Location",
}

console.log("Industry:", result.profile.industry)
console.log("Template:", result.template.id)
console.log("Archetype:", JSON.stringify(config.designLanguage))
console.log("Tuners:", JSON.stringify(config.tuners))
console.log("Sections:", result.sectionAssignments.map(s => `${s.category}:${s.variant}`).join(" → "))

const outputPath = new URL("../src/test-configs/mama-mahoneys.json", import.meta.url)
writeFileSync(outputPath, JSON.stringify(config, null, 2) + "\n")
console.log("Written to:", outputPath.pathname)

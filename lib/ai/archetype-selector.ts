import type { LayoutOutput } from "@/lib/schemas"
import { LayoutOutputSchema } from "@/lib/schemas"

export type ArchetypeSelectorInput = {
  businessProfile: Record<string, unknown>
  archetypeCatalog: {
    archetypes: Record<string, {
      blocks: string[]
      bestFor?: string[]
      minData?: Record<string, string>
      excludes?: string[]
      typicalOrder?: number
    }>
    blockVocabulary: Record<string, { description: string }>
  }
  selectionRules: Array<{ condition: string; archetype: string; page: string }>
}

export type ArchetypeSelectorResult = {
  success: boolean
  output?: LayoutOutput
  source: "llm" | "fallback"
  error?: string
}

const SYSTEM_PROMPT = `You are a web designer selecting page layouts and block orders for a small business website.

Rules:
1. Only select from the provided archetype names.
2. For each page, select the best archetype and produce TWO distinct block orderings.
3. Both orderings must use only blocks from the selected archetype's set.
4. Variant A should be feature-forward (lift gallery/testimonials/services based on business strengths).
5. Variant B should be conservative (closer to the archetype's typicalOrder hint).
6. hero must always be first if present in the archetype block set.
7. cta must be placed no earlier than position 2.
8. Respect minData gates: if the profile lacks required data, do not select that archetype.
9. Return exactly the JSON schema provided.
10. Do not invent archetype names not in the catalog.

Output format per page:
{
  "page": "<page-slug>",
  "archetype": "<ARCHETYPE_NAME>",
  "variants": [
    { "id": "A", "order": ["hero","gallery","text","products","cta"], "reasoning": "Feature-forward for visually-rich business" },
    { "id": "B", "order": ["hero","text","products","cta"], "reasoning": "Conservative default" }
  ]
}`

const RESPONSE_SCHEMA_DESCRIPTION = `{
  "selected": {
    "<page-slug>": {
      "archetype": "<ARCHETYPE_NAME>",
      "variants": [
        { "id": "A", "order": ["hero","text","products","cta"], "reasoning": "..." },
        { "id": "B", "order": ["hero","products","text","cta"], "reasoning": "..." }
      ]
    }
  },
  "reasoning": "<optional summary of choices>"
}`

export async function selectArchetypesWithLLM(
  input: ArchetypeSelectorInput,
  llmCall: (prompt: string, systemPrompt: string) => Promise<string>,
): Promise<ArchetypeSelectorResult> {
  const userPrompt = buildUserPrompt(input)

  try {
    const raw = await llmCall(userPrompt, SYSTEM_PROMPT)
    const parsed = JSON.parse(raw)
    const validated = LayoutOutputSchema.parse(parsed)
    return { success: true, output: validated, source: "llm" }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, source: "llm", error: message }
  }
}

export function selectArchetypesFallback(input: ArchetypeSelectorInput): LayoutOutput {
  const selected: Record<string, { archetype: string; variants: LayoutVariant[] }> = {}

  for (const rule of input.selectionRules) {
    const page = rule.page
    if (selected[page]) continue

    if (evaluateCondition(rule.condition, input.businessProfile)) {
      if (archetypePassesGate(rule.archetype, input.businessProfile, input.archetypeCatalog)) {
        const archetypeBlocks = input.archetypeCatalog.archetypes[rule.archetype]?.blocks ?? []
        selected[page] = {
          archetype: rule.archetype,
          variants: buildFallbackVariants(rule.archetype, archetypeBlocks, input.businessProfile),
        }
      }
    }
  }

  return { selected, reasoning: "Rule-based fallback selection with two layout variants." }
}

function buildFallbackVariants(
  archetypeName: string,
  blocks: string[],
  _profile: Record<string, unknown>
): LayoutVariant[] {
  const canonical = [...blocks]
  const featureForward = arrangeFeatureForward(archetypeName, [...blocks])

  return [
    {
      id: "A",
      archetype: archetypeName,
      order: featureForward,
      reasoning: `Feature-forward ordering for ${archetypeName} based on business signals.`,
    },
    {
      id: "B",
      archetype: archetypeName,
      order: canonical,
      reasoning: `Conservative canonical ordering for ${archetypeName}.`,
    },
  ]
}

function arrangeFeatureForward(archetypeName: string, order: string[]): string[] {
  const heroIdx = order.indexOf("hero")
  if (heroIdx > 0) {
    order.unshift(order.splice(heroIdx, 1)[0])
  }

  const featureBlocks = ["gallery", "testimonials", "services", "products"]
  let lifted: string | null = null
  for (const block of featureBlocks) {
    if (order.includes(block)) {
      lifted = block
      break
    }
  }

  if (lifted && lifted !== "hero") {
    const idx = order.indexOf(lifted)
    if (idx > 1) {
      order.unshift(order.splice(idx, 1)[0])
    }
  }

  const ctaIdx = order.indexOf("cta")
  if (ctaIdx >= 0 && ctaIdx < 2) {
    order.splice(ctaIdx, 1)
    order.push("cta")
  }

  if (order[0] !== "hero" && order.includes("hero")) {
    const hIdx = order.indexOf("hero")
    const [hero] = order.splice(hIdx, 1)
    order.unshift(hero)
  }

  return order
}

function buildUserPrompt(input: ArchetypeSelectorInput): string {
  const archetypesJson = JSON.stringify(input.archetypeCatalog, null, 2)
  const rulesJson = JSON.stringify(input.selectionRules, null, 2)
  const profileJson = JSON.stringify(input.businessProfile, null, 2)

  return `## Archetype Catalog
${archetypesJson}

## Selection Rules
${rulesJson}

## Business Profile
${profileJson}

## Required Output Schema
Return a JSON object matching this schema:
${RESPONSE_SCHEMA_DESCRIPTION}

Select an archetype with two layout variants for each of these pages: ${input.selectionRules.map(r => r.page).join(", ")}.

Respond with ONLY the JSON object.`
}

function evaluateCondition(condition: string, profile: Record<string, unknown>): boolean {
  const trimmed = condition.trim()
  if (trimmed === "true") return true
  if (trimmed === "false") return false

  const safeProfile = profile as Record<string, unknown>
  const media = (safeProfile.media as Record<string, unknown>) ?? {}
  const gallery = (media.gallery as string[]) ?? []

  if (condition.includes("media.gallery.length >= 5") && gallery.length >= 5) return true
  if (condition.includes("media.gallery.length >= 3") && gallery.length >= 3) return true
  if (condition.includes("features") && Array.isArray(safeProfile.features)) {
    const features = safeProfile.features as string[]
    for (const feature of features) {
      if (condition.includes(`"${feature}"`) || condition.includes(`'${feature}'`)) return true
    }
  }
  if (condition.includes("audience") && safeProfile.audience === "tourists") return true
  if (condition.includes("services") && Array.isArray(safeProfile.services) && (safeProfile.services as unknown[]).length > 0) return true
  if (condition.includes("testimonials") && Array.isArray(safeProfile.testimonials) && (safeProfile.testimonials as unknown[]).length >= 3) return true
  if (condition.includes("description.length >= 50") && typeof safeProfile.description === "string" && safeProfile.description.length >= 50) return true
  if (condition.includes("phone") && typeof safeProfile.phone === "string" && safeProfile.phone) return true
  if (condition.includes("location.address") && typeof (safeProfile.location as Record<string, unknown>)?.address === "string") return true
  if (condition.includes("catalogue.categories.length > 0")) {
    const catalogue = (safeProfile.catalogue as Record<string, unknown>) ?? {}
    const categories = (catalogue.categories as string[]) ?? []
    if (categories.length > 0) return true
  }
  if (condition.includes("features") && condition.includes("faq") && Array.isArray(safeProfile.features)) {
    if ((safeProfile.features as string[]).includes("faq")) return true
  }
  if (condition.includes("type in") && typeof safeProfile.type === "string") {
    const match = condition.match(/\{(.+?)\}/)
    if (match) {
      const allowedTypes = match[1].split(",").map((t) => t.trim())
      if (allowedTypes.includes((safeProfile.type as string).toLowerCase())) return true
    }
  }

  return false
}

function archetypePassesGate(
  archetypeName: string,
  profile: Record<string, unknown>,
  catalog: ArchetypeSelectorInput["archetypeCatalog"],
): boolean {
  const def = catalog.archetypes[archetypeName]
  if (!def) return false

  if (def.minData) {
    const safeProfile = profile as Record<string, unknown>
    for (const [field, requirement] of Object.entries(def.minData)) {
      if (requirement === "nonEmpty") {
        const value = safeProfile[field]
        if (Array.isArray(value) && value.length === 0) return false
        if (typeof value === "string" && !value) return false
      }
      if (requirement === ">=2") {
        const value = safeProfile[field]
        if (!Array.isArray(value) || value.length < 2) return false
      }
    }
  }

  return true
}

export async function resolveLayout(
  input: ArchetypeSelectorInput,
  llmCall?: (prompt: string, systemPrompt: string) => Promise<string>,
): Promise<{ output: LayoutOutput; source: "llm" | "fallback" }> {
  if (llmCall) {
    const result = await selectArchetypesWithLLM(input, llmCall)
    if (result.success && result.output) {
      return { output: result.output, source: "llm" }
    }
  }

  return { output: selectArchetypesFallback(input), source: "fallback" }
}

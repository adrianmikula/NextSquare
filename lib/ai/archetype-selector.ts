import type { LayoutOutput } from "@/lib/schemas"
import { LayoutOutputSchema } from "@/lib/schemas"

export type ArchetypeSelectorInput = {
  businessProfile: Record<string, unknown>
  archetypeCatalog: {
    archetypes: Record<string, { blocks: string[]; bestFor?: string[]; minData?: Record<string, string> }>
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

const SYSTEM_PROMPT = `You are a website structure assistant. Given a business profile and an archetype catalog, select the single best archetype for each requested page.

Rules:
1. Only select from the provided archetype names.
2. Respect minData gates: if the profile lacks required data, do not select that archetype.
3. Match the business type and features from the profile to the archetype's bestFor list.
4. Return exactly the JSON schema provided.
5. Do not invent archetype names not in the catalog.
6. If unsure, prefer the default archetype for the page type.

Output format: JSON array with entries: { "page": "<page-slug>", "archetype": "<ARCHETYPE_NAME>", "reasoning": "<one sentence>" }`

const RESPONSE_SCHEMA_DESCRIPTION = `{
  "selected": {
    "<page-slug>": "<ARCHETYPE_NAME>"
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
  const selected: Record<string, string> = {}

  for (const rule of input.selectionRules) {
    const page = rule.page
    if (selected[page]) continue

    if (evaluateCondition(rule.condition, input.businessProfile)) {
      if (archetypePassesGate(rule.archetype, input.businessProfile, input.archetypeCatalog)) {
        selected[page] = rule.archetype
      }
    }
  }

  return { selected, reasoning: "Rule-based fallback selection." }
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

Select an archetype for each of these pages: ${input.selectionRules.map(r => r.page).join(", ")}.

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

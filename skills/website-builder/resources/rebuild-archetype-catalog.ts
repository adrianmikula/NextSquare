"use client"

import { generateArchetypes } from "./generate-archetypes"

export async function rebuildArchetypeCatalog(): Promise<void> {
  console.log("Rebuilding archetype catalog...")
  await generateArchetypes()
  console.log("Done.")
}

rebuildArchetypeCatalog().catch((err) => {
  console.error("Rebuild failed:", err)
  process.exit(1)
})

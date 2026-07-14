"use client"

import { useSoltana } from "@soltana-ui/react"
import { useTuners } from "taste-engine/react"

export interface HeroMinimalProps {
  headline: string
  subheadline?: string
}

export function HeroMinimal({ headline, subheadline }: HeroMinimalProps) {
  const { config } = useSoltana()
  const { tuners } = useTuners()

  const contrast = tuners.contrast ?? 0.5
  const narrative = tuners.narrative ?? 0.5

  const headingWeight = contrast > 0.5 ? 700 : 300
  const sectionPadding = `${4 + narrative * 2}rem`

  return (
    <section
      className="flex items-center justify-center"
      data-relief={config.relief}
      data-finish={config.finish}
      style={{
        minHeight: `${40 + narrative * 30}vh`,
        paddingTop: sectionPadding,
        paddingBottom: sectionPadding,
        backgroundColor: "var(--color-section-bg)",
      }}
    >
      <div className="container-max section-px text-center">
        <h1
          className="text-heading mx-auto max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
          style={{ fontWeight: headingWeight }}
        >
          {headline}
        </h1>

        {subheadline && (
          <p className="text-body mx-auto mt-4 max-w-xl text-base sm:text-lg">
            {subheadline}
          </p>
        )}
      </div>
    </section>
  )
}

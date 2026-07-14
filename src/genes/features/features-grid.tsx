"use client"

import { useSoltana } from "@soltana-ui/react"
import { useTuners } from "taste-engine/react"

export interface FeatureItem {
  title: string
  description: string
  icon?: string
}

export interface FeaturesGridProps {
  headline: string
  items: FeatureItem[]
}

export function FeaturesGrid({ headline, items }: FeaturesGridProps) {
  const { config } = useSoltana()
  const { tuners } = useTuners()

  const density = tuners.density ?? 0.5
  const contrast = tuners.contrast ?? 0.5

  const gap = `${1.5 + density * 1}rem`
  const cardPadding = `${1.5 + density * 1}rem`
  const borderOpacity = 0.05 + contrast * 0.2

  return (
    <section
      className="section-py"
      data-relief={config.relief}
      data-finish={config.finish}
      style={{ backgroundColor: "var(--color-section-bg)" }}
    >
      <div className="container-max section-px mx-auto">
        {headline && (
          <h2 className="text-heading mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            {headline}
          </h2>
        )}

        <div
          className="block-layout-card-grid"
          style={{ gap }}
        >
          {items.map((item, i) => (
            <article
              key={i}
              className="bg-card flex flex-col rounded-xl border transition-shadow hover:shadow-lg"
              style={{
                padding: cardPadding,
                borderColor: `color-mix(in srgb, var(--color-card-border) ${(1 - borderOpacity) * 100}%, transparent)`,
                boxShadow: "var(--card-shadow, 0 1px 3px rgba(0,0,0,0.08))",
              }}
            >
              {item.icon && (
                <div className="mb-4 text-3xl">{item.icon}</div>
              )}
              <h3 className="text-heading text-xl font-semibold">
                {item.title}
              </h3>
              <p className="text-body mt-2 flex-1 leading-relaxed">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

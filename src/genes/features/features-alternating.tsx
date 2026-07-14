"use client"

import { useSoltana } from "@soltana-ui/react"
import { useTuners } from "taste-engine/react"

export interface AlternatingFeatureItem {
  title: string
  description: string
  image?: string
}

export interface FeaturesAlternatingProps {
  headline: string
  items: AlternatingFeatureItem[]
}

export function FeaturesAlternating({ headline, items }: FeaturesAlternatingProps) {
  const { config } = useSoltana()
  const { tuners } = useTuners()

  const density = tuners.density ?? 0.5
  const motion = tuners.motion ?? 0.5
  const narrative = tuners.narrative ?? 0.5

  const rowGap = `${3 + density * 2}rem`
  const imageRadius = `${8 + motion * 8}px`
  const sectionSpacing = `${3 + narrative * 2}rem`

  return (
    <section
      className="section-py"
      data-relief={config.relief}
      data-finish={config.finish}
      style={{
        backgroundColor: "var(--color-section-bg)",
        paddingTop: sectionSpacing,
        paddingBottom: sectionSpacing,
      }}
    >
      <div className="container-max section-px mx-auto">
        {headline && (
          <h2 className="text-heading mb-16 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            {headline}
          </h2>
        )}

        <div className="flex flex-col" style={{ gap: rowGap }}>
          {items.map((item, i) => {
            const isReversed = i % 2 === 1

            return (
              <div
                key={i}
                className={`grid items-center gap-8 md:grid-cols-2 ${isReversed ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="flex flex-col justify-center">
                  <h3 className="text-heading text-2xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="text-body mt-4 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-auto w-full object-cover shadow-md"
                      style={{ borderRadius: imageRadius }}
                    />
                  ) : (
                    <div
                      className="flex h-48 w-full items-center justify-center rounded-lg md:h-64"
                      style={{
                        backgroundColor: "var(--color-card-border, #e7e5e4)",
                        borderRadius: imageRadius,
                      }}
                    >
                      <span className="text-muted text-sm">Image</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useSoltana } from "@soltana-ui/react"
import { useTuners } from "taste-engine/react"

export interface HeroSplitProps {
  headline: string
  subheadline?: string
  ctaLabel?: string
  ctaLink?: string
  image?: string
}

export function HeroSplit({
  headline,
  subheadline,
  ctaLabel,
  ctaLink = "#",
  image,
}: HeroSplitProps) {
  const { config } = useSoltana()
  const { tuners } = useTuners()

  const density = tuners.density ?? 0.5
  const contrast = tuners.contrast ?? 0.5
  const narrative = tuners.narrative ?? 0.5
  const abstraction = tuners.abstraction ?? 0.5

  const gap = `${1.5 + density * 1.5}rem`
  const headingWeight = contrast > 0.5 ? 700 : 400
  const subtitleOpacity = 0.5 + contrast * 0.4
  const heroMinHeight = `${50 + narrative * 50}vh`

  return (
    <section
      className="bg-hero text-hero-text relative flex items-center overflow-hidden"
      data-relief={config.relief}
      data-finish={config.finish}
      style={{
        minHeight: heroMinHeight,
        backgroundColor: "var(--color-hero-bg)",
      }}
    >
      <div
        className="container-max section-px mx-auto grid w-full items-center gap-8 md:grid-cols-2"
        style={{ gap }}
      >
        <div className="flex flex-col justify-center py-12 md:py-20">
          <h1
            className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            style={{ fontWeight: headingWeight }}
          >
            {headline}
          </h1>

          {subheadline && (
            <p
              className="mt-6 max-w-xl text-lg sm:text-xl"
              style={{ opacity: subtitleOpacity }}
            >
              {subheadline}
            </p>
          )}

          {ctaLabel && (
            <div className="mt-8">
              <a
                href={ctaLink}
                className="inline-block rounded-lg px-8 py-3 text-base font-semibold transition-transform hover:scale-105"
                style={{
                  backgroundColor: "var(--color-primary, #b45309)",
                  color: "var(--color-cta-text, #ffffff)",
                }}
              >
                {ctaLabel}
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center py-12 md:py-20">
          {image ? (
            <img
              src={image}
              alt=""
              className="h-auto w-full rounded-lg object-cover shadow-2xl"
              style={{
                borderRadius: `${8 + abstraction * 8}px`,
              }}
            />
          ) : (
            <div
              className="flex h-64 w-full items-center justify-center rounded-lg md:h-96"
              style={{
                backgroundColor: "var(--color-hero-muted, #d6d3d1)",
                opacity: 0.3,
              }}
            >
              <span className="text-lg" style={{ opacity: 0.5 }}>
                Image
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

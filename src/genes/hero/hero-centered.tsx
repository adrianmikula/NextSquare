"use client"

import { useSoltana } from "@soltana-ui/react"
import { useTuners } from "taste-engine/react"

export interface HeroCenteredProps {
  headline: string
  subheadline?: string
  ctaLabel?: string
  ctaLink?: string
  image?: string
}

export function HeroCentered({
  headline,
  subheadline,
  ctaLabel,
  ctaLink = "#",
  image,
}: HeroCenteredProps) {
  const { config } = useSoltana()
  const { tuners } = useTuners()

  const density = tuners.density ?? 0.5
  const contrast = tuners.contrast ?? 0.5
  const narrative = tuners.narrative ?? 0.5
  const motion = tuners.motion ?? 0.5

  const sectionPadding = `${4 + density * 2}rem`
  const headingWeight = contrast > 0.5 ? 700 : 400
  const subtitleOpacity = 0.5 + contrast * 0.4
  const heroMinHeight = `${60 + narrative * 40}vh`
  const transitionDuration = `${300 + motion * 400}ms`

  return (
    <section
      className="bg-hero text-hero-text relative flex items-center justify-center overflow-hidden"
      data-relief={config.relief}
      data-finish={config.finish}
      style={{
        minHeight: heroMinHeight,
        paddingTop: sectionPadding,
        paddingBottom: sectionPadding,
        backgroundColor: "var(--color-hero-bg)",
        transition: `background-color ${transitionDuration}`,
      }}
    >
      {image && (
        <div className="absolute inset-0">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      <div className="container-max section-px relative z-10 text-center">
        <h1
          className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          style={{ fontWeight: headingWeight }}
        >
          {headline}
        </h1>

        {subheadline && (
          <p
            className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl"
            style={{ opacity: subtitleOpacity }}
          >
            {subheadline}
          </p>
        )}

        {ctaLabel && (
          <div className="mt-10">
            <a
              href={ctaLink}
              className="inline-block rounded-lg px-8 py-3 text-base font-semibold transition-transform hover:scale-105"
              style={{
                transitionDuration,
                backgroundColor: "var(--color-primary, #b45309)",
                color: "var(--color-cta-text, #ffffff)",
              }}
            >
              {ctaLabel}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

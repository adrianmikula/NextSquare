"use client"

import { useSoltana } from "@soltana-ui/react"
import { useTuners } from "taste-engine/react"

export interface CtaSplitProps {
  headline: string
  subheadline?: string
  ctaLabel?: string
  ctaLink?: string
  image?: string
}

export function CtaSplit({
  headline,
  subheadline,
  ctaLabel,
  ctaLink = "#",
  image,
}: CtaSplitProps) {
  const { config } = useSoltana()
  const { tuners } = useTuners()

  const density = tuners.density ?? 0.5
  const contrast = tuners.contrast ?? 0.5
  const narrative = tuners.narrative ?? 0.5
  const abstraction = tuners.abstraction ?? 0.5

  const gap = `${1.5 + density * 1.5}rem`
  const subtitleOpacity = 0.5 + contrast * 0.4
  const sectionPadding = `${3 + narrative * 2}rem`
  const isDarkBg = abstraction > 0.5

  return (
    <section
      className="section-py"
      data-relief={config.relief}
      data-finish={config.finish}
      style={{
        backgroundColor: isDarkBg
          ? "var(--color-section-bg-inverse, #1c1917)"
          : "var(--color-section-bg-alt, #fef3c7)",
        paddingTop: sectionPadding,
        paddingBottom: sectionPadding,
      }}
    >
      <div
        className="container-max section-px mx-auto grid items-center gap-8 md:grid-cols-2"
        style={{ gap }}
      >
        <div className="flex flex-col justify-center">
          <h2
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{
              color: isDarkBg
                ? "var(--color-hero-text, #ffffff)"
                : "var(--color-heading, #1c1917)",
            }}
          >
            {headline}
          </h2>

          {subheadline && (
            <p
              className="mt-4 max-w-lg text-lg"
              style={{
                opacity: subtitleOpacity,
                color: isDarkBg
                  ? "var(--color-hero-muted, #d6d3d1)"
                  : "var(--color-body, #57534e)",
              }}
            >
              {subheadline}
            </p>
          )}

          {ctaLabel && (
            <div className="mt-6">
              <a
                href={ctaLink}
                className="inline-block rounded-lg px-8 py-3 text-base font-semibold shadow-md transition-transform hover:scale-105"
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

        <div className="flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt=""
              className="h-auto w-full rounded-lg object-cover shadow-lg"
            />
          ) : (
            <div
              className="flex h-48 w-full items-center justify-center rounded-lg md:h-64"
              style={{
                backgroundColor: "var(--color-card-border, #e7e5e4)",
                opacity: 0.4,
              }}
            >
              <span className="text-muted text-sm">Image</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

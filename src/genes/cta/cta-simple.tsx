"use client"

import { useSoltana } from "@soltana-ui/react"
import { useTuners } from "taste-engine/react"

export interface CtaSimpleProps {
  headline: string
  ctaLabel?: string
  ctaLink?: string
}

export function CtaSimple({ headline, ctaLabel, ctaLink = "#" }: CtaSimpleProps) {
  const { config } = useSoltana()
  const { tuners } = useTuners()

  const contrast = tuners.contrast ?? 0.5
  const motion = tuners.motion ?? 0.5
  const abstraction = tuners.abstraction ?? 0.5

  const transitionDuration = `${300 + motion * 400}ms`
  const isDarkBg = abstraction > 0.5
  const buttonBg = contrast > 0.5 ? "var(--color-primary, #b45309)" : "var(--color-primary-hover, #92400e)"
  const headingColor = isDarkBg ? "var(--color-cta-text, #ffffff)" : "var(--color-heading, #1c1917)"

  return (
    <section
      className="section-py text-center"
      data-relief={config.relief}
      data-finish={config.finish}
      style={{
        backgroundColor: isDarkBg
          ? "var(--color-section-bg-cta, #b45309)"
          : "var(--color-section-bg-alt, #fef3c7)",
      }}
    >
      <div className="container-max section-px mx-auto">
        <h2
          className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: headingColor }}
        >
          {headline}
        </h2>

        {ctaLabel && (
          <div className="mt-8">
            <a
              href={ctaLink}
              className="inline-block rounded-lg px-8 py-3 text-base font-semibold shadow-md transition-all hover:scale-105"
              style={{
                backgroundColor: buttonBg,
                color: "var(--color-cta-text, #ffffff)",
                transitionDuration,
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

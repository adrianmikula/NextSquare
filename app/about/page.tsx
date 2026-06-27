"use client"

import { useState, useEffect } from "react"
import DOMPurify from "dompurify"
import { Heart, Coffee, Users } from "lucide-react"

const fallbackValues = [
  {
    icon: Coffee,
    title: "Quality Coffee",
    description:
      "We source our beans from sustainable farms and roast them locally in small batches for peak freshness.",
  },
  {
    icon: Heart,
    title: "Community First",
    description:
      "Our cafe is a gathering place for friends, families, and colleagues. Everyone is welcome here.",
  },
  {
    icon: Users,
    title: "Great Service",
    description:
      "Our team is passionate about creating a warm, welcoming experience for every customer.",
  },
]

export default function AboutPage() {
  const [page, setPage] = useState<{ title?: string; htmlContent?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/cms/pages?slug=about`)
        if (res.ok) {
          const data = await res.json()
          setPage(data)
        }
      } catch {
        // Network error - fallback content will be shown
      } finally {
        setLoading(false)
      }
    }
    fetchPage()
  }, [])

  const hasCmsContent = !!page?.htmlContent
  const content = hasCmsContent
    ? DOMPurify.sanitize(page.htmlContent)
    : null

  return (
    <div className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">
            {page?.title ?? "Our Story"}
          </h1>
          <div className="mt-8 space-y-4 text-left text-stone-600">
            {content ? (
              <div
                className="prose prose-stone max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <>
                <p>
                  Founded in 2020, Cafe Template started as a small dream
                  between two friends who believed that great coffee could bring
                  people together. What began as a pop-up at the local farmers
                  market quickly grew into the beloved neighbourhood cafe it is
                  today.
                </p>
                <p>
                  We believe in the power of simple things done well. From our
                  carefully roasted coffee beans to our freshly prepared food,
                  every detail matters. We partner with local farmers, bakers,
                  and artisans to bring you the best our community has to offer.
                </p>
                <p>
                  Whether you are grabbing a quick flat white on your way to
                  work, settling in for a long brunch with friends, or ordering
                  online for pickup, we are here to make your day a little
                  brighter.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-3">
          {fallbackValues.map((value) => {
            const Icon = value.icon
            return (
              <div key={value.title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-900">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-stone-600">
                  {value.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

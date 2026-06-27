"use client"

import { useState, useEffect } from "react"
import DOMPurify from "dompurify"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { GoogleMaps } from "@/components/google-maps"

const fallbackContactDetails = [
  {
    icon: MapPin,
    label: "Address",
    value: "123 Coffee Lane, Melbourne VIC 3000",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "(03) 9000 0000",
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@cafetemplate.com",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon-Fri 7am-3pm, Sat 8am-4pm, Sun 8am-2pm",
  },
]

export default function ContactPage() {
  const [page, setPage] = useState<{ title?: string; excerpt?: string; htmlContent?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/cms/pages?slug=contact`)
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

  if (loading) {
    return (
      <div className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-stone-900">
              {page?.title ?? "Contact Us"}
            </h1>
            <p className="mt-4 text-lg text-stone-600">
              {page?.excerpt ?? "We would love to hear from you. Get in touch!"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const hasCmsContent = !!page?.htmlContent
  const content = hasCmsContent
    ? DOMPurify.sanitize(page.htmlContent)
    : null

  return (
    <div className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">
            {page?.title ?? "Contact Us"}
          </h1>
          <p className="mt-4 text-lg text-stone-600">
            {page?.excerpt ?? "We would love to hear from you. Get in touch!"}
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            {content ? (
              <div
                className="prose prose-stone max-w-none text-stone-600"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              fallbackContactDetails.map((detail) => {
                const Icon = detail.icon
                return (
                  <div key={detail.label} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-500">
                        {detail.label}
                      </p>
                      <p className="text-sm text-stone-900">{detail.value}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="overflow-hidden rounded-xl">
            <GoogleMaps />
          </div>
        </div>
      </div>
    </div>
  )
}

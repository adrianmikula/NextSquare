import type { Metadata } from "next"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { GoogleMaps } from "@/components/google-maps"
import { getActiveTenant, readSiteProfile } from "@/lib/cms"

const tenant = getActiveTenant()
const profile = readSiteProfile(tenant)

const address = profile?.address
const contact = profile?.contact

const contactDetails = [
  {
    icon: MapPin,
    label: "Address",
    value: address?.full || "123 Coffee Lane, Melbourne VIC 3000",
  },
  {
    icon: Phone,
    label: "Phone",
    value: contact?.phoneDisplay || contact?.phone || "(03) 9000 0000",
  },
  {
    icon: Mail,
    label: "Email",
    value: contact?.email || "hello@cafetemplate.com",
  },
  {
    icon: Clock,
    label: "Hours",
    value:
      contact?.hours?.weekdays
        ? `Mon-Fri ${contact.hours.weekdays}${contact?.hours?.saturday ? `, Sat ${contact.hours.saturday}` : ""}`
        : "Mon-Fri 7am-3pm, Sat 8am-4pm, Sun 8am-2pm",
  },
]

export const metadata: Metadata = {
  title: "Contact",
  description: profile?.seo?.description || "Get in touch with us. Find our location, hours, and contact information.",
}

export default function ContactPage() {
  return (
    <div className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-stone-600">
            We would love to hear from you. Get in touch!
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            {contactDetails.map((detail) => {
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
            })}
          </div>

          <div className="overflow-hidden rounded-xl">
            <GoogleMaps query={address?.full} />
          </div>
        </div>
      </div>
    </div>
  )
}
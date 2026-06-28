import { MapPin, Clock } from "lucide-react"
import { readSiteProfile } from "@/lib/cms"

const tenants = ["aydins-cafe"]
const tenant = tenants[0] || "aydins-cafe"
const profile = readSiteProfile(tenant)

const hours = [
  { day: "Monday - Friday", time: profile?.contact?.hours?.weekdays || "7:00 AM - 3:00 PM" },
  { day: "Saturday", time: profile?.contact?.hours?.saturday || "8:00 AM - 4:00 PM" },
  { day: "Sunday", time: profile?.contact?.hours?.sunday || "Closed" },
]

export function HoursLocation() {
  const address = profile?.address
  const street = address?.street || "123 Coffee Lane"
  const suburbState = `${address?.suburb || "Melbourne"} ${address?.state || "VIC"} ${address?.postcode || "3000"}`

  return (
    <section className="bg-stone-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-amber-700" />
              <h2 className="text-2xl font-bold text-stone-900">Hours</h2>
            </div>
            <dl className="mt-6 space-y-3">
              {hours.map((row) => (
                <div key={row.day} className="flex justify-between">
                  <dt className="text-sm font-medium text-stone-700">
                    {row.day}
                  </dt>
                  <dd className="text-sm text-stone-500">{row.time}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-amber-700" />
              <h2 className="text-2xl font-bold text-stone-900">
                Location
              </h2>
            </div>
            <div className="mt-6 space-y-2 text-sm text-stone-600">
              <p>{street}</p>
              <p>{suburbState}</p>
              <p>{address?.country || "Australia"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { MapPin, Clock } from "lucide-react"

const hours = [
  { day: "Monday - Friday", time: "7:00 AM - 3:00 PM" },
  { day: "Saturday", time: "8:00 AM - 4:00 PM" },
  { day: "Sunday", time: "8:00 AM - 2:00 PM" },
]

export function HoursLocation() {
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
              <p>123 Coffee Lane</p>
              <p>Melbourne VIC 3000</p>
              <p>Australia</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

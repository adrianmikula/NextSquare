import type { Metadata } from "next"
import { Heart, Coffee, Users } from "lucide-react"
import { readSiteProfile } from "@/lib/cms"

function FallbackValues() {
  return {
    story: "Founded in 2020, Cafe Template started as a small dream between two friends who believed that great coffee could bring people together. What began as a pop-up at the local farmers market quickly grew into the beloved neighbourhood cafe it is today.",
    values: [
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
    ],
  }
}

const tenants = ["aydins-cafe"]
const tenant = tenants[0] || "aydins-cafe"
const profile = readSiteProfile(tenant)
const { story, values } = profile
  ? {
      story: profile.story || "",
      values: (profile.values || []).map((v, i) => ({
        icon: [Coffee, Heart, Users][i % 3],
        title: v.title,
        description: v.description,
      })),
    }
  : FallbackValues()

export const metadata: Metadata = {
  title: "About",
  description: profile?.seo?.description || "Learn about our story, our values, and what makes our cafe special.",
}

export default function AboutPage() {
  return (
    <div className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">
            Our Story
          </h1>
          <div className="mt-8 space-y-4 text-left text-stone-600">
            <p>{story}</p>
          </div>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-3">
          {values.map((value) => {
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

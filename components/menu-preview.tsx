import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowRight, Coffee, Sandwich, GlassWater } from "lucide-react"

const previewItems = [
  {
    name: "Flat White",
    description: "Double shot espresso with steamed silky milk",
    price: "$5.50",
    icon: Coffee,
  },
  {
    name: "Avocado Toast",
    description: "Sourdough, smashed avo, cherry tomatoes, feta",
    price: "$14.00",
    icon: Sandwich,
  },
  {
    name: "Cold Brew",
    description: "Slow-steeped 24hr nitrogen-infused cold brew",
    price: "$6.00",
    icon: GlassWater,
  },
]

export function MenuPreview() {
  return (
    <section className="bg-section section-py">
      <div className="mx-auto container-max px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            Our Menu
          </h2>
          <p className="mt-4 text-lg text-body">
            Freshly prepared every day. View our full menu below.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-3" style={{ gap: "var(--grid-gap)" }}>
          {previewItems.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.name}>
                <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-section-alt text-price">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{item.name}</CardTitle>
                  <p className="text-sm text-muted">
                    {item.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <span className="text-lg font-bold text-price">
                    {item.price}
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/menu"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "inline-flex items-center gap-1 no-underline"
            )}
          >
            View Full Menu
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

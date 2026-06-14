import type { Metadata } from "next"
import { Coffee, Sandwich, Croissant } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse our full menu of freshly prepared coffee, food, and drinks.",
}

const categories = [
  {
    name: "Coffee",
    icon: Coffee,
    items: [
      { name: "Flat White", price: "$5.50", description: "Double shot espresso with steamed silky milk" },
      { name: "Latte", price: "$5.50", description: "Espresso with steamed milk and a light foam" },
      { name: "Cappuccino", price: "$5.50", description: "Espresso with thick foam and chocolate dust" },
      { name: "Long Black", price: "$4.50", description: "Double shot espresso over hot water" },
      { name: "Cold Brew", price: "$6.00", description: "Slow-steeped 24hr nitrogen-infused cold brew" },
      { name: "Mocha", price: "$6.00", description: "Espresso with chocolate and steamed milk" },
    ],
  },
  {
    name: "Food",
    icon: Sandwich,
    items: [
      { name: "Avocado Toast", price: "$14.00", description: "Sourdough, smashed avo, cherry tomatoes, feta" },
      { name: "Breakfast Roll", price: "$12.00", description: "Bacon, egg, cheese, aioli on a brioche bun" },
      { name: "Granola Bowl", price: "$13.00", description: "Toasted oats, yogurt, seasonal fruit, honey" },
      { name: "BLAT Sandwich", price: "$15.00", description: "Bacon, lettuce, avocado, tomato on sourdough" },
    ],
  },
  {
    name: "Pastries",
    icon: Croissant,
    items: [
      { name: "Croissant", price: "$5.00", description: "Buttery, flaky French pastry" },
      { name: "Banana Bread", price: "$5.50", description: "House-made with locally sourced bananas" },
      { name: "Muffin of the Day", price: "$5.00", description: "Ask your barista for today's flavour" },
    ],
  },
]

export default function MenuPage() {
  return (
    <div className="bg-stone-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">
            Our Menu
          </h1>
          <p className="mt-4 text-lg text-stone-600">
            Freshly prepared every day with locally sourced ingredients.
          </p>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.name}>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-stone-100">
                    {category.items.map((item) => (
                      <li
                        key={item.name}
                        className="flex items-center justify-between py-3"
                      >
                        <div>
                          <span className="text-sm font-medium text-stone-900">
                            {item.name}
                          </span>
                          <p className="text-xs text-stone-500">
                            {item.description}
                          </p>
                        </div>
                        <span className="ml-4 text-sm font-bold text-amber-700">
                          {item.price}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

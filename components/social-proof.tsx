import { Star } from "lucide-react"

const reviews = [
  {
    text: "Best flat white in town! The atmosphere is incredible.",
    author: "Sarah M.",
    rating: 5,
  },
  {
    text: "Love the avocado toast. Great spot for brunch with friends.",
    author: "James K.",
    rating: 5,
  },
  {
    text: "Fast online ordering, coffee was ready when I arrived.",
    author: "Emma L.",
    rating: 5,
  },
]

export function SocialProof() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            What Our Customers Say
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.author}
              className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 flex gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm text-stone-600">&ldquo;{review.text}&rdquo;</p>
              <p className="mt-3 text-xs font-medium text-stone-500">
                — {review.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

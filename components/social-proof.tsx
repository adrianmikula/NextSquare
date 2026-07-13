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
    <section className="bg-section section-py">
      <div className="mx-auto container-max px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            What Our Customers Say
          </h2>
        </div>

        <div className="mt-12 grid sm:grid-cols-3" style={{ gap: "var(--grid-gap)" }}>
          {reviews.map((review) => (
            <div
              key={review.author}
              className="card bg-base-100 p-6" style={{ boxShadow: "var(--card-shadow, var(--theme-shadow-card))", border: "var(--card-border-toggle, var(--theme-border-width, 1px)) var(--theme-border-style, solid) var(--color-card-border)", transition: "box-shadow var(--transition-speed, 300ms) var(--motion-easing, ease), transform var(--transition-speed, 300ms) var(--motion-easing, ease)" }}
            >
              <div className="mb-3 flex gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-star text-star"
                  />
                ))}
              </div>
              <p className="text-sm text-body">&ldquo;{review.text}&rdquo;</p>
              <p className="mt-3 text-xs font-medium text-muted">
                — {review.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

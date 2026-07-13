import Image from "next/image"

const placeholderImages = [
  { id: "1", src: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80", alt: "Coffee art" },
  { id: "2", src: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=400&q=80", alt: "Pastries" },
  { id: "3", src: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&q=80", alt: "Cafe interior" },
  { id: "4", src: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&q=80", alt: "Coffee beans" },
]

export function InstagramFeed() {
  return (
    <section className="bg-section section-py">
      <div className="mx-auto container-max px-4 sm:px-6">
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-price"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            <h2 className="text-2xl font-bold text-heading">
              Follow Us on Instagram
            </h2>
          </div>
          <p className="mt-2 text-sm text-muted">@cafetemplate</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: "var(--grid-gap)" }}>
          {placeholderImages.map((img) => (
            <a
              key={img.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={400}
                height={400}
                className="rounded-box w-full transition-transform group-hover:scale-110" style={{ objectFit: "var(--image-treatment, cover)" as React.CSSProperties["objectFit"], aspectRatio: "var(--image-default-aspect, auto)", transitionDuration: "var(--transition-speed)" }}
              />
              <div className="absolute inset-0 transition-colors group-hover:opacity-100" style={{ backgroundColor: "color-mix(in srgb, var(--color-overlay, rgba(0,0,0,0.5)) 40%, transparent)", opacity: 0 }} />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

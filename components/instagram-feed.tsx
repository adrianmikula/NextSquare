import Image from "next/image"

const placeholderImages = [
  { id: "1", src: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80", alt: "Coffee art" },
  { id: "2", src: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=400&q=80", alt: "Pastries" },
  { id: "3", src: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&q=80", alt: "Cafe interior" },
  { id: "4", src: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&q=80", alt: "Coffee beans" },
]

export function InstagramFeed() {
  return (
    <section className="bg-stone-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-amber-700"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            <h2 className="text-2xl font-bold text-stone-900">
              Follow Us on Instagram
            </h2>
          </div>
          <p className="mt-2 text-sm text-stone-500">@cafetemplate</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

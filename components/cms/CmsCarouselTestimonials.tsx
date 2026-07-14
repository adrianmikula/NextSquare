"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function CmsCarouselTestimonials({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as Array<{ author: string; text: string; source?: string }>) || []
  const [current, setCurrent] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startAutoPlay = useCallback(() => {
    stopAutoPlay()
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length)
    }, 5000)
  }, [items.length, stopAutoPlay])

  const goTo = useCallback((index: number) => {
    stopAutoPlay()
    setCurrent(index)
  }, [stopAutoPlay])

  const goNext = useCallback(() => {
    stopAutoPlay()
    setCurrent((prev) => (prev + 1) % items.length)
  }, [items.length, stopAutoPlay])

  const goPrev = useCallback(() => {
    stopAutoPlay()
    setCurrent((prev) => (prev - 1 + items.length) % items.length)
  }, [items.length, stopAutoPlay])

  useEffect(() => {
    startAutoPlay()
    return stopAutoPlay
  }, [startAutoPlay, stopAutoPlay])

  if (items.length === 0) return null

  const item = items[current]

  return (
    <section className="bg-section-inverse section-py section-px">
      <div className="mx-auto container-max px-4 sm:px-6">
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-xl text-hero-text leading-relaxed">&ldquo;{item.text}&rdquo;</p>
          <p className="mt-6 text-base font-medium text-hero-muted">— {item.author}</p>
          {item.source && <p className="text-sm text-hero-muted">{item.source}</p>}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={goPrev}
              className="p-2 rounded-full bg-hero-subtle hover-bg-hero-subtle transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 text-hero-text" />
            </button>
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i === current ? "bg-hero-text" : "bg-hero-dot"
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={goNext}
              className="p-2 rounded-full bg-hero-subtle hover-bg-hero-subtle transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 text-hero-text" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

import { OrderButton } from "@/components/order-button"

export function Hero() {
  return (
    <section className="hero relative overflow-hidden bg-hero">
      <div className="hero-overlay" />
      <div className="hero-content text-center" style={{ flexDirection: "var(--hero-content-flow, column)" as unknown as React.CSSProperties["flexDirection"] }}>
        <h1 className="text-4xl font-bold tracking-tight text-hero-text sm:text-5xl md:text-6xl">
          Fresh Coffee,
          <br />
          <span className="text-price">Great Vibes</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          Handcrafted coffee, delicious food, and a warm atmosphere. 
          Order online for pickup or delivery.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <OrderButton />
        </div>
      </div>
    </section>
  )
}

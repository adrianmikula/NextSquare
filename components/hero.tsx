import { OrderButton } from "@/components/order-button"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-stone-900 py-24 sm:py-32">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80')] bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/70 to-stone-900" />

      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          Fresh Coffee,
          <br />
          <span className="text-amber-400">Great Vibes</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-300">
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

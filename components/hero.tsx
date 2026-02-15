import Image from "next/image"
import { ArrowDown } from "lucide-react"

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero.jpg"
          alt="Upcycled denim jacket with embroidery and patched fabric on a rustic table"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-background/60" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-accent">
          Inspired by the Japanese art of Dorodango
        </p>
        <h1 className="font-serif text-5xl leading-tight text-foreground md:text-7xl lg:text-8xl text-balance">
          Polishing textile waste into masterpieces
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          We collect discarded fast fashion and partner with artisans to upcycle them
          into unique, trend-forward pieces — creating a closed-loop circular economy.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#how-it-works"
            className="rounded-full bg-accent px-8 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            See How It Works
          </a>
          <a
            href="#problem"
            className="rounded-full border border-border px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Learn More
          </a>
        </div>
      </div>

      <a
        href="#problem"
        className="absolute bottom-10 animate-bounce text-muted-foreground"
        aria-label="Scroll down"
      >
        <ArrowDown className="h-5 w-5" />
      </a>
    </section>
  )
}

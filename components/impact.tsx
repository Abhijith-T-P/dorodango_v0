import Image from "next/image"
import { Recycle, Users, Shirt, TreePine } from "lucide-react"

const metrics = [
  { icon: Recycle, value: "12K+", label: "Tons of Waste Diverted" },
  { icon: Users, value: "850+", label: "Artisans Empowered" },
  { icon: Shirt, value: "45K+", label: "Items Repurposed" },
  { icon: TreePine, value: "3.2M", label: "kg CO\u2082 Saved" },
]

const pathways = [
  "Fashion shows and pop-up events showcasing upcycled collections",
  "Online store and partner boutiques for sustainable shopping",
  "Direct gifting to vulnerable communities through NGO partners",
]

export function Impact() {
  return (
    <section id="impact" className="scroll-mt-20 bg-secondary px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
          Our Impact
        </p>
        <h2 className="mt-3 font-serif text-3xl text-foreground md:text-5xl text-balance">
          Measurable change, one garment at a time
        </h2>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col items-start gap-3 rounded-2xl bg-card p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <metric.icon className="h-5 w-5 text-accent" />
              </div>
              <span className="font-serif text-4xl text-foreground">{metric.value}</span>
              <span className="text-sm text-muted-foreground">{metric.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-20 grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/images/collection.jpg"
              alt="Curated display of upcycled fashion pieces on a minimalist rack"
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="font-serif text-2xl text-foreground md:text-3xl">
              Circulation Pathways
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              Every repurposed garment finds its way back into the world through
              multiple channels, maximizing reach and impact.
            </p>
            <ul className="flex flex-col gap-4">
              {pathways.map((pathway) => (
                <li key={pathway} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  <span className="leading-relaxed text-muted-foreground">{pathway}</span>
                </li>
              ))}
            </ul>
            <a
              href="#get-involved"
              className="mt-4 w-fit rounded-full bg-accent px-8 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              Partner With Us
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

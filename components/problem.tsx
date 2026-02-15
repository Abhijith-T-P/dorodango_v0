import { Droplets, Factory, ShoppingBag } from "lucide-react"

const problems = [
  {
    icon: Factory,
    title: "Massive Overproduction",
    description:
      "Millions of tons of textiles end up in landfills yearly or are exported as 'donations' that overwhelm developing nations.",
  },
  {
    icon: Droplets,
    title: "Toxic Pollution",
    description:
      "Textile dyeing pollutes waterways with toxic chemicals, heavy metals, and microplastics, devastating ecosystems worldwide.",
  },
  {
    icon: ShoppingBag,
    title: "Overconsumption Cycle",
    description:
      "Fast fashion fuels worker exploitation and resource depletion — garments are often worn only a few times before discard.",
  },
]

export function Problem() {
  return (
    <section id="problem" className="scroll-mt-20 bg-primary px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/60">
          The Crisis
        </p>
        <h2 className="mt-3 font-serif text-3xl text-primary-foreground md:text-5xl text-balance">
          Fast fashion is devastating our planet
        </h2>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {problems.map((item) => (
            <div key={item.title} className="flex flex-col gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10">
                <item.icon className="h-6 w-6 text-primary-foreground/80" />
              </div>
              <h3 className="font-serif text-xl text-primary-foreground">
                {item.title}
              </h3>
              <p className="leading-relaxed text-primary-foreground/70">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

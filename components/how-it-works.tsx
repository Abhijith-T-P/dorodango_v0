import Image from "next/image"

const steps = [
  {
    number: "01",
    title: "Collect",
    description:
      "Individuals donate via app-based pickups. Industry partners send bulk excess inventory through our B2B portal.",
  },
  {
    number: "02",
    title: "Create",
    description:
      "Designers and artisans browse inventory, submit proposals, and repurpose materials through layering, painting, stitching, and embroidery.",
  },
  {
    number: "03",
    title: "Circulate",
    description:
      "Finished pieces reach the world through fashion shows, our online store, partner boutiques, and direct gifting to those in need.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
          Our Process
        </p>
        <h2 className="mt-3 font-serif text-3xl text-foreground md:text-5xl text-balance">
          From discard to desirable
        </h2>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-12">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <span className="font-serif text-4xl text-accent/40">{step.number}</span>
                <div className="flex flex-col gap-2">
                  <h3 className="font-serif text-2xl text-foreground">{step.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src="/images/artisan.jpg"
              alt="Artisan embroidering a colorful floral pattern on repurposed fabric"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

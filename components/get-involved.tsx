"use client"

import { useState } from "react"
import { Heart, Palette, X, CheckCircle, Loader2 } from "lucide-react"

const fabricArtForms = [
  "Embroidery",
  "Hand Painting",
  "Block Printing",
  "Stitching & Patching",
  "Outfit Layering",
  "Digital Printing",
  "Crochet & Knitting",
  "Batik & Tie-Dye",
  "Applique Work",
  "Screen Printing",
  "Weaving",
  "Creative Redesign",
]

function ContributeForm({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("loading")
    const form = e.currentTarget
    const data = {
      type: "contribute",
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      location: (form.elements.namedItem("location") as HTMLInputElement).value,
      mobile: (form.elements.namedItem("mobile") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      clothesType: (form.elements.namedItem("clothesType") as HTMLInputElement).value,
    }
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed")
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle className="h-12 w-12 text-accent" />
        <h3 className="font-serif text-2xl text-foreground">Thank you for contributing!</h3>
        <p className="text-muted-foreground">We will get back to you shortly.</p>
        <button onClick={onClose} className="mt-4 rounded-full bg-accent px-6 py-2 text-sm font-medium text-accent-foreground">
          Close
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-name" className="text-sm font-medium text-foreground">Full Name</label>
        <input id="c-name" name="name" required type="text" placeholder="Your full name" className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-location" className="text-sm font-medium text-foreground">Location</label>
        <input id="c-location" name="location" required type="text" placeholder="City, State" className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-mobile" className="text-sm font-medium text-foreground">Mobile Number</label>
        <input id="c-mobile" name="mobile" required type="tel" placeholder="+91 98765 43210" className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-email" className="text-sm font-medium text-foreground">Email</label>
        <input id="c-email" name="email" required type="email" placeholder="you@example.com" className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-clothes" className="text-sm font-medium text-foreground">Type of Clothes to Donate</label>
        <input id="c-clothes" name="clothesType" required type="text" placeholder="e.g. Denim jackets, Cotton tees, Silk sarees..." className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <button type="submit" disabled={status === "loading"} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
        {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "loading" ? "Submitting..." : "Submit Donation Request"}
      </button>
      {status === "error" && <p className="text-sm text-destructive">Something went wrong. Please try again.</p>}
    </form>
  )
}

function CollaborateForm({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  function toggleArt(art: string) {
    setSelected((prev) => prev.includes(art) ? prev.filter((a) => a !== art) : [...prev, art])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (selected.length === 0) return
    setStatus("loading")
    const form = e.currentTarget
    const data = {
      type: "collaborate",
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      location: (form.elements.namedItem("location") as HTMLInputElement).value,
      artForms: selected,
      experience: (form.elements.namedItem("experience") as HTMLInputElement).value,
      socialMedia: (form.elements.namedItem("socialMedia") as HTMLInputElement).value,
      suggestions: (form.elements.namedItem("suggestions") as HTMLTextAreaElement).value,
    }
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed")
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle className="h-12 w-12 text-accent" />
        <h3 className="font-serif text-2xl text-foreground">Thank you for your interest!</h3>
        <p className="text-muted-foreground">We are excited to collaborate with you.</p>
        <button onClick={onClose} className="mt-4 rounded-full bg-accent px-6 py-2 text-sm font-medium text-accent-foreground">
          Close
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="co-name" className="text-sm font-medium text-foreground">Full Name</label>
        <input id="co-name" name="name" required type="text" placeholder="Your full name" className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="co-location" className="text-sm font-medium text-foreground">Location</label>
        <input id="co-location" name="location" required type="text" placeholder="City, State" className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Fabric Art Forms You Specialise In</label>
        <p className="text-xs text-muted-foreground">Select all that apply</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {fabricArtForms.map((art) => (
            <button
              key={art}
              type="button"
              onClick={() => toggleArt(art)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                selected.includes(art)
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-accent/50"
              }`}
            >
              {art}
            </button>
          ))}
        </div>
        {selected.length === 0 && <p className="text-xs text-destructive">Please select at least one art form</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="co-exp" className="text-sm font-medium text-foreground">Years of Experience</label>
        <input id="co-exp" name="experience" required type="text" placeholder="e.g. 5 years" className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="co-social" className="text-sm font-medium text-foreground">Social Media Handle (optional)</label>
        <input id="co-social" name="socialMedia" type="text" placeholder="@yourhandle" className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="co-suggestions" className="text-sm font-medium text-foreground">Your Suggestions</label>
        <textarea id="co-suggestions" name="suggestions" rows={3} placeholder="Share your ideas, vision, or how you'd like to collaborate..." className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
      </div>
      <button type="submit" disabled={status === "loading" || selected.length === 0} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
        {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "loading" ? "Submitting..." : "Submit Collaboration Request"}
      </button>
      {status === "error" && <p className="text-sm text-destructive">Something went wrong. Please try again.</p>}
    </form>
  )
}

export function GetInvolved() {
  const [activeForm, setActiveForm] = useState<"none" | "contribute" | "collaborate">("none")

  return (
    <section id="get-involved" className="scroll-mt-20 bg-background px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent text-center">
          Get Involved
        </p>
        <h2 className="mt-3 font-serif text-3xl text-foreground md:text-5xl text-balance text-center">
          Join the movement
        </h2>
        <p className="mt-4 mx-auto max-w-2xl text-center leading-relaxed text-muted-foreground">
          Whether you want to donate clothes or collaborate as an artisan, there is
          a place for you in the Dorodango community.
        </p>

        {activeForm === "none" ? (
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            <button
              onClick={() => setActiveForm("contribute")}
              className="group flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-8 text-left transition-all hover:border-accent/50 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Heart className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-serif text-2xl text-foreground">Contribute</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Donate your pre-loved clothes and give them a second life. We collect,
                sort, and match your donations with skilled artisans who transform them
                into something extraordinary.
              </p>
              <span className="mt-auto text-sm font-medium text-accent group-hover:underline">
                Start donating &rarr;
              </span>
            </button>

            <button
              onClick={() => setActiveForm("collaborate")}
              className="group flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-8 text-left transition-all hover:border-accent/50 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Palette className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-serif text-2xl text-foreground">Collaborate</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Are you an artisan, designer, or creative professional? Partner with
                us to transform textile waste into unique fashion pieces and earn from
                your craft.
              </p>
              <span className="mt-auto text-sm font-medium text-accent group-hover:underline">
                Join as artisan &rarr;
              </span>
            </button>
          </div>
        ) : (
          <div className="mt-12 mx-auto max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl text-foreground">
                {activeForm === "contribute" ? "Contribute Clothes" : "Collaborate With Us"}
              </h3>
              <button
                onClick={() => setActiveForm("none")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {activeForm === "contribute" ? (
              <ContributeForm onClose={() => setActiveForm("none")} />
            ) : (
              <CollaborateForm onClose={() => setActiveForm("none")} />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

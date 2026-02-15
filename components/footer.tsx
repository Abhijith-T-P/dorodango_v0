import { Leaf } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-accent" />
          <span className="font-serif text-lg text-foreground">Dorodango ReFashion</span>
        </div>

        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Transforming ordinary into extraordinary. Inspired by the Japanese art
          of dorodango — polishing dirt into radiant spheres of beauty.
        </p>

        <p className="text-xs text-muted-foreground">
          {"© 2026 Dorodango ReFashion"}
        </p>
      </div>
    </footer>
  )
}

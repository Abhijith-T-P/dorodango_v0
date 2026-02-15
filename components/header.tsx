"use client"

import { useState } from "react"
import Link from "next/link"
import { Leaf, Menu, X } from "lucide-react"

const navLinks = [
  { label: "Problem", href: "#problem" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Impact", href: "#impact" },
  { label: "Get Involved", href: "#get-involved" },
  { label: "Products", href: "/products" },
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-accent" />
          <span className="font-serif text-xl text-foreground">Dorodango</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isExternal = link.href.startsWith("/")
            return isExternal ? (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            )
          })}
          <Link
            href="/login"
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Login
          </Link>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-6 pb-6 md:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => {
              const isExternal = link.href.startsWith("/")
              return isExternal ? (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              )
            })}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-accent px-5 py-2 text-center text-sm font-medium text-accent-foreground"
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

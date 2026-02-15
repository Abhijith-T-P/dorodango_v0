"use client"

import Link from "next/link"
import Image from "next/image"
import { Leaf, ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart-provider"

export default function CartPage() {
  const { items, removeItem, updateQty, total, count } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-accent" />
              <span className="font-serif text-xl text-foreground">Dorodango</span>
            </Link>
          </div>
        </header>
        <main className="flex flex-col items-center justify-center gap-6 px-6 py-32">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
          <h1 className="font-serif text-3xl text-foreground">Your cart is empty</h1>
          <p className="text-muted-foreground">Discover artisan-crafted sustainable fashion.</p>
          <Link
            href="/products"
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Browse Products
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-accent" />
            <span className="font-serif text-xl text-foreground">Dorodango</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/products" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>

        <h1 className="mt-4 font-serif text-3xl text-foreground md:text-4xl">
          {"Your Cart ("}{count}{" item"}{count !== 1 ? "s" : ""}{")"}
        </h1>

        <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:gap-12">
          {/* Cart Items */}
          <div className="flex flex-1 flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-foreground">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">by {item.artisan}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-foreground">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-foreground">
                        {"₹"}{(item.price * item.qty).toLocaleString("en-IN")}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-80">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
              <h2 className="font-serif text-xl text-foreground">Order Summary</h2>
              <div className="mt-4 flex flex-col gap-3 border-b border-border pb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{"Subtotal ("}{count}{" items)"}</span>
                  <span className="text-foreground">{"₹"}{total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-accent">Free</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-medium text-foreground">Total</span>
                <span className="font-serif text-2xl text-foreground">{"₹"}{total.toLocaleString("en-IN")}</span>
              </div>
              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

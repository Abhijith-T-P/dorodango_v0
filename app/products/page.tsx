"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Leaf, ArrowLeft, ShoppingCart, Plus, Trash2, X, Loader2, LogOut, ShoppingBag, Check } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useCart } from "@/components/cart-provider"

interface Product {
  id: number
  name: string
  artisan: string
  price: number
  image: string
  tag: string | null
  description: string
}

export default function ProductsPage() {
  const { user, logout } = useAuth()
  const { items: cartItems, addItem, count: cartCount } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set())

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/products")
    const data = await res.json()
    setProducts(data.products)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  async function handleAddProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        artisan: formData.get("artisan"),
        price: Number(formData.get("price")),
        description: formData.get("description"),
        tag: formData.get("tag") || null,
      }),
    })
    if (res.ok) {
      form.reset()
      setShowAddForm(false)
      await fetchProducts()
    }
    setFormLoading(false)
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      await fetchProducts()
    }
  }

  function handleAddToCart(product: Product) {
    addItem({
      id: product.id,
      name: product.name,
      artisan: product.artisan,
      price: product.price,
      image: product.image,
    })
    setAddedIds((prev) => new Set(prev).add(product.id))
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev)
        next.delete(product.id)
        return next
      })
    }, 1500)
  }

  const inCart = new Set(cartItems.map((i) => i.id))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-accent" />
            <span className="font-serif text-xl text-foreground">Dorodango</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
                <button
                  onClick={logout}
                  className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">Shop</p>
            <h1 className="mt-3 font-serif text-3xl text-foreground md:text-5xl text-balance">
              Artisan-crafted, one of a kind
            </h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
              Every piece tells a story of transformation. Handmade by skilled artisans
              from upcycled materials, each item is truly unique.
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex w-fit shrink-0 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAddForm ? "Cancel" : "Add Product"}
            </button>
          )}
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddProduct}
            className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="prod-name" className="text-sm font-medium text-foreground">Product Name</label>
              <input
                id="prod-name"
                name="name"
                required
                placeholder="e.g. Hand-Painted Silk Scarf"
                className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="prod-artisan" className="text-sm font-medium text-foreground">Artisan Name</label>
              <input
                id="prod-artisan"
                name="artisan"
                required
                placeholder="e.g. Meera Devi"
                className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="prod-price" className="text-sm font-medium text-foreground">{"Price (₹)"}</label>
              <input
                id="prod-price"
                name="price"
                type="number"
                min="1"
                required
                placeholder="e.g. 1499"
                className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="prod-tag" className="text-sm font-medium text-foreground">Tag (optional)</label>
              <input
                id="prod-tag"
                name="tag"
                placeholder="e.g. New, Limited, Best Seller"
                className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="prod-desc" className="text-sm font-medium text-foreground">Description</label>
              <textarea
                id="prod-desc"
                name="description"
                required
                rows={2}
                placeholder="Describe the product and its story..."
                className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={formLoading}
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Product
              </button>
            </div>
          </form>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                {user && (
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="absolute top-4 right-4 z-10 rounded-full bg-background/80 p-2 text-destructive opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.tag && (
                    <span className="absolute top-4 left-4 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                      {product.tag}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="font-serif text-lg text-foreground">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">by {product.artisan}</p>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-serif text-xl text-foreground">
                      {"₹"}{product.price.toLocaleString("en-IN")}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                        addedIds.has(product.id)
                          ? "bg-accent text-accent-foreground"
                          : "bg-primary text-primary-foreground hover:opacity-90"
                      }`}
                    >
                      {addedIds.has(product.id) ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Added
                        </>
                      ) : inCart.has(product.id) ? (
                        <>
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Add More
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">No products yet. Be the first to add one!</p>
          </div>
        )}
      </main>
    </div>
  )
}

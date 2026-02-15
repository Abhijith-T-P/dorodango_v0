import Image from "next/image"
import Link from "next/link"
import { Leaf, ArrowLeft, ShoppingBag } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Embroidered Denim Jacket",
    artisan: "Meera Devi",
    price: 2499,
    image: "/images/product-1.jpg",
    tag: "Best Seller",
    description: "Hand-embroidered floral motifs on upcycled denim. One of a kind.",
  },
  {
    id: 2,
    name: "Botanical Canvas Tote",
    artisan: "Priya Sharma",
    price: 899,
    image: "/images/product-2.jpg",
    tag: "New",
    description: "Hand-painted botanical art on repurposed canvas. Carry your story.",
  },
  {
    id: 3,
    name: "Patchwork Quilted Vest",
    artisan: "Fatima Begum",
    price: 1899,
    image: "/images/product-3.jpg",
    tag: "Limited",
    description: "Vintage fabric scraps stitched into a warm, wearable mosaic.",
  },
  {
    id: 4,
    name: "Embroidered Jeans",
    artisan: "Lakshmi Iyer",
    price: 1999,
    image: "/images/product-4.jpg",
    tag: null,
    description: "Floral and butterfly embroidery breathing new life into classic denim.",
  },
  {
    id: 5,
    name: "Silk Beaded Headband",
    artisan: "Anjali Patel",
    price: 599,
    image: "/images/product-5.jpg",
    tag: "New",
    description: "Repurposed vintage silk with hand-stitched beadwork detailing.",
  },
  {
    id: 6,
    name: "Block-Printed Cotton Tee",
    artisan: "Ravi Kumar",
    price: 1299,
    image: "/images/product-6.jpg",
    tag: null,
    description: "Traditional block printing technique on sustainably sourced cotton.",
  },
]

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-accent" />
            <span className="font-serif text-xl text-foreground">Dorodango</span>
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mt-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">Shop</p>
          <h1 className="mt-3 font-serif text-3xl text-foreground md:text-5xl text-balance">
            Artisan-crafted, one of a kind
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            Every piece tells a story of transformation. Handmade by skilled artisans
            from upcycled materials, each item is truly unique.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
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
                  <button className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Buy Now
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}

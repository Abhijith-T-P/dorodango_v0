  "use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Leaf, ArrowLeft, ShoppingCart, Plus, Trash2, X, Loader2, LogOut, ShoppingBag, Check, Upload, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useCart } from "@/components/cart-provider"

interface Product {
  id: string
  name: string
  artisan: string
  price: number
  image: string
  images: string[]
  tag: string | null
  description: string
}

const MAX_IMAGES = 4
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

export default function ProductsPage() {
  const { user, logout } = useAuth()
  const { items: cartItems, addItem, count: cartCount } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageError, setImageError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Open lightbox with product images
  function openLightbox(images: string[]) {
    setLightboxImages(images)
    setLightboxIndex(0)
    setLightboxOpen(true)
  }

  // Close lightbox
  function closeLightbox() {
    setLightboxOpen(false)
  }

  // Navigate to previous image
  function prevImage(e?: React.MouseEvent) {
    e?.stopPropagation()
    setLightboxIndex((prev) => (prev === 0 ? lightboxImages.length - 1 : prev - 1))
  }

  // Navigate to next image
  function nextImage(e?: React.MouseEvent) {
    e?.stopPropagation()
    setLightboxIndex((prev) => (prev === lightboxImages.length - 1 ? 0 : prev + 1))
  }

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") setLightboxIndex((prev) => (prev === 0 ? lightboxImages.length - 1 : prev - 1))
      if (e.key === "ArrowRight") setLightboxIndex((prev) => (prev === lightboxImages.length - 1 ? 0 : prev + 1))
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxOpen, lightboxImages.length])

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/products")
    const data = await res.json()
    setProducts(data.products)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setImageError("")

    if (selectedImages.length + files.length > MAX_IMAGES) {
      setImageError(`Maximum ${MAX_IMAGES} images allowed`)
      return
    }

    const validFiles: File[] = []
    let sizeError = false

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        sizeError = true
        continue
      }
      if (!file.type.startsWith("image/")) {
        continue
      }
      validFiles.push(file)
    }

    if (sizeError) {
      setImageError("Some files exceeded 5MB limit and were skipped")
    }

    const newFiles = [...selectedImages, ...validFiles].slice(0, MAX_IMAGES)
    setSelectedImages(newFiles)

    // Create preview URLs
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
    setImagePreviews(newPreviews)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleRemoveImage(index: number) {
    const newFiles = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    
    // Revoke the removed URL to avoid memory leaks
    if (imagePreviews[index].startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviews[index])
    }
    
    setSelectedImages(newFiles)
    setImagePreviews(newPreviews)
  }

  async function handleAddProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormLoading(true)
    setImageError("")

    const form = e.currentTarget
    const formData = new FormData(form)

    // Convert images to base64 data URLs
    const imagePromises = selectedImages.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.readAsDataURL(file)
      })
    })

    const images = await Promise.all(imagePromises)

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        artisan: formData.get("artisan"),
        price: Number(formData.get("price")),
        description: formData.get("description"),
        tag: formData.get("tag") || null,
        images: images,
      }),
    })

    if (res.ok) {
      form.reset()
      setShowAddForm(false)
      setSelectedImages([])
      setImagePreviews([])
      await fetchProducts()
    }

    setFormLoading(false)
  }

async function handleDelete(id: string) {
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
            
            {/* Image Upload Section */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-foreground">
                Product Images (max {MAX_IMAGES}, 5MB each)
              </label>
              
              {/* Image Preview Grid */}
              {imagePreviews.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 rounded-full bg-background/80 p-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload Button */}
              {selectedImages.length < MAX_IMAGES && (
                <div 
                  className="mt-3 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-accent hover:bg-accent/5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-accent">Click to upload</span> or drag and drop
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 5MB
                    </div>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              
              {imageError && (
                <p className="mt-2 text-sm text-destructive">{imageError}</p>
              )}
              
              <p className="mt-1 text-xs text-muted-foreground">
                {selectedImages.length}/{MAX_IMAGES} images selected
              </p>
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
                <div 
                  className="relative aspect-square overflow-hidden"
                  onClick={() => product.images && product.images.length > 1 && openLightbox(product.images)}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className={`object-cover transition-transform duration-500 ${product.images && product.images.length > 1 ? 'cursor-pointer group-hover:scale-105' : ''}`}
                  />
                  {product.tag && (
                    <span className="absolute top-4 left-4 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                      {product.tag}
                    </span>
                  )}
                  {/* Show image count indicator if multiple images */}
                  {product.images && product.images.length > 1 && (
                    <div 
                      className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); openLightbox(product.images!) }}
                    >
                      <ImageIcon className="h-3 w-3" />
                      {product.images.length}
                    </div>
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

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Previous button */}
          {lightboxImages.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {/* Image */}
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxImages[lightboxIndex]}
              alt={`Image ${lightboxIndex + 1}`}
              width={800}
              height={800}
              className="max-h-[90vh] w-auto object-contain"
            />
          </div>

          {/* Next button */}
          {lightboxImages.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              aria-label="Next image"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          {/* Image counter */}
          {lightboxImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-white">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

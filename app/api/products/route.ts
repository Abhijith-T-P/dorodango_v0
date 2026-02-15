import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export interface Product {
  id: number
  name: string
  artisan: string
  price: number
  image: string
  tag: string | null
  description: string
}

let nextId = 7

const products: Product[] = [
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

function getUser(jar: Awaited<ReturnType<typeof cookies>>) {
  const session = jar.get("session")
  if (!session?.value) return null
  try {
    return JSON.parse(session.value)
  } catch {
    return null
  }
}

export async function GET() {
  return NextResponse.json({ products })
}

export async function POST(req: NextRequest) {
  const jar = await cookies()
  const user = getUser(jar)
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 })
  }

  const body = await req.json()
  const { name, artisan, price, description, tag } = body

  if (!name || !artisan || !price || !description) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  const product: Product = {
    id: nextId++,
    name,
    artisan,
    price: Number(price),
    image: "/images/product-1.jpg",
    tag: tag || null,
    description,
  }
  products.push(product)
  return NextResponse.json({ product })
}

export async function DELETE(req: NextRequest) {
  const jar = await cookies()
  const user = getUser(jar)
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get("id"))
  const idx = products.findIndex((p) => p.id === id)
  if (idx === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }
  products.splice(idx, 1)
  return NextResponse.json({ ok: true })
}

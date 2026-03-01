import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/firebase"
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore"

export interface Product {
  id: string
  name: string
  artisan: string
  price: number
  image: string
  images: string[]
  tag: string | null
  description: string
}

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
  try {
    const productsRef = collection(db, 'products')
    const snapshot = await getDocs(productsRef)
    
    const products: Product[] = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name as string,
        artisan: data.artisan as string,
        price: data.price as number,
        image: data.image as string,
        images: data.images as string[] || [],
        tag: data.tag as string | null,
        description: data.description as string,
      }
    })
    
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products from Firebase:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const jar = await cookies()
  const user = getUser(jar)
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, artisan, price, description, tag, images } = body

    if (!name || !artisan || !price || !description) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate images array - max 4 images
    const imageArray = Array.isArray(images) ? images.slice(0, 4) : []
    
    const productsRef = collection(db, 'products')
    const docRef = await addDoc(productsRef, {
      name,
      artisan,
      price: Number(price),
      image: imageArray[0] || "/images/product-1.jpg",
      images: imageArray,
      tag: tag || null,
      description,
      createdAt: serverTimestamp()
    })
    
    const product: Product = {
      id: docRef.id,
      name,
      artisan,
      price: Number(price),
      image: imageArray[0] || "/images/product-1.jpg",
      images: imageArray,
      tag: tag || null,
      description,
    }
    
    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error adding product to Firebase:', error)
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const jar = await cookies()
  const user = getUser(jar)
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }
    
    await deleteDoc(doc(db, 'products', id))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting product from Firebase:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

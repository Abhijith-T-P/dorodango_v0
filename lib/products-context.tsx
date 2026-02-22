"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { db } from "./firebase"
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from "firebase/firestore"

export type Product = {
  id: string
  name: string
  artisan: string
  price: number
  image: string
  tag: string | null
  description: string
}

type ProductsContextType = {
  products: Product[]
  addProduct: (product: Omit<Product, "id">) => void
  removeProduct: (id: string) => void
  loading: boolean
  syncFromFirestore: () => Promise<void>
}

const ProductsContext = createContext<ProductsContextType | null>(null)

const STORAGE_KEY = "dorodango-products"

const defaultProducts: Product[] = [
  {
    id: "1",
    name: "Embroidered Denim Jacket",
    artisan: "Meera Devi",
    price: 2499,
    image: "/images/product-1.jpg",
    tag: "Best Seller",
    description: "Hand-embroidered floral motifs on upcycled denim. One of a kind.",
  },
  {
    id: "2",
    name: "Botanical Canvas Tote",
    artisan: "Priya Sharma",
    price: 899,
    image: "/images/product-2.jpg",
    tag: "New",
    description: "Hand-painted botanical art on repurposed canvas. Carry your story.",
  },
  {
    id: "3",
    name: "Patchwork Quilted Vest",
    artisan: "Fatima Begum",
    price: 1899,
    image: "/images/product-3.jpg",
    tag: "Limited",
    description: "Vintage fabric scraps stitched into a warm, wearable mosaic.",
  },
  {
    id: "4",
    name: "Embroidered Jeans",
    artisan: "Lakshmi Iyer",
    price: 1999,
    image: "/images/product-4.jpg",
    tag: null,
    description: "Floral and butterfly embroidery breathing new life into classic denim.",
  },
  {
    id: "5",
    name: "Silk Beaded Headband",
    artisan: "Anjali Patel",
    price: 599,
    image: "/images/product-5.jpg",
    tag: "New",
    description: "Repurposed vintage silk with hand-stitched beadwork detailing.",
  },
  {
    id: "6",
    name: "Block-Printed Cotton Tee",
    artisan: "Ravi Kumar",
    price: 1299,
    image: "/images/product-6.jpg",
    tag: null,
    description: "Traditional block printing technique on sustainably sourced cotton.",
  },
]

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  // Initialize from localStorage cache (cache-first strategy)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setProducts(JSON.parse(stored))
      } catch {
        setProducts(defaultProducts)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts))
      }
    } else {
      setProducts(defaultProducts)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts))
    }
    setMounted(true)
    setLoading(false)
  }, [])

  // Sync with Firestore in background (after initial render)
  useEffect(() => {
    if (mounted && !loading) {
      syncFromFirestore()
    }
  }, [mounted, loading])

  // Sync products from Firestore
  async function syncFromFirestore() {
    try {
      const productsRef = collection(db, 'products')
      const snapshot = await getDocs(productsRef)
      
      if (!snapshot.empty) {
        const firestoreProducts: Product[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[]
        
        // Merge: prefer localStorage data, but sync new products from Firestore
        const localIds = new Set(products.map(p => p.id))
        const newFromFirestore = firestoreProducts.filter(p => !localIds.has(p.id))
        
        if (newFromFirestore.length > 0) {
          const merged = [...products, ...newFromFirestore]
          setProducts(merged)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        }
      }
    } catch (error) {
      console.warn('Firestore sync failed, using cached data:', error)
      // Keep using cached localStorage data on error
    }
  }

  // Persist to both localStorage and Firestore
  function persist(updated: Product[]) {
    setProducts(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    
    // Also persist to Firestore in background
    updated.forEach(async (product) => {
      try {
        await setDoc(doc(db, 'products', product.id), product, { merge: true })
      } catch (error) {
        console.warn('Failed to sync to Firestore:', error)
      }
    })
  }

  function addProduct(product: Omit<Product, "id">) {
    const newProduct: Product = { ...product, id: crypto.randomUUID() }
    persist([newProduct, ...products])
  }

  function removeProduct(id: string) {
    persist(products.filter((p) => p.id !== id))
    
    // Also delete from Firestore
    try {
      deleteDoc(doc(db, 'products', id))
    } catch (error) {
      console.warn('Failed to delete from Firestore:', error)
    }
  }

  if (!mounted) return null

  return (
    <ProductsContext.Provider value={{ products, addProduct, removeProduct, loading, syncFromFirestore }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider")
  return ctx
}

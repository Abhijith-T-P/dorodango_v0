"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { db } from "./firebase"
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore"

export type Product = {
  id: string
  name: string
  artisan: string
  price: number
  image: string
  tag: string | null
  description: string
  createdAt?: Date
}

type ProductsContextType = {
  products: Product[]
  addProduct: (product: Omit<Product, "id">) => void
  removeProduct: (id: string) => void
  loading: boolean
  syncFromFirestore: () => Promise<void>
  migrateProducts: () => Promise<{ success: boolean; message: string; count?: number; error?: string }>
}

const ProductsContext = createContext<ProductsContextType | null>(null)

const STORAGE_KEY = "dorodango-products"
const MIGRATION_KEY = "dorodango-migration-complete"

const defaultProducts: Omit<Product, "id">[] = [
  
]

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  // Migrate products to Firestore (automatic on first run)
  async function migrateProducts(): Promise<{ success: boolean; message: string; count?: number; error?: string }> {
    try {
      const productsRef = collection(db, 'products')
      
      // Check if products already exist in Firestore
      const snapshot = await getDocs(productsRef)
      
      if (!snapshot.empty) {
        // Products already migrated
        return { 
          success: true, 
          message: "Products already exist in Firestore",
          count: snapshot.size
        }
      }

      // Migrate each product to Firestore
      let migratedCount = 0
      const errors: string[] = []

      for (const product of defaultProducts) {
        try {
          const docRef = await addDoc(productsRef, {
            ...product,
            createdAt: serverTimestamp()
          })
          console.log(`Migrated product: ${product.name} with ID: ${docRef.id}`)
          migratedCount++
        } catch (productError: any) {
          errors.push(`Failed to migrate ${product.name}: ${productError.message}`)
          console.error(`Failed to migrate product: ${product.name}`, productError)
        }
      }

      if (migratedCount === defaultProducts.length) {
        // Mark migration as complete
        localStorage.setItem(MIGRATION_KEY, 'true')
        return { 
          success: true, 
          message: `Successfully migrated ${migratedCount} products to Firestore`,
          count: migratedCount
        }
      } else {
        return { 
          success: false, 
          message: `Partially migrated ${migratedCount}/${defaultProducts.length} products`,
          count: migratedCount,
          error: errors.join('; ')
        }
      }
    } catch (error: any) {
      console.error("Migration failed:", error)
      return { 
        success: false, 
        message: "Migration failed",
        error: error.message 
      }
    }
  }

  // Initialize from localStorage cache (cache-first strategy)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setProducts(JSON.parse(stored))
      } catch {
        setProducts(defaultProducts.map((p, i) => ({ ...p, id: String(i + 1) })))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts.map((p, i) => ({ ...p, id: String(i + 1) }))))
      }
    } else {
      setProducts(defaultProducts.map((p, i) => ({ ...p, id: String(i + 1) })))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts.map((p, i) => ({ ...p, id: String(i + 1) }))))
    }
    setMounted(true)
    setLoading(false)
  }, [])

  // Sync with Firestore in background (after initial render)
  // Also trigger automatic migration if not yet done
  useEffect(() => {
    if (mounted && !loading) {
      // Check if migration has been completed
      const migrationComplete = localStorage.getItem(MIGRATION_KEY) === 'true'
      
      if (!migrationComplete) {
        // Run migration automatically
        migrateProducts().then((result) => {
          console.log("Migration result:", result)
          // After migration, sync from Firestore
          syncFromFirestore()
        })
      } else {
        // Already migrated, just sync
        syncFromFirestore()
      }
    }
  }, [mounted, loading])

  // Sync products from Firestore
  async function syncFromFirestore() {
    try {
      const productsRef = collection(db, 'products')
      const snapshot = await getDocs(productsRef)
      
      if (!snapshot.empty) {
        const firestoreProducts: Product[] = snapshot.docs.map(doc => {
          const data = doc.data()
          // Handle Firestore timestamp conversion
          return {
            id: doc.id,
            name: data.name as string,
            artisan: data.artisan as string,
            price: data.price as number,
            image: data.image as string,
            tag: data.tag as string | null,
            description: data.description as string,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : undefined
          }
        })
        
        // Merge: prefer localStorage data, but sync new products from Firestore
        const localIds = new Set(products.map(p => p.id))
        const newFromFirestore = firestoreProducts.filter(p => !localIds.has(p.id))
        
        if (newFromFirestore.length > 0) {
          const merged = [...products, ...newFromFirestore]
          setProducts(merged)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        } else if (products.length === 0) {
          // If no local products, use Firestore products
          setProducts(firestoreProducts)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreProducts))
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
    
    // Also add to Firestore with new ID
    try {
      addDoc(collection(db, 'products'), {
        ...product,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.warn('Failed to add to Firestore:', error)
    }
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
    <ProductsContext.Provider value={{ products, addProduct, removeProduct, loading, syncFromFirestore, migrateProducts }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider")
  return ctx
}

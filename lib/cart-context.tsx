"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Product } from "./products-context"

export type CartItem = Product & { quantity: number }

type CartContextType = {
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
}

const CartContext = createContext<CartContextType | null>(null)

const STORAGE_KEY = "dorodango-cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setCart(JSON.parse(stored))
      } catch {
        setCart([])
      }
    }
    setMounted(true)
  }, [])

  function persist(updated: CartItem[]) {
    setCart(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  function addToCart(product: Product) {
    const existing = cart.find((item) => item.id === product.id)
    if (existing) {
      persist(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      persist([...cart, { ...product, quantity: 1 }])
    }
  }

  function removeFromCart(id: string) {
    persist(cart.filter((item) => item.id !== id))
  }

  function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    persist(cart.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const clearCart = useCallback(() => {
    setCart([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (!mounted) return null

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}

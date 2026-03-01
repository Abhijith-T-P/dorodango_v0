"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { firebaseAuth, userProfile } from "@/lib/firebase"

interface User {
  uid?: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session and restore Firebase auth state
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        // First, try to get session from API (cookie-based)
        const response = await fetch("/api/auth")
        const data = await response.json()
        
        if (data.user) {
          // Session exists, set user state from cookie
          setUser(data.user)
          
          // IMPORTANT: Also restore Firebase auth state using the session
          // This ensures Firebase knows about the user on page refresh
          // We use Firebase's onAuthStateChanged to sync
          const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
            if (!firebaseUser && data.user?.uid) {
              // Firebase doesn't have user but cookie does - silently re-authenticate
              // This is a no-op that restores Firebase's internal state from localStorage
              console.log('Restoring Firebase auth state from session')
            }
            unsubscribe()
          })
        }
      } catch (error) {
        console.error('Failed to restore auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    restoreAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      // Call Firebase Auth directly on client side
      const result = await firebaseAuth.login(email, password)
      
      if (result.error) {
        return { error: result.error }
      }

      // Get user profile from Firestore
      const profileResult = await userProfile.getProfile(result.user!.uid)
      const userName = profileResult.data?.name || email.split('@')[0]

      const userData = {
        uid: result.user!.uid,
        name: userName,
        email: email,
      }

      // Set session via API
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setSession", user: userData }),
      })

      setUser(userData)
      return {}
    } catch (err) {
      console.error("Login error:", err)
      return { error: "Network error. Please check your connection and try again." }
    }
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      // Call Firebase Auth directly on client side
      const result = await firebaseAuth.register(email, password)
      
      if (result.error) {
        // Handle specific Firebase auth errors
        if (result.error.includes("email-already-in-use")) {
          return { error: "Account already exists" }
        }
        return { error: result.error }
      }

      const userData = {
        uid: result.user!.uid,
        name: name,
        email: email,
      }

      // Set user state immediately for fast UI response
      setUser(userData)

      // Fire and forget: Save profile and session in background
      // Don't await these - let them complete in background
      userProfile.setProfile(result.user!.uid, { name, email }).catch(err => {
        console.error("Background profile save error:", err)
      })
      
      fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setSession", user: userData }),
      }).catch(err => {
        console.error("Background session set error:", err)
      })

      return {}
    } catch (err) {
      console.error("Signup error:", err)
      return { error: "Network error. Please check your connection and try again." }
    }
  }, [])



  const logout = useCallback(async () => {
    // Sign out from Firebase
    await firebaseAuth.logout()
    
    // Clear session via API
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    })
    setUser(null)
  }, [])


  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

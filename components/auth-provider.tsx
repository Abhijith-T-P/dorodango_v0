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

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
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

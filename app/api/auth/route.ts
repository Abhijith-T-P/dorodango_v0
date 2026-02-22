import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { firebaseAuth, userProfile } from "@/lib/firebase"

// Helper to get auth token from header or cookie
async function getCurrentUserFromSession() {
  const jar = await cookies()
  const session = jar.get("session")
  if (!session?.value) {
    return null
  }
  try {
    const userData = JSON.parse(session.value)
    return userData
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, name, email, password } = body

  if (action === "signup") {
    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Register with Firebase Auth
    const result = await firebaseAuth.register(email, password)
    
    if (result.error) {
      // Handle specific Firebase auth errors
      if (result.error.includes("email-already-in-use")) {
        return NextResponse.json({ error: "Account already exists" }, { status: 409 })
      }
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Save user profile to Firestore
    const profileResult = await userProfile.setProfile(result.user!.uid, {
      name,
      email
    })

    if (profileResult.error) {
      console.error("Error saving user profile:", profileResult.error)
    }

    // Set session cookie
    const jar = await cookies()
    jar.set("session", JSON.stringify({ 
      uid: result.user!.uid,
      name, 
      email 
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "strict",
    })

    return NextResponse.json({ 
      user: { 
        uid: result.user!.uid,
        name, 
        email 
      } 
    })
  }

  if (action === "login") {
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Sign in with Firebase Auth
    const result = await firebaseAuth.login(email, password)
    
    if (result.error) {
      if (result.error.includes("invalid-credential") || result.error.includes("wrong-password") || result.error.includes("user-not-found")) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    // Get user profile from Firestore
    const profileResult = await userProfile.getProfile(result.user!.uid)
    const userName = profileResult.data?.name || email.split('@')[0]

    // Set session cookie
    const jar = await cookies()
    jar.set("session", JSON.stringify({ 
      uid: result.user!.uid,
      name: userName, 
      email 
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "strict",
    })

    return NextResponse.json({ 
      user: { 
        uid: result.user!.uid,
        name: userName, 
        email 
      } 
    })
  }

  if (action === "logout") {
    // Sign out from Firebase
    await firebaseAuth.logout()
    
    // Delete session cookie
    const jar = await cookies()
    jar.delete("session")
    
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

export async function GET() {
  const userData = await getCurrentUserFromSession()
  
  if (!userData) {
    return NextResponse.json({ user: null })
  }

  return NextResponse.json({ 
    user: { 
      uid: userData.uid,
      name: userData.name, 
      email: userData.email 
    } 
  })
}

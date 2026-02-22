import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

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
  const { action, user } = body

  if (action === "setSession") {
    // Set session cookie after client-side Firebase auth succeeds
    if (!user || !user.uid || !user.email) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 })
    }

    const jar = await cookies()
    jar.set("session", JSON.stringify({ 
      uid: user.uid,
      name: user.name || user.email.split('@')[0], 
      email: user.email 
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "strict",
    })

    return NextResponse.json({ 
      user: { 
        uid: user.uid,
        name: user.name || user.email.split('@')[0], 
        email: user.email 
      } 
    })
  }

  if (action === "logout") {
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

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// In-memory user store (reset on redeploy — fine for a small demo)
const users: Map<string, { name: string; email: string; password: string }> = new Map()

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, name, email, password } = body

  if (action === "signup") {
    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }
    if (users.has(email)) {
      return NextResponse.json({ error: "Account already exists" }, { status: 409 })
    }
    users.set(email, { name, email, password })
    const jar = await cookies()
    jar.set("session", JSON.stringify({ name, email }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    })
    return NextResponse.json({ user: { name, email } })
  }

  if (action === "login") {
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }
    const user = users.get(email)
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
    const jar = await cookies()
    jar.set("session", JSON.stringify({ name: user.name, email: user.email }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    })
    return NextResponse.json({ user: { name: user.name, email: user.email } })
  }

  if (action === "logout") {
    const jar = await cookies()
    jar.delete("session")
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

export async function GET() {
  const jar = await cookies()
  const session = jar.get("session")
  if (!session?.value) {
    return NextResponse.json({ user: null })
  }
  try {
    const user = JSON.parse(session.value)
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}

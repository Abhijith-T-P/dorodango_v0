import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    let subject = ""
    let text = ""

    if (body.type === "contribute") {
      subject = `[Dorodango] New Contribution from ${body.name}`
      text = [
        `New Contribution Request`,
        ``,
        `Name: ${body.name}`,
        `Location: ${body.location}`,
        `Mobile: ${body.mobile}`,
        `Email: ${body.email}`,
        `Type of Clothes: ${body.clothesType}`,
      ].join("\n")
    } else if (body.type === "collaborate") {
      subject = `[Dorodango] New Collaboration from ${body.name}`
      text = [
        `New Collaboration Request`,
        ``,
        `Name: ${body.name}`,
        `Location: ${body.location}`,
        `Art Forms: ${body.artForms?.join(", ")}`,
        `Experience: ${body.experience}`,
        `Social Media: ${body.socialMedia || "Not provided"}`,
        `Suggestions: ${body.suggestions || "None"}`,
      ].join("\n")
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    // Send email via mailto link won't work server side. We use a simple
    // email forwarding approach. For production, integrate with a service
    // like Resend, SendGrid, or Nodemailer + SMTP.
    // For now, we store and log the submission, and the /api/contact
    // endpoint is ready to be wired up to any email provider.

    const recipient = "dorodango.org@gmail.com"

    console.log(`[Contact Form] To: ${recipient}`)
    console.log(`[Contact Form] Subject: ${subject}`)
    console.log(`[Contact Form] Body:\n${text}`)

    // If RESEND_API_KEY is set, send a real email via Resend
    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Dorodango ReFashion <onboarding@resend.dev>",
          to: [recipient],
          subject,
          text,
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        console.error("[Contact Form] Resend error:", err)
        // Still return success to user — form data is logged
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Contact Form] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

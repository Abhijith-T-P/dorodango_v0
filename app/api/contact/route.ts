import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

const RECIPIENT = "dorodango.org@gmail.com"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    let subject = ""
    let htmlBody = ""

    if (body.type === "contribute") {
      subject = `[Dorodango] New Contribution from ${body.name}`
      htmlBody = `
        <h2 style="color:#2d5a3d;">New Contribution Request</h2>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(body.name)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Location</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(body.location)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Mobile</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(body.mobile)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(body.email)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Type of Clothes</td><td style="padding:8px;">${escapeHtml(body.clothesType)}</td></tr>
        </table>
      `
    } else if (body.type === "collaborate") {
      const artForms = Array.isArray(body.artForms)
        ? body.artForms.map((a: string) => escapeHtml(a)).join(", ")
        : ""
      subject = `[Dorodango] New Collaboration from ${body.name}`
      htmlBody = `
        <h2 style="color:#2d5a3d;">New Collaboration Request</h2>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(body.name)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Location</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(body.location)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Art Forms</td><td style="padding:8px;border-bottom:1px solid #eee;">${artForms}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Experience</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(body.experience)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Social Media</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(body.socialMedia || "Not provided")}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Suggestions</td><td style="padding:8px;">${escapeHtml(body.suggestions || "None")}</td></tr>
        </table>
      `
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    // Check required env vars
    const gmailUser = process.env.GMAIL_USER
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD

    if (!gmailUser || !gmailAppPassword) {
      console.error(
        "[Contact Form] Missing GMAIL_USER or GMAIL_APP_PASSWORD env vars. Email NOT sent."
      )
      console.log(`[Contact Form] Subject: ${subject}`)
      console.log(`[Contact Form] Would send to: ${RECIPIENT}`)
      console.log(`[Contact Form] Body:`, body)
      return NextResponse.json({
        success: false,
        error: "Email service not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD.",
      }, { status: 500 })
    }

    // Create transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    })

    // Send the email
    await transporter.sendMail({
      from: `"Dorodango ReFashion" <${gmailUser}>`,
      to: RECIPIENT,
      subject,
      html: htmlBody,
      replyTo: body.email || gmailUser,
    })

    console.log(`[Contact Form] Email sent successfully to ${RECIPIENT}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Contact Form] Error sending email:", error)
    return NextResponse.json(
      { error: "Failed to send email. Please try again later." },
      { status: 500 }
    )
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

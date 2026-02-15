import type { Metadata } from 'next'
import { DM_Serif_Display, Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const dmSerif = DM_Serif_Display({ weight: '400', subsets: ['latin'], variable: '--font-dm-serif' })

export const metadata: Metadata = {
  title: 'Dorodango ReFashion | Polishing Textile Waste into Sustainable Masterpieces',
  description: 'Dorodango ReFashion collects excess fast fashion and partners with artisans to upcycle them into unique, trend-forward pieces — creating a closed-loop circular economy.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSerif.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}

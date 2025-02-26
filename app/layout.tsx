import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"

// Load Inter font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
})

// Load Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "CareerForge - Application Perfection Platform",
  description: "Optimize your resume and generate cover letters with AI",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  )
}



import './globals.css'
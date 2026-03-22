import type { Metadata } from "next"
import { Geist_Mono, Outfit, Plus_Jakarta_Sans } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta-sans' })
const outfit = Outfit({subsets:['latin'],variable:'--font-outfit'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    template: "%s | Tiam AC",
    default: "Tiam AC - Solusi Service & Perbaikan AC Profesional",
  },
  description: "Layanan cuci, perbaikan, dan bongkar pasang AC berkualitas dengan harga transparan dan teknisi berpengalaman di area Anda.",
  keywords: ["service AC", "cuci AC", "perbaikan AC", "pasang AC", "Tiam AC", "teknisi AC"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", plusJakartaSans.variable, outfit.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

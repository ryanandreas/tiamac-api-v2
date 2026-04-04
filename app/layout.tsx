import type { Metadata } from "next"
import { Geist, Geist_Mono, EB_Garamond, Lexend } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LenisProvider } from "@/components/providers/lenis-provider"
import { cn } from "@/lib/utils";
import Script from "next/script";

const fontSans = Geist({ 
  subsets: ['latin'], 
  variable: '--font-geist-sans',
  display: 'swap',
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: 'swap',
})

const fontSerif = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb-garamond',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const fontLexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
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
      className={cn("antialiased", fontMono.variable, fontSans.variable, fontSerif.variable, fontLexend.variable)}
    >
      <body className="font-sans antialiased overflow-x-hidden">
        <ThemeProvider>
          <LenisProvider>
             {children}
          </LenisProvider>
        </ThemeProvider>
        <Script
          src={process.env.MIDTRANS_IS_PRODUCTION === 'true' 
            ? "https://app.midtrans.com/snap/snap.js" 
            : "https://app.sandbox.midtrans.com/snap/snap.js"}
          data-client-key={process.env.MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}

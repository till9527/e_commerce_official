import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "DAFT Commerce",
  description: "DAFT Commerce",
  icons: {
    icon: [
      { rel: 'icon', sizes: '32x32', url: '/favicon-32x32.png' },
      { rel: 'icon', sizes: '16x16', url: '/favicon-16x16.png' },
    ],
    apple: '/apple-touch-icon.png',
    manifest: '/site.webmanifest',
    other: [
      { rel: 'icon', sizes: '192x192', url: '/android-chrome-192x192.png' },
      { rel: 'icon', sizes: '512x512', url: '/android-chrome-512x512.png' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          inter.variable
        )}
      >
        {children}
      </body>
    </html>
  )
}

import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Nav from "@/components/Nav"
import RegisterSW from "@/components/RegisterSW"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "TweetBrain",
  description: "AI-powered Twitter post generator from voice & photos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TweetBrain",
  },
  icons: {
    apple: "/icon-192.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-zinc-950 text-white min-h-screen`}>
        <main
          className="max-w-lg mx-auto px-4 pb-24"
          style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}
        >
          {children}
        </main>
        <Nav />
        <RegisterSW />
      </body>
    </html>
  )
}

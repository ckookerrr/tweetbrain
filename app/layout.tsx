import type { Metadata, Viewport } from "next"
import "./globals.css"
import Nav from "@/components/Nav"
import RegisterSW from "@/components/RegisterSW"
import { LangProvider } from "@/lib/lang-context"
import SessionProvider from "@/components/SessionProvider"

export const metadata: Metadata = {
  title: "TweetBrain",
  description: "AI-powered Twitter post generator from voice & photos",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "TweetBrain" },
  icons: { apple: "/icon-192.png" },
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ background: "#000" }}>
        <SessionProvider>
        <LangProvider>
          <main
            className="max-w-[600px] mx-auto pb-20"
            style={{ paddingTop: "max(0px, env(safe-area-inset-top))" }}
          >
            {children}
          </main>
          <Nav />
          <RegisterSW />
        </LangProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

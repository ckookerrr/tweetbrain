"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { LogOut, Check, Loader2 } from "lucide-react"
import { useLang } from "@/lib/lang-context"
import { saveUserStyle } from "@/lib/storage"

interface TwitterConnectProps {
  onStyleLoaded?: (style: string) => void
}

export default function TwitterConnect({ onStyleLoaded }: TwitterConnectProps) {
  const { data: session, status } = useSession()
  const { lang } = useLang()
  const [syncing, setSyncing] = useState(false)
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (session?.accessToken && !synced) {
      syncStyle()
    }
  }, [session])

  const syncStyle = async () => {
    setSyncing(true)
    try {
      const res = await fetch("/api/twitter-style")
      if (!res.ok) return
      const { bio, tweets } = await res.json()
      const style = [bio ? `Bio: ${bio}` : "", ...tweets.slice(0, 50)].filter(Boolean).join("\n")
      saveUserStyle(style)
      onStyleLoaded?.(style)
      setSynced(true)
    } catch { /* ignore */ } finally {
      setSyncing(false)
    }
  }

  // Always show the button — even while loading
  if (status === "authenticated" && session) {
    return (
      <div className="flex items-center gap-2">
        {syncing && (
          <span className="flex items-center gap-1.5 text-xs" style={{ color: "#71767b" }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {lang === "ru" ? "Сканирую…" : "Scanning…"}
          </span>
        )}
        {synced && !syncing && (
          <span className="flex items-center gap-1.5 text-xs" style={{ color: "#00ba7c" }}>
            <Check className="w-3.5 h-3.5" />
            {lang === "ru" ? "Стиль загружен" : "Style loaded"}
          </span>
        )}
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs border"
          style={{ borderColor: "#2f3336", color: "#71767b" }}
        >
          <LogOut className="w-3.5 h-3.5" />
          𝕏
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn("twitter")}
      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold border transition-all"
      style={{ borderColor: "#1d9bf0", color: "#1d9bf0", background: "transparent" }}
    >
      <span className="font-bold">𝕏</span>
      {lang === "ru" ? "Войти" : "Sign in"}
    </button>
  )
}

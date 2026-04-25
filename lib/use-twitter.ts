"use client"

import { useEffect, useState, useCallback } from "react"

export interface TwitterUser {
  id: string
  username?: string
}

export function useTwitter() {
  const [user, setUser] = useState<TwitterUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/twitter/me", { cache: "no-store" })
      const data = await res.json()
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const login = () => { window.location.href = "/api/auth/twitter/login" }
  const logout = async () => {
    await fetch("/api/auth/twitter/logout", { method: "POST" })
    setUser(null)
  }

  return { user, loading, login, logout, refresh }
}

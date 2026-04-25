"use client"

import { useState } from "react"
import { Send, Check, Loader2 } from "lucide-react"
import { useLang } from "@/lib/lang-context"
import { useTwitter } from "@/lib/use-twitter"

interface PublishBtnProps {
  text: string
}

export default function PublishBtn({ text }: PublishBtnProps) {
  const { user, login } = useTwitter()
  const { lang } = useLang()
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [tweetId, setTweetId] = useState<string | null>(null)

  if (!user) {
    return (
      <button
        onClick={login}
        className="flex items-center justify-center gap-2 rounded-full py-2.5 px-5 text-sm font-bold border transition-all"
        style={{ borderColor: "#1d9bf0", color: "#1d9bf0" }}
      >
        <span className="font-bold">𝕏</span>
        {lang === "ru" ? "Войти чтобы публиковать" : "Sign in to publish"}
      </button>
    )
  }

  const publish = async () => {
    setState("loading")
    try {
      const res = await fetch("/api/tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(JSON.stringify(data.error))
      setTweetId(data.id)
      setState("done")
    } catch {
      setState("error")
      setTimeout(() => setState("idle"), 3000)
    }
  }

  if (state === "done") {
    return (
      <a
        href={`https://x.com/i/web/status/${tweetId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-full py-2.5 px-5 text-sm font-bold"
        style={{ background: "#00ba7c", color: "#fff" }}
      >
        <Check className="w-4 h-4" />
        {lang === "ru" ? "Опубликовано! Открыть →" : "Published! Open →"}
      </a>
    )
  }

  return (
    <button
      onClick={publish}
      disabled={state === "loading"}
      className="flex items-center justify-center gap-2 rounded-full py-2.5 px-5 text-sm font-bold transition-all"
      style={{
        background: state === "error" ? "#f4212e" : "#000",
        color: state === "error" ? "#fff" : "#e7e9ea",
        border: "1px solid #2f3336",
        opacity: state === "loading" ? 0.7 : 1,
      }}
    >
      {state === "loading" ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Send className="w-4 h-4" />
      )}
      {state === "error"
        ? (lang === "ru" ? "Ошибка" : "Error")
        : state === "loading"
        ? (lang === "ru" ? "Публикую…" : "Publishing…")
        : (lang === "ru" ? "Опубликовать в X" : "Post to X")}
    </button>
  )
}

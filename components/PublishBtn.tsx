"use client"

import { Send } from "lucide-react"
import { useLang } from "@/lib/lang-context"

interface PublishBtnProps {
  text: string
}

export default function PublishBtn({ text }: PublishBtnProps) {
  const { lang } = useLang()

  const open = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <button
      onClick={open}
      className="flex items-center justify-center gap-2 rounded-full py-2.5 px-5 text-sm font-bold transition-all"
      style={{
        background: "#1d9bf0",
        color: "#fff",
        border: "1px solid #1d9bf0",
      }}
    >
      <Send className="w-4 h-4" />
      {lang === "ru" ? "Открыть в X" : "Open in X"}
    </button>
  )
}

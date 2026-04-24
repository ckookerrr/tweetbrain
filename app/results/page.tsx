"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Copy, Check } from "lucide-react"
import PostCard from "@/components/PostCard"
import type { GeneratedPosts } from "@/lib/types"
import { useLang } from "@/lib/lang-context"

type TabKey = "short" | "thread" | "provocative" | "all"

export default function ResultsPage() {
  const router = useRouter()
  const { tr } = useLang()
  const [posts, setPosts] = useState<GeneratedPosts | null>(null)
  const [photos] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<TabKey>("short")
  const [copied, setCopied] = useState(false)

  const TABS: { key: TabKey; label: string }[] = [
    { key: "short", label: tr.tabShort },
    { key: "thread", label: tr.tabThread },
    { key: "provocative", label: tr.tabBold },
    { key: "all", label: tr.tabAll },
  ]

  useEffect(() => {
    const raw = sessionStorage.getItem("tweetbrain_current")
    if (!raw) { router.push("/"); return }
    const { posts: p } = JSON.parse(raw)
    setPosts(p)
  }, [router])

  if (!posts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#2f3336", borderTopColor: "#1d9bf0" }} />
      </div>
    )
  }

  const buildAllText = () => {
    const lines: string[] = []
    lines.push(tr.allShortLabel)
    lines.push(posts.short.content)
    if (posts.short.hashtags.length) lines.push(posts.short.hashtags.map(h => `#${h}`).join(" "))
    lines.push("")
    lines.push(tr.allBoldLabel)
    lines.push(posts.provocative.content)
    if (posts.provocative.hashtags.length) lines.push(posts.provocative.hashtags.map(h => `#${h}`).join(" "))
    lines.push("")
    lines.push(tr.allThreadLabel)
    posts.thread.tweets.forEach(t => lines.push(t))
    if (posts.thread.hashtags.length) lines.push(posts.thread.hashtags.map(h => `#${h}`).join(" "))
    return lines.join("\n")
  }

  const activeVariant = activeTab === "thread" ? posts.thread : activeTab === "short" ? posts.short : posts.provocative

  const copyAll = async () => {
    await navigator.clipboard.writeText(buildAllText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", borderColor: "#2f3336" }}>
        <button onClick={() => router.push("/")} className="p-2 rounded-full transition-colors" style={{ color: "#e7e9ea" }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg" style={{ color: "#e7e9ea" }}>{tr.generatedPosts}</h1>
      </header>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: "#2f3336" }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex-1 py-4 text-sm font-semibold transition-colors relative"
            style={{ color: activeTab === key ? "#e7e9ea" : "#71767b" }}
          >
            {label}
            {activeTab === key && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full" style={{ background: "#1d9bf0" }} />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {activeTab === "all" ? (
          <div className="space-y-3">
            <div className="rounded-2xl p-4 border" style={{ background: "#16181c", borderColor: "#2f3336" }}>
              <pre className="text-sm whitespace-pre-wrap leading-relaxed font-sans" style={{ color: "#e7e9ea" }}>
                {buildAllText()}
              </pre>
            </div>
            <button
              onClick={copyAll}
              className="w-full flex items-center justify-center gap-2 font-bold rounded-full py-3 text-sm"
              style={{ background: "#1d9bf0", color: "#fff" }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? tr.copiedAll : tr.copyAll}
            </button>
          </div>
        ) : (
          <PostCard type={activeTab} variant={activeVariant} photos={photos} />
        )}
      </div>
    </div>
  )
}

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
  const [photos, setPhotos] = useState<string[]>([])
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
    const { posts: p, photos: ph } = JSON.parse(raw)
    setPosts(p)
    setPhotos(ph || [])
  }, [router])

  if (!posts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const buildAllText = () => {
    const lines: string[] = []
    lines.push(tr.allShortLabel)
    lines.push(posts.short.content)
    if (posts.short.hashtags.length) lines.push(posts.short.hashtags.map((h) => `#${h}`).join(" "))
    lines.push("")
    lines.push(tr.allBoldLabel)
    lines.push(posts.provocative.content)
    if (posts.provocative.hashtags.length) lines.push(posts.provocative.hashtags.map((h) => `#${h}`).join(" "))
    lines.push("")
    lines.push(tr.allThreadLabel)
    posts.thread.tweets.forEach((t) => lines.push(t))
    if (posts.thread.hashtags.length) lines.push(posts.thread.hashtags.map((h) => `#${h}`).join(" "))
    return lines.join("\n")
  }

  const activeVariant =
    activeTab === "thread" ? posts.thread
    : activeTab === "short" ? posts.short
    : posts.provocative

  const copyAll = async () => {
    await navigator.clipboard.writeText(buildAllText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold">{tr.generatedPosts}</h1>
      </div>

      <div className="flex gap-1 bg-zinc-800/60 rounded-xl p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === key ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "all" ? (
        <div className="space-y-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <pre className="text-sm text-white whitespace-pre-wrap leading-relaxed font-sans">
              {buildAllText()}
            </pre>
          </div>
          <button
            onClick={copyAll}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-3 text-sm font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
            {copied ? tr.copiedAll : tr.copyAll}
          </button>
        </div>
      ) : (
        <PostCard type={activeTab} variant={activeVariant} photos={photos} />
      )}
    </div>
  )
}

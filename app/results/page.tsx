"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Copy, Check, Bookmark, Clock } from "lucide-react"
import type { GeneratedPosts, QueueEntry } from "@/lib/types"
import { saveToQueue } from "@/lib/storage"
import { useLang } from "@/lib/lang-context"
import HookAlternatives from "@/components/HookAlternatives"
import PublishBtn from "@/components/PublishBtn"

type TabKey = "post" | "thread" | "dump"

const TIME_EMOJIS: Record<string, string> = { morning: "🌅", lunch: "☀️", evening: "🌙" }
const SIZE_LABELS = ["S", "M", "L"]
const SIZE_KEYS = ["s", "m", "l"] as const

function CopyBtn({ text, label, copiedLabel }: { text: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="flex items-center justify-center gap-2 font-bold rounded-full py-2.5 px-5 text-sm transition-all" style={{ background: "#1d9bf0", color: "#fff" }}>
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? copiedLabel : label}
    </button>
  )
}

export default function ResultsPage() {
  const router = useRouter()
  const { tr, lang } = useLang()
  const [posts, setPosts] = useState<GeneratedPosts | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>("post")
  const [sizeIdx, setSizeIdx] = useState(1) // 0=S 1=M 2=L
  const [savedPost, setSavedPost] = useState(false)
  const [savedThread, setSavedThread] = useState(false)
  const [savedDump, setSavedDump] = useState(false)

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

  const currentPostText = posts.post.sizes[SIZE_KEYS[sizeIdx]]

  const savePost = () => {
    saveToQueue({ id: `q_${Date.now()}`, savedAt: Date.now(), type: "post", content: currentPostText, hashtags: posts.post.hashtags, photoIndices: [] })
    setSavedPost(true); setTimeout(() => setSavedPost(false), 2000)
  }
  const saveThread = () => {
    saveToQueue({ id: `q_${Date.now()}`, savedAt: Date.now(), type: "thread", content: posts.thread.tweets.join("\n\n"), hashtags: posts.thread.hashtags, photoIndices: [] })
    setSavedThread(true); setTimeout(() => setSavedThread(false), 2000)
  }
  const saveDump = () => {
    saveToQueue({ id: `q_${Date.now()}`, savedAt: Date.now(), type: "dump", content: posts.dump, hashtags: [], photoIndices: [] })
    setSavedDump(true); setTimeout(() => setSavedDump(false), 2000)
  }

  const timeLabel = (t: string) => t === "morning" ? tr.morning : t === "lunch" ? tr.lunch : tr.evening

  const tabLabels: Record<TabKey, string> = {
    post: lang === "ru" ? "Пост" : "Post",
    thread: lang === "ru" ? "Тред" : "Thread",
    dump: lang === "ru" ? "Мысли" : "Thoughts",
  }

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b" style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)", borderColor: "#2f3336" }}>
        <button onClick={() => router.push("/")} className="p-2 rounded-full" style={{ color: "#e7e9ea" }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg" style={{ color: "#e7e9ea" }}>{tr.generatedPosts}</h1>
      </header>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: "#2f3336" }}>
        {(["post", "thread", "dump"] as TabKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex-1 py-4 text-sm font-semibold transition-colors relative"
            style={{ color: activeTab === key ? "#e7e9ea" : "#71767b" }}
          >
            {tabLabels[key]}
            {activeTab === key && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full" style={{ background: "#1d9bf0" }} />
            )}
          </button>
        ))}
      </div>

      <div className="px-4 py-5 space-y-5">

        {/* ── POST TAB ── */}
        {activeTab === "post" && (
          <div className="space-y-4">
            {/* Size slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#71767b" }}>
                  {lang === "ru" ? "Объём" : "Length"}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(29,155,240,0.15)", color: "#1d9bf0" }}>
                  {SIZE_LABELS[sizeIdx]}
                </span>
              </div>
              <div className="relative flex items-center gap-2">
                <span className="text-xs" style={{ color: "#71767b" }}>S</span>
                <input
                  type="range"
                  min={0} max={2} step={1}
                  value={sizeIdx}
                  onChange={(e) => setSizeIdx(Number(e.target.value))}
                  className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "#1d9bf0", background: `linear-gradient(to right, #1d9bf0 ${sizeIdx * 50}%, #2f3336 ${sizeIdx * 50}%)` }}
                />
                <span className="text-xs" style={{ color: "#71767b" }}>L</span>
              </div>
              <p className="text-xs" style={{ color: "#71767b" }}>
                {currentPostText.length} {lang === "ru" ? "символов" : "chars"}
              </p>
            </div>

            {/* Tweet card */}
            <div className="border rounded-2xl overflow-hidden" style={{ borderColor: "#2f3336" }}>
              <div className="p-4 flex gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: "#1d9bf0", color: "#fff" }}>TB</div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    <span className="font-bold text-sm" style={{ color: "#e7e9ea" }}>TweetBrain</span>
                    <span className="text-xs" style={{ color: "#71767b" }}>· AI</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#e7e9ea" }}>{currentPostText}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {posts.post.hashtags.map(h => <span key={h} className="text-sm" style={{ color: "#1d9bf0" }}>#{h}</span>)}
                  </div>
                </div>
              </div>
              <div className="border-t px-4 py-2 flex items-center gap-2" style={{ borderColor: "#2f3336" }}>
                <Clock className="w-3.5 h-3.5" style={{ color: "#71767b" }} />
                <span className="text-xs" style={{ color: "#71767b" }}>
                  {TIME_EMOJIS[posts.post.best_time]} {timeLabel(posts.post.best_time)} — {posts.post.best_time_reason}
                </span>
              </div>
            </div>

            <HookAlternatives hooks={posts.post.hook_alternatives} onSelect={() => {}} />

            <div className="flex gap-2">
              <CopyBtn text={currentPostText + "\n\n" + posts.post.hashtags.map(h => `#${h}`).join(" ")} label={tr.copy} copiedLabel={tr.copied} />
              <button
                onClick={savePost}
                className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold border"
                style={savedPost ? { background: "rgba(29,155,240,0.1)", color: "#1d9bf0", borderColor: "#1d9bf0" } : { background: "transparent", color: "#e7e9ea", borderColor: "#2f3336" }}
              >
                {savedPost ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {savedPost ? tr.saved : tr.save}
              </button>
            </div>
            <PublishBtn text={currentPostText + "\n\n" + posts.post.hashtags.map(h => `#${h}`).join(" ")} />
          </div>
        )}

        {/* ── THREAD TAB ── */}
        {activeTab === "thread" && (
          <div className="space-y-4">
            <div className="border rounded-2xl overflow-hidden" style={{ borderColor: "#2f3336" }}>
              {posts.thread.tweets.map((tweet, i) => (
                <div key={i} className="flex gap-3 px-4 pt-4" style={{ paddingBottom: i < posts.thread.tweets.length - 1 ? 0 : "1rem" }}>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: "#1d9bf0", color: "#fff" }}>TB</div>
                    {i < posts.thread.tweets.length - 1 && <div className="w-0.5 flex-1 mt-1 mb-0" style={{ background: "#2f3336", minHeight: "1.5rem" }} />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-bold text-sm" style={{ color: "#e7e9ea" }}>TweetBrain</span>
                      <span className="text-xs" style={{ color: "#71767b" }}>· AI</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#e7e9ea" }}>{tweet}</p>
                  </div>
                </div>
              ))}
              <div className="border-t px-4 py-2 flex flex-wrap gap-1" style={{ borderColor: "#2f3336" }}>
                {posts.thread.hashtags.map(h => <span key={h} className="text-sm" style={{ color: "#1d9bf0" }}>#{h}</span>)}
              </div>
              <div className="border-t px-4 py-2 flex items-center gap-2" style={{ borderColor: "#2f3336" }}>
                <Clock className="w-3.5 h-3.5" style={{ color: "#71767b" }} />
                <span className="text-xs" style={{ color: "#71767b" }}>
                  {TIME_EMOJIS[posts.thread.best_time]} {timeLabel(posts.thread.best_time)} — {posts.thread.best_time_reason}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <CopyBtn text={posts.thread.tweets.join("\n\n") + "\n\n" + posts.thread.hashtags.map(h => `#${h}`).join(" ")} label={tr.copy} copiedLabel={tr.copied} />
              <button
                onClick={saveThread}
                className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold border"
                style={savedThread ? { background: "rgba(29,155,240,0.1)", color: "#1d9bf0", borderColor: "#1d9bf0" } : { background: "transparent", color: "#e7e9ea", borderColor: "#2f3336" }}
              >
                {savedThread ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {savedThread ? tr.saved : tr.save}
              </button>
            </div>
            <PublishBtn text={posts.thread.tweets[0]} />
          </div>
        )}

        {/* ── DUMP TAB ── */}
        {activeTab === "dump" && (
          <div className="space-y-4">
            <div className="border rounded-2xl p-4" style={{ borderColor: "#2f3336" }}>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: "#2f3336", color: "#71767b" }}>TB</div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    <span className="font-bold text-sm" style={{ color: "#e7e9ea" }}>TweetBrain</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(113,118,123,0.2)", color: "#71767b" }}>
                      {lang === "ru" ? "без правок" : "raw"}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#e7e9ea" }}>{posts.dump}</p>
                </div>
              </div>
            </div>
            <p className="text-xs px-1" style={{ color: "#71767b" }}>
              {lang === "ru"
                ? "Только убраны слова-паразиты. Ни одна мысль не добавлена и не изменена."
                : "Filler words removed only. No ideas added or changed."}
            </p>
            <div className="flex gap-2">
              <CopyBtn text={posts.dump} label={tr.copy} copiedLabel={tr.copied} />
              <button
                onClick={saveDump}
                className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold border"
                style={savedDump ? { background: "rgba(29,155,240,0.1)", color: "#1d9bf0", borderColor: "#1d9bf0" } : { background: "transparent", color: "#e7e9ea", borderColor: "#2f3336" }}
              >
                {savedDump ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {savedDump ? tr.saved : tr.save}
              </button>
            </div>
            <PublishBtn text={posts.dump} />
          </div>
        )}

      </div>
    </div>
  )
}

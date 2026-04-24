"use client"

import { useState } from "react"
import { Copy, Check, Bookmark, Clock, Heart, Repeat2, BarChart2 } from "lucide-react"
import HookAlternatives from "./HookAlternatives"
import type { PostVariant, ThreadVariant, QueueEntry } from "@/lib/types"
import { saveToQueue } from "@/lib/storage"
import { useLang } from "@/lib/lang-context"

type Variant = PostVariant | ThreadVariant

interface PostCardProps {
  type: "short" | "thread" | "provocative"
  variant: Variant
  photos: string[]
}

function isThread(v: Variant): v is ThreadVariant {
  return "tweets" in v
}

const TIME_EMOJIS: Record<string, string> = { morning: "🌅", lunch: "☀️", evening: "🌙" }

function TweetBubble({ text, index, total }: { text: string; index: number; total: number }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: "#1d9bf0", color: "#fff" }}>
          TB
        </div>
        {index < total - 1 && <div className="w-0.5 flex-1 mt-1" style={{ background: "#2f3336" }} />}
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-1 mb-1">
          <span className="font-bold text-sm" style={{ color: "#e7e9ea" }}>TweetBrain</span>
          <span className="text-xs" style={{ color: "#71767b" }}>· AI</span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "#e7e9ea" }}>{text}</p>
      </div>
    </div>
  )
}

export default function PostCard({ type, variant, photos }: PostCardProps) {
  const { tr } = useLang()
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [displayContent, setDisplayContent] = useState<string | null>(null)

  const mainText = isThread(variant) ? variant.tweets.join("\n\n") : variant.content
  const currentText = displayContent ?? mainText

  const copyText = async () => {
    await navigator.clipboard.writeText(currentText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const saveForLater = () => {
    const entry: QueueEntry = {
      id: `q_${Date.now()}`,
      savedAt: Date.now(),
      type,
      content: currentText,
      hashtags: variant.hashtags,
      photoIndices: variant.selected_photo_indices,
    }
    saveToQueue(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleHookSelect = (hook: string) => {
    if (isThread(variant)) {
      const tweets = [...variant.tweets]
      const nSlash = tweets[0].match(/^\d+\/\d+\s/)?.[0] ?? ""
      tweets[0] = nSlash + hook
      setDisplayContent(tweets.join("\n\n"))
    } else {
      setDisplayContent(hook)
    }
  }

  const timeLabel = variant.best_time === "morning" ? tr.morning : variant.best_time === "lunch" ? tr.lunch : tr.evening

  const tweets = displayContent ? displayContent.split("\n\n") : (isThread(variant) ? variant.tweets : [currentText])

  return (
    <div>
      {/* Tweet-style card */}
      <div className="border rounded-2xl overflow-hidden" style={{ borderColor: "#2f3336", background: "#000" }}>

        {/* Tweet content */}
        <div className="px-4 pt-4">
          {isThread(variant) ? (
            <div>
              {tweets.map((tweet, i) => (
                <TweetBubble key={i} text={tweet} index={i} total={tweets.length} />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 pb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: "#1d9bf0", color: "#fff" }}>
                TB
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-bold text-sm" style={{ color: "#e7e9ea" }}>TweetBrain</span>
                  <span className="text-xs" style={{ color: "#71767b" }}>· AI</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#e7e9ea" }}>{currentText}</p>
              </div>
            </div>
          )}
        </div>

        {/* Hashtags */}
        {variant.hashtags.length > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-1.5 ml-13" style={{ paddingLeft: "3.25rem" }}>
            {variant.hashtags.map((tag) => (
              <span key={tag} className="text-sm font-medium" style={{ color: "#1d9bf0" }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="border-t mx-4" style={{ borderColor: "#2f3336" }} />

        {/* Twitter action bar */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-1" style={{ color: "#71767b" }}>
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">{TIME_EMOJIS[variant.best_time]} {timeLabel}</span>
          </div>
          <div className="flex items-center gap-4" style={{ color: "#71767b" }}>
            <Heart className="w-4 h-4" />
            <Repeat2 className="w-4 h-4" />
            <BarChart2 className="w-4 h-4" />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t mx-4" style={{ borderColor: "#2f3336" }} />

        {/* Best time reason */}
        <p className="px-4 py-2 text-xs" style={{ color: "#71767b" }}>{variant.best_time_reason}</p>
      </div>

      {/* Hook alternatives */}
      <div className="mt-3">
        <HookAlternatives hooks={variant.hook_alternatives} onSelect={handleHookSelect} />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={copyText}
          className="flex-1 flex items-center justify-center gap-2 font-bold rounded-full py-2.5 text-sm transition-all"
          style={{ background: "#1d9bf0", color: "#fff" }}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? tr.copied : tr.copy}
        </button>
        <button
          onClick={saveForLater}
          className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all border"
          style={saved
            ? { background: "rgba(29,155,240,0.1)", color: "#1d9bf0", borderColor: "#1d9bf0" }
            : { background: "transparent", color: "#e7e9ea", borderColor: "#2f3336" }}
        >
          {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {saved ? tr.saved : tr.save}
        </button>
      </div>
    </div>
  )
}
